export const verificationEmailTemplate = (verificationUrl) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
    .header { background: #8b5cf6; padding: 30px 40px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 700; }
    .content { padding: 40px; }
    .content p { color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px; }
    .button { display: inline-block; background: #8b5cf6; color: white; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 8px; margin-bottom: 24px; }
    .footer { padding: 30px 40px; background: #f3f4f6; text-align: center; color: #6b7280; font-size: 14px; }
    .link-fallback { font-size: 14px; color: #6b7280; word-break: break-all; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>KalaConnect</h1>
    </div>
    <div class="content">
      <p>Welcome to KalaConnect! We're thrilled to have you join our community of artisans and craft lovers.</p>
      <p>Before you can start using your account, we just need to verify your email address to keep everything secure.</p>
      <div style="text-align: center;">
        <a href="${verificationUrl}" class="button">Verify Email Address</a>
      </div>
      <p>This link will expire in 24 hours.</p>
      <p class="link-fallback">If the button doesn't work, copy and paste this link into your browser:<br>${verificationUrl}</p>
    </div>
    <div class="footer">
      <p>If you didn't create an account with KalaConnect, you can safely ignore this email.</p>
      <p>&copy; ${new Date().getFullYear()} KalaConnect. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const resetPasswordTemplate = (resetUrl) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
    .header { background: #8b5cf6; padding: 30px 40px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 700; }
    .content { padding: 40px; }
    .content p { color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px; }
    .button { display: inline-block; background: #8b5cf6; color: white; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 8px; margin-bottom: 24px; }
    .footer { padding: 30px 40px; background: #f3f4f6; text-align: center; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset Request</h1>
    </div>
    <div class="content">
      <p>You are receiving this email because you (or someone else) requested a password reset for your KalaConnect account.</p>
      <div style="text-align: center;">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </div>
      <p>This link will expire in 10 minutes.</p>
      <p>If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} KalaConnect. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
