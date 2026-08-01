import User from '../models/User.js';
import generateToken, { generateVerificationToken, getResetPasswordToken } from '../utils/generateToken.js';
import sendEmail from '../services/email.js';
import { verificationEmailTemplate, resetPasswordTemplate } from '../utils/emailTemplates.js';
import crypto from 'crypto';

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'customer',
    });

    // Generate Verification Token
    const verificationToken = generateVerificationToken(user._id);
    user.verificationToken = verificationToken;
    user.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save({ validateBeforeSave: false });

    // Create verification URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationUrl = `${frontendUrl}/verify-email/${verificationToken}`;

    // Send Email
    try {
      await sendEmail({
        email: user.email,
        subject: 'KalaConnect - Verify your Email',
        html: verificationEmailTemplate(verificationUrl)
      });

      res.status(201).json({
        success: true,
        message: 'Account created! Please check your email to verify your account before logging in.',
      });
    } catch (error) {
      user.verificationToken = undefined;
      user.verificationTokenExpire = undefined;
      await user.save({ validateBeforeSave: false });
      
      console.error('Email could not be sent', error);
      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Email
// @route   GET /api/auth/verifyemail/:token
// @access  Public
export const verifyEmail = async (req, res, next) => {
  try {
    // We are passing a JWT as the verification token
    const token = req.params.token;
    
    // Find user with this token and check expiry
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now log in.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // --- LAST MINUTE DEMO BYPASS ---
    if (email === 'admin@test.com' && password === 'password123') {
      return res.status(200).json({
        success: true,
        message: 'Login successful (Test Admin)',
        token: 'dummy-jwt-token-for-admin-test',
        user: {
          _id: 'admin_test_id_12345',
          name: 'Test Admin',
          email: 'admin@test.com',
          role: 'admin',
          isEmailVerified: true,
          profileImage: 'https://via.placeholder.com/150'
        }
      });
    }
    // ---------------------------------

    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const waitMinutes = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(401).json({ success: false, message: `Account temporarily locked. Try again in ${waitMinutes} minutes.` });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      // Increment login attempts
      user.loginAttempts += 1;
      // Lock account if >= 5 attempts
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000; // Lock for 15 mins
        await user.save({ validateBeforeSave: false });
        return res.status(401).json({ success: false, message: 'Account locked due to too many failed attempts. Try again in 15 minutes.' });
      }
      await user.save({ validateBeforeSave: false });
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Reset login attempts on success
    if (user.loginAttempts > 0) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save({ validateBeforeSave: false });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({ success: false, message: 'Please verify your email before logging in.' });
    }

    const token = generateToken(user._id);

    user.password = undefined;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'There is no user with that email' });
    }

    // Get reset token
    const resetToken = getResetPasswordToken(user);

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'KalaConnect - Password Reset Request',
        html: resetPasswordTemplate(resetUrl)
      });

      res.status(200).json({ success: true, message: 'Email sent' });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });
      console.error(error);
      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

import { verifyIdToken } from '../services/firebase.js';

// @desc    Google OAuth Login/Signup
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req, res, next) => {
  try {
    const { idToken, role } = req.body;
    if (!idToken) return res.status(400).json({ success: false, message: 'No ID token provided' });

    // 1. Verify token with Firebase
    const decodedToken = await verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // 2. Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // 3. Create new user if they don't exist
      user = await User.create({
        name: name || 'Google User',
        email,
        googleId: uid,
        isEmailVerified: true, // Google emails are already verified
        profileImage: picture || 'default.jpg',
        role: role || 'customer',
        authProvider: 'google'
      });
    } else {
      // 4. If they exist but signed up via email, link the Google account
      if (!user.googleId) {
        user.googleId = uid;
        user.isEmailVerified = true;
        user.authProvider = 'google';
        await user.save({ validateBeforeSave: false });
      }
      
      if (user.lockUntil && user.lockUntil > Date.now()) {
        const waitMinutes = Math.ceil((user.lockUntil - Date.now()) / 60000);
        return res.status(401).json({ success: false, message: `Account temporarily locked. Try again in ${waitMinutes} minutes.` });
      }
    }

    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // 5. Generate backend JWT
    const token = generateToken(user._id);
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: 'Google login successful',
      token,
      user,
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ success: false, message: 'Invalid or expired Google token' });
  }
};

// @desc    Verify Phone OTP (Firebase)
// @route   POST /api/auth/verifyphone
// @access  Private
export const verifyPhone = async (req, res, next) => {
  try {
    const { idToken, phone } = req.body;
    if (!idToken) return res.status(400).json({ success: false, message: 'No ID token provided' });

    // Verify the token from Firebase Phone Auth
    const decodedToken = await verifyIdToken(idToken);
    
    // Check if the phone numbers match (or at least the token is valid for a phone)
    if (!decodedToken.phone_number) {
       return res.status(400).json({ success: false, message: 'Invalid phone token' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.phone = phone || decodedToken.phone_number;
    user.isPhoneVerified = true;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: 'Phone number verified successfully' });
  } catch (error) {
    console.error('Phone Auth Error:', error);
    res.status(401).json({ success: false, message: 'Invalid or expired Phone token' });
  }
};

// @desc    Update user language
// @route   PUT /api/auth/language
// @access  Private
export const updateLanguage = async (req, res, next) => {
  try {
    const { language } = req.body;
    if (!language) {
      return res.status(400).json({ success: false, message: 'Please provide a language' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.language = language;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Language updated successfully',
      data: { language: user.language }
    });
  } catch (error) {
    next(error);
  }
};
