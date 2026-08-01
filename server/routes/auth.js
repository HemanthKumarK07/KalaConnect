import express from 'express';
import { signup, login, logout, getMe, verifyEmail, forgotPassword, resetPassword, googleLogin, verifyPhone, updateLanguage } from '../controllers/auth.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/verifyphone', protect, verifyPhone);
router.get('/verifyemail/:token', verifyEmail);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/language', protect, updateLanguage);

export default router;
