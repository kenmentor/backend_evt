const { client, sender } = require("./mailTrapConfig");
const {
  verificationEmail,
  welcomeEmail,
  forgetPasswordEmail,
} = require("./emailTemplate");

// 🟢 Generalized send function
async function sendEmail(options) {
  try {
    const response = await client.sendMail({
      from: sender,
      ...options,
    });
    console.log("✅ Email sent:", response);
    return response;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw error;
  }
}

// 🟡 Specific email helpers
async function sendVerificationEmail(email, verificationToken, userName) {
  return sendEmail({
    to: email,
    subject: "Verify your email address",
    html: verificationEmail
      .replace("[verificationcode]", verificationToken)
      .replace("[userName]", userName),
    category: "Email Verification",
  });
}

async function sendWelcomeEmail(email, userName) {
  return sendEmail({
    to: email,
    subject: "Welcome to Agent-With-Me 🎉",
    html: welcomeEmail.replace("[userName]", userName),
  });
}

async function sendPasswordResetEmail(email, resetURL) {
  return sendEmail({
    to: email,
    subject: "Reset your password",
    html: forgetPasswordEmail.replace("[resetURL]", resetURL),
  });
}

async function sendResetPasswordSuccessEmail(email) {
  return sendEmail({
    to: email,
    subject: "Password Reset Successful",
    html: `<p>Hello,</p><p>Your password has been reset successfully. If this wasn't you, please contact support immediately.</p>`,
  });
}

async function sendRequestEmail(email, requestMessage) {
  return sendEmail({
    to: email,
    subject: "New Request Notification",
    html: `<p>Hello,</p><p>${requestMessage}</p>`,
  });
}

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendResetPasswordSuccessEmail,
  sendRequestEmail,
};
