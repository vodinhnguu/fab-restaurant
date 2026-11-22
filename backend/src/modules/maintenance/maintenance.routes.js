import { Router } from 'express';
import { requirePermission } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import * as ctrl from './maintenance.controller.js';
import {
  equipmentQuerySchema,
  equipmentSchema,
  historyQuerySchema,
  maintainSchema,
  ticketQuerySchema,
  ticketSchema,
  ticketStatusSchema,
} from './maintenance.validation.js';

// Kỹ thuật: thiết bị & sửa chữa (chức năng FACILITY). Tài liệu: docs/22-ky-thuat-bao-tri.md
const router = Router();
const VIEW = ['FACILITY', 'view'];
const CREATE = ['FACILITY', 'create'];
const EDIT = ['FACILITY', 'edit'];
const DELETE = ['FACILITY', 'delete'];

router.get('/overview', requirePermission(VIEW), ctrl.overview);
router.get('/history', requirePermission(VIEW), validate(historyQuerySchema, 'query'), ctrl.history);
router.get('/staff', requirePermission(CREATE, EDIT), ctrl.staff);

// Danh sách thiết bị: người chỉ có quyền Thêm (phục vụ, tạp vụ...) cũng cần để chọn thiết bị khi báo hỏng
router.get('/equipment', requirePermission(VIEW, CREATE), validate(equipmentQuerySchema, 'query'), ctrl.listEquipment);
router.post('/equipment', requirePermission(DELETE), validate(equipmentSchema), ctrl.createEquipment);
router.put('/equipment/:id', requirePermission(DELETE), validate(equipmentSchema), ctrl.updateEquipment);
router.post('/equipment/:id/maintain', requirePermission(EDIT), validate(maintainSchema), ctrl.maintain);

router.get('/tickets', requirePermission(VIEW), validate(ticketQuerySchema, 'query'), ctrl.listTickets);
router.get('/tickets/reported', requirePermission(CREATE, VIEW), ctrl.myReported);
router.post('/tickets', requirePermission(CREATE), validate(ticketSchema), ctrl.createTicket);
router.put('/tickets/:id', requirePermission(EDIT), validate(ticketSchema), ctrl.updateTicket);
// Hủy (CANCELLED) cần thêm quyền Xóa: controller tự kiểm tra
router.patch('/tickets/:id/status', requirePermission(EDIT), validate(ticketStatusSchema), ctrl.updateTicketStatus);

export default router;
