const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const dotenv = require("dotenv").config();
const { userDB } = require("../modules");
const { response } = require("../utility");
const { user_repository } = require("../repositories");
const userRepo = new user_repository(userDB);
const { generateVerificationCode } = require("../utility");
const { sendPasswordResetEmail, sendResetPasswordSuccessEmail } = require("../utility/mail-trap/emails");
const saltround = 10;
const jwt_api_key = process.env.JWT_API_KEY;

async function delete_user(id) {
  try {
    const data = await userRepo.delete(id);
    const Response = response.goodResponse;
    return (Response.data = data);
  } catch (err) {}
}

async function verify(verificationCode) {
  const user = await userRepo.findOne({ verifyToken: verificationCode });
  console.log("1ke");
  if (user) {
    user.verifiedEmail = true;
    const verifiedUser = await user.save();
    console.log("keke");
    return verifiedUser;
  }
  console.log("keke3 ");
}

async function edit_user_details(id, object) {
  const data = await userRepo.update(id, object);
  return data;
}

async function get_user(id) {
  const data = await userRepo.findById(id);
  return data;
}

async function filter(object) {
  const data = await userRepo.find(object);
  return data;
}

async function find_users(object) {
  console.log(object);
  return userRepo.filter(object);
}

async function forgot_password(email) {
  try {
    console.log("=== FORGOT PASSWORD SERVICE ===");
    console.log("Email received:", email);
    
    const user = await userRepo.findOne({ email: email });
    console.log("User found:", user ? "yes" : "no");
    
    if (!user) {
      console.log("ERROR: No user found with email:", email);
      return { success: false, message: "User not found" };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpireAt = Date.now() + 60 * 60 * 1000; // 1 hour

    console.log("Generated reset token:", resetToken);
    console.log("Token expires at:", new Date(resetTokenExpireAt).toISOString());
    
    user.forgottonPasswordToken = resetToken;
    user.forgottonPasswordTokenExpireAt = resetTokenExpireAt;
    
    const savedUser = await user.save();
    console.log("User saved, forgottonPasswordToken:", savedUser.forgottonPasswordToken ? "set" : "NOT SET");
    console.log("Token saved matches generated:", savedUser.forgottonPasswordToken === resetToken ? "YES" : "NO");
    
    const emailResult = await sendPasswordResetEmail(user.email, resetToken, user.userName);
    console.log("Email send result:", emailResult ? "success" : "failed");
    
    console.log("=== FORGOT PASSWORD COMPLETE ===");
    return { success: true, message: "Password reset email sent" };
  } catch (error) {
    console.error("Forgot password error:", error);
    throw error;
  }
}

async function find_user(object) {
  const user = await userRepo.findOne(object);
  return user;
}

async function reset_password(object) {
  try {
    console.log("=== RESET PASSWORD SERVICE ===");
    console.log("Token received:", object.token);
    console.log("Token length:", object.token ? object.token.length : 0);
    
    const query = {
      forgottonPasswordToken: object.token,
      forgottonPasswordTokenExpireAt: { $gt: Date.now() },
    };
    console.log("Query:", JSON.stringify(query));
    
    const data = await userRepo.findOne(query);
    console.log("User found:", data ? data.email : "NULL");

    if (!data) {
      console.log("ERROR: User not found with token or token expired");
      console.log("Checking if token exists in database...");
      const allUsers = await userRepo.find({});
      console.log("Total users in DB:", allUsers.length);
      // Check if any user has this token
      const userWithToken = allUsers.find(u => u.forgottonPasswordToken === object.token);
      console.log("User with matching token:", userWithToken ? userWithToken.email : "none");
      return { success: false, message: "Invalid or expired reset token" };
    }

    console.log("User found, proceeding with password reset...");
    console.log("Current password field:", data.password ? "exists" : "missing");
    
    const hashedPassword = await bcrypt.hash(object.password, saltround);
    console.log("New hashed password generated, length:", hashedPassword.length);
    
    data.password = hashedPassword;
    data.forgottonPasswordToken = undefined;
    data.forgottonPasswordTokenExpireAt = undefined;
    
    const savedData = await data.save();
    console.log("Password saved, new hash:", savedData.password ? "exists" : "missing");
    console.log("Saved document verified:", savedData.password === hashedPassword ? "YES" : "NO");

    console.log("Sending success email to:", data.email);
    await sendResetPasswordSuccessEmail(data.email, data.userName);
    
    console.log("=== RESET PASSWORD COMPLETE ===");
    return { success: true, message: "Password changed successfully", user: { email: data.email, userName: data.userName } };
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
}

module.exports = {
  verify,
  edit_user_details,
  delete_user,
  get_user,
  find_users,
  forgot_password,
  reset_password,
  find_user,
  filter,
};
