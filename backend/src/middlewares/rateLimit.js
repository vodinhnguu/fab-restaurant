import { ApiError } from '../utils/ApiError.js';

// Giới hạn số request của 1 địa chỉ IP trong 1 khoảng thời gian (chống dò mật khẩu, spam).
// Lưu bộ đếm trong RAM: đơn giản, đủ cho 1 server. Chạy nhiều server thì cần Redis.
// Dùng: router.post('/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }), ...)
export function rateLimit({ windowMs, max, message = 'Bạn thao tác quá nhiều lần, vui lòng thử lại sau ít phút' }) {
  const hits = new Map(); // key -> { count, resetAt }

  // Dọn các bộ đếm đã hết hạn để Map không phình to mãi
  setInterval(() => {
    const now = Date.now();
    for (const [key, h] of hits) if (h.resetAt <= now) hits.delete(key);
  }, windowMs).unref();

  return (req, res, next) => {
    const key = `${req.ip}:${req.baseUrl}${req.path}`;
    const now = Date.now();
    let h = hits.get(key);
    if (!h || h.resetAt <= now) {
      h = { count: 0, resetAt: now + windowMs };
      hits.set(key, h);
    }
    h.count++;

    res.setHeader('RateLimit-Remaining', Math.max(0, max - h.count));
    if (h.count > max) {
      res.setHeader('Retry-After', Math.ceil((h.resetAt - now) / 1000));
      throw new ApiError(429, message);
    }
    next();
  };
}
