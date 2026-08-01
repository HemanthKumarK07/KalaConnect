import express from 'express';
import { getProfile, updateProfile } from '../controllers/user.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/profile')
  .get(getProfile)
  .put(updateProfile);

export default router;
