import { z } from 'zod';

const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải có dạng yyyy-MM-dd');
// Gửi null = bỏ giao việc (chưa ai nhận)
const optionalUserId = z.null().or(z.coerce.number().int().positive()).optional();

// Thêm / sửa 1 việc
export const taskSchema = z.object({
  title: z.string().trim().min(2, 'Vui lòng nhập tên việc').max(120, 'Tên việc tối đa 120 ký tự'),
  note: z.string().trim().max(500, 'Mô tả tối đa 500 ký tự').optional().nullable(),
  areaId: z.coerce.number({ error: 'Vui lòng chọn khu vực' }).int().positive('Vui lòng chọn khu vực'),
  priority: z.enum(['NORMAL', 'URGENT']).default('NORMAL'),
  assigneeId: optionalUserId,
});

// Bắt đầu / hoàn thành / hủy. Hủy thì bắt buộc ghi lý do.
export const taskStatusSchema = z
  .object({
    status: z.enum(['IN_PROGRESS', 'DONE', 'CANCELLED']),
    note: z.string().trim().max(300, 'Ghi chú tối đa 300 ký tự').optional().nullable(),
  })
  .refine((b) => b.status !== 'CANCELLED' || b.note, { message: 'Vui lòng nhập lý do hủy', path: ['note'] });

// Danh sách việc chưa xong. OPEN = chờ làm + đang làm
export const taskQuerySchema = z.object({
  status: z.enum(['OPEN', 'TODO', 'IN_PROGRESS']).default('OPEN'),
  mine: z.stringbool().optional(), // ?mine=true: chỉ việc giao cho tôi
  areaId: z.coerce.number().int().positive().optional(),
});

// Lịch sử: mặc định 7 ngày gần nhất, việc đã xong
export const historyQuerySchema = z.object({
  from: ymd.optional(),
  to: ymd.optional(),
  status: z.enum(['DONE', 'CANCELLED']).default('DONE'),
  userId: z.coerce.number().int().positive().optional(),
  areaId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});

// Khu vực
export const areaSchema = z.object({
  name: z.string().trim().min(2, 'Vui lòng nhập tên khu vực').max(80),
  description: z.string().trim().max(300).optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const areaQuerySchema = z.object({
  all: z.stringbool().optional(), // ?all=true: kèm cả khu đang ẩn (để quản lý bật lại)
});

// Bấm "Đã dọn xong" ở 1 khu vực
export const cleanAreaSchema = z.object({
  note: z.string().trim().max(300, 'Ghi chú tối đa 300 ký tự').optional().nullable(),
});
