// Simple in-memory response cache for read-heavy, user-independent public
// endpoints (categories, popular tags, featured/trending posts). Deliberately
// NOT used on /api/posts or /api/posts/:id, since those vary by requester
// role and the single-post route has a view-count side effect on every hit.
//
// This is intentionally lightweight (no Redis) - fine for a single-instance
// deployment or moderate traffic. For multi-instance production deployments,
// swap the Map below for a shared store (Redis, Memcached, etc).

const store = new Map(); // key -> { body, expiresAt }

const cacheMiddleware = (ttlSeconds = 60) => (req, res, next) => {
  if (req.method !== 'GET') return next();

  const key = req.originalUrl;
  const cached = store.get(key);

  if (cached && cached.expiresAt > Date.now()) {
    res.set('X-Cache', 'HIT');
    res.set('Cache-Control', `public, max-age=${ttlSeconds}`);
    return res.status(200).json(cached.body);
  }

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode === 200) {
      store.set(key, { body, expiresAt: Date.now() + ttlSeconds * 1000 });
    }
    res.set('X-Cache', 'MISS');
    res.set('Cache-Control', `public, max-age=${ttlSeconds}`);
    return originalJson(body);
  };

  next();
};

// Clears every cached entry - call after a mutation that should invalidate
// the cache immediately rather than waiting out the TTL (e.g. category CRUD).
const clearCache = () => store.clear();

module.exports = { cacheMiddleware, clearCache };
