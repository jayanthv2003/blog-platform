const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Reusable storage engine for multer - used for cover images, avatars, etc.
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'blog-platform',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 1600, crop: 'limit', quality: 'auto' }],
    public_id: `${Date.now()}-${file.originalname.split('.')[0].replace(/\s+/g, '-')}`,
  }),
});

module.exports = { cloudinary, storage };
