import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Lưu token + thông tin user vào localStorage để F5 không bị đăng xuất
export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: ({ token, user }) => set({ token, user }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'fab-auth' },
  ),
);
