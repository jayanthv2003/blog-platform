const express = require('express');
const { body } = require('express-validator');
const {
  getCommentsForPost,
  addComment,
  updateComment,
  deleteComment,
  toggleLikeComment,
  toggleSpamComment,
} = require('../controllers/commentController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/:postId', optionalAuth, getCommentsForPost);

router.post(
  '/',
  protect,
  [
    body('postId').notEmpty().withMessage('postId is required'),
    body('content').trim().notEmpty().withMessage('Comment content is required').isLength({ max: 1000 }),
  ],
  validate,
  addComment
);

router.put(
  '/:id',
  protect,
  [body('content').trim().notEmpty().withMessage('Comment content is required').isLength({ max: 1000 })],
  validate,
  updateComment
);

router.delete('/:id', protect, deleteComment);
router.put('/:id/like', protect, toggleLikeComment);
router.put('/:id/spam', protect, authorize('admin'), toggleSpamComment);

module.exports = router;
