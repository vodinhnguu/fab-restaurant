import { z } from 'zod';

export const dishSchema = z
  .object({
    name: z.string().trim().min(2, 'Tên món tối thiểu 2 ký tự').max(150),
    description: z.string().trim().max(2000).optional().nullable(),
    price: z.coerce.number().int().positive('Giá phải lớn hơn 0'),
    salePrice: z.coerce.number().int().positive().optional().nullable(),
    unit: z.string().trim().max(20).default('phần'),
    image: z.string().max(500).optional().nullable(),
    categoryId: z.coerce.number().int().positive('Vui lòng chọn danh mục'),
    isAvailable: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
  })
  .refine((d) => !d.salePrice || d.salePrice < d.price, {
    message: 'Giá khuyến mãi phải nhỏ hơn giá gốc',
    path: ['salePrice'],
  });

export const dishQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().optional(), // slug danh mục
  featured: z.enum(['true', 'false']).optional(),
  available: z.enum(['true', 'false', 'all']).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'popular', 'rating']).default('newest'),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});
