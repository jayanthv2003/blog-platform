const mongoose = require('mongoose');

// Lightweight aggregate collection used to power the "Popular Tags" section
// without scanning every BlogPost document on each request.
const tagSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, lowercase: true, trim: true },
    postCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Tag', tagSchema);
