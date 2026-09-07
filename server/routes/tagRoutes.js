const express = require('express');
const { getPopularTags } = require('../controllers/tagController');
const { cacheMiddleware } = require('../middleware/cache');

const router = express.Router();

router.get('/popular', cacheMiddleware(120), getPopularTags);

module.exports = router;
