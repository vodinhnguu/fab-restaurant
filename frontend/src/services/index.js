// Tất cả hàm gọi API ở một chỗ - page/component chỉ việc import và dùng với React Query
import { api } from '../lib/api';

export const infoApi = {
  get: () => api.get('/info').then((r) => r.data),
};

export const authApi = {
  login: (body) => api.post('/auth/login', body).then((r) => r.data),
  register: (body) => api.post('/auth/register', body).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
  updateProfile: (body) => api.patch('/auth/me', body).then((r) => r.data),
  changePassword: (body) => api.post('/auth/change-password', body),
};

export const categoryApi = {
  list: () => api.get('/categories').then((r) => r.data),
  create: (body) => api.post('/categories', body),
  update: (id, body) => api.put(`/categories/${id}`, body),
  remove: (id) => api.delete(`/categories/${id}`),
};

export const dishApi = {
  list: (params) => api.get('/dishes', { params }), // trả { data, meta }
  detail: (slug) => api.get(`/dishes/${slug}`).then((r) => r.data),
  create: (body) => api.post('/dishes', body),
  update: (id, body) => api.put(`/dishes/${id}`, body),
  toggle: (id) => api.patch(`/dishes/${id}/toggle`),
  remove: (id) => api.delete(`/dishes/${id}`),
};

export const orderApi = {
  create: (body) => api.post('/orders', body).then((r) => r.data),
  my: (params) => api.get('/orders/my', { params }),
  track: (code, phone) => api.get(`/orders/track/${code}`, { params: { phone } }).then((r) => r.data),
  cancel: (code, phone) => api.post(`/orders/${code}/cancel`, { phone }),
  // admin
  list: (params) => api.get('/orders', { params }),
  detail: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  // Hủy đơn (status = CANCELLED) thì bắt buộc kèm reason, khách sẽ thấy lý do này
  updateStatus: (id, status, reason) => api.patch(`/orders/${id}/status`, { status, reason }),
};

export const paymentApi = {
  // Lấy link VNPay cho đơn -> frontend chuyển khách sang link đó
  createVnpay: (code, phone) => api.post(`/payments/vnpay/${code}`, { phone }).then((r) => r.data.paymentUrl),
  // Gửi nguyên query VNPay gắn trên URL trả về (?vnp_...) để backend kiểm tra chữ ký
  vnpayReturn: (search) => api.get(`/payments/vnpay/return${search}`).then((r) => r.data),
};

export const reservationApi = {
  create: (body) => api.post('/reservations', body).then((r) => r.data),
  my: () => api.get('/reservations/my').then((r) => r.data),
  // Sơ đồ bàn tại 1 thời điểm (ISO): { diningMinutes, areas: [{ name, cols, rows, tables }] }
  tables: (date) => api.get('/reservations/tables', { params: { date } }).then((r) => r.data),
  track: (code, phone) => api.get(`/reservations/track/${code}`, { params: { phone } }).then((r) => r.data),
  cancel: (code, phone) => api.post(`/reservations/${code}/cancel`, { phone }),
  // admin
  list: (params) => api.get('/reservations', { params }),
  updateStatus: (id, status, reason) => api.patch(`/reservations/${id}/status`, { status, reason }),
  // Lễ tân chuyển bàn / xếp bàn: trả { data, message } (docs/21-le-tan-chuyen-ban.md)
  moveTable: (id, tableId, reason) => api.patch(`/reservations/${id}/table`, { tableId, reason }),
};

export const reviewApi = {
  create: (body) => api.post('/reviews', body),
  list: (params) => api.get('/reviews', { params }),
  remove: (id) => api.delete(`/reviews/${id}`),
};

export const couponApi = {
  public: () => api.get('/coupons/public').then((r) => r.data),
  check: (code, subtotal) => api.post('/coupons/check', { code, subtotal }).then((r) => r.data),
  list: () => api.get('/coupons').then((r) => r.data),
  create: (body) => api.post('/coupons', body),
  update: (id, body) => api.put(`/coupons/${id}`, body),
  remove: (id) => api.delete(`/coupons/${id}`),
};

export const userApi = {
  list: (params) => api.get('/users', { params }),
  create: (body) => api.post('/users', body),
  update: (id, body) => api.patch(`/users/${id}`, body),
  resetPassword: (id, password) => api.post(`/users/${id}/reset-password`, { password }),
};

// Ma trận phân quyền: list trả { modules, actions, roles }
export const permissionApi = {
  list: () => api.get('/permissions').then((r) => r.data),
  create: (body) => api.post('/permissions/roles', body),
  update: (id, body) => api.put(`/permissions/roles/${id}`, body),
  remove: (id) => api.delete(`/permissions/roles/${id}`),
};

export const statsApi = {
  overview: (days) => api.get('/stats/overview', { params: { days } }).then((r) => r.data),
  manager: () => api.get('/stats/manager').then((r) => r.data),
};

