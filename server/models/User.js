const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const socialLinksSchema = new mongoose.Schema(
  {
    website: { type: String, default: '' },
    twitter: { type: String, default: '' },
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    avatar: {
      url: {
        type: String,
        default: 'https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png',
      },
      public_id: { type: String, default: '' },
    },
    bio: { type: String, default: '', maxlength: [280, 'Bio cannot exceed 280 characters'] },
    socialLinks: { type: socialLinksSchema, default: () => ({}) },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isActive: { type: Boolean, default: true },
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BlogPost' }],
    likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BlogPost' }],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Sign and return a JWT
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

userSchema.methods.toSafeObject = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    bio: this.bio,
    socialLinks: this.socialLinks,
    role: this.role,
    createdAt: this.createdAt,
    // Lightweight id lists (not populated) so the client can check
    // "is this post saved/liked by me?" without an extra round trip.
    savedPosts: this.savedPosts,
    likedPosts: this.likedPosts,
  };
};

module.exports = mongoose.model('User', userSchema);
