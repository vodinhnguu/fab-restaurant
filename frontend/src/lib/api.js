import axios from 'axios';
import { useAuthStore } from '../stores/auth';

// VITE_API_URL rỗng khi dev -> dùng proxy của Vite
export const API_ORIGIN = import.meta.env.VITE_API_URL || '';

export const api = axios.create({ baseURL: `${API_ORIGIN}/api/v1`, timeout: 15000 });

// Tự động gắn token vào mọi request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Chuẩn hóa lỗi: luôn có err.message tiếng Việt từ backend; 401 thì đăng xuất
api.interceptors.response.use(
  (res) => res.data, // backend trả { success, data, meta } -> lấy luôn body
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || 'Không thể kết nối máy chủ';
    if (status === 401 && useAuthStore.getState().token) useAuthStore.getState().logout();
    const err = new Error(message);
    err.status = status;
    err.errors = error.response?.data?.errors;
    return Promise.reject(err);
  },
);
