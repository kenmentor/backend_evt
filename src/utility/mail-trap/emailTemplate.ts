const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3001";

const baseStyles = `
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      background-color: #f4f5f7; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .email-container { 
      max-width: 600px; 
      margin: 40px auto; 
      background: #ffffff; 
      border-radius: 16px; 
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }
    .email-header { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .email-header h1 { 
      font-size: 28px; 
      font-weight: 700;
      margin-bottom: 8px;
    }
    .email-header p { 
      font-size: 16px; 
      opacity: 0.9;
    }
    .email-body { 
      padding: 40px 30px;
    }
    .email-body p { 
      font-size: 16px; 
      color: #555;
      margin-bottom: 20px;
    }
    .email-body h2 {
      font-size: 20px;
      color: #333;
      margin-bottom: 16px;
    }
    .btn { 
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 10px 0;
      text-align: center;
    }
    .btn:hover {
      opacity: 0.9;
    }
    .btn-outline {
      background: transparent;
      border: 2px solid #667eea;
      color: #667eea !important;
    }
    .code-box { 
      background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
      border: 2px dashed #667eea;
      border-radius: 12px;
      padding: 24px 40px;
      text-align: center;
      margin: 24px 0;
    }
    .code-box .code { 
      font-size: 36px; 
      font-weight: 700;
      color: #667eea;
      letter-spacing: 8px;
      font-family: 'Courier New', monospace;
    }
    .code-box p {
      margin-top: 12px;
      font-size: 14px;
      color: #888;
    }
    .features { 
      background: #f8f9fa; 
      border-radius: 12px; 
      padding: 24px;
      margin: 24px 0;
    }
    .features li { 
      margin: 12px 0;
      padding-left: 8px;
      color: #555;
    }
    .footer { 
      text-align: center;
      padding: 30px;
      font-size: 14px;
      color: #888;
      border-top: 1px solid #eee;
    }
    .footer a { 
      color: #667eea;
      text-decoration: none;
    }
    .highlight { 
      color: #667eea;
      font-weight: 600;
    }
    .mb-20 { margin-bottom: 20px; }
    .text-center { text-align: center; }
  </style>
`;

const verificationEmail = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
  ${baseStyles}
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>🔐 Verify Your Email</h1>
      <p>Almost there! Complete your registration</p>
    </div>
    <div class="email-body">
      <p>Hi <span class="highlight">[userName]</span>,</p>
      <p>Thank you for signing up with <strong>Agent With Me</strong>! Please verify your email address to activate your account.</p>
      
      <div class="code-box">
        <p>Your verification code:</p>
        <div class="code">[verificationcode]</div>
        <p>Enter this code on the verification page</p>
      </div>
      
      <div class="text-center mb-20">
        <p>Or click the button below to verify:</p>
        <a href="[verifyUrl]" class="btn">Verify Email</a>
      </div>
      
      <p style="font-size: 14px; color: #888;">
        ⏰ This code expires in <strong>24 hours</strong>. If you didn't create an account, you can safely ignore this email.
      </p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Agent With Me. All rights reserved.</p>
      <p style="margin-top: 8px;">
        <a href="${FRONTEND_URL}">Visit Website</a> • 
        <a href="${FRONTEND_URL}/auth/login">Login</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

const welcomeEmail = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Agent With Me</title>
  ${baseStyles}
</head>
<body>
  <div class="email-container">
    <div class="email-header" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);">
      <h1>🎉 Welcome Aboard!</h1>
      <p>Your account is now active</p>
    </div>
    <div class="email-body">
      <p>Hi <span class="highlight">[userName]</span>,</p>
      <p>Welcome to <strong>Agent With Me</strong> – your gateway to finding the perfect property!</p>
      
      <div class="features">
        <h2>What you can do now:</h2>
        <ul>
          <li>🏠 Browse verified properties across Nigeria</li>
          <li>📅 Schedule property tours with ease</li>
          <li>💬 Chat directly with landlords and agents</li>
          <li>🔒 Complete your verification for trusted status</li>
        </ul>
      </div>
      
      <div class="text-center mb-20">
        <a href="${FRONTEND_URL}/properties" class="btn">Browse Properties</a>
      </div>
      
      <p>Need help getting started? Check out our <a href="${FRONTEND_URL}/help" style="color: #667eea;">help center</a> or reply to this email.</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Agent With Me. All rights reserved.</p>
      <p style="margin-top: 8px;">
        <a href="${FRONTEND_URL}">Visit Website</a> • 
        <a href="${FRONTEND_URL}/auth/login">Go to Dashboard</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

