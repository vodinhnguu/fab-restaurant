import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'Tên danh mục tối thiểu 2 ký tự').max(100),
  description: z.string().trim().max(500).optional().nullable(),
  image: z.string().max(500).optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
});
