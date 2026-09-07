const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const BlogPost = require('../models/BlogPost');
const User = require('../models/User');
const Category = require('../models/Category');
const ApiFeatures = require('../utils/apiFeatures');
const { syncTags } = require('../utils/tagHelper');
const { clearCache } = require('../middleware/cache');

const POPULATE_AUTHOR = 'name avatar bio';
const POPULATE_CATEGORY = 'name slug';

// @desc    Get all posts (search, filter, sort, pagination)
// @route   GET /api/posts
// @access  Public
const getPosts = asyncHandler(async (req, res) => {
  const queryString = { ...req.query };

  // Public visitors only ever see published posts; authors can pass their own id to see all of theirs
  const baseFilter = {};
  if (!req.query.status || !(req.user?.role === 'admin')) {
    baseFilter.status = 'published';
  }

  if (queryString.author) {
    // author query may be a name (search) or an exact user id
    if (mongoose.isValidObjectId(queryString.author)) {
      baseFilter.author = queryString.author;
    } else {
      const matchingAuthors = await User.find({
        name: new RegExp(queryString.author, 'i'),
      }).select('_id');
      baseFilter.author = { $in: matchingAuthors.map((u) => u._id) };
    }
    delete queryString.author;
  }

  let query = BlogPost.find(baseFilter).populate('author', POPULATE_AUTHOR).populate('category', POPULATE_CATEGORY);

  const features = new ApiFeatures(query, queryString).search().filter().sort();

  const totalQuery = BlogPost.find(features.query.getFilter());
  const total = await totalQuery.countDocuments();

  features.paginate();
  const posts = await features.query;

  res.status(200).json({
    success: true,
    count: posts.length,
    total,
    page: features.pagination.page,
    pages: Math.ceil(total / features.pagination.limit),
    posts,
  });
});

// @desc    Get single post by id or slug (increments view count)
// @route   GET /api/posts/:id
// @access  Public
const getPost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const filter = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id };

  const post = await BlogPost.findOne(filter)
    .populate('author', 'name avatar bio socialLinks')
    .populate('category', POPULATE_CATEGORY);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  if (post.status !== 'published' && (!req.user || (req.user.role !== 'admin' && String(post.author._id) !== String(req.user._id)))) {
    res.status(403);
    throw new Error('This post is not published yet');
  }

  post.views += 1;
  await post.save();

  res.status(200).json({ success: true, post });
});

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = asyncHandler(async (req, res) => {
  const { title, subtitle, content, category, tags, status, coverImage } = req.body;

  const categoryDoc = await Category.findById(category);
  if (!categoryDoc) {
    res.status(400);
    throw new Error('Invalid category');
  }

  const parsedTags = Array.isArray(tags)
    ? tags.map((t) => t.toLowerCase().trim())
    : (tags || '')
        .split(',')
        .map((t) => t.toLowerCase().trim())
        .filter(Boolean);

  const post = await BlogPost.create({
    title,
    subtitle,
    content,
    category,
    tags: parsedTags,
    status: status || 'published',
    coverImage: coverImage || {},
    author: req.user._id,
  });

  await syncTags([], parsedTags);
  clearCache(); // a newly published post can affect the featured/trending cache

  const populated = await post.populate([
    { path: 'author', select: POPULATE_AUTHOR },
    { path: 'category', select: POPULATE_CATEGORY },
  ]);

  res.status(201).json({ success: true, post: populated });
});

// @desc    Update a post (owner or admin only)
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = asyncHandler(async (req, res) => {
  const post = await BlogPost.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const isOwner = String(post.author) === String(req.user._id);
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to edit this post');
  }

  const { title, subtitle, content, category, tags, status, coverImage } = req.body;
  const oldTags = post.tags;

  if (title !== undefined) post.title = title;
  if (subtitle !== undefined) post.subtitle = subtitle;
  if (content !== undefined) post.content = content;
  if (category !== undefined) post.category = category;
  if (status !== undefined) post.status = status;
  if (coverImage !== undefined) post.coverImage = coverImage;

  if (tags !== undefined) {
    post.tags = Array.isArray(tags)
      ? tags.map((t) => t.toLowerCase().trim())
      : tags
          .split(',')
          .map((t) => t.toLowerCase().trim())
          .filter(Boolean);
    await syncTags(oldTags, post.tags);
  }

  await post.save();
  clearCache();

  const populated = await post.populate([
    { path: 'author', select: POPULATE_AUTHOR },
    { path: 'category', select: POPULATE_CATEGORY },
  ]);

  res.status(200).json({ success: true, post: populated });
});

