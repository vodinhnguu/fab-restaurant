import { Router } from 'express';
import { requireAdmin } from '../../middlewares/auth.js';
import * as ctrl from './stats.controller.js';

const router = Router();

router.get('/overview', requireAdmin, ctrl.overview);

export default router;
