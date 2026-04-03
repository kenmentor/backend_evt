const { verification_repository } = require("../repositories");
const { userDB } = require("../modules");
const {
  response,
  generateVerificationCode,
  generateTokenAndSetCookie,
} = require("../utility");
const { email } = require("../utility/");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  sendVerificationEmail,
  sendWelcomeEmail,
} = require("../utility/mail-trap/emails");
const saltround = 10;
const jwt_api_key = process.env.JWT_API_KEY;
const verificationRepo = new verification_repository(userDB);
async function verif_NIN(NIN, userId) {
  try {
    const DOJAH_APP_ID = process.env.DOJAH_ID;
    const DOJAH_SECRET = process.env.DOJAH_SECRET;

    const response = await fetch(
      `http://api.dojah.io/api/v1/kyc/nin?nin= ${NIN}`,
      {
        method: "GET",
        headers: {
          appId: DOJAH_APP_ID,
          Authorization: `Bearer${DOJAH_SECRET}`,
        },
      }
    );
    const data = await verificationRepo.update(
      userId,
      dresponse.data.data.entity
    );
    return (response.badResponse.message = "creted successfully ");
  } catch (err) {
    throw err;
  }
}

async function verify_email(code) {
  console.log(code);
  try {
    // First try to find by token
    let user = await verificationRepo.findOne({
      verifyToken: code,
      verificationTokenExpireAt: { $gt: Date.now() },
    });

    // If not found by token, check if already verified with any code
    if (!user) {
      user = await verificationRepo.findOne({
        verifiedEmail: true,
      });
      if (user) {
        return { ...user._doc, alreadyVerified: true };
      }
    }

    console.log(user);
    if (user) {
      // If already verified, return success
      if (user.verifiedEmail) {
        return { ...user._doc, alreadyVerified: true };
      }
      
      user.verifiedEmail = true;
      user.verifyToken = undefined;
      user.verificationTokenExpireAt = undefined;
      await user.save();
      await sendWelcomeEmail(user.email, user.userName);
    }
    console.log(user);
    return user;
  } catch (error) {
    console.log("error occured in service verification ");
    throw error;
  }
}

async function login_user(password, email) {
  try {
    console.log("=== LOGIN SERVICE ===");
    console.log("Email:", email);
    console.log("Password provided:", password ? "yes" : "no");
    
    // First check if user exists at all
    const userExists = await verificationRepo.findOne({ email: email });
    
    if (!userExists) {
      console.log("ERROR: User not found");
      throw new Error("Invalid email or password");
    }
    
    // Check if email is verified
    if (!userExists.verifiedEmail) {
      console.log("ERROR: User email not verified");
      throw new Error("Please verify your email before logging in. Check your email for the verification code.");
    }
    
    const user = await verificationRepo.findOne({
      email: email,
      verifiedEmail: true,
    });
    
    if (!user) {
      console.log("ERROR: User not found or not verified");
      throw new Error("Invalid email or password");
    }
    
    console.log("User found:", user.email);
    console.log("User verifiedEmail:", user.verifiedEmail);
    console.log("Stored password hash exists:", user.password ? "yes" : "NO - THIS IS THE PROBLEM!");
    
    if (!user.password) {
      console.log("ERROR: User has no password stored!");
      throw new Error("Invalid email or password");
    }
    
    console.log("Comparing passwords...");
    const isvalidpassword = await bcrypt.compare(password, user.password);
    console.log("Password comparison result:", isvalidpassword ? "MATCH" : "NO MATCH");

    if (!isvalidpassword) {
      console.log("ERROR: Password does not match");
      throw new Error("Invalid email or password");
    }

    console.log("=== LOGIN SUCCESSFUL ===");
    return user;
  } catch (err) {
    console.error("Error during login:", err);
    throw err;
  }
}

async function signup_user(dataObject, res) {
  try {
    const hashedPassword = await bcrypt.hash(dataObject.password, saltround);
    const verifyToken = await generateVerificationCode();
    const data = await verificationRepo.create({
      ...dataObject,
      password: hashedPassword,
      verifyToken: verifyToken,
      verificationTokenExpireAt: Date.now() + 24 * 60 * 60 * 1000, //24hr
    });
    console.log(data.email);

    return data;
  } catch (err) {
    console.log("erro creating user -complete-verification");
    throw err;
  }
}

async function resend_verification(email) {
  try {
    const user = await verificationRepo.findOne({ email: email });
    
    if (!user) {
      throw new Error("User not found");
    }
    
    if (user.verifiedEmail) {
      throw new Error("Email already verified");
    }
    
    const newVerifyToken = await generateVerificationCode();
    user.verifyToken = newVerifyToken;
    user.verificationTokenExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();
    
    await sendVerificationEmail(user.email, user.userName, newVerifyToken);
    
    return { message: "Verification code resent successfully" };
  } catch (error) {
    console.error("Error resending verification:", error);
    throw error;
  }
}

module.exports = {
  verif_NIN: verif_NIN,
  verify_email: verify_email,
  signup_user: signup_user,
  login_user: login_user,
  resend_verification: resend_verification,
};
