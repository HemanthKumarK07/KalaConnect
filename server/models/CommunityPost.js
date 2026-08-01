import mongoose from 'mongoose';

const communityPostSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    authorRole: { type: String, default: 'Member' },
    title: { type: String },
    content: { type: String, required: true },
    topicId: { type: String, default: 'topic-01' },
    topic: { type: String, default: 'General Discussion' },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export default mongoose.model('CommunityPost', communityPostSchema);
