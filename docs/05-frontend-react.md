# 05. Frontend với React

## 1. Cấu trúc thư mục

```
src/
├── main.jsx               # Điểm khởi đầu: gắn QueryClient, Router, Toaster, ErrorBoundary
├── App.jsx                # Khai báo toàn bộ route
├── index.css              # Tailwind + theme màu/font
├── lib/
│   ├── api.js             # axios instance + interceptor (gắn token, chuẩn hóa lỗi)
│   ├── format.js          # formatPrice, formatDate, imageUrl...
│   ├── constants.js       # Nhãn và màu của các trạng thái
│   ├── hooks.js           # useInfo, useCategories (query dùng nhiều nơi)
│   └── cn.js              # Gộp class Tailwind
├── services/index.js      # TẤT CẢ hàm gọi API
├── stores/
│   ├── auth.js            # Zustand: token + user
│   └── cart.js            # Zustand: giỏ hàng
├── components/
│   ├── ui/                # Button, Input, Modal, Badge, Table... (dùng lại khắp nơi)
│   ├── layout/            # Header, Footer, CartDrawer, AdminLayout, ProtectedRoute
│   └── DishCard.jsx, ImageUpload.jsx, PageHeader.jsx, ErrorBoundary.jsx
└── pages/                 # Mỗi trang một file
    ├── account/           # Hồ sơ, đơn của tôi, đặt bàn của tôi
    └── admin/             # Các trang quản trị
```

## 2. Ba loại "state" và công cụ cho từng loại

Đây là ý quan trọng nhất của React hiện đại:

| Loại state | Ví dụ | Công cụ |
|---|---|---|
| **Server state**: dữ liệu nằm ở backend | danh sách món, đơn hàng, thống kê | **TanStack Query** |
| **Client state toàn cục**: dùng ở nhiều trang | giỏ hàng, người đang đăng nhập | **Zustand** |
| **Local state**: chỉ trong 1 component | modal đang mở, ô input | `useState` |
| **URL state**: muốn chia sẻ link hoặc F5 không mất | bộ lọc, trang hiện tại | `useSearchParams` |

❌ Sai lầm phổ biến: lấy dữ liệu từ API rồi nhét vào Redux/Zustand. Làm vậy bạn phải tự lo loading, lỗi, cache, cập nhật lại. React Query làm sẵn hết những việc đó.

## 3. TanStack Query

### Đọc dữ liệu: `useQuery`
```jsx
const { data, isLoading, isError, error, refetch } = useQuery({
  queryKey: ['dishes', { category, page }],     // "tên" của cache, đổi key thì tự gọi lại API
  queryFn: () => dishApi.list({ category, page }),
  placeholderData: keepPreviousData,            // giữ dữ liệu cũ khi chuyển trang → không nháy
});
```
- Hai component dùng cùng `queryKey` thì chỉ gọi API **một lần**.
- `staleTime` (đặt trong `main.jsx`): trong 30s dữ liệu được coi là còn mới, không gọi lại.
- `refetchInterval: 15000`: tự cập nhật định kỳ (trang theo dõi đơn).

### Ghi dữ liệu: `useMutation`
```jsx
const qc = useQueryClient();
const save = useMutation({
  mutationFn: (body) => dishApi.create(body),
  onSuccess: () => {
    toast.success('Đã thêm món');
    qc.invalidateQueries({ queryKey: ['admin-dishes'] });   // đánh dấu cache cũ → tự tải lại danh sách
  },
  onError: (e) => toast.error(e.message),
});

<Button loading={save.isPending} onClick={() => save.mutate(data)}>Lưu</Button>
```

## 4. Zustand: giỏ hàng

```js
// stores/cart.js (rút gọn)
export const useCartStore = create(
  persist(                                   // tự lưu vào localStorage key "fab-cart"
    (set) => ({
      items: [],
      add: (dish, qty) => set((s) => ({ items: [...s.items, { ...dish, qty }] })),
      clear: () => set({ items: [] }),
    }),
    { name: 'fab-cart' },
  ),
);

// Dùng trong component - chỉ re-render khi phần được chọn thay đổi
const count = useCartStore(selectCount);
const add = useCartStore((s) => s.add);
```

`stores/auth.js` hoạt động tương tự: lưu `token` và `user`. Interceptor trong `lib/api.js` đọc token bằng `useAuthStore.getState()` (dùng được cả bên ngoài component).

