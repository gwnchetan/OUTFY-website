const cache = new Map();

function cacheHeaders(res) {
  // Short browser/CDN caching cuts repeat Render + Mongo latency without making
  // merchandising updates take long to appear.
  res.set('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=300');
  res.set('Vary', 'Accept-Encoding');
}

function pruneExpired(now) {
  if (cache.size < 200) return;
  for (const [key, entry] of cache) {
    if (entry.expiresAt <= now) cache.delete(key);
  }
}

exports.cachePublicResponse = (ttlMs = 45_000) => (req, res, next) => {
  const now = Date.now();
  const key = req.originalUrl;
  const cached = cache.get(key);

  cacheHeaders(res);
  if (cached && cached.expiresAt > now) {
    res.set('X-Cache', 'HIT');
    return res.json(cached.body);
  }

  pruneExpired(now);
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      cache.set(key, { body, expiresAt: Date.now() + ttlMs });
      res.set('X-Cache', 'MISS');
    }
    return originalJson(body);
  };
  next();
};

exports.invalidateProductCache = () => cache.clear();
