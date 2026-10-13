import { Router } from 'express';
import { requirePermission } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import * as ctrl from './dishes.controller.js';
import { dishQuerySchema, dishSchema } from './dishes.validation.js';

const router = Router();

router.get('/', validate(dishQuerySchema, 'query'), ctrl.list);
router.get('/:idOrSlug', ctrl.detail);
router.post('/', requirePermission('MENU', 'create'), validate(dishSchema), ctrl.create);
router.put('/:id', requirePermission('MENU', 'edit'), validate(dishSchema), ctrl.update);
router.patch('/:id/toggle', requirePermission('MENU', 'edit'), ctrl.toggleAvailable);
router.delete('/:id', requirePermission('MENU', 'delete'), ctrl.remove);

export default router;
