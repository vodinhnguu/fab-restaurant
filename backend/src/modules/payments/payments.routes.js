import { Router } from 'express';
import { optionalAuth } from '../../middlewares/auth.js';
import { rateLimit } from '../../middlewares/rateLimit.js';
import { validate } from '../../middlewares/validate.js';
import { phoneSchema } from '../orders/orders.validation.js';
import * as ctrl from './payments.controller.js';

const router = Router();

// Nhận mã đơn + SĐT nên cũng giới hạn như API tra cứu đơn (chống dò SĐT)
const createLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });

router.post('/vnpay/:code', createLimiter, optionalAuth, validate(phoneSchema), ctrl.createVnpay);
router.get('/vnpay/ipn', ctrl.vnpayIpn);
router.get('/vnpay/return', ctrl.vnpayReturn);

export default router;
