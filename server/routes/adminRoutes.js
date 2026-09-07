const express = require('express');
const {
  getDashboardStats,
  getUsers,
  updateUser,
  deleteUser,
  getAllPostsAdmin,
  updatePostStatus,
  getAllCommentsAdmin,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Every route below requires an authenticated admin
router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);

router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.get('/posts', getAllPostsAdmin);
router.put('/posts/:id/status', updatePostStatus);

router.get('/comments', getAllCommentsAdmin);

module.exports = router;