const forgetPasswordEmail = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  ${baseStyles}
</head>
<body>
  <div class="email-container">
    <div class="email-header" style="background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);">
      <h1>🔑 Reset Password</h1>
      <p>Secure your account with a new password</p>
    </div>
    <div class="email-body">
      <p>Hi <span class="highlight">[userName]</span>,</p>
      <p>We received a request to reset your password. Click the button below to create a new password for your account.</p>
      
      <div class="text-center mb-20">
        <a href="[resetUrl]" class="btn">Reset Password</a>
      </div>
      
      <p style="background: #fff3cd; padding: 16px; border-radius: 8px; border-left: 4px solid #ffc107;">
        ⚠️ <strong>Important:</strong> This link expires in 1 hour. If you didn't request a password reset, please ignore this email or contact support immediately if you suspect unauthorized access.
      </p>
      
      <p style="margin-top: 20px;">For security reasons, please don't share this link with anyone.</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Agent With Me. All rights reserved.</p>
      <p style="margin-top: 8px;">
        <a href="${FRONTEND_URL}">Visit Website</a> • 
        <a href="${FRONTEND_URL}/auth/login">Login</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

const passwordResetSuccessEmail = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Changed</title>
  ${baseStyles}
</head>
<body>
  <div class="email-container">
    <div class="email-header" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);">
      <h1>✅ Password Changed</h1>
      <p>Your account is secure</p>
    </div>
    <div class="email-body">
      <p>Hi <span class="highlight">[userName]</span>,</p>
      <p>Your password has been successfully changed.</p>
      
      <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <p style="margin: 0; color: #2e7d32;">✓ If this was you, no further action is needed.</p>
      </div>
      
      <p style="background: #ffebee; padding: 16px; border-radius: 8px; border-left: 4px solid #f44336;">
        🛡️ <strong>Didn't make this change?</strong> Contact our support team immediately. Someone may be trying to access your account.
      </p>
      
      <div class="text-center mb-20" style="margin-top: 24px;">
        <a href="${FRONTEND_URL}/auth/login" class="btn">Login to Your Account</a>
      </div>
    </div>
    <div class="footer">
      <p>&copy; 2025 Agent With Me. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

const successEmail = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Signup Successful</title>
  ${baseStyles}
</head>
<body>
  <div class="email-container">
    <div class="email-header" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);">
      <h1>🎉 Account Created!</h1>
      <p>Welcome to Agent With Me</p>
    </div>
    <div class="email-body">
      <p>Hi <span class="highlight">[userName]</span>,</p>
      <p>Your account has been successfully created! Please check your inbox for the verification email to activate your account.</p>
      
      <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #1565c0;"><strong>Next Steps:</strong></p>
        <ul style="margin-top: 10px; padding-left: 20px;">
          <li>Check your inbox for the verification email</li>
          <li>Enter the verification code</li>
          <li>Complete your profile</li>
        </ul>
      </div>
      
      <div class="text-center mb-20">
        <a href="${FRONTEND_URL}/auth/verify" class="btn">Verify Email</a>
      </div>
    </div>
    <div class="footer">
      <p>&copy; 2025 Agent With Me. All rights reserved.</p>
      <p style="margin-top: 8px;">
        <a href="${FRONTEND_URL}/auth/login">Already verified? Login here</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

const requestNotificationEmail = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Request Notification</title>
  ${baseStyles}
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>📩 New Request</h1>
      <p>Someone is interested in your property</p>
    </div>
    <div class="email-body">
      <p>Hi <span class="highlight">[userName]</span>,</p>
      <p>[requestMessage]</p>
      
      <div class="text-center mb-20" style="margin-top: 24px;">
        <a href="${FRONTEND_URL}/dashboard" class="btn">View Dashboard</a>
      </div>
    </div>
    <div class="footer">
      <p>&copy; 2025 Agent With Me. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export {
  verificationEmail,
  welcomeEmail,
  forgetPasswordEmail,
  passwordResetSuccessEmail,
  successEmail,
  requestNotificationEmail,
  FRONTEND_URL,
};
