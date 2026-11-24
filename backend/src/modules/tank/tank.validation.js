// Kiểm tra dữ liệu gửi lên cho Tồn hồ hải sản (docs/27-ton-ho-hai-san.md)
import { z } from 'zod';

// Số kg: gõ "1,5" hay "1.5" đều được (frontend đổi dấu phẩy thành dấu chấm trước khi gửi)
const kg = (max = 500) =>
  z.coerce
    .number({ error: 'Nhập số kg' })
    .min(0.01, 'Ít nhất 0,01 kg')
    .max(max, `Nhiều nhất ${max} kg, kiểm tra lại số`);

const note = (max = 300) => z.string().trim().max(max, `Tối đa ${max} ký tự`).optional().nullable();

// Nhập hàng: xe hàng về
export const importSchema = z.object({
  kg: kg(),
  unitCost: z.null().or(z.coerce.number().int().min(0, 'Giá nhập không âm').max(100_000_000)).optional(),
  supplier: z.string().trim().max(120, 'Tối đa 120 ký tự').optional().nullable(),
  note: note(),
});

// Kiểm hồ: nhập số kg đếm / cân thực tế (0 kg hợp lệ = hồ hết loại này)
export const auditSchema = z.object({
  actualKg: z.coerce.number({ error: 'Nhập số kg đếm được' }).min(0, 'Không âm').max(500, 'Nhiều nhất 500 kg'),
  note: note(),
});

// Hao hụt: hải sản chết / thất thoát, bắt buộc ghi lý do
export const lossSchema = z.object({
  kg: kg(),
  note: z.string({ error: 'Vui lòng ghi rõ lý do' }).trim().min(3, 'Vui lòng ghi rõ lý do (vd: 2 con tôm hùm chết)').max(300),
});

// Thêm loại hải sản mới
export const createSchema = z.object({
  name: z.string().trim().min(2, 'Nhập tên loại hải sản').max(60, 'Tối đa 60 ký tự'),
  lowStockKg: z.coerce.number().min(0, 'Không âm').max(100).optional(),
  note: note(),
});

// Sửa loại: tên / ngưỡng gần hết / ghi chú. Tồn chỉ đổi qua phiếu nhập - kiểm hồ - hao hụt.
export const updateSchema = z
  .object({
    name: z.string().trim().min(2, 'Nhập tên loại hải sản').max(60, 'Tối đa 60 ký tự').optional(),
    lowStockKg: z.coerce.number().min(0, 'Không âm').max(100).optional(),
    note: note(),
  })
  .refine((b) => Object.keys(b).length > 0, { message: 'Không có gì để sửa' });

// Tắt / bật loại (hồ không nuôi nữa). Cần quyền Xóa.
export const activeSchema = z.object({ isActive: z.coerce.boolean() });
