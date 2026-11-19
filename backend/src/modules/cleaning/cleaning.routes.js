import { Router } from 'express';
import { requirePermission } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import * as ctrl from './cleaning.controller.js';
import {
  areaQuerySchema,
  areaSchema,
  cleanAreaSchema,
  historyQuerySchema,
  taskQuerySchema,
  taskSchema,
  taskStatusSchema,
} from './cleaning.validation.js';

// Vệ sinh & dọn dẹp (việc của tạp vụ). Tài liệu: docs/20-ve-sinh.md
const router = Router();

router.get('/overview', requirePermission('CLEANING', 'view'), ctrl.overview);
router.get('/history', requirePermission('CLEANING', 'view'), validate(historyQuerySchema, 'query'), ctrl.history);
// Danh sách người để giao việc / lọc lịch sử
router.get('/staff', requirePermission(['CLEANING', 'create'], ['CLEANING', 'edit']), ctrl.staff);

router.get('/areas', requirePermission('CLEANING', 'view'), validate(areaQuerySchema, 'query'), ctrl.listAreas);
router.post('/areas', requirePermission('CLEANING', 'delete'), validate(areaSchema), ctrl.createArea);
router.put('/areas/:id', requirePermission('CLEANING', 'delete'), validate(areaSchema), ctrl.updateArea);
router.post('/areas/:id/clean', requirePermission('CLEANING', 'edit'), validate(cleanAreaSchema), ctrl.cleanArea);

router.get('/tasks', requirePermission('CLEANING', 'view'), validate(taskQuerySchema, 'query'), ctrl.listTasks);
router.post('/tasks', requirePermission('CLEANING', 'create'), validate(taskSchema), ctrl.createTask);
router.put('/tasks/:id', requirePermission('CLEANING', 'edit'), validate(taskSchema), ctrl.updateTask);
// Hủy (CANCELLED) cần thêm quyền Xóa: controller tự kiểm tra
router.patch('/tasks/:id/status', requirePermission('CLEANING', 'edit'), validate(taskStatusSchema), ctrl.updateTaskStatus);

export default router;
