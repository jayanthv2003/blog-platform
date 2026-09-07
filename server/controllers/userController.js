const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const BlogPost = require('../models/BlogPost');

// @desc    Get own profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ success: true, user: user.toSafeObject() });
});

// @desc    Update own profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, socialLinks, avatar } = req.body;

  const user = await User.findById(req.user._id);

  if (name !== undefined) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (avatar !== undefined) user.avatar = avatar;
  if (socialLinks !== undefined) {
    user.socialLinks = { ...user.socialLinks.toObject(), ...socialLinks };
  }

  await user.save();
  res.status(200).json({ success: true, user: user.toSafeObject() });
});

// @desc    Change own password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true, message: 'Password updated successfully' });
});

// @desc    Get a public author profile + their published posts
// @route   GET /api/users/:id
// @access  Public
const getPublicProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const posts = await BlogPost.find({ author: user._id, status: 'published' })
    .populate('category', 'name slug')
    .sort('-createdAt')
    .limit(12);

  res.status(200).json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      avatar: user.avatar,
      bio: user.bio,
      socialLinks: user.socialLinks,
      createdAt: user.createdAt,
    },
    posts,
  });
});

// @desc    Get logged-in user's own posts (all statuses)
// @route   GET /api/users/my-posts
// @access  Private
const getMyPosts = asyncHandler(async (req, res) => {
  const posts = await BlogPost.find({ author: req.user._id })
    .populate('category', 'name slug')
    .sort('-createdAt');

  res.status(200).json({ success: true, count: posts.length, posts });
});

// @desc    Get logged-in user's saved/bookmarked posts
// @route   GET /api/users/saved-posts
// @access  Private
const getSavedPosts = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'savedPosts',
    populate: [
      { path: 'author', select: 'name avatar' },
      { path: 'category', select: 'name slug' },
    ],
  });

  res.status(200).json({ success: true, posts: user.savedPosts });
});

// @desc    Get logged-in user's liked posts
// @route   GET /api/users/liked-posts
// @access  Private
const getLikedPosts = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'likedPosts',
    populate: [
      { path: 'author', select: 'name avatar' },
      { path: 'category', select: 'name slug' },
    ],
  });

  res.status(200).json({ success: true, posts: user.likedPosts });
});

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getPublicProfile,
  getMyPosts,
  getSavedPosts,
  getLikedPosts,
};
