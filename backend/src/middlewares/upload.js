import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import { ApiError } from '../utils/ApiError.js';

// Lưu file ảnh vào thư mục backend/uploads, tên file ngẫu nhiên để không trùng
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  },
});

export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
    else cb(ApiError.badRequest('Chỉ chấp nhận ảnh JPG, PNG, WEBP, GIF'));
  },
});
