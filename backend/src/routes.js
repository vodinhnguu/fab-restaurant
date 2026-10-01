import { Router } from 'express';
import { env } from './config/env.js';
import { restaurant } from './config/restaurant.js';
import authRoutes from './modules/auth/auth.routes.js';
import categoryRoutes from './modules/categories/categories.routes.js';
import couponRoutes from './modules/coupons/coupons.routes.js';
import dishRoutes from './modules/dishes/dishes.routes.js';
import orderRoutes from './modules/orders/orders.routes.js';
import reservationRoutes from './modules/reservations/reservations.routes.js';
import reviewRoutes from './modules/reviews/reviews.routes.js';
import statsRoutes from './modules/stats/stats.routes.js';
import uploadRoutes from './modules/upload/upload.routes.js';
import userRoutes from './modules/users/users.routes.js';

const router = Router();

router.get('/health', (req, res) => res.json({ success: true, data: { status: 'ok', time: new Date() } }));
router.get('/info', (req, res) => res.json({ success: true, data: { ...restaurant, shippingFee: env.shippingFee, freeShippingMin: env.freeShippingMin } }));

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/dishes', dishRoutes);
router.use('/orders', orderRoutes);
router.use('/reservations', reservationRoutes);
router.use('/reviews', reviewRoutes);
router.use('/coupons', couponRoutes);
router.use('/users', userRoutes);
router.use('/stats', statsRoutes);
router.use('/upload', uploadRoutes);

export default router;
