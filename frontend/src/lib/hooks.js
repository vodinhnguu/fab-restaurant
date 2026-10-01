import { useQuery } from '@tanstack/react-query';
import { categoryApi, infoApi } from '../services';

// Thông tin nhà hàng - ít thay đổi nên cache vĩnh viễn trong phiên
export const useInfo = () => useQuery({ queryKey: ['info'], queryFn: infoApi.get, staleTime: Infinity });

export const useCategories = () =>
  useQuery({ queryKey: ['categories'], queryFn: categoryApi.list, staleTime: 5 * 60 * 1000 });
