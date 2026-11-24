import { Router } from 'express';
import { env, isVnpayEnabled } from './config/env.js';
import { restaurant } from './config/restaurant.js';
import authRoutes from './modules/auth/auth.routes.js';
import categoryRoutes from './modules/categories/categories.routes.js';
import cleaningRoutes from './modules/cleaning/cleaning.routes.js';
import couponRoutes from './modules/coupons/coupons.routes.js';
import dineInRoutes from './modules/dine-in/dine-in.routes.js';
import drinksRoutes from './modules/drinks/drinks.routes.js';
import tankRoutes from './modules/tank/tank.routes.js';
import dishRoutes from './modules/dishes/dishes.routes.js';
import maintenanceRoutes from './modules/maintenance/maintenance.routes.js';
import orderRoutes from './modules/orders/orders.routes.js';
import paymentRoutes from './modules/payments/payments.routes.js';
import permissionRoutes from './modules/permissions/permissions.routes.js';
import reservationRoutes from './modules/reservations/reservations.routes.js';
import reviewRoutes from './modules/reviews/reviews.routes.js';
import statsRoutes from './modules/stats/stats.routes.js';
import uploadRoutes from './modules/upload/upload.routes.js';
import userRoutes from './modules/users/users.routes.js';

const router = Router();

router.get('/health', (req, res) => res.json({ success: true, data: { status: 'ok', time: new Date() } }));
router.get('/info', (req, res) => res.json({ success: true, data: { ...restaurant, shippingFee: env.shippingFee, freeShippingMin: env.freeShippingMin, onlinePayment: isVnpayEnabled() } }));

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/dishes', dishRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/reservations', reservationRoutes);
router.use('/reviews', reviewRoutes);
router.use('/coupons', couponRoutes);
router.use('/users', userRoutes);
router.use('/stats', statsRoutes);
router.use('/permissions', permissionRoutes);
router.use('/upload', uploadRoutes);
router.use('/cleaning', cleaningRoutes);
router.use('/maintenance', maintenanceRoutes);
// Ăn tại quán: nhân viên phục vụ ghi món tại bàn bằng app mobile (docs/23-app-nhan-vien-phuc-vu.md)
router.use('/dine-in', dineInRoutes);
router.use('/tank', tankRoutes); // Tồn hồ hải sản (docs/27)
router.use('/drinks', drinksRoutes); // Kiểm bia nước cuối ngày (docs/29)

export default router;
