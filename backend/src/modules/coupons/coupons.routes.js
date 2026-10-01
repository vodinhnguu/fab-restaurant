import { Router } from 'express';
import { requireAdmin } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import * as ctrl from './coupons.controller.js';
import { checkCouponSchema, couponSchema } from './coupons.validation.js';

const router = Router();

router.get('/public', ctrl.listPublic);
router.post('/check', validate(checkCouponSchema), ctrl.check);

router.get('/', requireAdmin, ctrl.list);
router.post('/', requireAdmin, validate(couponSchema), ctrl.create);
router.put('/:id', requireAdmin, validate(couponSchema), ctrl.update);
router.delete('/:id', requireAdmin, ctrl.remove);

export default router;
