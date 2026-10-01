import { z } from 'zod';
import { restaurant } from '../../config/restaurant.js';

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

export const createReservationSchema = z
  .object({
    name: z.string().trim().min(2, 'Vui lòng nhập họ tên').max(100),
    phone: z
      .string()
      .trim()
      .regex(/^(0|\+84)\d{9,10}$/, 'Số điện thoại không hợp lệ'),
    email: z.email('Email không hợp lệ').optional().or(z.literal('')),
    date: z.coerce.date({ error: 'Vui lòng chọn ngày giờ' }),
    guests: z.coerce.number().int().min(1, 'Ít nhất 1 khách').max(50, 'Tối đa 50 khách, đoàn lớn vui lòng gọi hotline'),
    area: z.string().trim().max(100).optional().nullable(),
    note: z.string().trim().max(500).optional().nullable(),
  })
  .refine((r) => r.date.getTime() > Date.now() + 30 * 60 * 1000, {
    message: 'Vui lòng đặt trước ít nhất 30 phút',
    path: ['date'],
  })
  .refine(
    (r) => {
      // Giờ Việt Nam (UTC+7)
      const vn = new Date(r.date.getTime() + 7 * 3600 * 1000);
      const minutes = vn.getUTCHours() * 60 + vn.getUTCMinutes();
      const { open, close } = restaurant.openingHours;
      return minutes >= toMinutes(open) && minutes <= toMinutes(close) - 60;
    },
    { message: `Nhà hàng nhận khách từ ${restaurant.openingHours.open}, đặt muộn nhất trước giờ đóng cửa 1 tiếng`, path: ['date'] },
  );

export const updateReservationStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']),
});

export const reservationQuerySchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), // yyyy-MM-dd
  search: z.string().trim().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});
