import { Router } from 'express';
import { optionalAuth, requireAuth, requirePermission } from '../../middlewares/auth.js';
import { rateLimit } from '../../middlewares/rateLimit.js';
import { validate } from '../../middlewares/validate.js';
import * as ctrl from './reservations.controller.js';
import {
  cancelReservationSchema,
  createReservationSchema,
  reservationQuerySchema,
  tableMapQuerySchema,
  updateReservationStatusSchema,
} from './reservations.validation.js';

const router = Router();
// Sơ đồ bàn được tải lại mỗi khi khách đổi ngày / giờ nên cho thoải mái hơn
const mapLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });

// Tra cứu bằng mã + SĐT: giới hạn để không ai dò thử hàng loạt SĐT
const trackLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 60 });
// Chống spam lịch ảo: mỗi IP tối đa 10 lần đặt bàn / 15 phút
const createLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Bạn đặt bàn quá nhiều lần, vui lòng thử lại sau ít phút' });

router.post('/', createLimiter, optionalAuth, validate(createReservationSchema), ctrl.create);
router.get('/my', requireAuth, ctrl.myReservations);
// Sơ đồ bàn: ai cũng xem được trống / bận; nhân viên có quyền thì thấy thêm tên khách
router.get('/tables', mapLimiter, optionalAuth, validate(tableMapQuerySchema, 'query'), ctrl.tables);
router.get('/track/:code', trackLimiter, optionalAuth, ctrl.track);
router.post('/:code/cancel', trackLimiter, optionalAuth, validate(cancelReservationSchema), ctrl.cancel);

router.get('/', requirePermission('RESERVATIONS', 'view'), validate(reservationQuerySchema, 'query'), ctrl.list);
router.patch('/:id/status', requirePermission('RESERVATIONS', 'edit'), validate(updateReservationStatusSchema), ctrl.updateStatus);

export default router;
