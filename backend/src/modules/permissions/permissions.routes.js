import { Router } from 'express';
import { requireAdmin, requirePermission } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import * as ctrl from './permissions.controller.js';
import { roleSchema } from './permissions.validation.js';

const router = Router();

// Nhân viên có quyền Xem "Nhân sự & phân quyền" thì xem được ma trận.
// Sửa ma trận chỉ ADMIN: tránh nhân viên tự nâng quyền cho chính vai trò của mình.
router.get('/', requirePermission('STAFF', 'view'), ctrl.list);
router.get('/roles/:id', requirePermission('STAFF', 'view'), ctrl.detail);
router.post('/roles', requireAdmin, validate(roleSchema), ctrl.create);
router.put('/roles/:id', requireAdmin, validate(roleSchema), ctrl.update);
router.delete('/roles/:id', requireAdmin, ctrl.remove);

export default router;
