import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.js';
import { rateLimit } from '../../middlewares/rateLimit.js';
import { validate } from '../../middlewares/validate.js';
import * as ctrl from './auth.controller.js';
import { changePasswordSchema, loginSchema, registerSchema, updateProfileSchema } from './auth.validation.js';

const router = Router();

// Tối đa 20 lần / 15 phút cho mỗi IP -> chống dò mật khẩu và tạo tài khoản rác
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
// Đăng nhập: chỉ đếm lần SAI (đăng nhập đúng không bị trừ lượt) -> đổi qua lại nhiều tài khoản không bị chặn
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, skipSuccessful: true });

router.post('/register', authLimiter, validate(registerSchema), ctrl.register);
router.post('/login', loginLimiter, validate(loginSchema), ctrl.login);
router.get('/me', requireAuth, ctrl.me);
router.patch('/me', requireAuth, validate(updateProfileSchema), ctrl.updateProfile);
router.post('/change-password', requireAuth, authLimiter, validate(changePasswordSchema), ctrl.changePassword);

export default router;
