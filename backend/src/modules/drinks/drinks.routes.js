import { Router } from 'express';
import { requirePermission } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import * as ctrl from './drinks.controller.js';
import { addProductSchema, saveCheckSchema, updateProductSchema } from './drinks.validation.js';

// Kiểm bia nước cuối ngày. Tài liệu: docs/29-kiem-bia-nuoc.md
// Quyền: chức năng DRINKS "Bia nước & kiểm kho quầy" (xem bảng ở drinks.controller.js)
const router = Router();

router.get('/check', requirePermission('DRINKS', 'view'), ctrl.dayCheck);
router.put('/check', requirePermission('DRINKS', 'edit'), validate(saveCheckSchema), ctrl.saveCheck);
router.get('/history', requirePermission('DRINKS', 'view'), ctrl.history);

router.get('/products', requirePermission('DRINKS', 'view'), ctrl.products);
router.post('/products', requirePermission('DRINKS', 'create'), validate(addProductSchema), ctrl.addProduct);
router.patch('/products/:id', requirePermission('DRINKS', 'delete'), validate(updateProductSchema), ctrl.updateProduct);

export default router;
