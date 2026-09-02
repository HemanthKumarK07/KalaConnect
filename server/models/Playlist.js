import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    artisanId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    thumbnail: {
      url: { type: String },
      publicId: { type: String },
      source: { type: String, enum: ['uploaded', 'video_frame'], default: 'uploaded' }
    },
    category: { type: String },
    craftType: { type: String },
    difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'All'], default: 'All' },
    language: { type: String },
    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }], // Preserves exact order
    totalLessons: { type: Number, default: 0 },
    totalDuration: { type: Number, default: 0 }, // in seconds
    isPublished: { type: Boolean, default: false },
    enrolledStudents: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model('Playlist', playlistSchema);
