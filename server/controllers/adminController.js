const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const BlogPost = require('../models/BlogPost');
const Comment = require('../models/Comment');
const Category = require('../models/Category');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalPosts, publishedPosts, draftPosts, totalComments, totalCategories, viewsAgg] =
    await Promise.all([
      User.countDocuments(),
      BlogPost.countDocuments(),
      BlogPost.countDocuments({ status: 'published' }),
      BlogPost.countDocuments({ status: 'draft' }),
      Comment.countDocuments(),
      Category.countDocuments(),
      BlogPost.aggregate([{ $group: { _id: null, totalViews: { $sum: '$views' } } }]),
    ]);

  const recentPosts = await BlogPost.find()
    .populate('author', 'name avatar')
    .populate('category', 'name')
    .sort('-createdAt')
    .limit(5);

  const recentUsers = await User.find().sort('-createdAt').limit(5).select('name email avatar role createdAt');

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      totalPosts,
      publishedPosts,
      draftPosts,
      totalComments,
      totalCategories,
      totalViews: viewsAgg[0]?.totalViews || 0,
    },
    recentPosts,
    recentUsers,
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  const filter = {};
  if (req.query.search) {
    filter.$or = [
      { name: new RegExp(req.query.search, 'i') },
      { email: new RegExp(req.query.search, 'i') },
    ];
  }

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(limit);

  res.status(200).json({ success: true, count: users.length, total, page, pages: Math.ceil(total / limit), users });
});

// @desc    Update a user's role or active status
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (String(user._id) === String(req.user._id) && req.body.role && req.body.role !== 'admin') {
    res.status(400);
    throw new Error('You cannot revoke your own admin role');
  }

  const { role, isActive } = req.body;
  if (role !== undefined) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;

  await user.save();
  res.status(200).json({ success: true, user: user.toSafeObject() });
});

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) {
    res.status(400);
    throw new Error('You cannot delete your own account from the admin panel');
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  await user.deleteOne();
  res.status(200).json({ success: true, message: 'User deleted successfully' });
});

// @desc    Get all posts for moderation (any status)
// @route   GET /api/admin/posts
// @access  Private/Admin
const getAllPostsAdmin = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) filter.title = new RegExp(req.query.search, 'i');

  const total = await BlogPost.countDocuments(filter);
  const posts = await BlogPost.find(filter)
    .populate('author', 'name email avatar')
    .populate('category', 'name')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(limit);

  res.status(200).json({ success: true, count: posts.length, total, page, pages: Math.ceil(total / limit), posts });
});

// @desc    Approve (publish) or reject a pending post
// @route   PUT /api/admin/posts/:id/status
// @access  Private/Admin
const updatePostStatus = asyncHandler(async (req, res) => {
  const post = await BlogPost.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  post.status = req.body.status;
  await post.save();

  res.status(200).json({ success: true, post });
});

// @desc    Get all comments for moderation
// @route   GET /api/admin/comments
// @access  Private/Admin
const getAllCommentsAdmin = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 30;

  const filter = {};
  if (req.query.spamOnly === 'true') filter.isSpam = true;

  const total = await Comment.countDocuments(filter);
  const comments = await Comment.find(filter)
    .populate('author', 'name avatar email')
    .populate('post', 'title slug')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: comments.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    comments,
  });
});

module.exports = {
  getDashboardStats,
  getUsers,
  updateUser,
  deleteUser,
  getAllPostsAdmin,
  updatePostStatus,
  getAllCommentsAdmin,
};
