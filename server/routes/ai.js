import express from 'express';
import { generateChatResponse, verifyArtisanCraft, analyzeProductImage } from '../controllers/ai.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/chat', protect, generateChatResponse);
router.post('/verify', protect, verifyArtisanCraft);
router.post('/analyze-image', protect, analyzeProductImage);

export default router;
