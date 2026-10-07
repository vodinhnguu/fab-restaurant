import { Router } from 'express';
import { optionalAuth, requireAdmin, requireAuth } from '../../middlewares/auth.js';
import { rateLimit } from '../../middlewares/rateLimit.js';
import { validate } from '../../middlewares/validate.js';
import * as ctrl from './reservations.controller.js';
import {
  createReservationSchema,
  reservationQuerySchema,
  updateReservationStatusSchema,
} from './reservations.validation.js';

const router = Router();

// Tra cứu bằng mã + SĐT: giới hạn để không ai dò thử hàng loạt SĐT
const trackLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 60 });

router.post('/', optionalAuth, validate(createReservationSchema), ctrl.create);
router.get('/my', requireAuth, ctrl.myReservations);
router.get('/track/:code', trackLimiter, optionalAuth, ctrl.track);
router.post('/:code/cancel', optionalAuth, ctrl.cancel);

router.get('/', requireAdmin, validate(reservationQuerySchema, 'query'), ctrl.list);
router.patch('/:id/status', requireAdmin, validate(updateReservationStatusSchema), ctrl.updateStatus);

export default router;
