import { Router } from 'express';
import { requirePermission } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import * as ctrl from './dine-in.controller.js';
import { addItemsSchema, cancelItemSchema, kitchenStartSchema, serveItemsSchema, weighItemSchema } from './dine-in.validation.js';

// Ăn tại quán. Tài liệu: docs/23-app-nhan-vien-phuc-vu.md
// Quyền theo ma trận phân quyền:
//   phục vụ (app)  -> "Đơn hàng & gọi món" (ORDERS)
//   thu ngân (web) -> "Thanh toán" (PAYMENTS)
//   bếp (web)      -> "Phiếu bếp" (KITCHEN)
//   hồ hải sản (web) -> "Hồ hải sản & nhập hàng" (SEAFOOD_TANK): cân món bán theo kg
const router = Router();

// ---- Phục vụ (app mobile) ----
router.get('/tables', requirePermission('ORDERS', 'view'), ctrl.floor);
router.get('/tables/:id', requirePermission('ORDERS', 'view'), ctrl.tableDetail);
router.get('/orders', requirePermission('ORDERS', 'view'), ctrl.todayOrders);
router.post('/orders', requirePermission('ORDERS', 'create'), validate(addItemsSchema), ctrl.addItems); // Gửi bếp
router.post('/items/serve', requirePermission('ORDERS', 'edit'), validate(serveItemsSchema), ctrl.serveItems); // Check món
router.post('/items/:id/cancel', requirePermission('ORDERS', 'edit'), validate(cancelItemSchema), ctrl.cancelItem); // Hủy món
router.post('/orders/:id/bill-request', requirePermission('ORDERS', 'edit'), ctrl.requestBill); // Gửi thanh toán
router.delete('/orders/:id/bill-request', requirePermission('ORDERS', 'edit'), ctrl.cancelBillRequest);

// ---- Thu ngân (web /admin/cashier) ----
router.get('/bills', requirePermission('PAYMENTS', 'view'), ctrl.bills);
router.get('/bills/:id', requirePermission('PAYMENTS', 'view'), ctrl.bill);
router.post('/bills/:id/printed', requirePermission('PAYMENTS', 'view'), ctrl.markPrinted);
router.post('/bills/:id/pay', requirePermission('PAYMENTS', 'edit'), ctrl.pay); // Đã thu tiền

// ---- Bếp (web /admin/kitchen) ----
router.get('/kitchen', requirePermission('KITCHEN', 'view'), ctrl.kitchen);
router.post('/kitchen/start', requirePermission('KITCHEN', 'edit'), validate(kitchenStartSchema), ctrl.startCooking); // Nhận làm

// ---- Hồ hải sản (web /admin/weighing) ----
router.get('/weighing', requirePermission('SEAFOOD_TANK', 'view'), ctrl.weighingList);
router.post('/items/:id/weigh', requirePermission('SEAFOOD_TANK', 'edit'), validate(weighItemSchema), ctrl.weighItem); // Cân

export default router;
