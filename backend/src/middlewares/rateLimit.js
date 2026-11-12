import { ApiError } from '../utils/ApiError.js';

// Giới hạn số request của 1 địa chỉ IP trong 1 khoảng thời gian (chống dò mật khẩu, spam).
// Lưu bộ đếm trong RAM: đơn giản, đủ cho 1 server. Chạy nhiều server thì cần Redis.
// Dùng: router.post('/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }), ...)
// skipSuccessful: true -> chỉ đếm request bị lỗi (vd đăng nhập sai mật khẩu), request thành công được trả lại lượt
export function rateLimit({ windowMs, max, message = 'Bạn thao tác quá nhiều lần, vui lòng thử lại sau ít phút', skipSuccessful = false }) {
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
    // 'finish' = đã gửi xong phản hồi, lúc này mới biết thành công (< 400) hay lỗi
    if (skipSuccessful) res.on('finish', () => { if (res.statusCode < 400 && h.count > 0) h.count--; });

    res.setHeader('RateLimit-Remaining', Math.max(0, max - h.count));
    if (h.count > max) {
      res.setHeader('Retry-After', Math.ceil((h.resetAt - now) / 1000));
      throw new ApiError(429, message);
    }
    next();
  };
}
