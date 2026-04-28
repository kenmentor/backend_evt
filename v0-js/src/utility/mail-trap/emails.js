require("dotenv").config();
const { client, sender } = require("./mailTrapConfig");
const {
  verificationEmail,
  welcomeEmail,
  forgetPasswordEmail,
  passwordResetSuccessEmail,
  successEmail,
  requestNotificationEmail,
  FRONTEND_URL,
} = require("./emailTemplate");

const sendEmail = async (options) => {
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
};

async function sendVerificationEmail(email, verificationToken, userName) {
  const verifyUrl = `${FRONTEND_URL}/auth/verify/${verificationToken}?email=${encodeURIComponent(email)}`;
  
  return sendEmail({
    to: email,
    subject: "Verify your email - Agent With Me",
    html: verificationEmail
      .replace(/\[verificationcode\]/g, verificationToken)
      .replace(/\[userName\]/g, userName)
      .replace(/\[verifyUrl\]/g, verifyUrl),
  });
}

async function sendWelcomeEmail(email, userName) {
  return sendEmail({
    to: email,
    subject: "Welcome to Agent With Me! 🎉",
    html: welcomeEmail.replace(/\[userName\]/g, userName),
  });
}

async function sendPasswordResetEmail(email, resetToken, userName) {
  const resetUrl = `${FRONTEND_URL}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
  
  return sendEmail({
    to: email,
    subject: "Reset Your Password - Agent With Me",
    html: forgetPasswordEmail
      .replace(/\[userName\]/g, userName)
      .replace(/\[resetUrl\]/g, resetUrl),
  });
}

async function sendResetPasswordSuccessEmail(email, userName) {
  return sendEmail({
    to: email,
    subject: "Password Changed Successfully - Agent With Me",
    html: passwordResetSuccessEmail.replace(/\[userName\]/g, userName),
  });
}

async function sendRequestEmail(email, requestMessage, userName) {
  return sendEmail({
    to: email,
    subject: "New Request Notification - Agent With Me",
    html: requestNotificationEmail
      .replace(/\[userName\]/g, userName)
      .replace(/\[requestMessage\]/g, requestMessage),
  });
}

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendResetPasswordSuccessEmail,
  sendRequestEmail,
  FRONTEND_URL,
};
