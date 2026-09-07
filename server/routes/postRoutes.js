const express = require('express');
const { body } = require('express-validator');
const {
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
} = require('../controllers/postController');
const { protect, optionalAuth } = require('../middleware/auth');
const { cacheMiddleware } = require('../middleware/cache');
const validate = require('../middleware/validate');

const router = express.Router();

const postValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 150 }),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('category').notEmpty().withMessage('Category is required'),
];

// Static/meta routes must be declared before the dynamic /:id route
router.get('/meta/featured', cacheMiddleware(60), getFeaturedPosts);
router.get('/meta/trending', cacheMiddleware(60), getTrendingPosts);

router.get('/', optionalAuth, getPosts);
router.post('/', protect, postValidation, validate, createPost);

router.get('/:id', optionalAuth, getPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

router.put('/:id/like', protect, toggleLikePost);
router.put('/:id/save', protect, toggleSavePost);
router.get('/:id/related', getRelatedPosts);

module.exports = router;
