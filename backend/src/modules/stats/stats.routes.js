import { Router } from 'express';
import { requirePermission } from '../../middlewares/auth.js';
import * as ctrl from './stats.controller.js';
import * as manager from './manager.controller.js';

const router = Router();

router.get('/overview', requirePermission('DASHBOARD', 'view'), ctrl.overview);

// App Quản lý (docs/28-app-quan-ly.md): số liệu gom sẵn cho màn hình điện thoại
router.get('/manager', requirePermission('DASHBOARD', 'view'), manager.managerOverview);
router.get('/cancellations', requirePermission('DASHBOARD', 'view'), manager.cancellations);

export default router;
