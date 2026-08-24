import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Generate verification token (random hex, not JWT)
// Returns the plain token - caller will hash and store it
export const generateVerificationToken = () => {
  return crypto.randomBytes(20).toString('hex');
};

// Generate and hash password reset token (Random hex, not JWT)
export const getResetPasswordToken = function(user) {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire (10 minutes)
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

export default generateToken;
