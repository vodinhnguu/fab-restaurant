import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { effectivePrice } from '../lib/format';

// Giỏ hàng lưu ở trình duyệt. Giá chỉ để hiển thị - backend sẽ tính lại khi đặt hàng.
export const useCartStore = create(
  persist(
    (set) => ({
      items: [], // [{ dishId, name, slug, image, unit, category, price, quantity, note }]
      isOpen: false,

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),

      add: (dish, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.dishId === dish.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.dishId === dish.id ? { ...i, quantity: Math.min(50, i.quantity + quantity) } : i,
              ),
            };
          }
          const item = {
            dishId: dish.id,
            name: dish.name,
            slug: dish.slug,
            image: dish.image,
            unit: dish.unit,
            category: dish.category?.name, // để gợi ý ghi chú theo loại món
            price: effectivePrice(dish),
            quantity,
            note: '',
          };
          return { items: [...state.items, item] };
        }),

      setQuantity: (dishId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.dishId !== dishId)
              : state.items.map((i) => (i.dishId === dishId ? { ...i, quantity: Math.min(50, quantity) } : i)),
        })),

      // Ghi chú khẩu vị riêng của từng món
      setNote: (dishId, note) =>
        set((state) => ({ items: state.items.map((i) => (i.dishId === dishId ? { ...i, note } : i)) })),

      remove: (dishId) => set((state) => ({ items: state.items.filter((i) => i.dishId !== dishId) })),
      clear: () => set({ items: [] }),
    }),
    { name: 'fab-cart', partialize: (s) => ({ items: s.items }) },
  ),
);

// Selector tính toán - dùng: const count = useCartStore(selectCount)
export const selectCount = (s) => s.items.reduce((n, i) => n + i.quantity, 0);
export const selectSubtotal = (s) => s.items.reduce((n, i) => n + i.price * i.quantity, 0);
