import { Router } from 'express';
import { requirePermission } from '../../middlewares/auth.js';
import * as ctrl from './stats.controller.js';

const router = Router();

router.get('/overview', requirePermission('DASHBOARD', 'view'), ctrl.overview);

export default router;
