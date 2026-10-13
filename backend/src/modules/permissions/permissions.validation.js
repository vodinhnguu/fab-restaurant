import { z } from 'zod';
import { MODULE_KEYS } from '../../config/permissions.js';

const flags = z.object({
  view: z.boolean().default(false),
  create: z.boolean().default(false),
  edit: z.boolean().default(false),
  delete: z.boolean().default(false),
});

export const roleSchema = z.object({
  name: z.string().trim().min(2, 'Tên vai trò tối thiểu 2 ký tự').max(50),
  description: z.string().trim().max(255).optional().nullable(),
  // { ORDERS: { view: true, ... }, MENU: {...} } - chức năng không gửi lên = không có quyền
  permissions: z
    .record(z.string(), flags)
    .refine((p) => Object.keys(p).every((k) => MODULE_KEYS.includes(k)), { message: 'Có chức năng không hợp lệ' })
    .default({}),
});
