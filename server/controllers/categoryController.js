const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');
const BlogPost = require('../models/BlogPost');
const { clearCache } = require('../middleware/cache');

// @desc    Get all categories (with post counts)
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort('name');

  const counts = await BlogPost.aggregate([
    { $match: { status: 'published' } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));

  const result = categories.map((cat) => ({
    ...cat.toObject(),
    postCount: countMap[String(cat._id)] || 0,
  }));

  res.status(200).json({ success: true, count: result.length, categories: result });
});

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const exists = await Category.findOne({ name: new RegExp(`^${name}$`, 'i') });
  if (exists) {
    res.status(400);
    throw new Error('Category already exists');
  }

  const category = await Category.create({ name, description });
  clearCache();
  res.status(201).json({ success: true, category });
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  const { name, description } = req.body;
  if (name !== undefined) category.name = name;
  if (description !== undefined) category.description = description;

  await category.save();
  clearCache();
  res.status(200).json({ success: true, category });
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  const postCount = await BlogPost.countDocuments({ category: category._id });
  if (postCount > 0) {
    res.status(400);
    throw new Error(`Cannot delete category with ${postCount} associated post(s). Reassign them first.`);
  }

  await category.deleteOne();
  clearCache();
  res.status(200).json({ success: true, message: 'Category deleted successfully' });
});

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
