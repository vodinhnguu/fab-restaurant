import { Router } from 'express';
import { requirePermission } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import * as ctrl from './coupons.controller.js';
import { checkCouponSchema, couponSchema } from './coupons.validation.js';

const router = Router();

router.get('/public', ctrl.listPublic);
router.post('/check', validate(checkCouponSchema), ctrl.check);

router.get('/', requirePermission('COUPONS', 'view'), ctrl.list);
router.post('/', requirePermission('COUPONS', 'create'), validate(couponSchema), ctrl.create);
router.put('/:id', requirePermission('COUPONS', 'edit'), validate(couponSchema), ctrl.update);
router.delete('/:id', requirePermission('COUPONS', 'delete'), ctrl.remove);

export default router;
