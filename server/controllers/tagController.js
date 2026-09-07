const asyncHandler = require('express-async-handler');
const Tag = require('../models/Tag');

// @desc    Get popular tags
// @route   GET /api/tags/popular
// @access  Public
const getPopularTags = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 15;
  const tags = await Tag.find({ postCount: { $gt: 0 } })
    .sort('-postCount')
    .limit(limit);

  res.status(200).json({ success: true, tags });
});

module.exports = { getPopularTags };
