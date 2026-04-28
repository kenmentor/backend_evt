/**
 * Verification Service - Event Sourcing Version
 * 
 * Handles signup, login, email verification with event sourcing.
 * Passwords are stored separately for security (not in event store).
 */

const { response, generateVerificationCode } = require("../utility");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getRepos } = require("../event-sourcing");
const { sendVerificationEmail, sendWelcomeEmail } = require("../utility/mail-trap/emails");
const { getDb } = require("../event-sourcing");
const saltround = 10;
const jwt_api_key = process.env.JWT_API_KEY;

// Separate collection for credentials (passwords)
// In event sourcing, we don't store passwords in the event log
async function getCredentialsCollection() {
  const db = getDb();
  return db.collection('user_credentials');
}

async function verif_NIN(NIN, userId) {
  try {
    const DOJAH_APP_ID = process.env.DOJAH_ID;
    const DOJAH_SECRET = process.env.DOJAH_SECRET;

    const res = await fetch(
      `http://api.dojah.io/api/v1/kyc/nin?nin= ${NIN}`,
      {
        method: "GET",
        headers: {
          appId: DOJAH_APP_ID,
          Authorization: `Bearer${DOJAH_SECRET}`,
        },
      }
    );
    
    const { userEventRepo } = getRepos();
    // Update user with NIN verification
    await userEventRepo.commands.verifyNIN(userId);
    await userEventRepo.handler.runOnce();
    
    return { message: "NIN verified successfully" };
  } catch (err) {
    throw err;
  }
}

async function verify_email(code) {
  try {
    const { userEventRepo } = getRepos();
    
    // Find user by verifyToken - need to scan all users
    // In production, maintain an index or separate collection
    const credsColl = await getCredentialsCollection();
    const creds = await credsColl.findOne({ verifyToken: code });
    
    if (!creds) {
      // Try to find by any valid token
      const allUsers = await userEventRepo.findAll();
      const userWithToken = allUsers.find(u => u.verifyToken === code);
      if (userWithToken) {
        await userEventRepo.commands.verifyEmail(userWithToken._id);
        await userEventRepo.handler.runOnce();
        return { ...userWithToken, alreadyVerified: true };
      }
      return null;
    }

    const user = await userEventRepo.findById(creds.userId);
    
    if (user) {
      if (user.verifiedEmail) {
        return { ...user._doc, alreadyVerified: true };
      }
      
      await userEventRepo.commands.verifyEmail(user._id);
      await userEventRepo.handler.runOnce();
      
      // Clear verify token in credentials
      await credsColl.updateOne(
        { _id: creds._id },
        { $set: { verifyToken: null, verificationTokenExpireAt: null } }
      );
      
      await sendWelcomeEmail(user.email, user.userName);
      return { ...user._doc, alreadyVerified: false };
    }
    
    return null;
  } catch (error) {
    console.log("error occurred in service verification");
    throw error;
  }
}

async function login_user(password, email) {
  try {
    console.log("=== LOGIN SERVICE ===");
    console.log("Email:", email);
    
    // Find credentials by email
    const credsColl = await getCredentialsCollection();
    const creds = await credsColl.findOne({ email: email });
    
    if (!creds) {
      console.log("ERROR: Credentials not found");
      throw new Error("Invalid email or password");
    }
    
    // Get user from event store
    const { userEventRepo } = getRepos();
    const user = await userEventRepo.findById(creds.userId);
    
    if (!user) {
      console.log("ERROR: User not found");
      throw new Error("Invalid email or password");
    }
    
    // Check if email is verified
    if (!user.verifiedEmail) {
      console.log("ERROR: User email not verified");
      throw new Error("Please verify your email before logging in. Check your email for the verification code.");
    }
    
    console.log("User found:", user.email);
    console.log("User verifiedEmail:", user.verifiedEmail);
    console.log("Stored password hash exists:", creds.password ? "yes" : "NO");
    
    if (!creds.password) {
      console.log("ERROR: User has no password stored!");
      throw new Error("Invalid email or password");
    }
    
    console.log("Comparing passwords...");
    const isValidPassword = await bcrypt.compare(password, creds.password);
    console.log("Password comparison result:", isValidPassword ? "MATCH" : "NO MATCH");

    if (!isValidPassword) {
      console.log("ERROR: Password does not match");
      throw new Error("Invalid email or password");
    }
    
    // Record login event
    await userEventRepo.commands.login(user._id);
    await userEventRepo.handler.runOnce();

    console.log("=== LOGIN SUCCESSFUL ===");
    return user;
  } catch (err) {
    console.error("Error during login:", err);
    throw err;
  }
}

async function signup_user(dataObject) {
  try {
    const { userEventRepo } = getRepos();
    const credsColl = await getCredentialsCollection();
    
    // Check if email already exists in credentials
    const existingCreds = await credsColl.findOne({ email: dataObject.email });
    if (existingCreds) {
      throw new Error("Email already exists");
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(dataObject.password, saltround);
    const verifyToken = await generateVerificationCode();
    
    // Generate user ID
    const mongoose = require('mongoose');
    const userId = new mongoose.Types.ObjectId().toString();
    
    // Create user via event sourcing
    await userEventRepo.create({
      _id: userId,
      email: dataObject.email,
      userName: dataObject.userName,
      phoneNumber: dataObject.phoneNumber,
    });
    
    // Store credentials separately (password not in event store)
    await credsColl.insertOne({
      userId: userId,
      email: dataObject.email,
      password: hashedPassword,
      role: dataObject.role || 'USER',
      verifyToken: verifyToken,
      verificationTokenExpireAt: Date.now() + 24 * 60 * 60 * 1000, // 24hr
      createdAt: new Date(),
    });
    
    // Send verification email
    await sendVerificationEmail(dataObject.email, dataObject.userName, verifyToken);
    
    // Get the created user
    const user = await userEventRepo.findById(userId);
    console.log(user.email);

    return user;
  } catch (err) {
    console.log("error creating user - complete-verification:", err.message);
    throw err;
  }
}

async function resend_verification(email) {
  try {
    const { userEventRepo } = getRepos();
    const credsColl = await getCredentialsCollection();
    
    const creds = await credsColl.findOne({ email: email });
    
    if (!creds) {
      throw new Error("User not found");
    }
    
    const user = await userEventRepo.findById(creds.userId);
    
    if (!user) {
      throw new Error("User not found");
    }
    
    if (user.verifiedEmail) {
      throw new Error("Email already verified");
    }
    
    const newVerifyToken = await generateVerificationCode();
    
    // Update credentials
    await credsColl.updateOne(
      { _id: creds._id },
      { 
        $set: { 
          verifyToken: newVerifyToken,
          verificationTokenExpireAt: Date.now() + 24 * 60 * 60 * 1000 
        } 
      }
    );
    
    await sendVerificationEmail(user.email, user.userName, newVerifyToken);
    
    return { message: "Verification code resent successfully" };
  } catch (error) {
    console.error("Error resending verification:", error);
    throw error;
  }
}

module.exports = {
  verif_NIN,
  verify_email,
  signup_user,
  login_user,
  resend_verification,
};