// @desc    Delete a post (owner or admin only)
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = asyncHandler(async (req, res) => {
  const post = await BlogPost.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const isOwner = String(post.author) === String(req.user._id);
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this post');
  }

  await syncTags(post.tags, []);
  clearCache();
  await post.deleteOne();

  // Clean up references in users' saved/liked lists
  await User.updateMany(
    { $or: [{ savedPosts: post._id }, { likedPosts: post._id }] },
    { $pull: { savedPosts: post._id, likedPosts: post._id } }
  );

  res.status(200).json({ success: true, message: 'Post deleted successfully' });
});

// @desc    Toggle like on a post
// @route   PUT /api/posts/:id/like
// @access  Private
const toggleLikePost = asyncHandler(async (req, res) => {
  const post = await BlogPost.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const alreadyLiked = post.likes.some((id) => String(id) === String(req.user._id));

  if (alreadyLiked) {
    post.likes = post.likes.filter((id) => String(id) !== String(req.user._id));
    await User.findByIdAndUpdate(req.user._id, { $pull: { likedPosts: post._id } });
  } else {
    post.likes.push(req.user._id);
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { likedPosts: post._id } });
  }

  post.likeCount = post.likes.length;
  await post.save();

  res.status(200).json({ success: true, liked: !alreadyLiked, likeCount: post.likes.length });
});

// @desc    Toggle bookmark/save on a post
// @route   PUT /api/posts/:id/save
// @access  Private
const toggleSavePost = asyncHandler(async (req, res) => {
  const post = await BlogPost.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const user = await User.findById(req.user._id);
  const alreadySaved = user.savedPosts.some((id) => String(id) === String(post._id));

  if (alreadySaved) {
    user.savedPosts = user.savedPosts.filter((id) => String(id) !== String(post._id));
  } else {
    user.savedPosts.push(post._id);
  }

  await user.save();

  res.status(200).json({ success: true, saved: !alreadySaved });
});

// @desc    Get related posts (same category, excluding current)
// @route   GET /api/posts/:id/related
// @access  Public
const getRelatedPosts = asyncHandler(async (req, res) => {
  const post = await BlogPost.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const related = await BlogPost.find({
    _id: { $ne: post._id },
    status: 'published',
    $or: [{ category: post.category }, { tags: { $in: post.tags } }],
  })
    .populate('author', POPULATE_AUTHOR)
    .populate('category', POPULATE_CATEGORY)
    .sort('-views')
    .limit(4);

  res.status(200).json({ success: true, posts: related });
});

// @desc    Get featured posts (highest views among recent posts)
// @route   GET /api/posts/meta/featured
// @access  Public
const getFeaturedPosts = asyncHandler(async (req, res) => {
  const posts = await BlogPost.find({ status: 'published' })
    .populate('author', POPULATE_AUTHOR)
    .populate('category', POPULATE_CATEGORY)
    .sort('-views -createdAt')
    .limit(5);

  res.status(200).json({ success: true, posts });
});

// @desc    Get trending posts (most liked + viewed, last 14 days)
// @route   GET /api/posts/meta/trending
// @access  Public
const getTrendingPosts = asyncHandler(async (req, res) => {
  const since = new Date();
  since.setDate(since.getDate() - 14);

  const posts = await BlogPost.aggregate([
    { $match: { status: 'published', createdAt: { $gte: since } } },
    { $addFields: { score: { $add: ['$views', { $multiply: ['$likeCount', 5] }] } } },
    { $sort: { score: -1 } },
    { $limit: 6 },
  ]);

  await BlogPost.populate(posts, [
    { path: 'author', select: POPULATE_AUTHOR },
    { path: 'category', select: POPULATE_CATEGORY },
  ]);

  res.status(200).json({ success: true, posts });
});

module.exports = {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  toggleLikePost,
  toggleSavePost,
  getRelatedPosts,
  getFeaturedPosts,
  getTrendingPosts,
};
