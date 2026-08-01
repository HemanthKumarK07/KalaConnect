import express from 'express';
import { getPosts, createPost, toggleLike } from '../controllers/community.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getPosts)
  .post(protect, createPost);

router.route('/:id/like')
  .put(protect, toggleLike);

export default router;
