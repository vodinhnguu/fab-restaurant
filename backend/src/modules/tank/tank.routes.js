import { Router } from 'express';
import { requirePermission } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import * as ctrl from './tank.controller.js';
import { activeSchema, auditSchema, createSchema, importSchema, lossSchema, updateSchema } from './tank.validation.js';

// Tồn hồ hải sản. Tài liệu: docs/27-ton-ho-hai-san.md
// Quyền: chức năng SEAFOOD_TANK "Hồ hải sản & nhập hàng" (xem bảng ở tank.controller.js)
const router = Router();

router.get('/', requirePermission('SEAFOOD_TANK', 'view'), ctrl.list);
router.get('/entries', requirePermission('SEAFOOD_TANK', 'view'), ctrl.entries);

router.post('/:id/import', requirePermission('SEAFOOD_TANK', 'edit'), validate(importSchema), ctrl.importStock); // Nhập hàng
router.post('/:id/audit', requirePermission('SEAFOOD_TANK', 'edit'), validate(auditSchema), ctrl.audit); // Kiểm hồ
router.post('/:id/loss', requirePermission('SEAFOOD_TANK', 'edit'), validate(lossSchema), ctrl.recordLoss); // Hao hụt

router.post('/', requirePermission('SEAFOOD_TANK', 'create'), validate(createSchema), ctrl.create);
router.patch('/:id', requirePermission('SEAFOOD_TANK', 'edit'), validate(updateSchema), ctrl.update);
router.patch('/:id/active', requirePermission('SEAFOOD_TANK', 'delete'), validate(activeSchema), ctrl.setActive); // Tắt / bật loại

export default router;
