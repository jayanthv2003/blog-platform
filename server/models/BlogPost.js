const mongoose = require('mongoose');
const slugify = require('slugify');

const blogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [220, 'Subtitle cannot exceed 220 characters'],
      default: '',
    },
    slug: { type: String, unique: true, index: true },
    coverImage: {
      url: { type: String, default: '' },
      public_id: { type: String, default: '' },
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    excerpt: { type: String, maxlength: 300, default: '' },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'pending'],
      default: 'published',
    },
    readTime: { type: Number, default: 1 }, // in minutes
    views: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // Denormalized count kept in sync with likes.length so we can sort/index
    // on it directly - Mongoose can't efficiently sort by array length.
    likeCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Text index for search by title/subtitle/tags
blogPostSchema.index({ title: 'text', subtitle: 'text', tags: 'text' });
blogPostSchema.index({ createdAt: -1 });
blogPostSchema.index({ views: -1 });
blogPostSchema.index({ likeCount: -1 });

// Generate slug + excerpt + readTime before saving
blogPostSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = `${slugify(this.title, { lower: true, strict: true })}-${Date.now()
      .toString()
      .slice(-6)}`;
  }

  if (this.isModified('content')) {
    const plainText = this.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    this.excerpt = plainText.slice(0, 280);
    const words = plainText.split(' ').filter(Boolean).length;
    this.readTime = Math.max(1, Math.ceil(words / 200)); // ~200 wpm reading speed
  }

  next();
});

blogPostSchema.set('toJSON', { virtuals: true });
blogPostSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('BlogPost', blogPostSchema);
