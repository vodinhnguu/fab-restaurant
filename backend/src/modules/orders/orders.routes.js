import { Router } from 'express';
import { optionalAuth, requireAdmin, requireAuth } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import * as ctrl from './orders.controller.js';
import { createOrderSchema, orderQuerySchema, phoneSchema, updateStatusSchema } from './orders.validation.js';

const router = Router();

// Khách hàng (có hoặc không có tài khoản)
router.post('/', optionalAuth, validate(createOrderSchema), ctrl.create);
router.get('/my', requireAuth, ctrl.myOrders);
router.get('/track/:code', optionalAuth, ctrl.track);
router.post('/:code/pay', optionalAuth, validate(phoneSchema), ctrl.pay);
router.post('/:code/cancel', optionalAuth, validate(phoneSchema), ctrl.cancel);

// Admin
router.get('/', requireAdmin, validate(orderQuerySchema, 'query'), ctrl.list);
router.get('/:id', requireAdmin, ctrl.detail);
router.patch('/:id/status', requireAdmin, validate(updateStatusSchema), ctrl.updateStatus);

export default router;
