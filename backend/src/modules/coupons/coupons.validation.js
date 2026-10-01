import { z } from 'zod';

export const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3)
      .max(30)
      .regex(/^[A-Za-z0-9_-]+$/, 'Mã chỉ gồm chữ, số, - và _')
      .transform((s) => s.toUpperCase()),
    description: z.string().trim().max(255).optional().nullable(),
    type: z.enum(['PERCENT', 'FIXED']),
    value: z.coerce.number().int().positive('Giá trị phải lớn hơn 0'),
    minOrder: z.coerce.number().int().min(0).default(0),
    maxDiscount: z.coerce.number().int().positive().optional().nullable(),
    usageLimit: z.coerce.number().int().positive().optional().nullable(),
    startsAt: z.coerce.date().optional().nullable(),
    expiresAt: z.coerce.date().optional().nullable(),
    isActive: z.boolean().default(true),
  })
  .refine((c) => c.type !== 'PERCENT' || c.value <= 100, { message: 'Phần trăm tối đa 100', path: ['value'] });

export const checkCouponSchema = z.object({
  code: z.string().trim().min(1, 'Vui lòng nhập mã'),
  subtotal: z.coerce.number().int().min(0),
});
