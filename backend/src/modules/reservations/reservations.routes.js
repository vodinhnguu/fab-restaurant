import { Router } from 'express';
import { optionalAuth, requireAdmin, requireAuth } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import * as ctrl from './reservations.controller.js';
import {
  createReservationSchema,
  reservationQuerySchema,
  updateReservationStatusSchema,
} from './reservations.validation.js';

const router = Router();

router.post('/', optionalAuth, validate(createReservationSchema), ctrl.create);
router.get('/my', requireAuth, ctrl.myReservations);
router.get('/track/:code', optionalAuth, ctrl.track);
router.post('/:code/cancel', optionalAuth, ctrl.cancel);

router.get('/', requireAdmin, validate(reservationQuerySchema, 'query'), ctrl.list);
router.patch('/:id/status', requireAdmin, validate(updateReservationStatusSchema), ctrl.updateStatus);

export default router;
