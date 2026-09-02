import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    playlistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Playlist', required: true },
    artisanId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    video: {
      url: { type: String },
      publicId: { type: String },
      duration: { type: Number, default: 0 }, // in seconds
      width: { type: Number },
      height: { type: Number },
      format: { type: String },
      status: { type: String, enum: ['PENDING', 'PROCESSING', 'READY', 'FAILED'], default: 'PENDING' }
    },
    thumbnail: {
      url: { type: String },
      publicId: { type: String },
      source: { type: String, enum: ['uploaded', 'video_frame'], default: 'uploaded' }
    },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model('Lesson', lessonSchema);
