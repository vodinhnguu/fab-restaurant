import { Router } from 'express';
import { optionalAuth, requireAdmin, requireAuth } from '../../middlewares/auth.js';
import { rateLimit } from '../../middlewares/rateLimit.js';
import { validate } from '../../middlewares/validate.js';
import * as ctrl from './orders.controller.js';
import { createOrderSchema, orderQuerySchema, phoneSchema, updateStatusSchema } from './orders.validation.js';

const router = Router();

// Tra cứu bằng mã + SĐT: giới hạn để không ai dò thử hàng loạt SĐT
const trackLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 60 });
// Chống spam đơn ảo: mỗi IP tối đa 10 đơn / 15 phút (đủ rộng cho nhiều người dùng chung wifi)
const createLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Bạn đặt quá nhiều đơn, vui lòng thử lại sau ít phút' });

// Khách hàng (có hoặc không có tài khoản)
router.post('/', createLimiter, optionalAuth, validate(createOrderSchema), ctrl.create);
router.get('/my', requireAuth, ctrl.myOrders);
router.get('/track/:code', trackLimiter, optionalAuth, ctrl.track);
router.post('/:code/cancel', trackLimiter, optionalAuth, validate(phoneSchema), ctrl.cancel);

// Admin
router.get('/', requireAdmin, validate(orderQuerySchema, 'query'), ctrl.list);
router.get('/:id', requireAdmin, ctrl.detail);
router.patch('/:id/status', requireAdmin, validate(updateStatusSchema), ctrl.updateStatus);

export default router;
