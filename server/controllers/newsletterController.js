const asyncHandler = require('express-async-handler');
const Newsletter = require('../models/Newsletter');

// @desc    Subscribe an email to the newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
const subscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const exists = await Newsletter.findOne({ email: email?.toLowerCase() });
  if (exists) {
    return res.status(200).json({ success: true, message: 'You are already subscribed' });
  }

  await Newsletter.create({ email });
  res.status(201).json({ success: true, message: 'Subscribed successfully' });
});

module.exports = { subscribe };
