import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getPlaylists,
  getMyPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
  getProgress,
  markLessonComplete
} from '../controllers/academy.js';

const router = express.Router();

// Public / Customer routes
router.get('/playlists', getPlaylists);
router.get('/playlists/:id', getPlaylistById);

// Protected Customer routes (Progress)
router.get('/progress/:playlistId', protect, getProgress);
router.post('/progress/:lessonId', protect, markLessonComplete);

// Protected Artisan routes (Playlists)
router.get('/artisan/playlists', protect, getMyPlaylists);
router.post('/playlists', protect, createPlaylist);
router.put('/playlists/:id', protect, updatePlaylist);
router.delete('/playlists/:id', protect, deletePlaylist);

// Protected Artisan routes (Lessons)
router.post('/playlists/:id/lessons', protect, createLesson);
router.put('/lessons/reorder', protect, reorderLessons);
router.put('/lessons/:id', protect, updateLesson);
router.delete('/lessons/:id', protect, deleteLesson);

export default router;
