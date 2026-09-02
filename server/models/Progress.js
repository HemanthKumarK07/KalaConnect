import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    playlistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Playlist', required: true },
    completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
    lastWatchedLessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }
  },
  { timestamps: true }
);

// Ensure a user only has one progress record per playlist
progressSchema.index({ userId: 1, playlistId: 1 }, { unique: true });

export default mongoose.model('Progress', progressSchema);
