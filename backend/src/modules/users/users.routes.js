import { Router } from 'express';
import { requireAdmin } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import * as ctrl from './users.controller.js';

const router = Router();

router.use(requireAdmin);
router.get('/', ctrl.list);
router.patch('/:id', validate(ctrl.updateUserSchema), ctrl.update);

export default router;
