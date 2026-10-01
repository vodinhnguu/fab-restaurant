import { Prisma } from '@prisma/client';
import multer from 'multer';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: `Không tìm thấy đường dẫn ${req.method} ${req.originalUrl}` });
}

// Middleware xử lý lỗi tập trung: mọi lỗi throw ra đều chạy vào đây
// (Express 5 tự bắt lỗi của hàm async, không cần try/catch hay asyncHandler)
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let status = 500;
  let message = 'Lỗi máy chủ, vui lòng thử lại sau';
  let errors;

  if (err instanceof ApiError) {
    status = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: vi phạm unique, P2025: không tìm thấy bản ghi, P2003: vi phạm khóa ngoại
    if (err.code === 'P2002') {
      status = 409;
      message = `Giá trị ${err.meta?.target ?? ''} đã tồn tại`;
    } else if (err.code === 'P2025') {
      status = 404;
      message = 'Không tìm thấy dữ liệu';
    } else if (err.code === 'P2003') {
      status = 409;
      message = 'Không thể xóa vì dữ liệu đang được sử dụng';
    }
  } else if (err instanceof multer.MulterError) {
    status = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'File quá lớn (tối đa 5MB)' : err.message;
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'JSON không hợp lệ';
  }

  if (status === 500) console.error(err);

  res.status(status).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(env.nodeEnv === 'development' && status === 500 && { stack: err.stack }),
  });
}
