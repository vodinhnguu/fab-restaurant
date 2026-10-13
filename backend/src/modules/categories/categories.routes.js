import { Router } from 'express';
import { requirePermission } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import * as ctrl from './categories.controller.js';
import { categorySchema } from './categories.validation.js';

const router = Router();

router.get('/', ctrl.list);
router.post('/', requirePermission('MENU', 'create'), validate(categorySchema), ctrl.create);
router.put('/:id', requirePermission('MENU', 'edit'), validate(categorySchema), ctrl.update);
router.delete('/:id', requirePermission('MENU', 'delete'), ctrl.remove);

export default router;
