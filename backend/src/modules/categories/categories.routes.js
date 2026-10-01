import { Router } from 'express';
import { requireAdmin } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import * as ctrl from './categories.controller.js';
import { categorySchema } from './categories.validation.js';

const router = Router();

router.get('/', ctrl.list);
router.post('/', requireAdmin, validate(categorySchema), ctrl.create);
router.put('/:id', requireAdmin, validate(categorySchema), ctrl.update);
router.delete('/:id', requireAdmin, ctrl.remove);

export default router;
