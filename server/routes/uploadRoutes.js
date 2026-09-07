const express = require('express');
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { cloudinary } = require('../config/cloudinary');

const router = express.Router();

// @desc    Upload a single image (cover image, avatar, or in-editor image) to Cloudinary
// @route   POST /api/upload
// @access  Private
router.post(
  '/',
  protect,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400);
      throw new Error('No image file provided');
    }

    res.status(201).json({
      success: true,
      url: req.file.path,
      public_id: req.file.filename,
    });
  })
);

// @desc    Delete an uploaded image from Cloudinary
// @route   DELETE /api/upload/:publicId
// @access  Private
router.delete(
  '/:publicId',
  protect,
  asyncHandler(async (req, res) => {
    await cloudinary.uploader.destroy(`blog-platform/${req.params.publicId}`);
    res.status(200).json({ success: true, message: 'Image deleted' });
  })
);

module.exports = router;
