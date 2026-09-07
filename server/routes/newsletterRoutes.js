const express = require('express');
const { body } = require('express-validator');
const { subscribe } = require('../controllers/newsletterController');
const validate = require('../middleware/validate');

const router = express.Router();

router.post(
  '/subscribe',
  [body('email').isEmail().withMessage('A valid email is required').normalizeEmail()],
  validate,
  subscribe
);

module.exports = router;