// Vệ sinh & dọn dẹp (việc của tạp vụ). Tài liệu: docs/20-ve-sinh.md
export const cleaningApi = {
  overview: () => api.get('/cleaning/overview').then((r) => r.data),
  // Khu vực + việc chưa xong của từng khu. { all: true } = kèm khu đang ẩn (quản lý)
  areas: (params) => api.get('/cleaning/areas', { params }).then((r) => r.data),
  createArea: (body) => api.post('/cleaning/areas', body),
  updateArea: (id, body) => api.put(`/cleaning/areas/${id}`, body),
  // "Đã dọn xong" cả khu: trả { data: { closed, skipped }, message }
  cleanArea: (id, note) => api.post(`/cleaning/areas/${id}/clean`, { note }),
  tasks: (params) => api.get('/cleaning/tasks', { params }).then((r) => r.data),
  createTask: (body) => api.post('/cleaning/tasks', body),
  updateTask: (id, body) => api.put(`/cleaning/tasks/${id}`, body),
  // status: IN_PROGRESS (bắt đầu) | DONE (hoàn thành, note không bắt buộc) | CANCELLED (hủy, note = lý do)
  updateStatus: (id, status, note) => api.patch(`/cleaning/tasks/${id}/status`, { status, note }),
  history: (params) => api.get('/cleaning/history', { params }), // trả { data, meta }
  staff: () => api.get('/cleaning/staff').then((r) => r.data),
};

// Kỹ thuật: thiết bị, phiếu sửa chữa, bảo trì định kỳ. Tài liệu: docs/22-ky-thuat-bao-tri.md
export const maintenanceApi = {
  overview: () => api.get('/maintenance/overview').then((r) => r.data),
  // Thiết bị + openTickets + hạn bảo trì. { all: true } = kèm máy đã ngưng dùng (kỹ thuật)
  equipment: (params) => api.get('/maintenance/equipment', { params }).then((r) => r.data),
  createEquipment: (body) => api.post('/maintenance/equipment', body),
  updateEquipment: (id, body) => api.put(`/maintenance/equipment/${id}`, body),
  // "Đã bảo trì": trả { data, message }
  maintain: (id, body) => api.post(`/maintenance/equipment/${id}/maintain`, body),
  tickets: (params) => api.get('/maintenance/tickets', { params }).then((r) => r.data),
  myReported: () => api.get('/maintenance/tickets/reported').then((r) => r.data),
  // Báo hỏng / tạo phiếu: trả { data, message }
  createTicket: (body) => api.post('/maintenance/tickets', body),
  updateTicket: (id, body) => api.put(`/maintenance/tickets/${id}`, body),
  // status: IN_PROGRESS | WAITING_PARTS (note = đang chờ gì) | DONE (note = cách xử lý, cost) | CANCELLED (note = lý do)
  updateStatus: (id, body) => api.patch(`/maintenance/tickets/${id}/status`, body),
  history: (params) => api.get('/maintenance/history', { params }), // trả { data, meta }
  staff: () => api.get('/maintenance/staff').then((r) => r.data),
};

// Ăn tại quán: thu ngân + bếp trên web (phục vụ ghi món bằng app mobile). Tài liệu: docs/23-app-nhan-vien-phuc-vu.md
export const dineInApi = {
  // Thu ngân: các bàn đang mở, bàn đã "Gửi thanh toán" (billRequestedAt) xếp trước
  bills: () => api.get('/dine-in/bills').then((r) => r.data),
  bill: (id) => api.get(`/dine-in/bills/${id}`).then((r) => r.data),
  markPrinted: (id) => api.post(`/dine-in/bills/${id}/printed`).then((r) => r.data),
  pay: (id, body = {}) => api.post(`/dine-in/bills/${id}/pay`, body), // trả { data, message }
  adjustItem: (billId, itemId, body) => api.post(`/dine-in/bill-items/${itemId}/adjust`, body),
  addBillItems: (billId, items) => api.post(`/dine-in/bills/${billId}/items`, { items }),
  // Bếp: phiếu các bàn còn món chờ làm / đang làm
  kitchen: () => api.get('/dine-in/kitchen').then((r) => r.data),
  startCooking: (itemIds) => api.post('/dine-in/kitchen/start', { itemIds }), // trả { data, message }
  finishCooking: (itemIds) => api.post('/dine-in/kitchen/finish', { itemIds }),
  // Hồ hải sản: món bán theo kg chờ cân + món đã cân hôm nay; nhập số kg (docs/24-thuc-don-ban-theo-kg.md)
  weighing: () => api.get('/dine-in/weighing').then((r) => r.data),
  weigh: ({ id, weight }) => api.post(`/dine-in/items/${id}/weigh`, { weight }), // trả { data, message }
};

// Tồn hồ hải sản: nhập bao nhiêu, bán bao nhiêu, còn lại bao nhiêu (docs/27-ton-ho-hai-san.md)
export const tankApi = {
  list: (all = false) => api.get('/tank', { params: all ? { all: 1 } : {} }).then((r) => r.data),
  entries: (params) => api.get('/tank/entries', { params }).then((r) => r), // cần cả meta (phân trang)
  import: ({ id, ...body }) => api.post(`/tank/${id}/import`, body), // trả { data, message }
  audit: ({ id, ...body }) => api.post(`/tank/${id}/audit`, body),
  loss: ({ id, ...body }) => api.post(`/tank/${id}/loss`, body),
  create: (body) => api.post('/tank', body),
  update: ({ id, ...body }) => api.patch(`/tank/${id}`, body),
  setActive: ({ id, isActive }) => api.patch(`/tank/${id}/active`, { isActive }),
};

export const uploadApi = {
  image: (file) => {
    const form = new FormData();
    form.append('image', file);
    return api.post('/upload', form).then((r) => r.data.url);
  },
};
