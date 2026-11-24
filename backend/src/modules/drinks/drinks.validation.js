// Kiểm tra dữ liệu gửi lên cho Kiểm bia nước (docs/29-kiem-bia-nuoc.md)
import { z } from 'zod';

const count = (max, label) =>
  z.coerce.number({ error: `Nhập ${label}` }).int(`${label} phải là số nguyên`).min(0, `${label} không âm`).max(max, `${label} tối đa ${max}`);

// Ghi / sửa phiếu kiểm 1 loại trong 1 ngày
export const saveCheckSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải có dạng yyyy-MM-dd').optional(),
  productId: z.coerce.number({ error: 'Chọn loại đồ uống' }).int().positive('Chọn loại đồ uống'),
  issuedPacks: count(500, 'số thùng').optional(),
  issuedUnits: count(2000, 'số lon / chai lẻ').optional(),
  returnedUnits: count(10000, 'số trả lại').optional(),
  note: z.string().trim().max(300, 'Tối đa 300 ký tự').optional().nullable(),
});

// Thêm 1 món đồ uống vào danh sách kiểm
export const addProductSchema = z.object({
  dishId: z.coerce.number({ error: 'Chọn món' }).int().positive('Chọn món'),
  packSize: z.coerce.number().int().min(1, 'Ít nhất 1').max(200, 'Tối đa 200').optional(),
});

// Sửa quy cách thùng / tắt - bật
export const updateProductSchema = z
  .object({
    packSize: z.coerce.number().int().min(1, 'Ít nhất 1 lon / chai mỗi thùng').max(200, 'Tối đa 200').optional(),
    isActive: z.coerce.boolean().optional(),
  })
  .refine((b) => Object.keys(b).length > 0, { message: 'Không có gì để sửa' });
