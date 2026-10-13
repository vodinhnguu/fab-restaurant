import { Router } from 'express';
import { requireAuth, requirePermission } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import * as ctrl from './reviews.controller.js';

const router = Router();

router.post('/', requireAuth, validate(ctrl.reviewSchema), ctrl.upsert);
router.get('/', requirePermission('REVIEWS', 'view'), ctrl.list);
router.delete('/:id', requirePermission('REVIEWS', 'delete'), ctrl.remove);

export default router;
