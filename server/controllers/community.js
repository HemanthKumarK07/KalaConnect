import CommunityPost from '../models/CommunityPost.js';
import User from '../models/User.js';

// @desc    Get all community posts
// @route   GET /api/community
// @access  Public
export const getPosts = async (req, res, next) => {
  try {
    const posts = await CommunityPost.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: posts.length, data: posts });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a post
// @route   POST /api/community
// @access  Private
export const createPost = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Convert role to display format
    const displayRole = user.role === 'artisan' ? 'Verified Artisan' : user.role === 'admin' ? 'Admin' : 'Learner';

    const newPost = await CommunityPost.create({
      authorId: req.user.id,
      authorName: user.name,
      authorRole: displayRole,
      title: req.body.title || '',
      content: req.body.content,
      topicId: req.body.topicId || 'topic-01',
      topic: req.body.topic || 'General Discussion',
    });

    res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle Like on a post
// @route   PUT /api/community/:id/like
// @access  Private
export const toggleLike = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check if post has already been liked by this user
    if (post.likedBy.includes(req.user.id)) {
      post.likes -= 1;
      post.likedBy = post.likedBy.filter(id => id.toString() !== req.user.id.toString());
    } else {
      post.likes += 1;
      post.likedBy.push(req.user.id);
    }

    await post.save();
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};
