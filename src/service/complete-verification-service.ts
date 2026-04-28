import { response, generateVerificationCode } from "../utility";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDb } from "../event-sourcing";
import { sendVerificationEmail, sendWelcomeEmail } from "../utility/mail-trap/emails";
import mongoose from "mongoose";
import { userCmd } from "../es/commands/user";
import { queryUsers } from "../es/queries";
import { projectionHandlers } from "../es/projection";

const saltround = 10;
const jwt_api_key = process.env.JWT_API_KEY;

async function getCredentialsCollection() {
  const db = getDb();
  return db.collection("user_credentials");
}

export async function verif_NIN(NIN: string, userId: string) {
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
        } as any,
      }
    );

    await userCmd.verifyNIN(userId, {});
    await projectionHandlers.users.runOnce();

    return { message: "NIN verified successfully" };
  } catch (err) {
    throw err;
  }
}

export async function verify_email(code: string) {
  try {
    const credsColl = await getCredentialsCollection();
    const creds = await credsColl.findOne({ verifyToken: code });

    if (!creds) {
      const allUsers = await queryUsers.getAll();
      const userWithToken = allUsers.find((u: any) => (u as any).verifyToken === code);
      if (userWithToken) {
        await userCmd.verifyEmail(userWithToken.userId, {});
        await projectionHandlers.users.runOnce();
        return { ...userWithToken, alreadyVerified: true };
      }
      return null;
    }

    const user = await queryUsers.getByAggregateId(creds.userId);

    if (user) {
      if (user.verifiedEmail) {
        return { ...(user as any), alreadyVerified: true };
      }

      await userCmd.verifyEmail(user.userId, {});
      await projectionHandlers.users.runOnce();

      await credsColl.updateOne(
        { _id: creds._id },
        { $set: { verifyToken: null, verificationTokenExpireAt: null } }
      );

      await sendWelcomeEmail(user.email, user.userName);
      return { ...(user as any), alreadyVerified: false };
    }

    return null;
  } catch (error) {
    console.log("error occurred in service verification");
    throw error;
  }
}

export async function login_user(password: string, email: string) {
  try {
    console.log("=== LOGIN SERVICE ===");
    console.log("Email:", email);

    const credsColl = await getCredentialsCollection();
    const creds = await credsColl.findOne({ email: email });

    if (!creds) {
      console.log("ERROR: Credentials not found");
      throw new Error("Invalid email or password");
    }

    const user = await queryUsers.getByAggregateId(creds.userId);

    if (!user) {
      console.log("ERROR: User not found");
      throw new Error("Invalid email or password");
    }

    if (!user.verifiedEmail) {
      console.log("ERROR: User email not verified");
      throw new Error("Please verify your email before logging in. Check your email for the verification code.");
    }

    console.log("User found:", user.email);
    console.log("User verifiedEmail:", user.verifiedEmail);

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

    await userCmd.login(user.userId, {});
    await projectionHandlers.users.runOnce();

    console.log("=== LOGIN SUCCESSFUL ===");
    return user;
  } catch (err) {
    console.error("Error during login:", err);
    throw err;
  }
}

export async function signup_user(dataObject: any) {
  try {
    const credsColl = await getCredentialsCollection();

    const existingCreds = await credsColl.findOne({ email: dataObject.email });
    if (existingCreds) {
      throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(dataObject.password, saltround);
    const verifyToken = await generateVerificationCode();

    const userId = new mongoose.Types.ObjectId().toString();

    await userCmd.create(userId, {
      email: dataObject.email,
      userName: dataObject.userName,
      phoneNumber: dataObject.phoneNumber,
    });
    await projectionHandlers.users.runOnce();

    await credsColl.insertOne({
      userId: userId,
      email: dataObject.email,
      password: hashedPassword,
      role: dataObject.role || "USER",
      verifyToken: verifyToken,
      verificationTokenExpireAt: Date.now() + 24 * 60 * 60 * 1000,
      createdAt: new Date(),
    });

    await sendVerificationEmail(dataObject.email, dataObject.userName, verifyToken);

    const user = await queryUsers.getByAggregateId(userId);
    console.log(user?.email);

    return user;
  } catch (err: any) {
    console.log("error creating user - complete-verification:", err.message);
    throw err;
  }
}

export async function resend_verification(email: string) {
  try {
    const credsColl = await getCredentialsCollection();

    const creds = await credsColl.findOne({ email: email });

    if (!creds) {
      throw new Error("User not found");
    }

    const user = await queryUsers.getByAggregateId(creds.userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.verifiedEmail) {
      throw new Error("Email already verified");
    }

    const newVerifyToken = await generateVerificationCode();

    await credsColl.updateOne(
      { _id: creds._id },
      {
        $set: {
          verifyToken: newVerifyToken,
          verificationTokenExpireAt: Date.now() + 24 * 60 * 60 * 1000,
        },
      }
    );

    await sendVerificationEmail(user.email, user.userName, newVerifyToken);

    return { message: "Verification code resent successfully" };
  } catch (error) {
    console.error("Error resending verification:", error);
    throw error;
  }
}
