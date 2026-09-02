import Playlist from '../models/Playlist.js';
import Lesson from '../models/Lesson.js';
import Progress from '../models/Progress.js';

// --- PLAYLISTS ---

export const getPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ isPublished: true })
      .populate('artisanId', 'name craft district state avatar initials')
      .populate('lessons', 'duration')
      .sort('-createdAt');
    res.json({ success: true, data: playlists });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ artisanId: req.user.id })
      .populate('lessons', 'title order duration status isPublished')
      .sort('-createdAt');
    res.json({ success: true, data: playlists });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPlaylistById = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('artisanId', 'name craft district state story experience awards avatar initials')
      .populate({
        path: 'lessons',
        options: { sort: { 'order': 1 } }
      });
      
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }

    // Only creator can see draft playlists
    if (!playlist.isPublished && (!req.user || req.user.id !== playlist.artisanId.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.create({
      ...req.body,
      artisanId: req.user.id
    });
    res.status(201).json({ success: true, data: playlist });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updatePlaylist = async (req, res) => {
  try {
    let playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found' });
    if (playlist.artisanId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this playlist' });
    }

    // If publishing, ensure there is at least one lesson and valid data
    if (req.body.isPublished) {
      if (!playlist.title || !playlist.description) {
        return res.status(400).json({ success: false, message: 'Title and description are required to publish' });
      }
      if (playlist.lessons.length === 0) {
        return res.status(400).json({ success: false, message: 'Cannot publish a playlist with no lessons' });
      }
    }

    playlist = await Playlist.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: playlist });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found' });
    if (playlist.artisanId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this playlist' });
    }

    await Lesson.deleteMany({ playlistId: playlist._id });
    await playlist.deleteOne();
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- LESSONS ---

export const createLesson = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found' });
    if (playlist.artisanId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to add lessons to this playlist' });
    }

    const order = playlist.lessons.length + 1;
    const lesson = await Lesson.create({
      ...req.body,
      playlistId: playlist._id,
      artisanId: req.user.id,
      order
    });

    playlist.lessons.push(lesson._id);
    playlist.totalLessons += 1;
    await playlist.save();

    res.status(201).json({ success: true, data: lesson });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateLesson = async (req, res) => {
  try {
    let lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });
    if (lesson.artisanId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this lesson' });
    }

    lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    
    // Update total duration of the playlist if needed
    // Simple recalculation:
    const allLessons = await Lesson.find({ playlistId: lesson.playlistId });
    const totalDuration = allLessons.reduce((sum, l) => sum + (l.video?.duration || 0), 0);
    await Playlist.findByIdAndUpdate(lesson.playlistId, { totalDuration });

    res.json({ success: true, data: lesson });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });
    if (lesson.artisanId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this lesson' });
    }

    const playlist = await Playlist.findById(lesson.playlistId);
    if (playlist) {
      playlist.lessons.pull(lesson._id);
      playlist.totalLessons = Math.max(0, playlist.totalLessons - 1);
      
      const allLessons = await Lesson.find({ playlistId: lesson.playlistId });
      playlist.totalDuration = allLessons.reduce((sum, l) => sum + (l.video?.duration || 0), 0) - (lesson.video?.duration || 0);
      
      await playlist.save();
    }

    await lesson.deleteOne();
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reorderLessons = async (req, res) => {
  try {
    const { playlistId, orderedIds } = req.body;
    const playlist = await Playlist.findById(playlistId);
    
    if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found' });
    if (playlist.artisanId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Update the array on the playlist to reflect new order
    playlist.lessons = orderedIds;
    await playlist.save();

    // Update order field on each lesson
    const updates = orderedIds.map((id, index) => {
      return Lesson.findByIdAndUpdate(id, { order: index });
    });
    await Promise.all(updates);

    res.json({ success: true, message: 'Lessons reordered' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- PROGRESS ---

export const getProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({ userId: req.user.id, playlistId: req.params.playlistId });
    res.json({ success: true, data: progress || { completedLessons: [] } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markLessonComplete = async (req, res) => {
  try {
    const { playlistId } = req.body;
    const lessonId = req.params.lessonId;

    let progress = await Progress.findOne({ userId: req.user.id, playlistId });
    
    if (!progress) {
      progress = await Progress.create({
        userId: req.user.id,
        playlistId,
        completedLessons: [lessonId],
        lastWatchedLessonId: lessonId
      });
    } else {
      if (!progress.completedLessons.includes(lessonId)) {
        progress.completedLessons.push(lessonId);
      }
      progress.lastWatchedLessonId = lessonId;
      await progress.save();
    }

    res.json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
