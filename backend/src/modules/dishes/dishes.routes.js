import { Router } from 'express';
import { requireAdmin } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import * as ctrl from './dishes.controller.js';
import { dishQuerySchema, dishSchema } from './dishes.validation.js';

const router = Router();

router.get('/', validate(dishQuerySchema, 'query'), ctrl.list);
router.get('/:idOrSlug', ctrl.detail);
router.post('/', requireAdmin, validate(dishSchema), ctrl.create);
router.put('/:id', requireAdmin, validate(dishSchema), ctrl.update);
router.patch('/:id/toggle', requireAdmin, ctrl.toggleAvailable);
router.delete('/:id', requireAdmin, ctrl.remove);

export default router;
