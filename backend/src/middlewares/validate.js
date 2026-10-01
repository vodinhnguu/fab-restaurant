import { ApiError } from '../utils/ApiError.js';

// Kiểm tra req.body / req.query bằng schema Zod.
// Dữ liệu hợp lệ (đã được ép kiểu, bỏ trường thừa) được ghi vào req.body / req.validatedQuery
export const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source] ?? {});
  if (!result.success) {
    const errors = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    throw ApiError.badRequest(errors[0]?.message || 'Dữ liệu không hợp lệ', errors);
  }
  if (source === 'body') req.body = result.data;
  else req.validatedQuery = result.data; // Express 5: req.query chỉ đọc
  next();
};
