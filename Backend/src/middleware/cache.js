import redis from "../services/redis.js";

// Wraps a route with Redis caching. ttl = seconds until cache expires.
export function cache(ttl = 300) {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;

    const cached = await redis.get(key);
    if (cached) return res.json(JSON.parse(cached));

    // Intercept res.json to store the response in Redis before sending
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      redis.setEx(key, ttl, JSON.stringify(data));
      return originalJson(data);
    };

    next();
  };
}
