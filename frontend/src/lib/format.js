import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import relativeTime from 'dayjs/plugin/relativeTime';
import { API_ORIGIN } from './api';

dayjs.extend(relativeTime);
dayjs.locale('vi');

export const formatPrice = (n) => `${(n ?? 0).toLocaleString('vi-VN')}đ`;
export const formatDate = (d) => dayjs(d).format('DD/MM/YYYY');
export const formatDateTime = (d) => dayjs(d).format('HH:mm DD/MM/YYYY');
export const fromNow = (d) => dayjs(d).fromNow();

// Ảnh upload lưu dạng "/uploads/abc.jpg" -> ghép với địa chỉ server
export const imageUrl = (src) => {
  if (!src) return 'https://placehold.co/600x400/d5ebf4/0b3954?text=FAB+Seafood';
  return src.startsWith('http') ? src : `${API_ORIGIN}${src}`;
};

export const effectivePrice = (dish) => dish.salePrice ?? dish.price;

// Rút gọn số tiền lớn: 98993000 -> "99 triệu"
export const formatCompactPrice = (n) => {
  if (n >= 1e9) return `${(n / 1e9).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} tỷ`;
  if (n >= 1e6) return `${(n / 1e6).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} triệu`;
  return formatPrice(n);
};
