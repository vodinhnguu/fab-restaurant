import { z } from 'zod';

export const createOrderSchema = z
  .object({
    customerName: z.string().trim().min(2, 'Vui lòng nhập họ tên').max(100),
    phone: z
      .string()
      .trim()
      .regex(/^(0|\+84)\d{9,10}$/, 'Số điện thoại không hợp lệ'),
    address: z.string().trim().max(255).optional().nullable(),
    type: z.enum(['DELIVERY', 'PICKUP']).default('DELIVERY'),
    paymentMethod: z.enum(['COD', 'ONLINE']).default('COD'),
    note: z.string().trim().max(500).optional().nullable(),
    couponCode: z.string().trim().optional().nullable(),
    items: z
      .array(
        z.object({
          dishId: z.coerce.number().int().positive(),
          quantity: z.coerce.number().int().min(1).max(50),
        }),
      )
      .min(1, 'Giỏ hàng trống'),
  })
  .refine((o) => o.type !== 'DELIVERY' || (o.address && o.address.length >= 5), {
    message: 'Vui lòng nhập địa chỉ giao hàng',
    path: ['address'],
  });

export const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERING', 'COMPLETED', 'CANCELLED']),
});

export const phoneSchema = z.object({
  phone: z.string().trim().optional(),
});

export const orderQuerySchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERING', 'COMPLETED', 'CANCELLED']).optional(),
  search: z.string().trim().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});
