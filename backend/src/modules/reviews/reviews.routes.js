import { Router } from 'express';
import { requireAdmin, requireAuth } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import * as ctrl from './reviews.controller.js';

const router = Router();

router.post('/', requireAuth, validate(ctrl.reviewSchema), ctrl.upsert);
router.get('/', requireAdmin, ctrl.list);
router.delete('/:id', requireAdmin, ctrl.remove);

export default router;
