import { Router } from 'express';
import { requirePermission } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import * as ctrl from './users.controller.js';

const router = Router();

router.get('/', requirePermission('STAFF', 'view'), ctrl.list);
router.post('/', requirePermission('STAFF', 'create'), validate(ctrl.createUserSchema), ctrl.create);
router.patch('/:id', requirePermission('STAFF', 'edit'), validate(ctrl.updateUserSchema), ctrl.update);
router.post('/:id/reset-password', requirePermission('STAFF', 'edit'), validate(ctrl.resetPasswordSchema), ctrl.resetPassword);

export default router;
