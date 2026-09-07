const asyncHandler = require('express-async-handler');
const Comment = require('../models/Comment');
const BlogPost = require('../models/BlogPost');

// @desc    Get all comments for a post (threaded: top-level + nested replies)
// @route   GET /api/comments/:postId
// @access  Public
const getCommentsForPost = asyncHandler(async (req, res) => {
  const filter = { post: req.params.postId };
  if (req.user?.role !== 'admin') filter.isSpam = false;

  const comments = await Comment.find(filter)
    .populate('author', 'name avatar')
    .sort('createdAt');

  // Build a simple two-level tree: top-level comments with nested replies
  const topLevel = comments.filter((c) => !c.parentComment);
  const replies = comments.filter((c) => c.parentComment);

  const tree = topLevel.map((comment) => ({
    ...comment.toObject(),
    replies: replies
      .filter((r) => String(r.parentComment) === String(comment._id))
      .map((r) => r.toObject()),
  }));

  res.status(200).json({ success: true, count: comments.length, comments: tree });
});

// @desc    Add a comment or reply
// @route   POST /api/comments
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  const { postId, content, parentComment } = req.body;

  const post = await BlogPost.findById(postId);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  if (parentComment) {
    const parent = await Comment.findById(parentComment);
    if (!parent) {
      res.status(404);
      throw new Error('Parent comment not found');
    }
  }

  const comment = await Comment.create({
    post: postId,
    author: req.user._id,
    content,
    parentComment: parentComment || null,
  });

  const populated = await comment.populate('author', 'name avatar');

  res.status(201).json({ success: true, comment: populated });
});

// @desc    Update own comment
// @route   PUT /api/comments/:id
// @access  Private
const updateComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  if (String(comment.author) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to edit this comment');
  }

  comment.content = req.body.content;
  comment.isEdited = true;
  await comment.save();

  const populated = await comment.populate('author', 'name avatar');
  res.status(200).json({ success: true, comment: populated });
});

// @desc    Delete own comment (or any comment if admin)
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  const isOwner = String(comment.author) === String(req.user._id);
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this comment');
  }

  // Also remove any replies to this comment
  await Comment.deleteMany({ parentComment: comment._id });
  await comment.deleteOne();

  res.status(200).json({ success: true, message: 'Comment deleted successfully' });
});

// @desc    Toggle like on a comment
// @route   PUT /api/comments/:id/like
// @access  Private
const toggleLikeComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  const alreadyLiked = comment.likes.some((id) => String(id) === String(req.user._id));

  if (alreadyLiked) {
    comment.likes = comment.likes.filter((id) => String(id) !== String(req.user._id));
  } else {
    comment.likes.push(req.user._id);
  }

  await comment.save();
  res.status(200).json({ success: true, liked: !alreadyLiked, likeCount: comment.likes.length });
});

// @desc    Flag/unflag a comment as spam (admin only)
// @route   PUT /api/comments/:id/spam
// @access  Private/Admin
const toggleSpamComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  comment.isSpam = !comment.isSpam;
  await comment.save();

  res.status(200).json({ success: true, isSpam: comment.isSpam });
});

module.exports = {
  getCommentsForPost,
  addComment,
  updateComment,
  deleteComment,
  toggleLikeComment,
  toggleSpamComment,
};
