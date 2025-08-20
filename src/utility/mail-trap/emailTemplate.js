const successEmail = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Signup Successful</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      background-color: #f5f8fa;
      font-family: 'Segoe UI', sans-serif;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 50px auto;
      background: #ffffff;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 0 20px rgba(0,0,0,0.05);
      text-align: center;
    }
    .checkmark {
      font-size: 60px;
      color: #28a745;
      margin-bottom: 20px;
    }
    h1 {
      font-size: 28px;
      color: #28a745;
      margin-bottom: 15px;
    }
    p {
      font-size: 16px;
      color: #333;
      line-height: 1.6;
      margin: 10px 0;
    }
    .btn {
 
      display: inline-block;
      margin-top: 25px;
      padding: 14px 32px;
      background-color: #28a745;
      color: #fff;
      border-radius: 8px;
      text-decoration: none;
      font-weight: bold;
      transition: background 0.3s;
    }
    .btn:hover {
      background-color: #218838;
    }
    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #888;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="checkmark">✔</div>
    <h1>Signup Successful!</h1>
    <p>Hi [UserName],</p>
    <p>Your account with <strong>Agent With Me</strong> has been successfully created.</p>
    <p>Click the button below to log in and claim your badge!</p>
    <a href="https://agent-with-me-frountend.vercel.app/Signup" class="btn">Log In to Your Account</a>
    <p>Check your name on the First 100 users list here:</p>
    <a href="https://agent-with-me-frountend.vercel.app/first100" class="btn">See First 100 Users</a>
    <div class="footer">
      &copy; 2025 Agent With Me. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

const forgetPasswordEmail = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Password Reset</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { background-color: #f4f4f4; font-family: 'Segoe UI', sans-serif; margin: 0; padding: 0; }
    .email-wrapper { max-width: 600px; background: #fff; margin: auto; padding: 40px; border-radius: 8px; }
    h2 { color: #d9534f; text-align: center; }
    p { font-size: 16px; line-height: 1.6; color: #333; }
    .btn {
      display: inline-block;
      background: #d9534f;
      color: #fff;
      padding: 12px 24px;
      border-radius: 5px;
      text-decoration: none;
      margin-top: 20px;
      font-weight: bold;
    }
    .footer { font-size: 12px; text-align: center; color: #888; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <h2>Reset Your Password</h2>
    <p>Hi [UserName],</p>
    <p>We received a request to reset your password. Click the button below to set a new one:</p>
    <a href="https://AGENT WITH ME app.com/reset-password?token=123456" class="btn">Reset Password</a>
    <p>If you didn’t request this, you can ignore this email.</p>
    <div class="footer">&copy; 2025 AGENT WITH ME . All rights reserved.</div>
  </div>
</body>
</html>
`;
const verificationEmail = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Your Verification Code</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
   .btn {
      display: inline-block;
      margin-top: 25px;
      padding: 14px 32px;
      background-color: #28a745;
      color: #fff;
      border-radius: 8px;
      text-decoration: none;
      font-weight: bold;
      transition: background 0.3s;
      padding:10px;
    }
    .btn:hover {
      background-color: #218838;
    }
    body { background: #f4f4f4; font-family: 'Segoe UI', sans-serif; }
    .container { max-width: 600px; background: #fff; margin: auto; padding: 40px; border-radius: 8px; }
    h2 { color: #0a75c2; text-align: center; }
    p { font-size: 16px; color: #333; line-height: 1.6; }
    .code-box {
      text-align: center;
      background: #e6f2ff;
      padding: 20px;
      font-size: 24px;
      font-weight: bold;
      color: #0a75c2;
      border: 2px dashed #0a75c2;
      margin: 30px 0;
      border-radius: 5px;
    }
      
    .footer { font-size: 12px; text-align: center; color: #888; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Email Verification Code</h2>
    <p>Hi [userName],</p>
    <p>Click on the button to Verify your Email </p>
   <a href = "https://agent-with-me-frountend.vercel.app/verify-email/[verificationcode]" class="btn">
   Verify your Email </a>
    <p>This code will expire in 10 minutes.</p>
    <div class="footer">&copy; 2025 AGENT WITH ME . All rights reserved.</div>
  </div>
</body>
</html>
`;
const welcomeEmail = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Welcome to AGENT WITH ME !</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { background-color: #f9f9f9; font-family: 'Segoe UI', sans-serif; padding: 0; margin: 0; }
    .email-container { max-width: 600px; margin: auto; background: #fff; padding: 40px; border-radius: 8px; }
    h1 { color: #0a75c2; text-align: center; }
    p { font-size: 16px; line-height: 1.6; color: #333; }
    .btn { display: inline-block; background: #0a75c2; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; }
    .footer { font-size: 12px; text-align: center; color: #888; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="email-container">
    <h1>Welcome to AGENT WITH ME  🎉</h1>
    <p>Hi [UserName],</p>
    <p>Thank you for signing up for <strong>AGENT WITH ME </strong>! We’re thrilled to have you on board.</p>
    <p>You can now start creating and organizing your notes effortlessly.</p>
    <p><a href="https://AGENT WITH ME app.com/dashboard" class="btn">Go to Dashboard</a></p>
    <div class="footer">&copy; 2025 AGENT WITH ME . All rights reserved.</div>
  </div>
</body>
</html>
r`;

// <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8">
//   <title>Notification from AGENT WITH ME </title>
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <style>
//     body { background: #f0f0f0; font-family: 'Segoe UI', sans-serif; margin: 0; padding: 0; }
//     .email-box { max-width: 600px; background: #fff; padding: 40px; margin: auto; border-radius: 8px; }
//     h2 { color: #333; }
//     p { font-size: 16px; line-height: 1.6; color: #444; }
//     .footer { font-size: 12px; color: #888; text-align: center; margin-top: 30px; }
//   </style>
// </head>
// <body>
//   <div class="email-box">
//     <h2>Hello [UserName]</h2>
//     <p>This is a notification from <strong>AGENT WITH ME </strong>.</p>
//     <p>[Your custom message goes here.]</p>
//     <div class="footer">&copy; 2025 AGENT WITH ME . All rights reserved.</div>
//   </div>
// </body>
// </html>

module.exports = {
  sucessEmail: successEmail,
  forgetPasswordEmail: forgetPasswordEmail,
  verificationEmail: verificationEmail,
  welcomeEmail: successEmail,
};
