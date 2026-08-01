import express from 'express';
import { generateChatResponse } from '../controllers/ai.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/chat', protect, generateChatResponse);

export default router;
