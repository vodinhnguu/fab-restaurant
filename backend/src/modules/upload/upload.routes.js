import { Router } from 'express';
import { requirePermission } from '../../middlewares/auth.js';
import { uploadImage } from '../../middlewares/upload.js';
import { ApiError } from '../../utils/ApiError.js';

const router = Router();

// POST /upload  (multipart/form-data, field "image")
// Trả về đường dẫn tương đối /uploads/xxx.jpg - client tự ghép với địa chỉ server
// Ảnh món / danh mục: cần quyền thêm hoặc sửa thực đơn
router.post('/', requirePermission(['MENU', 'create'], ['MENU', 'edit']), uploadImage.single('image'), (req, res) => {
  if (!req.file) throw ApiError.badRequest('Vui lòng chọn ảnh');
  res.status(201).json({ success: true, data: { url: `/uploads/${req.file.filename}` } });
});

export default router;
