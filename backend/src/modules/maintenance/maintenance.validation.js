import { z } from 'zod';
import { EQUIPMENT_CATEGORIES } from '../../config/equipment.js';

const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải có dạng yyyy-MM-dd');
const optionalId = z.coerce.number().int().positive().optional();

// Báo hỏng / tạo phiếu / sửa phiếu
export const ticketSchema = z.object({
  title: z.string().trim().min(3, 'Vui lòng mô tả ngắn sự cố').max(120, 'Tối đa 120 ký tự'),
  description: z.string().trim().max(500, 'Mô tả tối đa 500 ký tự').optional().nullable(),
  equipmentId: z.coerce.number({ error: 'Vui lòng chọn thiết bị' }).int().positive('Vui lòng chọn thiết bị'),
  priority: z.enum(['NORMAL', 'URGENT']).default('NORMAL'),
  assigneeId: z.null().or(z.coerce.number().int().positive()).optional(), // null = bỏ giao
});

// Đổi trạng thái phiếu:
//   IN_PROGRESS   "Nhận sửa" / "Tiếp tục sửa"
//   WAITING_PARTS "Chờ linh kiện": bắt buộc note (đang chờ gì)
//   DONE          "Hoàn thành": bắt buộc note (đã xử lý thế nào), cost không bắt buộc
//   CANCELLED     "Hủy": bắt buộc note (lý do), cần quyền Xóa
export const ticketStatusSchema = z
  .object({
    status: z.enum(['IN_PROGRESS', 'WAITING_PARTS', 'DONE', 'CANCELLED']),
    note: z.string().trim().max(500, 'Tối đa 500 ký tự').optional().nullable(),
    cost: z.null().or(z.coerce.number().int().min(0, 'Chi phí không âm').max(1_000_000_000)).optional(),
  })
  .refine((b) => b.status === 'IN_PROGRESS' || b.note, {
    message: 'Vui lòng ghi rõ (đang chờ gì / đã xử lý thế nào / lý do hủy)',
    path: ['note'],
  });

// Danh sách phiếu chưa xong. ACTIVE = mới báo + đang sửa + chờ linh kiện
export const ticketQuerySchema = z.object({
  status: z.enum(['ACTIVE', 'OPEN', 'IN_PROGRESS', 'WAITING_PARTS']).default('ACTIVE'),
  mine: z.stringbool().optional(), // phiếu tôi đang nhận
  equipmentId: optionalId,
  category: z.string().trim().optional(),
});

// Lịch sử: mặc định 30 ngày gần nhất
export const historyQuerySchema = z.object({
  from: ymd.optional(),
  to: ymd.optional(),
  status: z.enum(['DONE', 'CANCELLED']).default('DONE'),
  type: z.enum(['REPAIR', 'MAINTENANCE']).optional(),
  userId: optionalId,
  equipmentId: optionalId,
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});

// Thêm / sửa thiết bị
export const equipmentSchema = z.object({
  name: z.string().trim().min(2, 'Vui lòng nhập tên thiết bị').max(100),
  category: z.enum(EQUIPMENT_CATEGORIES, { error: 'Nhóm thiết bị không hợp lệ' }),
  location: z.string().trim().max(100).optional().nullable(),
  maintenanceDays: z.null().or(z.coerce.number().int().min(1, 'Chu kỳ ít nhất 1 ngày').max(3650)).optional(),
  note: z.string().trim().max(300).optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const equipmentQuerySchema = z.object({
  all: z.stringbool().optional(), // kèm thiết bị đã ngưng dùng
});

// Bấm "Đã bảo trì". closeTickets = máy đang có phiếu sửa chữa và đã sửa xong luôn -> đóng các phiếu đó
// (khi đó bắt buộc ghi chú, dùng làm "cách xử lý" của phiếu)
export const maintainSchema = z
  .object({
    note: z.string().trim().max(500).optional().nullable(),
    cost: z.null().or(z.coerce.number().int().min(0).max(1_000_000_000)).optional(),
    closeTickets: z.boolean().optional(),
  })
  .refine((b) => !b.closeTickets || b.note, { message: 'Vui lòng ghi đã xử lý thế nào để đóng phiếu sửa chữa', path: ['note'] });
