import { z } from 'zod';

const phone = z
  .string()
  .trim()
  .regex(/^(0|\+84)\d{9,10}$/, 'Số điện thoại không hợp lệ');

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Tên tối thiểu 2 ký tự').max(100),
  email: z.email('Email không hợp lệ').toLowerCase(),
  phone: phone.optional(),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự').max(100),
});

export const loginSchema = z.object({
  email: z.email('Email không hợp lệ').toLowerCase(),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: phone.optional().or(z.literal('')),
  address: z.string().trim().max(255).optional(),
  avatar: z.string().max(500).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: z.string().min(6, 'Mật khẩu mới tối thiểu 6 ký tự').max(100),
});
