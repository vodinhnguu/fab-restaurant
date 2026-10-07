import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { categoryApi, infoApi } from '../services';

// Thông tin nhà hàng - ít thay đổi nên cache vĩnh viễn trong phiên
export const useInfo = () => useQuery({ queryKey: ['info'], queryFn: infoApi.get, staleTime: Infinity });

export const useCategories = () =>
  useQuery({ queryKey: ['categories'], queryFn: categoryApi.list, staleTime: 5 * 60 * 1000 });

// Đặt tiêu đề tab trình duyệt cho từng trang: useDocumentTitle('Thực đơn') -> "Thực đơn | FAB Seafood"
// Giúp người dùng phân biệt các tab đang mở, và tốt cho SEO / lịch sử trình duyệt
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | FAB Seafood` : 'FAB Seafood - Hải sản tươi sống';
  }, [title]);
}
