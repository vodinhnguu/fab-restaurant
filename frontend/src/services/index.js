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
  pay: (code, phone) => api.post(`/orders/${code}/pay`, { phone }),
  cancel: (code, phone) => api.post(`/orders/${code}/cancel`, { phone }),
  // admin
  list: (params) => api.get('/orders', { params }),
  detail: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
};

export const reservationApi = {
  create: (body) => api.post('/reservations', body).then((r) => r.data),
  my: () => api.get('/reservations/my').then((r) => r.data),
  cancel: (code, phone) => api.post(`/reservations/${code}/cancel`, { phone }),
  // admin
  list: (params) => api.get('/reservations', { params }),
  updateStatus: (id, status) => api.patch(`/reservations/${id}/status`, { status }),
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
  update: (id, body) => api.patch(`/users/${id}`, body),
};

export const statsApi = {
  overview: (days) => api.get('/stats/overview', { params: { days } }).then((r) => r.data),
};

export const uploadApi = {
  image: (file) => {
    const form = new FormData();
    form.append('image', file);
    return api.post('/upload', form).then((r) => r.data.url);
  },
};