## 5. Axios interceptor

```js
// Gắn token vào mọi request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Trả thẳng body; lỗi thì tạo Error có message tiếng Việt từ backend; 401 thì tự đăng xuất
api.interceptors.response.use((res) => res.data, (error) => { ... });
```
Nhờ interceptor, code ở page chỉ cần `toast.error(e.message)`.

## 6. Routing (React Router 7)

```jsx
<Route element={<CustomerLayout />}>               {/* layout chung: Header + Footer */}
  <Route index element={<Home />} />
  <Route path="menu/:slug" element={<DishDetail />} />   {/* useParams() → { slug } */}
  <Route element={<ProtectedRoute />}>              {/* bắt buộc đăng nhập */}
    <Route path="account" element={<AccountLayout />}>
      <Route index element={<Profile />} />
    </Route>
  </Route>
</Route>
<Route element={<ProtectedRoute role="ADMIN" />}>   {/* chỉ admin */}
  <Route path="admin" element={<AdminLayout />}> ... </Route>
</Route>
```
- `<Outlet />` trong layout là chỗ hiển thị route con.
- `lazy(() => import(...))` + `<Suspense>`: **code splitting**. Code trang admin (có thư viện biểu đồ nặng) chỉ được tải khi admin vào trang đó.

## 7. Form với React Hook Form

```jsx
const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { name: '' } });

<form onSubmit={handleSubmit(onSubmit)}>
  <Field label="Số điện thoại" error={errors.phone?.message}>
    <Input {...register('phone', {
      required: 'Vui lòng nhập số điện thoại',
      pattern: { value: /^0\d{9}$/, message: 'Không hợp lệ' },
    })} />
  </Field>
</form>
```
- Với component không phải input thường (ví dụ `ImageUpload`), dùng `<Controller>` (xem `admin/Dishes.jsx`).
- React 19 cho phép truyền `ref` như một prop bình thường, nên `<Input {...register()} />` chạy được mà không cần `forwardRef`.

## 8. Tailwind CSS v4

- Cấu hình **bằng CSS** trong `index.css` (`@theme { --color-ocean-900: ... }`), không còn file `tailwind.config.js`.
- Màu thương hiệu: `ocean` (xanh biển, màu chính), `coral` (san hô, màu nhấn cho nút và giá), `sand` (nền ấm).
- Responsive theo hướng **mobile-first**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` nghĩa là mặc định 1 cột, từ 640px lên 2 cột, từ 1024px lên 4 cột.
- `cn()` (`lib/cn.js`) gộp class và để class truyền sau ghi đè class trùng loại: `cn('w-full', 'w-36')` → `'w-36'`.

## 9. Các kỹ thuật UX đã dùng (nên tìm hiểu thêm)

| Kỹ thuật | Ở đâu |
|---|---|
| Debounce ô tìm kiếm | `pages/Menu.jsx` |
| Bộ lọc lưu trên URL | `Menu.jsx`, `admin/Orders.jsx` |
| Toast thông báo | thư viện `sonner` |
| Skeleton/Spinner, Empty state, Error state | `components/ui/Feedback.jsx` |
| Lazy load ảnh `loading="lazy"` | `DishCard.jsx` |
| Polling tự cập nhật | `OrderDetail.jsx` (15s), `admin/Orders.jsx` (30s) |
| Error Boundary chống trắng trang | `components/ErrorBoundary.jsx` |
| Header dính và mờ nền khi cuộn | `layout/Header.jsx` |

## 10. Luồng "thêm vào giỏ → đặt hàng" (nên tự đọc lại)

1. `DishCard` → `useCartStore.add(dish)` → localStorage
2. `Header` đọc `selectCount` → badge số lượng
3. `CartDrawer` → nút "Tiến hành đặt món" → `/checkout`
4. `Checkout` → `couponApi.check` (áp mã) → `orderApi.create` → `clear()` giỏ hàng → `navigate('/orders/:code?phone=...')`
5. `OrderDetail` → `useQuery` với `refetchInterval` → nút "Thanh toán qua VNPay" → `paymentApi.createVnpay` → chuyển sang VNPay → quay về `PaymentResult` (`/payment/vnpay-return`) → `paymentApi.vnpayReturn`
