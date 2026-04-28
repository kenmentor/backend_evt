import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();
import { response } from "../utility";
import { sendPasswordResetEmail, sendResetPasswordSuccessEmail } from "../utility/mail-trap/emails";
import { userCmd } from "../es/commands/user";
import { queryUsers } from "../es/queries";
import { projectionHandlers } from "../es/projection";

const saltround = 10;
const jwt_api_key = process.env.JWT_API_KEY;

export async function delete_user(id: string) {
  try {
    await userCmd.delete(id, {});
    await projectionHandlers.users.runOnce();
    return { ...response.goodResponse, data: { deleted: true } };
  } catch (err: any) {
    return { ...response.badResponse, message: err.message };
  }
}

export async function verify(verificationCode: string) {
  const users = await queryUsers.getAll();
  const user = users.find((u: any) => (u as any).verifyToken === verificationCode);

  if (user) {
    await userCmd.verifyEmail(user.userId, {});
    await projectionHandlers.users.runOnce();
    const updated = await queryUsers.getByAggregateId(user.userId);
    return updated;
  }
  return null;
}

export async function edit_user_details(id: string, object: any) {
  if (object.role) {
    await userCmd.changeRole(id, { role: object.role });
    await projectionHandlers.users.runOnce();
  }

  if (object.profileImage) {
    await userCmd.updateProfileImage(id, { profileImage: object.profileImage });
    await projectionHandlers.users.runOnce();
  }

  return await queryUsers.getByAggregateId(id);
}

export async function get_user(id: string) {
  return await queryUsers.getByAggregateId(id);
}

export async function filter(object: any) {
  if (object.role) {
    return await queryUsers.getByRole(object.role);
  }
  if (object.adminVerified) {
    return await queryUsers.getVerifiedUsers();
  }
  return await queryUsers.getAll();
}

export async function find_users(object: any) {
  return filter(object);
}

export async function forgot_password(email: string) {
  try {
    console.log("=== FORGOT PASSWORD SERVICE ===");
    console.log("Email received:", email);

    const user = await queryUsers.getByEmail(email);

    if (!user) {
      console.log("ERROR: No user found with email:", email);
      return { success: false, message: "User not found" };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpireAt = Date.now() + 60 * 60 * 1000;

    await userCmd.requestPasswordReset(user.userId, { token: resetToken, expiresAt: resetTokenExpireAt });
    await projectionHandlers.users.runOnce();

    const updatedUser = await queryUsers.getByAggregateId(user.userId);
    console.log("User updated, forgottonPasswordToken:", (updatedUser as any)?.forgottonPasswordToken ? "set" : "NOT SET");

    const emailResult = await sendPasswordResetEmail(updatedUser.email, resetToken, updatedUser.userName);
    console.log("Email send result:", emailResult ? "success" : "failed");

    console.log("=== FORGOT PASSWORD COMPLETE ===");
    return { success: true, message: "Password reset email sent" };
  } catch (error) {
    console.error("Forgot password error:", error);
    throw error;
  }
}

export async function find_user(object: any) {
  if (object.email) {
    return await queryUsers.getByEmail(object.email);
  }
  if (object.phoneNumber) {
    return await queryUsers.getByPhone(object.phoneNumber);
  }
  return null;
}

export async function reset_password(object: any) {
  try {
    console.log("=== RESET PASSWORD SERVICE ===");
    console.log("Token received:", object.token);

    const allUsers = await queryUsers.getAll();
    const user = allUsers.find((u: any) =>
      (u as any).forgottonPasswordToken === object.token &&
      (u as any).forgottonPasswordTokenExpireAt > Date.now()
    );

    if (!user) {
      console.log("ERROR: User not found with token or token expired");
      return { success: false, message: "Invalid or expired reset token" };
    }

    console.log("User found, proceeding with password reset...");

    await userCmd.resetPassword(user.userId, {});
    await projectionHandlers.users.runOnce();

    const updatedUser = await queryUsers.getByAggregateId(user.userId);
    console.log("Password reset completed");

    console.log("Sending success email to:", updatedUser.email);
    await sendResetPasswordSuccessEmail(updatedUser.email, updatedUser.userName);

    console.log("=== RESET PASSWORD COMPLETE ===");
    return { success: true, message: "Password changed successfully", user: { email: updatedUser.email, userName: updatedUser.userName } };
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
}
