# 10. Sổ tay toàn tập FAB Seafood

> **Một tài liệu, đủ mọi thứ trên website.** Đi lần lượt từng chức năng mà người dùng nhìn thấy. Mỗi chức năng đều trả lời đủ 6 câu hỏi: *người dùng thấy gì? dữ liệu chạy qua đâu? code nằm ở file nào? quy tắc nghiệp vụ là gì? học được kiến thức gì? tự thử thế nào?*
>
> Cập nhật lần cuối: 06/10/2026

**Cách dùng tài liệu này**

- **Lần đầu:** đọc **Phần I** từ trên xuống để có bức tranh tổng thể, rồi mở web lên và đọc **Phần II** theo đúng thứ tự bạn bấm trên web.
- **Khi học một chức năng:** mở song song 3 thứ: trang web, file code được nhắc tới, và DevTools (F12 → tab **Network**) để nhìn request thật.
- **Khi ôn tập:** làm phần **Câu hỏi tự kiểm tra** ở cuối.

**Liên hệ với các tài liệu khác:** tài liệu này là *bản tổng hợp theo chức năng*. Khi cần đào sâu một chủ đề, đi tiếp sang tài liệu chuyên đề:

| Muốn biết sâu hơn về... | Đọc |
|---|---|
| Cài đặt, lỗi khi chạy, deploy | [02-cai-dat-va-chay.md](02-cai-dat-va-chay.md) |
| Database, Prisma, câu truy vấn | [03-database-prisma.md](03-database-prisma.md) |
| Express, middleware, JWT, Zod | [04-backend-express.md](04-backend-express.md) |
| React Query, Zustand, Router, Form, Tailwind | [05-frontend-react.md](05-frontend-react.md) |
| Danh sách đầy đủ các API | [06-api-reference.md](06-api-reference.md) |
| Bài tập nâng cấp | [07-lo-trinh-hoc-va-bai-tap.md](07-lo-trinh-hoc-va-bai-tap.md) |
| Từng file làm gì | [08-ban-do-ma-nguon.md](08-ban-do-ma-nguon.md) |
| Muốn sửa X thì sửa ở đâu | [09-muon-sua-gi-thi-sua-o-dau.md](09-muon-sua-gi-thi-sua-o-dau.md) |

---

## Mục lục

**Phần I: Nền tảng**
1. [Website này làm được gì?](#1-website-này-làm-được-gì)
2. [Kiến thức nền cần có (giải thích bằng ví dụ nhà hàng)](#2-kiến-thức-nền-cần-có)
3. [Kiến trúc và công nghệ](#3-kiến-trúc-và-công-nghệ)
4. [Chạy dự án và dữ liệu mẫu để thử](#4-chạy-dự-án-và-dữ-liệu-mẫu-để-thử)
5. [Vòng đời của một thao tác: từ cú bấm chuột tới database](#5-vòng-đời-của-một-thao-tác)

**Phần II: Từng chức năng phía khách hàng**
6. [Khung chung: Header, Footer, giỏ hàng, thông báo](#6-khung-chung-của-trang-khách)
7. [Trang chủ](#7-trang-chủ-)
8. [Thực đơn: lọc, tìm kiếm, sắp xếp, phân trang](#8-thực-đơn-menu)
9. [Chi tiết món và đánh giá](#9-chi-tiết-món-và-đánh-giá-menuslug)
10. [Giỏ hàng](#10-giỏ-hàng)
11. [Thanh toán và đặt hàng ⭐](#11-thanh-toán-và-đặt-hàng-checkout-)
12. [Theo dõi đơn, thanh toán online, hủy đơn](#12-theo-dõi-đơn-thanh-toán-online-hủy-đơn-orderscode)
13. [Tra cứu đơn hàng và lịch đặt bàn](#13-tra-cứu-đơn-hàng-và-lịch-đặt-bàn-track)
14. [Đặt bàn](#14-đặt-bàn-reservation)
15. [Đăng ký, đăng nhập và phân quyền](#15-đăng-ký-đăng-nhập-và-phân-quyền)
16. [Trang tài khoản](#16-trang-tài-khoản-account)

**Phần III: Từng chức năng phía quản trị (`/admin`)**
17. [Khung trang admin](#17-khung-trang-admin)
18. [Tổng quan (Dashboard)](#18-tổng-quan-dashboard-admin)
19. [Quản lý đơn hàng](#19-quản-lý-đơn-hàng-adminorders)
20. [Quản lý đặt bàn](#20-quản-lý-đặt-bàn-adminreservations)
21. [Quản lý món ăn và upload ảnh](#21-quản-lý-món-ăn-admindishes)
22. [Quản lý danh mục](#22-quản-lý-danh-mục-admincategories)
23. [Quản lý mã giảm giá](#23-quản-lý-mã-giảm-giá-admincoupons)
24. [Kiểm duyệt đánh giá](#24-kiểm-duyệt-đánh-giá-adminreviews)
25. [Quản lý người dùng](#25-quản-lý-người-dùng-adminusers)

**Phần IV: Chủ đề xuyên suốt**
26. [Database: 8 bảng và mối quan hệ](#26-database-8-bảng-và-mối-quan-hệ)
27. [Bảo mật: những lớp bảo vệ đang có](#27-bảo-mật-những-lớp-bảo-vệ-đang-có)
28. [Xử lý lỗi từ backend tới màn hình](#28-xử-lý-lỗi-từ-backend-tới-màn-hình)
29. [Thời gian, múi giờ, tiền, mã code, slug](#29-thời-gian-múi-giờ-tiền-mã-code-slug)
30. [Hiệu năng và trải nghiệm người dùng](#30-hiệu-năng-và-trải-nghiệm-người-dùng)
31. [Ảnh: lấy từ đâu, lưu ở đâu](#31-ảnh-lấy-từ-đâu-lưu-ở-đâu)

**Phần V: Tổng kết**
32. [Những gì vừa được bổ sung (06/10/2026)](#32-những-gì-vừa-được-bổ-sung-06102026)
33. [Giới hạn hiện tại và hướng phát triển](#33-giới-hạn-hiện-tại-và-hướng-phát-triển)
34. [Câu hỏi tự kiểm tra (có đáp án)](#34-câu-hỏi-tự-kiểm-tra)
35. [Từ điển thuật ngữ](#35-từ-điển-thuật-ngữ)

---

# PHẦN I: NỀN TẢNG

## 1. Website này làm được gì?

FAB Seafood là website của một nhà hàng hải sản ở Đà Nẵng. Có **2 nhóm người dùng**:

### Khách hàng (ai cũng vào được, không bắt buộc đăng nhập)

| # | Chức năng | Đường dẫn | Cần đăng nhập? |
|---|---|---|---|
| 1 | Xem trang chủ: món nổi bật, danh mục, ưu đãi, bản đồ | `/` | Không |
| 2 | Xem thực đơn, lọc theo danh mục, tìm kiếm, sắp xếp | `/menu` | Không |
| 3 | Xem chi tiết món, đọc đánh giá | `/menu/:slug` | Không |
| 4 | Viết đánh giá món đã ăn | `/menu/:slug` | **Có** (và phải từng nhận món đó) |
| 5 | Thêm món vào giỏ, sửa số lượng | ngăn kéo giỏ hàng | Không |
| 6 | Đặt món: giao tận nơi hoặc đến lấy, COD hoặc online | `/checkout` | Không |
| 7 | Áp mã giảm giá | `/checkout` | Không |
| 8 | Theo dõi trạng thái đơn (tự cập nhật), thanh toán lại qua VNPay, hủy đơn | `/orders/:code` | Không (cần mã đơn + SĐT) |
| 9 | Tra cứu đơn hàng hoặc lịch đặt bàn bằng mã + SĐT | `/track` | Không |
| 10 | Đặt bàn | `/reservation` | Không |
| 11 | Xem / hủy lịch đặt bàn | `/reservations/:code` | Không (cần mã + SĐT) |
| 12 | Đăng ký, đăng nhập | `/register`, `/login` | |
| 13 | Sửa hồ sơ, đổi mật khẩu | `/account` | **Có** |
| 14 | Lịch sử đơn hàng, lịch đặt bàn của tôi | `/account/orders`, `/account/reservations` | **Có** |

### Quản trị viên (role `ADMIN`)

| # | Chức năng | Đường dẫn |
|---|---|---|
| 15 | Xem doanh thu, biểu đồ, món bán chạy, đơn mới | `/admin` |
| 16 | Xử lý đơn hàng: xác nhận → chế biến → giao → hoàn thành / hủy | `/admin/orders` |
| 17 | Xác nhận / hủy lịch đặt bàn, đánh dấu khách đã đến | `/admin/reservations` |
| 18 | Thêm / sửa / ẩn / xóa món, upload ảnh | `/admin/dishes` |
| 19 | Quản lý danh mục | `/admin/categories` |
| 20 | Tạo mã giảm giá (theo % hoặc số tiền, giới hạn lượt, ngày hết hạn) | `/admin/coupons` |
| 21 | Xóa đánh giá vi phạm | `/admin/reviews` |
| 22 | Đổi vai trò, khóa / mở khóa tài khoản | `/admin/users` |

> 💡 Điểm đặc biệt của dự án: khách **không cần tài khoản** vẫn đặt món và đặt bàn được. Đây là thói quen phổ biến ở nhà hàng Việt Nam. Nhưng nó đặt ra câu hỏi bảo mật: *làm sao để người lạ không xem được đơn của người khác?* Câu trả lời ở [mục 12](#12-theo-dõi-đơn-thanh-toán-online-hủy-đơn-orderscode).

---

## 2. Kiến thức nền cần có

Phần này giải thích các khái niệm cơ bản bằng chính hình ảnh một nhà hàng. Đã biết rồi thì bỏ qua.

| Khái niệm | Giải thích | Trong dự án |
|---|---|---|
| **Client** (máy khách) | Bên *yêu cầu*. Giống thực khách gọi món. | Trình duyệt chạy React (`frontend/`), sau này thêm app Flutter |
| **Server** (máy chủ) | Bên *phục vụ*: nhận yêu cầu, xử lý, trả kết quả. Giống nhà bếp. | Express (`backend/`), cổng 4000 |
| **Database** | Nơi lưu dữ liệu lâu dài. Giống kho và sổ sách. | PostgreSQL, 8 bảng |
| **HTTP request** | Một "phiếu gọi món" gửi từ client tới server. Gồm: **method** (làm gì), **URL** (với cái gì), **header** (thông tin kèm theo, ví dụ token), **body** (dữ liệu gửi lên). | `POST /api/v1/orders` kèm body là danh sách món |
| **HTTP response** | "Món ăn" server trả về. Gồm **status code** (thành công hay lỗi) và **body**. | `201` + `{ success: true, data: { code: "FAB..." } }` |
| **Method** | `GET` = xem, `POST` = tạo mới / hành động, `PUT` = thay toàn bộ, `PATCH` = sửa một phần, `DELETE` = xóa | `GET /dishes`, `PATCH /orders/5/status` |
| **Status code** | `2xx` thành công, `4xx` lỗi do phía client (gửi sai, chưa đăng nhập...), `5xx` lỗi do server | `400` dữ liệu sai, `401` chưa đăng nhập, `403` không có quyền, `404` không tìm thấy, `409` trùng, `429` gọi quá nhiều |
| **JSON** | Định dạng dữ liệu dạng chữ mà mọi ngôn ngữ đều đọc được: `{ "name": "Tôm", "price": 289000 }` | Mọi request/response đều dùng JSON (trừ upload ảnh) |
| **REST API** | Cách đặt tên URL theo "tài nguyên": `/dishes` là danh sách món, `/dishes/5` là món số 5. Method cho biết hành động. | Toàn bộ `backend/src/modules/*/*.routes.js` |
| **SPA** (Single Page App) | Trình duyệt tải **một lần** file HTML + JavaScript. Sau đó chuyển trang **không tải lại**: JavaScript tự vẽ lại giao diện và chỉ xin *dữ liệu* (JSON) từ server. | React + React Router. Thử: chuyển trang và để ý trình duyệt không nháy trắng |
| **Component** | Một "mảnh" giao diện tái sử dụng được, là một hàm trả về JSX. | `DishCard`, `Button`, `Modal`... |
| **State** | Dữ liệu có thể thay đổi, và khi đổi thì giao diện tự vẽ lại. | Số lượng trong giỏ, ô đang nhập, trạng thái đơn |
| **ORM** | Thư viện cho phép thao tác database bằng code JavaScript thay vì viết SQL. | Prisma: `prisma.dish.findMany(...)` |
| **Migration** | File ghi lại *lịch sử thay đổi cấu trúc* database, để mọi máy có cùng cấu trúc bảng. | `backend/prisma/migrations/` |
| **Token / JWT** | "Thẻ ra vào" server cấp sau khi đăng nhập. Mỗi lần gọi API, client trình thẻ này ra thay vì gửi lại mật khẩu. | Header `Authorization: Bearer eyJhbGci...` |
| **Hash mật khẩu** | Biến mật khẩu thành chuỗi không thể dịch ngược. Database chỉ lưu chuỗi này. | `bcrypt`, cột `passwordHash` |
| **Middleware** | Hàm chạy *trước* controller để kiểm tra / chuẩn bị. Giống bảo vệ soát vé trước cửa bếp. | `requireAuth`, `validate`, `rateLimit` |
| **Environment variable** (`.env`) | Cấu hình *riêng từng máy* (mật khẩu DB, khóa bí mật). **Không** đưa lên git. | `backend/.env` (tạo từ `.env.example`) |

---

## 3. Kiến trúc và công nghệ

### 3.1 Bức tranh tổng thể

```
┌──────────────────────────────┐        HTTP + JSON         ┌──────────────────────────────┐      Prisma       ┌──────────────┐
│  FRONTEND  (React + Vite)    │  ───────────────────────▶  │  BACKEND  (Express)          │  ──────────────▶  │  PostgreSQL  │
│  http://localhost:5173       │  ◀───────────────────────  │  http://localhost:4000/api/v1│  ◀──────────────  │  fab_restaurant│
│                              │                            │                              │                   └──────────────┘
│  • Vẽ giao diện              │                            │  • Kiểm tra quyền (JWT)      │
│  • Giữ giỏ hàng, token       │                            │  • Kiểm tra dữ liệu (Zod)    │
│  • Gọi API (axios)           │                            │  • Nghiệp vụ: tính tiền,     │
│  • Cache dữ liệu (RQuery)    │                            │    mã giảm giá, trạng thái   │
└──────────────────────────────┘                            └──────────────────────────────┘
                                                                         ▲
                                       App Flutter (sau này) ────────────┘  dùng chung đúng các API này
```

**Nguyên tắc vàng của dự án:** *frontend chỉ để hiển thị, backend mới là nơi quyết định.* Ví dụ:
- Giá trong giỏ hàng chỉ để hiển thị. Khi đặt hàng, backend **lấy lại giá từ database**.
- Nút "Hủy đơn" chỉ hiện khi đơn đang chờ. Nhưng kể cả ai đó tự gọi API, backend vẫn **kiểm tra lại** trạng thái.
- Trang admin bị ẩn với khách. Nhưng điều thực sự bảo vệ dữ liệu là việc backend kiểm tra role ở mọi API admin.

Lý do: mọi thứ ở frontend đều **sửa được** bằng DevTools. Chỉ backend là nơi người dùng không can thiệp được.

### 3.2 Cấu trúc thư mục rút gọn

```
fab-restaurant/
├── package.json              ← lệnh chạy chung: npm run dev / setup / install:all
├── backend/
│   ├── .env.example          ← mẫu cấu hình (copy thành .env)
│   ├── prisma/
│   │   ├── schema.prisma     ← ĐỊNH NGHĨA 8 BẢNG
│   │   ├── migrations/       ← lịch sử thay đổi DB (tự sinh)
│   │   └── seed.js           ← tạo dữ liệu mẫu
│   ├── uploads/              ← ảnh admin tải lên (không đưa lên git)
│   └── src/
│       ├── server.js         ← điểm khởi động
│       ├── app.js            ← gắn middleware chung + routes
│       ├── routes.js         ← gom route của mọi module
│       ├── config/           ← env.js (đọc .env), restaurant.js (thông tin quán)
│       ├── middlewares/      ← auth, validate, error, upload, rateLimit
│       ├── utils/            ← ApiError, helpers (slug, mã đơn, phân trang)
│       └── modules/          ← MỖI CHỨC NĂNG 1 THƯ MỤC
│           └── orders/
│               ├── orders.routes.js      ← URL nào → middleware nào → hàm nào
│               ├── orders.validation.js  ← dữ liệu gửi lên phải trông thế nào (Zod)
│               ├── orders.controller.js  ← nhận req, gọi service, trả res
│               └── orders.service.js     ← logic nghiệp vụ phức tạp
└── frontend/
    ├── index.html, vite.config.js
    └── src/
        ├── main.jsx          ← khởi tạo React, React Query, Router, Toaster
        ├── App.jsx           ← BẢNG ĐỊNH TUYẾN: URL nào → trang nào
        ├── index.css         ← màu, font (Tailwind v4)
        ├── services/index.js ← MỌI HÀM GỌI API
        ├── stores/           ← auth.js (ai đăng nhập), cart.js (giỏ hàng)
        ├── lib/              ← api.js (axios), format.js, constants.js, hooks.js, cn.js
        ├── components/       ← ui/ (nút, ô nhập, modal...), layout/ (header, footer...), DishCard...
        └── pages/            ← mỗi trang 1 file; account/, admin/
```

### 3.3 Công nghệ: dùng để làm gì, nằm ở đâu

| Công nghệ | Vai trò (một câu) | Xem ở đâu trong code |
|---|---|---|
| **Node.js** | Chạy JavaScript ngoài trình duyệt, để viết server | toàn bộ `backend/` |
| **Express 5** | Khung tạo web server: định nghĩa route, middleware | `app.js`, `*.routes.js` |
| **PostgreSQL** | Hệ quản trị cơ sở dữ liệu quan hệ | cấu hình trong `.env` → `DATABASE_URL` |
| **Prisma** | ORM: định nghĩa bảng + truy vấn bằng JS + migration | `schema.prisma`, `lib/prisma.js`, mọi controller |
| **Zod** | Khai báo "hình dạng" dữ liệu hợp lệ và tự kiểm tra | `*.validation.js`, `middlewares/validate.js` |
| **jsonwebtoken** | Tạo và kiểm tra JWT | `auth.service.js > signToken`, `middlewares/auth.js` |
| **bcryptjs** | Hash và so sánh mật khẩu | `auth.service.js` |
| **helmet / cors** | Header bảo mật / cho phép frontend khác domain gọi API | `app.js` |
| **multer** | Nhận file upload | `middlewares/upload.js` |
| **morgan** | In log mỗi request ra terminal | `app.js` |
| **nodemon** | Tự khởi động lại server khi sửa code | `backend/package.json > dev` |
| **React 19** | Thư viện xây giao diện bằng component | toàn bộ `frontend/src` |
| **Vite** | Chạy dev server siêu nhanh và build ra file tĩnh | `vite.config.js` |
| **React Router 7** | Điều hướng giữa các trang không tải lại | `App.jsx`, `Link`, `NavLink`, `useNavigate` |
| **TanStack Query** | Lấy dữ liệu từ server: tự loading, cache, gọi lại | `useQuery`, `useMutation` ở mọi trang |
| **Zustand** | Lưu state dùng chung toàn app (giỏ hàng, đăng nhập) | `stores/` |
| **axios** | Gọi HTTP, có interceptor tự gắn token | `lib/api.js` |
| **React Hook Form** | Quản lý form và kiểm tra ô nhập | `useForm` ở Checkout, Login, admin... |
| **Tailwind CSS v4** | Viết CSS bằng class ngắn ngay trong JSX | `className="..."`, `index.css` |
| **Recharts** | Vẽ biểu đồ | `admin/Dashboard.jsx` |
| **lucide-react** | Bộ icon | `import { ShoppingBag } from 'lucide-react'` |
| **sonner** | Thông báo nổi (toast) | `toast.success(...)` |
| **dayjs** | Định dạng ngày giờ tiếng Việt | `lib/format.js` |
| **clsx + tailwind-merge** | Ghép class có điều kiện, chống trùng | `lib/cn.js` |

---

## 4. Chạy dự án và dữ liệu mẫu để thử

### 4.1 Chạy nhanh (chi tiết ở [02-cai-dat-va-chay.md](02-cai-dat-va-chay.md))

```bash
npm run install:all                         # cài thư viện cho root, backend, frontend
createdb fab_restaurant                     # tạo database
cp backend/.env.example backend/.env        # rồi sửa DATABASE_URL, JWT_SECRET
npm run setup                               # tạo bảng + dữ liệu mẫu
npm run dev                                 # chạy backend :4000 và frontend :5173
```

Mở http://localhost:5173. Khi `pull` code mới về, nhớ chạy lại `npm run install:all` (phòng có thư viện mới) và `npm --prefix backend run db:migrate` (phòng có thay đổi database).

> ⚠️ `npm run setup` (cụ thể là `db:seed`) **xóa toàn bộ dữ liệu cũ** rồi tạo lại. Đừng chạy trên database thật.

### 4.2 Dữ liệu mẫu sau khi seed ([backend/prisma/seed.js](../backend/prisma/seed.js))

**Tài khoản:**

| Vai trò | Email | Mật khẩu | Ghi chú |
|---|---|---|---|
| Admin | `admin@fab.vn` | `admin123` | Vào được `/admin` |
| Khách | `khach@fab.vn` | `123456` | Tên *Nguyễn Văn An*, SĐT `0901234567`. Có sẵn 1 đơn **đã hoàn thành** (mã `FAB0000DEMO`) để thử chức năng đánh giá |
| Khách | `binh@fab.vn`, `chau@fab.vn` | `123456` | Đã đánh giá các món nổi bật |

Trang đăng nhập có sẵn 2 nút **"Tài khoản demo"** để điền nhanh.

**Dữ liệu khác:** 8 danh mục, 26 món (7 món nổi bật), khoảng 80 đơn hàng rải trong 30 ngày qua (để biểu đồ có số liệu), 4 lịch đặt bàn (`RSV0000001` đến `RSV0000004`), và 3 mã giảm giá:

| Mã | Giảm | Điều kiện |
|---|---|---|
| `WELCOME10` | 10%, tối đa 50.000đ | Đơn từ 200.000đ |
| `FAB50K` | 50.000đ | Đơn từ 500.000đ, tối đa 100 lượt |
| `HAISAN20` | 20%, tối đa 150.000đ | Đơn từ 800.000đ |

**Để thử tra cứu (không đăng nhập):** vào `/track`, nhập mã `FAB0000DEMO` + SĐT `0901234567`. Tab "Đặt bàn": nhập `RSV0000002` + `0987654321`.

---

## 5. Vòng đời của một thao tác

Hiểu kỹ **một** luồng thì mọi luồng khác đều tương tự. Ví dụ dưới đây là khách bấm **"Đặt hàng"** ở trang Thanh toán.

```
 TRÌNH DUYỆT                                           SERVER                                         DATABASE
 ───────────                                           ──────                                         ────────
 ① Checkout.jsx: bấm "Đặt hàng"
    handleSubmit → React Hook Form kiểm tra ô nhập
    → placeOrder.mutate({ customerName, phone, items… })
 ② services/index.js: orderApi.create(body)
 ③ lib/api.js: interceptor gắn "Authorization: Bearer <token>" (nếu đã đăng nhập)
    axios gửi  POST /api/v1/orders  ─────────────────▶ ④ (khi dev: Vite proxy chuyển :5173 → :4000)
                                                       ⑤ app.js: helmet → cors → express.json() đọc body → morgan in log
                                                       ⑥ routes.js: /orders → orders.routes.js
                                                       ⑦ optionalAuth: có token hợp lệ → gắn req.user
                                                       ⑧ validate(createOrderSchema): Zod kiểm tra body
                                                          sai → throw ApiError 400 ──▶ nhảy tới ⑫
                                                       ⑨ orders.controller.create → orderService.createOrder
                                                       ⑩ Transaction: ─────────────────────────────▶ đọc giá món
                                                          tính tiền, áp mã, tạo đơn ───────────────▶ ghi Order, OrderItem
                                                          tăng soldCount, usedCount ───────────────▶ cập nhật Dish, Coupon
                                                       ⑪ res.status(201).json({ success, data: order })
                                                       ⑫ (nếu có lỗi) error.js → JSON { success:false, message }
    ◀──────────────────────────────────────────────────
 ⑬ lib/api.js: interceptor response trả về body; lỗi → tạo Error có message tiếng Việt
 ⑭ useMutation.onSuccess: clear() giỏ, toast "Đặt hàng thành công!", navigate(/orders/FAB…)
    onError: toast.error(e.message)
```

**Thử tận mắt:** mở DevTools → **Network** → lọc "Fetch/XHR" → đặt một đơn → bấm vào request `orders` để xem **Headers** (có `Authorization`), **Payload** (dữ liệu gửi lên), **Response** (kết quả). Đồng thời nhìn terminal backend sẽ thấy dòng log `POST /api/v1/orders 201 ...` do morgan in ra.

**Ba điều rút ra:**
1. Mỗi file chỉ lo **một việc**: routes khai báo, validation kiểm tra, controller điều phối, service xử lý nghiệp vụ.
2. Lỗi ở bất kỳ đâu chỉ cần `throw`. Một chỗ duy nhất (`error.js`) biến lỗi thành JSON.
3. Frontend không cần biết backend làm gì bên trong. Nó chỉ cần biết **API nhận gì, trả gì** ([06-api-reference.md](06-api-reference.md)).

---

# PHẦN II: TỪNG CHỨC NĂNG PHÍA KHÁCH HÀNG

> Mỗi mục bên dưới theo cùng một khuôn: **👀 Người dùng thấy gì** → **🔄 Luồng hoạt động** → **📁 Code ở đâu** → **📏 Quy tắc nghiệp vụ** → **🎓 Kiến thức học được** → **🧪 Tự thử**.

## 6. Khung chung của trang khách

**👀 Người dùng thấy gì:** thanh trên cùng (logo, menu, giỏ hàng, nút đăng nhập hoặc tên người dùng), chân trang (liên hệ, giờ mở cửa), ngăn kéo giỏ hàng trượt từ bên phải, thông báo nổi ở giữa phía trên.

**📁 Code ở đâu:**

| Thành phần | File | Điểm đáng chú ý |
|---|---|---|
| Khung trang | [CustomerLayout.jsx](../frontend/src/components/layout/CustomerLayout.jsx) | `Header` + `<Outlet />` (chỗ trang con hiện ra) + `Footer` + `CartDrawer`. Mỗi lần đổi URL thì `window.scrollTo(0, 0)` để cuộn lên đầu. |
| Thanh trên | [Header.jsx](../frontend/src/components/layout/Header.jsx) | Mảng `NAV` chứa các mục menu. `NavLink` tự tô màu mục đang mở. Cuộn xuống quá 10px thì nền chuyển trắng mờ (`scrolled`). Màn hình nhỏ thì hiện nút ☰. `UserMenu` là menu thả xuống, bấm ra ngoài thì tự đóng (dùng `useRef` + sự kiện `mousedown`). Badge số trên giỏ hàng lấy từ `useCartStore(selectCount)`. |
| Chân trang | [Footer.jsx](../frontend/src/components/layout/Footer.jsx) | Mọi thông tin quán (địa chỉ, SĐT, giờ mở cửa, mức miễn phí ship) lấy từ `useInfo()` → `GET /info`. Muốn đổi thông tin quán chỉ cần sửa backend. |
| Logo | [Logo.jsx](../frontend/src/components/layout/Logo.jsx) | Ảnh `/favicon.svg` + chữ. Prop `light` để đổi màu chữ trên nền tối. |
| Thông báo nổi | `<Toaster />` trong [main.jsx](../frontend/src/main.jsx) | Gọi ở bất kỳ đâu: `toast.success('...')`, `toast.error('...')`. |
| Bắt lỗi giao diện | [ErrorBoundary.jsx](../frontend/src/components/ErrorBoundary.jsx) | Nếu một component bị lỗi khi vẽ, thay vì trắng trang sẽ hiện "Đã có lỗi xảy ra". Đây là chỗ duy nhất trong dự án phải viết bằng **class component**. |
| Tiêu đề tab | `useDocumentTitle()` trong [lib/hooks.js](../frontend/src/lib/hooks.js) | Mỗi trang gọi ở dòng đầu, ví dụ `useDocumentTitle('Thực đơn')` thì tab hiện "Thực đơn \| FAB Seafood". |

**🔄 Thông tin quán đi từ đâu tới Footer?**
```
backend/src/config/restaurant.js  +  backend/.env (SHIPPING_FEE, FREE_SHIPPING_MIN)
        └──▶ routes.js: GET /api/v1/info  gộp lại thành 1 object
                └──▶ services: infoApi.get
                        └──▶ lib/hooks.js: useInfo()  (staleTime: Infinity → chỉ gọi 1 lần mỗi phiên)
                                └──▶ Footer, Home, Checkout, Reservation, ReservationDetail
```

**🎓 Kiến thức học được:**
- **Layout route:** nhiều trang dùng chung Header/Footer mà không phải lặp code. Xem `<Route element={<CustomerLayout />}>` trong `App.jsx`.
- **Custom hook** (`useInfo`, `useDocumentTitle`): gói logic dùng lại được vào một hàm tên `use...`.
- **Cleanup trong `useEffect`:** `Header` gắn sự kiện `scroll` và trả về hàm gỡ sự kiện. Nếu quên gỡ, sự kiện sẽ bị gắn chồng lên nhau mỗi lần component được vẽ lại.

**🧪 Tự thử:** sửa `phone` trong `backend/src/config/restaurant.js` → F5 trang web → Footer, trang chủ và trang đặt bàn đều đổi theo.

---

## 7. Trang chủ (`/`)

**👀 Người dùng thấy gì (từ trên xuống):** ảnh lớn + khẩu hiệu + 2 nút "Đặt món ngay" / "Đặt bàn" → 4 ưu điểm → lưới danh mục → món đặc biệt → ưu đãi (mã giảm giá) → về chúng tôi → khách hàng nói gì → kêu gọi đặt bàn → bản đồ Google.

**📁 Code:** [pages/Home.jsx](../frontend/src/pages/Home.jsx)

| Khối | Dữ liệu lấy từ | Ghi chú |
|---|---|---|
| Hero | Hằng `HERO` (link ảnh Unsplash), `useInfo()` cho giờ mở cửa + hotline | |
| 4 ưu điểm | Mảng `FEATURES` | Mục "Giao nhanh" có `text` là **một hàm** `(info) => ...` để đọc mức miễn phí ship từ API |
| Danh mục | `useCategories()` → `GET /categories` | Mỗi danh mục có `_count.dishes` (số món) do Prisma đếm sẵn |
| Món đặc biệt | `GET /dishes?featured=true&limit=8&sort=popular` | Món có `isFeatured = true` (admin bật trong form món) |
| Ưu đãi | `GET /coupons/public` | Chỉ những mã đang bật, đã tới ngày bắt đầu, chưa hết hạn. Không có mã nào thì ẩn cả khối |
| Về chúng tôi, Khách hàng nói gì | Viết cứng (`ABOUT_1`, `ABOUT_2`, `TESTIMONIALS`) | Nội dung giới thiệu, không cần database |
| Bản đồ | `info.mapEmbedUrl` → `<iframe>` | |

**🎓 Kiến thức học được:**
- Một trang có thể gọi **nhiều query song song**. React Query tự quản lý từng cái.
- `queryKey` giống nhau thì **dùng chung cache**: `['coupons', 'public']` ở trang chủ và trang thanh toán chỉ gọi API một lần (trong 30 giây).
- `loading="lazy"` trên `<img>`: ảnh ở dưới chỉ được tải khi người dùng cuộn tới.

**🧪 Tự thử:** vào admin → Món ăn → tắt "Món nổi bật" của một món → quay lại trang chủ → món đó biến khỏi khối "Món đặc biệt".

---

## 8. Thực đơn (`/menu`)

**👀 Người dùng thấy gì:** dải chip danh mục (cuộn ngang), ô tìm kiếm, ô sắp xếp, lưới món (12 món/trang), nút phân trang. Thanh lọc **dính** trên đầu khi cuộn.

**🔄 Luồng hoạt động:**
```
Người dùng gõ "tôm"
  → state keyword = "tôm"
  → chờ 400ms không gõ thêm (debounce)
  → URL đổi thành /menu?search=tôm
  → useSearchParams đọc lại → query = { search: "tôm", sort: "popular", page: 1, ... }
  → queryKey ['dishes', query] thay đổi → React Query gọi GET /dishes?search=tôm&...
  → backend: dishes.controller.js > list
       where.name = { contains: "tôm", mode: "insensitive" }   (không phân biệt hoa thường)
       where.isAvailable = true                               (khách chỉ thấy món đang bán)
       prisma.$transaction([ findMany(...), count(...) ])     (lấy 12 món + tổng số món)
  → trả { data: [...12 món], meta: { total, page, limit, totalPages } }
```

**📁 Code:**
- Frontend: [pages/Menu.jsx](../frontend/src/pages/Menu.jsx), [components/DishCard.jsx](../frontend/src/components/DishCard.jsx), `Pagination` trong [ui/Feedback.jsx](../frontend/src/components/ui/Feedback.jsx), `SORT_OPTIONS` trong [lib/constants.js](../frontend/src/lib/constants.js)
- Backend: [dishes.controller.js](../backend/src/modules/dishes/dishes.controller.js) `list`, [dishes.validation.js](../backend/src/modules/dishes/dishes.validation.js) `dishQuerySchema`, `getPagination` trong [utils/helpers.js](../backend/src/utils/helpers.js)

**📏 Quy tắc:**

| Tham số URL | Ý nghĩa | Backend xử lý |
|---|---|---|
| `category=tom` | Lọc theo **slug** danh mục | `where.category = { slug }` (lọc qua bảng quan hệ) |
| `search=...` | Tìm theo tên món | `contains` + `insensitive` |
| `sort=` | `popular` (bán chạy), `newest`, `rating`, `price_asc`, `price_desc` | Bảng `SORTS` ánh xạ sang `orderBy` |
| `page=2` | Trang thứ mấy | `skip = (page - 1) * limit`, `take = limit` |
| `available=all` | Chỉ admin dùng: xem cả món ngừng bán | Mặc định chỉ lấy `isAvailable = true` |

**DishCard** hiển thị: ảnh, nhãn `-x%` nếu có giá khuyến mãi, nhãn "Đặc biệt", sao đánh giá, số đã bán, giá, nút `+` thêm nhanh vào giỏ. Nút `+` gọi `e.preventDefault()` để **không** kích hoạt `<Link>` bao ngoài (nếu không, bấm `+` sẽ chuyển sang trang chi tiết).

**🎓 Kiến thức học được:**
- **Lưu state trên URL** thay vì `useState`: F5 không mất bộ lọc, gửi link cho bạn bè vẫn thấy đúng kết quả, nút Back của trình duyệt hoạt động.
- **Debounce:** không gọi API ở mỗi phím gõ. `setTimeout` 400ms, nếu gõ tiếp thì `clearTimeout` hủy lần trước.
- **Phân trang phía server:** không tải cả 1000 món về rồi mới cắt. Database chỉ trả đúng 12 món.
- **`placeholderData: keepPreviousData`:** khi chuyển trang vẫn giữ danh sách cũ (làm mờ đi) cho tới khi có dữ liệu mới, nên giao diện không bị nháy về vòng xoay loading.

**🧪 Tự thử:** chọn danh mục "Tôm" + sắp xếp "Giá thấp → cao" → copy URL → mở tab ẩn danh, dán vào → thấy đúng kết quả đó.

---

## 9. Chi tiết món và đánh giá (`/menu/:slug`)

**👀 Người dùng thấy gì:** đường dẫn breadcrumb (Thực đơn › Tôm › Tôm sú hấp bia), ảnh lớn, giá, mô tả, ô chọn số lượng + nút "Thêm vào giỏ · tổng tiền", khu đánh giá (điểm trung bình, form đánh giá, danh sách đánh giá), "Có thể bạn cũng thích" (4 món cùng danh mục).

**🔄 Luồng hoạt động:**
- `GET /dishes/tom-su-hap-bia`: backend nhận **cả id lẫn slug**. Chuỗi toàn chữ số thì tìm theo `id`, còn lại tìm theo `slug`. Trả về món + danh mục + 20 đánh giá mới nhất (kèm tên người viết) + `related` (4 món cùng danh mục, đang bán, bán chạy nhất).
- Gửi đánh giá: `POST /reviews { dishId, rating, comment }` → `reviews.controller.js > upsert`.

**📏 Quy tắc đánh giá** ([reviews.controller.js](../backend/src/modules/reviews/reviews.controller.js)):
1. Phải **đăng nhập** (`requireAuth`).
2. Phải **đã từng nhận món này**: có một `OrderItem` chứa món đó, thuộc đơn của mình, và đơn đó ở trạng thái `COMPLETED`. Nếu không → 403 "Bạn cần đặt và nhận món này trước khi đánh giá".
3. Mỗi người chỉ có **1 đánh giá cho mỗi món**. Database đảm bảo bằng `@@unique([userId, dishId])`. Đánh giá lại thì **ghi đè** (`upsert` = có rồi thì update, chưa có thì create).
4. Sau mỗi lần thêm / sửa / xóa đánh giá, hàm `recalcRating` tính lại `ratingAvg` (làm tròn 1 chữ số thập phân) và `ratingCount` rồi lưu vào bảng `Dish`. Toàn bộ chạy trong **transaction**.

> 💡 **Vì sao lưu `ratingAvg` vào bảng Dish thay vì tính mỗi lần?** Trang thực đơn hiển thị sao của 12 món cùng lúc và có sắp xếp theo đánh giá. Nếu lần nào cũng tính trung bình từ bảng Review thì rất chậm. Đây là kỹ thuật **denormalization** (lưu thừa để đọc nhanh), đổi lại phải nhớ cập nhật mỗi khi đánh giá thay đổi. `soldCount` cũng theo cùng ý tưởng.

**🎓 Kiến thức học được:** route động `:slug` + `useParams()`; `invalidateQueries(['dish', slug])` để trang tự tải lại sau khi gửi đánh giá; toast có nút hành động (`action: { label: 'Xem giỏ', onClick: openCart }`).

**🧪 Tự thử:** đăng nhập `khach@fab.vn` → vào một món **nổi bật** (đơn `FAB0000DEMO` chứa 3 món nổi bật) → đánh giá thành công. Sau đó vào một món chưa từng đặt → đánh giá → nhận lỗi 403.

---

## 10. Giỏ hàng

**👀 Người dùng thấy gì:** bấm icon túi trên Header → ngăn kéo trượt ra từ bên phải: danh sách món, tăng/giảm số lượng (giảm về 0 thì xóa món), nút thùng rác, tạm tính, nút "Tiến hành đặt món".

**📁 Code:** [stores/cart.js](../frontend/src/stores/cart.js), [layout/CartDrawer.jsx](../frontend/src/components/layout/CartDrawer.jsx), [ui/QuantityInput.jsx](../frontend/src/components/ui/QuantityInput.jsx)

**🔄 Cách hoạt động:** giỏ hàng nằm **hoàn toàn ở trình duyệt**, không có API giỏ hàng.

```js
// stores/cart.js (rút gọn)
useCartStore = create(persist((set) => ({
  items: [],              // [{ dishId, name, slug, image, unit, price, quantity }]
  isOpen: false,          // ngăn kéo đang mở?
  add: (dish, qty) => ...,          // đã có món này thì cộng dồn, tối đa 50
  setQuantity: (dishId, qty) => ..., // <= 0 thì xóa
  remove, clear, open, close,
}), { name: 'fab-cart', partialize: (s) => ({ items: s.items }) }))
```

- `persist` tự lưu vào **localStorage** (key `fab-cart`), nên đóng trình duyệt mở lại vẫn còn giỏ. `partialize` chỉ lưu `items`, không lưu `isOpen` (để mở lại web thì giỏ không tự bung ra).
- **Selector** `selectCount`, `selectSubtotal` tính tổng. Component chỉ "đăng ký" phần state nó cần: `useCartStore(selectCount)`, nên Header chỉ vẽ lại khi số lượng đổi.
- Giá lưu trong giỏ là **giá lúc bấm thêm**, chỉ để hiển thị. Nếu admin đổi giá sau đó, đơn hàng vẫn tính theo giá mới trong database (xem mục 11).

**🎓 Kiến thức học được:** state toàn cục (global state) với Zustand; localStorage; vì sao không tin dữ liệu từ client.

**🧪 Tự thử:** thêm 2 món → F12 → tab **Application** → Local Storage → `http://localhost:5173` → xem key `fab-cart`. Thử sửa `price` thành `1` rồi đặt hàng → tổng tiền trong đơn vẫn là giá thật.

---

## 11. Thanh toán và đặt hàng (`/checkout`) ⭐

Đây là chức năng **quan trọng nhất** và có nhiều nghiệp vụ nhất. Nên đọc thật kỹ.

**👀 Người dùng thấy gì:**
1. **Hình thức nhận món:** Giao tận nơi / Đến lấy tại quán.
2. **Thông tin người nhận:** họ tên, SĐT, địa chỉ (chỉ hiện khi giao tận nơi), ghi chú. Đã đăng nhập thì được điền sẵn từ hồ sơ.
3. **Phương thức thanh toán:** Tiền mặt (COD) / VNPay (chỉ hiện khi đã cấu hình VNPay).
4. **Cột tóm tắt:** danh sách món, ô mã giảm giá + các mã gợi ý (bấm là áp), tạm tính, giảm giá, phí giao, tổng cộng, nút "Đặt hàng".

**📁 Code:**
- Frontend: [pages/Checkout.jsx](../frontend/src/pages/Checkout.jsx)
- Backend: [orders.validation.js](../backend/src/modules/orders/orders.validation.js) `createOrderSchema`, [orders.service.js](../backend/src/modules/orders/orders.service.js) `createOrder`, [coupons.service.js](../backend/src/modules/coupons/coupons.service.js) `applyCoupon`

### 11.1 Công thức tính tiền

```
subtotal    = Σ (giá thực tế × số lượng)        giá thực tế = salePrice nếu có, không thì price
shippingFee = (DELIVERY và subtotal < FREE_SHIPPING_MIN) ? SHIPPING_FEE : 0     mặc định 20.000đ / 500.000đ
discount    = theo mã giảm giá (xem 11.3), không bao giờ vượt quá subtotal
total       = subtotal − discount + shippingFee
```

Ví dụ: 2 phần *Tôm sú hấp bia* (289.000đ) + mã `WELCOME10`, giao tận nơi:
- subtotal = 578.000đ
- discount = min(10% × 578.000 = 57.800, tối đa 50.000) = **50.000đ**
- shippingFee = 0 (vì 578.000 ≥ 500.000; lưu ý so sánh với **subtotal**, tức là *trước* khi giảm giá)
- total = 578.000 − 50.000 + 0 = **528.000đ**

### 11.2 Backend tạo đơn từng bước (`orders.service.js > createOrder`)

```
0. Gộp các dòng trùng món: [{dishId:3, qty:1}, {dishId:3, qty:2}] → {3: 3}
   ── BẮT ĐẦU TRANSACTION (tất cả thành công, hoặc không có gì thay đổi) ──
1. Lấy các món từ DB theo id.    Thiếu món nào     → 400 "Có món không tồn tại"
                                  Có món đang tắt   → 400 "Món X hiện đã hết"
2. Tính subtotal bằng GIÁ TRONG DB (không dùng giá client gửi; thực ra client cũng không gửi giá).
3. Tính phí ship.
4. Có mã giảm giá → applyCoupon kiểm tra + tính discount → usedCount + 1
5. Tạo Order + các OrderItem (lưu kèm TÊN và GIÁ tại thời điểm đặt).
   Mã đơn: generateCode('FAB') → FAB + yyMMdd (giờ VN) + 6 số ngẫu nhiên, ví dụ FAB261006123456
6. Tăng soldCount của từng món.
   ── KẾT THÚC TRANSACTION ──
```

> 💡 **Vì sao cần transaction?** Giả sử bước 5 đã tạo đơn, nhưng bước 6 bị lỗi. Không có transaction thì đơn đã tồn tại mà `soldCount` lại sai. Có transaction thì Prisma **hoàn tác** (rollback) toàn bộ: coi như chưa từng có gì xảy ra.

> 💡 **Vì sao OrderItem lưu cả `name` và `price`?** Ví dụ tháng sau admin tăng giá tôm từ 289k lên 320k. Nếu chỉ lưu `dishId` thì hóa đơn cũ của khách sẽ "tự đổi" thành 320k, sai hoàn toàn. Lưu ảnh chụp (snapshot) tên + giá tại thời điểm đặt thì lịch sử luôn đúng.

### 11.3 Quy tắc mã giảm giá (`applyCoupon`)

Kiểm tra lần lượt, sai ở bước nào thì báo lỗi 400 ở bước đó:

| # | Điều kiện | Thông báo lỗi |
|---|---|---|
| 1 | Mã tồn tại và `isActive = true` (không phân biệt hoa thường, vì mã luôn được chuyển thành IN HOA) | "Mã giảm giá không tồn tại" |
| 2 | Đã tới `startsAt` (nếu có) | "...chưa đến thời gian áp dụng" |
| 3 | Chưa quá `expiresAt` (nếu có) | "...đã hết hạn" |
| 4 | `usedCount < usageLimit` (nếu có giới hạn) | "...đã hết lượt sử dụng" |
| 5 | `subtotal ≥ minOrder` | "Đơn tối thiểu Xđ để dùng mã này" |

Tính tiền giảm: `PERCENT` → `floor(subtotal × value / 100)`, rồi giới hạn bởi `maxDiscount`. `FIXED` → `value`. Cuối cùng `min(discount, subtotal)`.

Nút "Áp dụng" ở trang thanh toán gọi `POST /coupons/check` chỉ để **xem trước** số tiền giảm. Khi đặt hàng, backend **kiểm tra lại từ đầu**. Hàm `applyCoupon` nhận tham số `db` để dùng được cả với `prisma` thường lẫn với `tx` trong transaction.

### 11.4 Kiểm tra dữ liệu: hai lớp

| Lớp | Ở đâu | Mục đích |
|---|---|---|
| Frontend | `register('phone', { pattern: ... })` trong Checkout.jsx | Báo lỗi **ngay** dưới ô nhập, không cần chờ server. Phục vụ trải nghiệm. |
| Backend | `createOrderSchema` (Zod) | **Bảo vệ thật**. Ai gọi thẳng API bỏ qua giao diện cũng bị chặn. Ví dụ: SĐT phải khớp `^(0|\+84)\d{9,10}$`, mỗi món 1 đến 50 phần, giỏ không được rỗng, giao tận nơi thì địa chỉ ít nhất 5 ký tự (`.refine`). |

**🎓 Kiến thức học được:** `useMutation` (gọi API ghi dữ liệu, có `isPending` để hiện loading trên nút); `navigate(url, { replace: true })` (để bấm Back không quay lại trang thanh toán đã xong); transaction; snapshot dữ liệu; validate hai lớp.

**🧪 Tự thử:**
1. Giỏ 1 món rẻ + giao tận nơi → thấy phí giao 20.000đ và dòng "Mua thêm Xđ để được miễn phí".
2. Áp `FAB50K` với đơn dưới 500k → lỗi "Đơn tối thiểu 500.000đ".
3. Dùng `docs/api.http` gửi `POST /orders` với `quantity: 100` → lỗi 400 từ Zod.
4. Đặt hàng xong vào admin → Mã giảm giá → thấy cột "Đã dùng" tăng 1.

---

## 12. Theo dõi đơn, thanh toán online, hủy đơn (`/orders/:code`)

**👀 Người dùng thấy gì:** lời cảm ơn (nếu đơn vừa đặt trong 10 phút), mã đơn, **thanh tiến trình** 5 bước (đơn "đến lấy" chỉ có 4 bước vì bỏ "Đang giao"), thông tin nhận hàng, chi tiết tiền, khung vàng "Thanh toán ngay" (nếu chọn online mà chưa trả), nút "Hủy đơn" (nếu còn chờ xác nhận). Dòng chữ nhỏ "Trạng thái tự động cập nhật mỗi 15 giây".

**📁 Code:** [pages/OrderDetail.jsx](../frontend/src/pages/OrderDetail.jsx) (`Timeline`, nút thanh toán VNPay), [orders.controller.js](../backend/src/modules/orders/orders.controller.js) (`track`, `cancel`), [payments/](../backend/src/modules/payments/), [orders.service.js](../backend/src/modules/orders/orders.service.js) (`findAccessibleOrder`, `changeStatus`)

### 12.1 Ai được xem một đơn hàng?

Mã đơn kiểu `FAB261006123456` khá dễ đoán. Nếu chỉ cần mã là xem được thì người lạ có thể dò ra tên, SĐT, địa chỉ của người khác. Vì vậy `findAccessibleOrder` chỉ cho xem khi thỏa **một trong ba** điều kiện:

```js
const isOwner    = user && order.userId === user.id;      // đơn của chính mình (đã đăng nhập)
const isAdmin    = user?.role === 'ADMIN';
const phoneMatch = phone && phone.replace(/\s/g, '') === order.phone;  // biết đúng SĐT đặt hàng
if (!isOwner && !isAdmin && !phoneMatch) throw ApiError.notFound(...);
```

> 💡 Sai điều kiện thì trả **404 "Không tìm thấy"** chứ không phải 403 "Không có quyền". Lý do: trả 403 đồng nghĩa với việc thừa nhận "mã này có tồn tại", và kẻ xấu sẽ biết mình đoán đúng mã. Ngoài ra API tra cứu còn bị **giới hạn 60 lần / 15 phút** (rate limit) để không ai dò SĐT hàng loạt được.

Đó là lý do sau khi đặt hàng, trang chuyển tới `/orders/FAB...?phone=09...`: SĐT nằm trên URL để trang này gọi được API tra cứu.

### 12.2 Tự cập nhật trạng thái (polling)

```js
useQuery({ queryKey: ['order', code], queryFn: ..., refetchInterval: 15000 })
```
Cứ 15 giây React Query tự gọi lại API. Admin vừa bấm "Xác nhận" thì tối đa 15 giây sau khách thấy thanh tiến trình nhảy bước. Cách này đơn giản nhưng tốn request. Cách "xịn" hơn là WebSocket (bài tập số 13 trong [07](07-lo-trinh-hoc-va-bai-tap.md)).

### 12.3 Thanh toán online (VNPay)

Backend tạo link thanh toán có chữ ký → khách sang trang VNPay → VNPay báo kết quả về backend bằng **IPN** và đưa khách quay về `/payment/vnpay-return` → backend kiểm tra chữ ký và số tiền rồi mới đánh dấu `PAID`. Client **không bao giờ** tự báo "tôi đã trả tiền". Mỗi lần bấm thanh toán được lưu thành một dòng trong bảng `Payment` để đối soát.

Toàn bộ chi tiết (luồng, code, đăng ký sandbox, thẻ test): [11-thanh-toan-vnpay.md](11-thanh-toan-vnpay.md).

### 12.4 Hủy đơn

- Khách chỉ hủy được khi đơn còn `PENDING`.
- Khi hủy (dù là khách hay admin), `changeStatus` chạy trong transaction: **trả lại `soldCount`** cho từng món, **trả lại 1 lượt** dùng mã giảm giá, và nếu đơn đã thanh toán thì chuyển `paymentStatus` sang `REFUNDED`.

**🎓 Kiến thức học được:** query string (`useSearchParams`); polling; `retry: false` (sai mã thì báo lỗi ngay, không thử lại); chống lộ thông tin (404 thay cho 403); "đơn vừa đặt" tính bằng `Date.now() - createdAt < 10 phút`.

**🧪 Tự thử:** mở 2 cửa sổ: cửa sổ 1 là khách đang xem đơn, cửa sổ 2 là admin. Admin bấm "Xác nhận đơn" → đếm thời gian tới khi cửa sổ khách đổi bước.

---

## 13. Tra cứu đơn hàng và lịch đặt bàn (`/track`)

**👀 Người dùng thấy gì:** một form có **2 tab**: "Đơn hàng" và "Đặt bàn". Nhập mã + SĐT → bấm "Tra cứu".

**🔄 Luồng:** form không gọi API. Nó chỉ **chuyển trang**:
- Tab đơn hàng → `/orders/FAB...?phone=...` (trang ở mục 12)
- Tab đặt bàn → `/reservations/RSV...?phone=...` → [pages/ReservationDetail.jsx](../frontend/src/pages/ReservationDetail.jsx) gọi `GET /reservations/track/:code?phone=`

Mã được chuyển IN HOA, SĐT được bỏ dấu cách trước khi đưa lên URL (`encodeURIComponent` để ký tự `+` trong `+84` không bị hiểu sai).

**📁 Code:** [pages/TrackOrder.jsx](../frontend/src/pages/TrackOrder.jsx) (hằng `TABS` mô tả 2 tab), [pages/ReservationDetail.jsx](../frontend/src/pages/ReservationDetail.jsx), [reservations.controller.js](../backend/src/modules/reservations/reservations.controller.js) `findAccessible`, `track`, `cancel`

**🎓 Kiến thức học được:** tab lưu trên URL (`/track?tab=reservation`) nên Footer có thể dẫn thẳng tới tab "Đặt bàn"; một component phục vụ 2 trường hợp nhờ **cấu hình bằng object** (`TABS[tabKey]`) thay vì viết `if/else` khắp nơi.

---

## 14. Đặt bàn (`/reservation`)

**👀 Người dùng thấy gì:** ảnh không gian quán (màn hình lớn), form: họ tên, SĐT, email (không bắt buộc), ngày, giờ (chọn từ danh sách), số khách, khu vực mong muốn, ghi chú. Đặt xong hiện thẻ "Đặt bàn thành công" với mã `RSV...` và nút **Xem chi tiết**.

**📁 Code:** [pages/Reservation.jsx](../frontend/src/pages/Reservation.jsx), [reservations.validation.js](../backend/src/modules/reservations/reservations.validation.js), [reservations.controller.js](../backend/src/modules/reservations/reservations.controller.js), giờ mở cửa và khu vực ở [config/restaurant.js](../backend/src/config/restaurant.js)

**📏 Quy tắc:**

| Quy tắc | Frontend | Backend (Zod `.refine`) |
|---|---|---|
| Khung giờ cách nhau 30 phút, từ giờ mở cửa tới **trước giờ đóng 1 tiếng** (10:00 → 21:00) | Hàm `timeSlots(open, close)` sinh danh sách | Kiểm tra giờ (theo giờ VN) nằm trong `[open, close − 60 phút]` |
| Đặt trước **ít nhất 30 phút** | Ô ngày có `min = hôm nay` | `date > bây giờ + 30 phút` |
| 1 đến 50 khách | `min`/`max` trên ô số | `z.number().min(1).max(50)` |
| Hủy lịch | Chỉ hiện nút khi `PENDING`/`CONFIRMED` và chưa tới giờ | Kiểm tra lại cả 2 điều kiện, sai thì trả 400 |

**🔄 Ghép ngày giờ:** form có 2 ô riêng `day = "2026-10-07"` và `time = "19:00"`. Khi gửi, code ghép thành `new Date("2026-10-07T19:00:00+07:00").toISOString()` → `"2026-10-07T12:00:00.000Z"` (giờ UTC). Chuỗi `+07:00` đảm bảo **19h ở Việt Nam**, dù máy khách đang để múi giờ nào. Xem thêm [mục 29](#29-thời-gian-múi-giờ-tiền-mã-code-slug).

**🎓 Kiến thức học được:** dữ liệu cấu hình dùng chung cho cả frontend lẫn backend (giờ mở cửa); `.refine` của Zod để kiểm tra điều kiện liên quan đến nhiều trường; xử lý múi giờ.

**🧪 Tự thử:** dùng `docs/api.http` gửi đặt bàn lúc `23:00` → lỗi "Nhà hàng nhận khách từ 10:00...". Đặt bàn khi chưa đăng nhập → bấm "Xem chi tiết" → hủy lịch.

---

## 15. Đăng ký, đăng nhập và phân quyền

**👀 Người dùng thấy gì:** trang `/login`, `/register`. Đăng nhập xong: admin được đưa tới `/admin`, khách về trang chủ (hoặc **quay lại trang đang xem dở** nếu bị bắt đăng nhập giữa chừng). Header hiện tên người dùng và menu thả xuống.

**📁 Code:**
- Backend: [auth.service.js](../backend/src/modules/auth/auth.service.js), [auth.validation.js](../backend/src/modules/auth/auth.validation.js), [auth.routes.js](../backend/src/modules/auth/auth.routes.js), [middlewares/auth.js](../backend/src/middlewares/auth.js), [middlewares/rateLimit.js](../backend/src/middlewares/rateLimit.js)
- Frontend: [pages/Login.jsx](../frontend/src/pages/Login.jsx), [pages/Register.jsx](../frontend/src/pages/Register.jsx), [stores/auth.js](../frontend/src/stores/auth.js), [lib/api.js](../frontend/src/lib/api.js), [layout/ProtectedRoute.jsx](../frontend/src/components/layout/ProtectedRoute.jsx), `useEffect` trong [App.jsx](../frontend/src/App.jsx)

### 15.1 Đăng ký và đăng nhập

```
ĐĂNG KÝ  POST /auth/register { name, email, phone?, password }
  rateLimit (20 lần/15 phút/IP) → Zod (email hợp lệ, chuyển chữ thường; mật khẩu ≥ 6 ký tự)
  → email đã có?  → 409 "Email đã được sử dụng"
  → passwordHash = bcrypt.hash(password, 10)     ← 10 = "độ khó", càng cao càng chậm và càng khó dò
  → tạo User (role mặc định CUSTOMER)
  → trả { user (KHÔNG có passwordHash), token }  → frontend tự đăng nhập luôn

ĐĂNG NHẬP  POST /auth/login { email, password }
  → tìm user theo email; bcrypt.compare(password, passwordHash)
  → sai email HOẶC sai mật khẩu → cùng 1 câu "Email hoặc mật khẩu không đúng"  (không lộ email nào tồn tại)
  → tài khoản bị khóa → 403
  → token = jwt.sign({ sub: user.id, role }, JWT_SECRET, { expiresIn: '7d' })
```

### 15.2 JWT hoạt động thế nào?

Token có 3 phần ngăn bởi dấu chấm: `header.payload.chữ_ký`. Payload là `{ sub: 5, role: "CUSTOMER", exp: ... }`, ai cũng **đọc** được (dán vào jwt.io là thấy), nhưng **không sửa được**: sửa một ký tự là chữ ký không còn khớp, vì chữ ký được tạo bằng `JWT_SECRET` mà chỉ server biết. Vì vậy **không bao giờ để thông tin bí mật trong payload**, và **phải giữ kín `JWT_SECRET`**.

Ở mỗi request cần đăng nhập, `requireAuth`:
1. Lấy token từ header `Authorization: Bearer ...`
2. `jwt.verify` → sai chữ ký hoặc hết hạn → 401
3. Tìm user trong DB → không còn hoặc `isActive = false` → 401
4. Gắn `req.user = user` cho controller dùng

Các biến thể: `optionalAuth` (có token thì gắn user, không có cũng cho qua; dùng cho đặt hàng và đặt bàn), `requireRole('ADMIN')`, `requireAdmin = [requireAuth, requireRole('ADMIN')]`.

### 15.3 Phía frontend

| Việc | Ở đâu | Cách làm |
|---|---|---|
| Lưu token + user | `stores/auth.js` | Zustand + `persist` → localStorage key `fab-auth`. F5 không bị đăng xuất. |
| Gắn token vào mọi request | `lib/api.js` interceptor request | `config.headers.Authorization = Bearer ${token}` |
| Token hết hạn | `lib/api.js` interceptor response | Gặp 401 mà đang có token → `logout()` |
| Đồng bộ thông tin tài khoản | `useEffect` trong `App.jsx` | Mỗi lần mở web gọi `GET /auth/me` để cập nhật `user` (admin vừa đổi quyền hoặc khóa tài khoản thì giao diện biết ngay) |
| Chặn trang cần đăng nhập | `ProtectedRoute` | Chưa đăng nhập → `<Navigate to="/login" state={{ from: url hiện tại }} />`. Sai role → về trang chủ. |
| Quay lại trang cũ sau đăng nhập | `Login.jsx` | Đọc `location.state.from` |

> ⚠️ `ProtectedRoute` chỉ là **lớp giao diện**. Người dùng có thể sửa localStorage thành `role: "ADMIN"` và nhìn thấy khung trang admin, nhưng mọi API admin vẫn trả 403 vì backend kiểm tra role từ **database**, không tin vào role trong token hay ở client.

### 15.4 Chống dò mật khẩu (rate limit)

[middlewares/rateLimit.js](../backend/src/middlewares/rateLimit.js) đếm số request theo **IP + đường dẫn**. Vượt giới hạn thì trả **429** kèm header `Retry-After` (số giây phải chờ).

| API | Giới hạn |
|---|---|
| `/auth/login`, `/auth/register`, `/auth/change-password` | 20 lần / 15 phút / IP |
| `/orders/track/:code`, `/reservations/track/:code` | 60 lần / 15 phút / IP |

Bộ đếm lưu trong RAM (`Map`), nên khởi động lại server là bộ đếm về 0. Khi chạy nhiều server cùng lúc thì cần lưu bộ đếm chung ở Redis.

**🎓 Kiến thức học được:** hash khác mã hóa (hash không dịch ngược được); JWT là *stateless* (server không cần lưu phiên đăng nhập); 401 khác 403; interceptor; route bảo vệ; rate limit.

**🧪 Tự thử:**
1. Đăng nhập → F12 → Application → Local Storage → copy `token` → dán vào https://jwt.io để xem payload.
2. Sửa 1 ký tự của token trong localStorage → F5 → bị đăng xuất (do `/auth/me` trả 401).
3. Đăng nhập sai 21 lần liên tiếp → lần thứ 21 nhận thông báo "Bạn thao tác quá nhiều lần".
4. Mở `psql` hoặc Prisma Studio (`npm --prefix backend run db:studio`) → bảng User → thấy cột `passwordHash` dạng `$2b$10$...`.

---

## 16. Trang tài khoản (`/account`)

**👀 Người dùng thấy gì:** avatar chữ cái đầu, tên, email; 3 tab: **Hồ sơ** (sửa tên, SĐT, địa chỉ mặc định; đổi mật khẩu), **Đơn hàng** (danh sách, 10 đơn/trang, bấm vào xem chi tiết), **Đặt bàn** (danh sách, bấm mã để xem chi tiết, nút hủy).

**📁 Code:** [pages/account/](../frontend/src/pages/account/) (`AccountLayout`, `Profile`, `MyOrders`, `MyReservations`); API `PATCH /auth/me`, `POST /auth/change-password`, `GET /orders/my`, `GET /reservations/my`

**📏 Quy tắc:**
- Sửa hồ sơ chỉ đổi được `name`, `phone`, `address`, `avatar`. **Không** đổi được `email`, `role`, vì `updateProfileSchema` không khai báo các trường đó nên Zod tự bỏ đi. Đây là cách chống "mass assignment" (gửi thêm `role: "ADMIN"` để tự thăng cấp).
- Để trống SĐT hoặc địa chỉ thì database lưu `null` (không lưu chuỗi rỗng).
- Đổi mật khẩu phải nhập đúng mật khẩu hiện tại.
- Nút "Lưu thay đổi" bị mờ khi chưa sửa gì (`isDirty` của React Hook Form).
- Địa chỉ mặc định được điền sẵn vào trang thanh toán.

**🎓 Kiến thức học được:** **nested route** (`/account` có `<Outlet />` cho 3 tab con); `NavLink` với `end` (để tab "Hồ sơ" không sáng khi đang ở `/account/orders`); Zod loại bỏ trường thừa.

---

# PHẦN III: TỪNG CHỨC NĂNG PHÍA QUẢN TRỊ

> Đăng nhập `admin@fab.vn` / `admin123` để vào `/admin`. Mọi API admin đều có `requireAdmin` ở file routes, và **đó** mới là lớp bảo vệ thật sự.

## 17. Khung trang admin

**👀 Người dùng thấy gì:** thanh bên trái màu xanh đậm với 8 mục (màn hình nhỏ thì thu vào nút ☰), góc phải hiện tên + email admin, cuối thanh bên có "Xem trang khách" và "Đăng xuất".

**📁 Code:** [layout/AdminLayout.jsx](../frontend/src/components/layout/AdminLayout.jsx) (mảng `MENU`), các trang trong [pages/admin/](../frontend/src/pages/admin/)

**Khuôn chung của mọi trang admin** (học một trang là hiểu cả 8 trang):

```
useQuery(['admin-xxx', filters])  ──▶  <Table> hiển thị danh sách  ──▶  <Pagination>
        ▲                                     │ bấm "Thêm" / "Sửa"
        │                                     ▼
invalidateQueries(['admin-xxx'])  ◀──  useMutation.onSuccess  ◀──  <Modal> chứa form (React Hook Form)
   (danh sách tự tải lại)                                            bấm "Lưu"
```

Các thành phần dùng lại: `PageHeader` (tiêu đề + nút), `Table`/`Th`/`Td`, `Modal`, `Field`/`Input`/`Select`/`Checkbox`, `Badge`/`StatusBadge`, `Button` (có `loading`), `Spinner`, `EmptyState`, `Pagination`.

> 💡 Mẹo trong code: state `editing` có 3 giá trị. `null` là modal đang đóng, `{}` là đang **thêm mới**, còn một object có `id` là đang **sửa**. Vì vậy có dòng `category={editing.id ? editing : null}`.

---

## 18. Tổng quan: Dashboard (`/admin`)

**👀 Người dùng thấy gì:** chọn khoảng 7 / 30 / 90 ngày; 4 ô số liệu (doanh thu, tổng đơn, đơn chờ xác nhận, đặt bàn hôm nay); biểu đồ vùng doanh thu theo ngày; biểu đồ cột 5 món bán chạy; số đơn theo trạng thái; 6 đơn mới nhất.

**📁 Code:** [admin/Dashboard.jsx](../frontend/src/pages/admin/Dashboard.jsx), [stats.controller.js](../backend/src/modules/stats/stats.controller.js)

**🔄 Backend tính gì?** (`GET /stats/overview?days=30`, `days` được kẹp trong khoảng 7 đến 365)

| Số liệu | Cách tính |
|---|---|
| Doanh thu | Tổng `total` của đơn **`COMPLETED`** trong khoảng ngày (`aggregate _sum`). Đơn chưa xong hoặc đã hủy **không** tính. |
| Tổng đơn | Đếm mọi đơn trong khoảng ngày |
| Đơn chờ xác nhận | Đếm đơn `PENDING` (không giới hạn ngày) |
| Đặt bàn hôm nay | Lịch `PENDING`/`CONFIRMED` có giờ hẹn trong hôm nay (theo giờ VN) |
| Theo trạng thái | `groupBy({ by: ['status'] })` |
| Món bán chạy | `orderItem.groupBy({ by: ['dishId','name'], _sum: { quantity } })` của đơn hoàn thành, lấy 5 món nhiều nhất |
| Doanh thu theo ngày | **SQL thuần** (`$queryRaw`): đổi `createdAt` từ UTC sang giờ VN, nhóm theo ngày. Sau đó dùng JS **lấp các ngày không có đơn bằng 0** để biểu đồ liền mạch. |

8 truy vấn đầu chạy **song song** bằng `Promise.all`, nên nhanh hơn chạy lần lượt từng câu.

**🎓 Kiến thức học được:** `aggregate`, `groupBy`, `$queryRaw` (khi Prisma không đủ linh hoạt; dùng *tagged template* `` $queryRaw`...${since}` `` nên biến được truyền dạng tham số, **an toàn với SQL injection**); xử lý múi giờ; Recharts (`ResponsiveContainer`, `AreaChart`, `BarChart`, tooltip tự viết `ChartTooltip`).

**🧪 Tự thử:** hoàn thành một đơn ở trang Đơn hàng → quay lại Dashboard → doanh thu hôm nay tăng.

---

## 19. Quản lý đơn hàng (`/admin/orders`)

**👀 Người dùng thấy gì:** các tab trạng thái kèm số lượng (Tất cả (81), Chờ xác nhận (2)...), ô tìm (mã đơn / tên / SĐT), bảng đơn, nút "Xem" mở modal chi tiết với các nút chuyển trạng thái. Danh sách tự làm mới mỗi 30 giây, và có nút "Làm mới".

**📁 Code:** [admin/Orders.jsx](../frontend/src/pages/admin/Orders.jsx) (`OrderModal`), `NEXT_STATUS` và `STATUS_ACTION_LABEL` trong [lib/constants.js](../frontend/src/lib/constants.js), `STATUS_FLOW` và `changeStatus` trong [orders.service.js](../backend/src/modules/orders/orders.service.js)

### State machine: đơn được phép đi từ đâu tới đâu

```
PENDING ──▶ CONFIRMED ──▶ PREPARING ──▶ DELIVERING ──▶ COMPLETED
(chờ)       (xác nhận)    (chế biến)  │  (đang giao)
   │            │             │       └──────────────▶ COMPLETED   (đơn "đến lấy" đi thẳng từ chế biến sang hoàn thành)
   └────────────┴─────────────┴──────────┴──────────▶ CANCELLED   (hủy được ở mọi bước trước khi hoàn thành)
COMPLETED và CANCELLED là trạng thái CUỐI: không đi tiếp được nữa.
```

```js
// orders.service.js
export const STATUS_FLOW = {
  PENDING:    ['CONFIRMED', 'CANCELLED'],
  CONFIRMED:  ['PREPARING', 'CANCELLED'],
  PREPARING:  ['DELIVERING', 'COMPLETED', 'CANCELLED'],
  DELIVERING: ['COMPLETED', 'CANCELLED'],
  COMPLETED:  [],
  CANCELLED:  [],
};
```

**Tác dụng phụ khi đổi trạng thái** (`changeStatus`):
- → `COMPLETED` và đơn COD → `paymentStatus = PAID` (giao xong là đã thu tiền mặt)
- → `CANCELLED` và đã thanh toán → `paymentStatus = REFUNDED`
- → `CANCELLED` → trả lại `soldCount` và lượt dùng mã giảm giá (trong transaction)

> ⚠️ `NEXT_STATUS` ở frontend là **bản sao** của `STATUS_FLOW` ở backend, dùng để biết nên hiện nút nào. Sửa quy trình thì **phải sửa cả hai nơi**. Frontend còn ẩn nút "Giao hàng" cho đơn "đến lấy".

**🎓 Kiến thức học được:** **state machine** (máy trạng thái) giúp dữ liệu không bao giờ rơi vào trạng thái vô lý, ví dụ đơn đã hủy lại chuyển sang "đang giao"; `groupBy` để đếm số đơn theo từng tab; `refetchInterval`.

**🧪 Tự thử:** dùng `docs/api.http` gửi `PATCH /orders/:id/status { "status": "PENDING" }` cho một đơn đã `COMPLETED` → nhận 400 "Không thể chuyển đơn từ COMPLETED sang PENDING".

---

## 20. Quản lý đặt bàn (`/admin/reservations`)

**👀 Người dùng thấy gì:** bộ lọc theo ngày, trạng thái, từ khóa; bảng lịch (sắp theo giờ hẹn tăng dần); nút hành động theo trạng thái: chờ → **Xác nhận** / **Hủy**; đã xác nhận → **Khách đã đến** / **Hủy**. SĐT bấm được để gọi (`tel:`).

**📁 Code:** [admin/Reservations.jsx](../frontend/src/pages/admin/Reservations.jsx) (hằng `ACTIONS`), [reservations.controller.js](../backend/src/modules/reservations/reservations.controller.js) `list`, `updateStatus`

**📏 Quy tắc:** lọc theo ngày tính theo giờ VN: `new Date('2026-10-06T00:00:00+07:00')` tới cộng thêm 24 giờ.

> ⚠️ **Điểm yếu đã biết:** khác với đơn hàng, backend đặt bàn **chưa có state machine**: `PATCH /reservations/:id/status` nhận mọi trạng thái. Giao diện chỉ hiện nút hợp lệ, nhưng gọi thẳng API vẫn đổi được `COMPLETED` → `PENDING`. Đây là bài tập tốt: áp dụng lại cách làm `STATUS_FLOW` cho đặt bàn.

---

## 21. Quản lý món ăn (`/admin/dishes`)

**👀 Người dùng thấy gì:** ô tìm tên món, lọc danh mục, bảng món (ảnh, nhãn "Nổi bật", giá, đã bán, đánh giá, **công tắc đang bán**), nút sửa / xóa; modal thêm / sửa có ô ảnh (bấm để tải ảnh lên, hoặc dán link).

**📁 Code:** [admin/Dishes.jsx](../frontend/src/pages/admin/Dishes.jsx) (`DishForm`), [components/ImageUpload.jsx](../frontend/src/components/ImageUpload.jsx), [dishes.controller.js](../backend/src/modules/dishes/dishes.controller.js), [dishes.validation.js](../backend/src/modules/dishes/dishes.validation.js), [middlewares/upload.js](../backend/src/middlewares/upload.js), [modules/upload/upload.routes.js](../backend/src/modules/upload/upload.routes.js)

**📏 Quy tắc:**

| Quy tắc | Ở đâu |
|---|---|
| Giá khuyến mãi phải **nhỏ hơn** giá gốc | Cả frontend (`validate` của ô) và backend (`.refine` trong `dishSchema`) |
| Slug sinh tự động từ tên, **không trùng**: `tom-hap-bia`, `tom-hap-bia-2`... | `uniqueSlug` trong controller |
| Công tắc "đang bán" | `PATCH /dishes/:id/toggle` đảo `isAvailable` |
| Xóa món **đã có trong đơn hàng** → **không xóa thật**, chỉ chuyển sang ngừng bán (giữ lịch sử đơn) | `remove` trong controller |
| Xóa món chưa ai đặt → xóa hẳn | |
| Sửa / thêm món → làm mới cả cache admin (`admin-dishes`) lẫn cache trang khách (`dishes`) | `invalidateQueries` 2 lần |

**🔄 Luồng upload ảnh:**
```
Bấm ô vuông → chọn file → ImageUpload.handleFile
  → uploadApi.image(file): tạo FormData, append('image', file)
  → POST /upload  (Content-Type: multipart/form-data)
  → requireAdmin → multer: kiểm tra ≤ 5MB, đúng loại JPG/PNG/WEBP/GIF → lưu backend/uploads/1728xxx-a1b2c3.jpg
  → trả { url: '/uploads/1728xxx-a1b2c3.jpg' }
  → onChange(url) → giá trị ô "image" trong form = url → bấm Lưu → lưu vào Dish.image
Hiển thị: imageUrl('/uploads/...') ghép thêm địa chỉ backend; link http... thì giữ nguyên
```

**🎓 Kiến thức học được:** **soft delete** (xóa mềm); `<Controller>` của React Hook Form cho component tự làm (ImageUpload không phải `<input>` thường); upload file bằng `FormData` + multer; phục vụ file tĩnh `express.static('uploads')`.

---

## 22. Quản lý danh mục (`/admin/categories`)

Thêm / sửa / xóa danh mục: ảnh, tên, mô tả, **thứ tự hiển thị** (`sortOrder`: số nhỏ đứng trước, cả ở trang chủ lẫn dải chip ở thực đơn).

**📏 Quy tắc** ([categories.controller.js](../backend/src/modules/categories/categories.controller.js)):
- Slug sinh từ tên. Hai danh mục cùng tên sẽ trùng slug → database từ chối (lỗi Prisma `P2002`) → `error.js` dịch thành **409**.
- **Không xóa được** danh mục còn món: phải chuyển hoặc xóa món trước (409 "Danh mục đang có N món...").
- Danh sách trả kèm `_count.dishes` (Prisma đếm sẵn số món).

---

## 23. Quản lý mã giảm giá (`/admin/coupons`)

**👀 Người dùng thấy gì:** bảng mã (mã + mô tả, mức giảm, điều kiện, đã dùng / giới hạn, ngày hết hạn, trạng thái **Hoạt động / Tắt / Hết hạn / Hết lượt**); modal tạo / sửa.

**📁 Code:** [admin/Coupons.jsx](../frontend/src/pages/admin/Coupons.jsx) (`CouponForm`, `statusOf`), [coupons.validation.js](../backend/src/modules/coupons/coupons.validation.js), [coupons.controller.js](../backend/src/modules/coupons/coupons.controller.js)

**📏 Quy tắc:**
- Mã chỉ gồm chữ, số, `-`, `_`; dài 3 đến 30 ký tự; **tự chuyển IN HOA** (`.transform`).
- Loại `PERCENT` thì giá trị ≤ 100 (`.refine`).
- Ô để trống "Giảm tối đa" / "Số lượt dùng" = **không giới hạn** (`null`).
- Ngày bắt đầu tính từ **00:00**, ngày hết hạn tính tới **23:59:59** giờ VN (code thêm `T00:00:00+07:00` / `T23:59:59+07:00`).
- Xóa mã không làm hỏng đơn cũ, vì `Order` lưu `couponCode` dạng **chữ**, không phải khóa ngoại.

---

## 24. Kiểm duyệt đánh giá (`/admin/reviews`)

Danh sách mọi đánh giá (20/trang): người viết, món (bấm để mở trang món ở tab mới), số sao, nội dung, thời gian. Nút xóa → `DELETE /reviews/:id` → xóa trong transaction rồi **tính lại** điểm trung bình của món (`recalcRating`).

---

## 25. Quản lý người dùng (`/admin/users`)

**👀 Người dùng thấy gì:** tìm theo tên / email / SĐT, lọc vai trò, bảng người dùng (số đơn, số lần đặt bàn), ô chọn vai trò ngay trên bảng, nút **Khóa / Mở khóa**.

**📏 Quy tắc** ([users.controller.js](../backend/src/modules/users/users.controller.js)):
- **Không tự thao tác trên chính mình** (chặn ở cả giao diện lẫn backend). Lý do: tránh admin cuối cùng tự hạ quyền hoặc tự khóa, khiến không ai vào được trang quản trị.
- Chỉ đổi được `role` và `isActive` (`updateUserSchema`).
- Trả về bằng `select: publicFields`, nên **không bao giờ** lộ `passwordHash`.

**Chuyện gì xảy ra khi khóa một tài khoản?** Đăng nhập mới → 403 "Tài khoản đã bị khóa". Đang đăng nhập sẵn → request kế tiếp đi qua `requireAuth` → `loadUser` thấy `isActive = false` → 401 → frontend tự đăng xuất (lần mở web tiếp theo, `GET /auth/me` cũng phát hiện ra ngay).

---

# PHẦN IV: CHỦ ĐỀ XUYÊN SUỐT

## 26. Database: 8 bảng và mối quan hệ

Định nghĩa ở [backend/prisma/schema.prisma](../backend/prisma/schema.prisma). Giải thích sâu: [03-database-prisma.md](03-database-prisma.md).

```
                ┌───────────┐
                │   User    │  role: CUSTOMER | ADMIN, isActive
                └─────┬─────┘
       ┌──────────────┼────────────────┬──────────────────┐
       │ 0..n         │ 0..n           │ 0..n             │
┌──────▼──────┐ ┌─────▼───────┐ ┌──────▼──────┐           │
│    Order    │ │ Reservation │ │   Review    │ (userId, dishId) là UNIQUE
│ userId NULL │ │ userId NULL │ └──────▲──────┘           │
│ được (khách │ │ được        │        │ 0..n             │
│ vãng lai)   │ └─────────────┘ ┌──────┴──────┐    ┌──────┴─────┐
└──────┬──────┘                 │    Dish     │◀───│  Category  │  1 danh mục có nhiều món
       │ 1..n (xóa đơn thì      │ soldCount,  │ n  └────────────┘
       │ xóa luôn chi tiết)     │ ratingAvg   │
┌──────▼──────┐  n          1   │             │
│  OrderItem  │────────────────▶│             │
│ name, price │  (snapshot)     └─────────────┘
└─────────────┘
┌─────────────┐
│   Coupon    │  ĐỨNG RIÊNG: Order chỉ lưu couponCode dạng chữ
└─────────────┘
```

| Bảng | Lưu gì | Điểm thiết kế đáng nhớ |
|---|---|---|
| `User` | Tài khoản | `email` unique; chỉ lưu `passwordHash`; `isActive` để khóa thay vì xóa |
| `Category` | Danh mục | `slug` unique cho URL đẹp; `sortOrder` |
| `Dish` | Món ăn | Giá là **số nguyên VNĐ**; `salePrice` có thể null; `soldCount`, `ratingAvg`, `ratingCount` là số liệu **lưu sẵn** để đọc nhanh |
| `Order` | Đơn hàng | `code` unique hiển thị cho khách; `userId` **có thể null**; lưu đủ `subtotal`, `discount`, `shippingFee`, `total` để không phải tính lại |
| `OrderItem` | Từng dòng món trong đơn | **Snapshot** `name` + `price`; `onDelete: Cascade` |
| `Reservation` | Lịch đặt bàn | `code` unique; `date` lưu giờ UTC; có index theo `date` |
| `Review` | Đánh giá | `@@unique([userId, dishId])` |
| `Coupon` | Mã giảm giá | `usedCount` / `usageLimit`; `startsAt` / `expiresAt` có thể null |

**Enum** (giá trị cố định): `Role`, `OrderType` (DELIVERY/PICKUP), `OrderStatus` (6 trạng thái), `PaymentMethod` (COD/ONLINE), `PaymentStatus` (UNPAID/PAID/REFUNDED), `PaymentTxnStatus` (PENDING/SUCCESS/FAILED, dùng cho bảng `Payment`), `ReservationStatus`, `CouponType` (PERCENT/FIXED).

**Index** (`@@index`): giúp tìm kiếm nhanh theo các cột hay lọc: `Dish.categoryId`, `Order.userId`, `Order.status`, `Order.createdAt`, `Reservation.date`.

**🧪 Tự thử:** `npm --prefix backend run db:studio` → mở http://localhost:5555 để xem và sửa dữ liệu bằng giao diện.

---

## 27. Bảo mật: những lớp bảo vệ đang có

| # | Mối nguy | Cách dự án chống | Ở đâu |
|---|---|---|---|
| 1 | Lộ database → lộ mật khẩu | Chỉ lưu **hash bcrypt**, không lưu mật khẩu gốc | `auth.service.js` |
| 2 | Trả `passwordHash` ra ngoài | `toPublicUser()` loại bỏ trường này; trang admin dùng `select` chỉ lấy trường an toàn | `auth.service.js`, `users.controller.js` |
| 3 | Giả mạo token | JWT ký bằng `JWT_SECRET` (giữ trong `.env`, không đưa lên git) | `middlewares/auth.js` |
| 4 | Khách gọi API admin | `requireAdmin` ở **mọi** route admin; role lấy từ **database** | `*.routes.js` |
| 5 | Sửa giá trong giỏ | Backend lấy giá từ DB khi tạo đơn | `orders.service.js` |
| 6 | Gửi dữ liệu bẩn / thừa (ví dụ `role: "ADMIN"`) | Zod kiểm tra kiểu, độ dài, định dạng và **bỏ trường lạ** | `*.validation.js` |
| 7 | SQL injection | Prisma luôn truyền tham số an toàn; `$queryRaw` dạng tagged template cũng vậy | |
| 8 | Dò mật khẩu, dò SĐT | **Rate limit** → 429 | `middlewares/rateLimit.js` |
| 9 | Dò xem email nào tồn tại | Cùng một thông báo cho sai email và sai mật khẩu | `auth.service.js > login` |
| 10 | Xem đơn / lịch của người khác | Phải là chủ đơn, admin, hoặc đúng SĐT; sai thì trả 404 | `findAccessibleOrder`, `findAccessible` |
| 11 | Upload file độc hại / quá lớn | Chỉ nhận ảnh, ≤ 5MB, tên file ngẫu nhiên | `middlewares/upload.js` |
| 12 | Body khổng lồ làm treo server | `express.json({ limit: '1mb' })` | `app.js` |
| 13 | Các lỗ hổng phổ biến của trình duyệt | `helmet` thêm header bảo mật | `app.js` |
| 14 | Website lạ gọi API | CORS chỉ cho phép `CORS_ORIGIN` | `app.js`, `.env` |
| 15 | Lộ chi tiết lỗi cho hacker | Chỉ trả `stack` khi `NODE_ENV=development` | `middlewares/error.js` |
| 16 | Tài khoản bị khóa vẫn dùng token cũ | Mỗi request đều kiểm tra `isActive` trong DB | `middlewares/auth.js > loadUser` |

**Còn thiếu (nên biết khi bảo vệ đồ án):**
- Token lưu ở **localStorage**: nếu web bị chèn mã độc (XSS), token có thể bị đánh cắp. Phương án mạnh hơn là cookie `httpOnly` kèm refresh token.
- Chưa có xác thực email, quên mật khẩu.
- Thanh toán VNPay mới chạy sandbox. Nhận tiền thật cần hợp đồng với VNPay (xem [11 mục 7](11-thanh-toan-vnpay.md)).
- `JWT_SECRET` trong `.env.example` là chuỗi mẫu: **bắt buộc đổi** khi deploy.

---

## 28. Xử lý lỗi từ backend tới màn hình

```
BACKEND                                                     FRONTEND
throw ApiError.badRequest('Mã giảm giá đã hết hạn')
  hoặc Zod sai  → validate.js ném ApiError 400 + errors[]
  hoặc Prisma P2002 / P2025 / P2003
  hoặc Multer (file > 5MB), JSON hỏng
        │
        ▼  (Express 5 tự bắt lỗi của hàm async, không cần try/catch)
middlewares/error.js > errorHandler
  → { success: false, message: "...", errors?: [...] }  + status code
        │
        ▼                                                   lib/api.js (interceptor response)
                                                              → new Error(message) có .status, .errors
                                                              → 401 + đang có token → logout()
                                                                    │
                                              ┌─────────────────────┴───────────────────────┐
                                              ▼                                             ▼
                                   useMutation → onError: toast.error(e.message)   useQuery → isError → <ErrorState />
```

| Loại lỗi | Ai xử lý | Người dùng thấy |
|---|---|---|
| Nhập sai ô form | React Hook Form | Chữ đỏ dưới ô |
| API trả lỗi khi ghi dữ liệu | `useMutation.onError` | Toast đỏ (thông báo tiếng Việt từ backend) |
| API trả lỗi khi đọc dữ liệu | `useQuery` → `isError` | `ErrorState` hoặc `EmptyState` + nút thử lại |
| Không kết nối được server | interceptor | "Không thể kết nối máy chủ" |
| Code React bị lỗi khi vẽ | `ErrorBoundary` | Trang "Đã có lỗi xảy ra" + nút về trang chủ |
| URL không tồn tại | Route `*` → `NotFound` (frontend), `notFoundHandler` (backend) | Trang 404 "con cá đã bơi đi mất" |

Tra lỗi theo mã: [09 mục H](09-muon-sua-gi-thi-sua-o-dau.md).

---

## 29. Thời gian, múi giờ, tiền, mã code, slug

### Múi giờ (chủ đề dễ sai nhất)

- Database lưu mọi thời điểm theo **UTC**. Ví dụ 19:00 tối ở Việt Nam được lưu là `12:00Z`.
- API trả chuỗi ISO (`2026-10-07T12:00:00.000Z`). Frontend dùng dayjs định dạng theo **giờ của trình duyệt** → hiện `19:00 07/10/2026`.
- Những chỗ **bắt buộc chỉ rõ giờ VN** (vì liên quan tới "ngày" hoặc "giờ mở cửa"):

| Chỗ | Cách làm |
|---|---|
| Gửi giờ đặt bàn | `new Date(\`${day}T${time}:00+07:00\`)` |
| Kiểm tra giờ mở cửa | Cộng 7 giờ rồi đọc `getUTCHours()` |
| Lọc đặt bàn theo ngày (admin) | `${date}T00:00:00+07:00` đến cộng thêm 24 giờ |
| Ngày bắt đầu / hết hạn mã giảm giá | `T00:00:00+07:00` / `T23:59:59+07:00` |
| Dashboard: "hôm nay", doanh thu theo ngày | Tính 0h theo giờ VN bằng phép cộng 7 giờ; SQL `("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Ho_Chi_Minh'` |

> Vì sao không dùng `setHours(0,0,0,0)`? Hàm đó dùng múi giờ **của máy chạy code**. Máy bạn ở VN thì đúng, nhưng server deploy thường chạy UTC và sẽ lệch 7 tiếng.

### Tiền
Luôn là **số nguyên VNĐ** (`Int`). Không dùng số thực để tránh sai số kiểu `0.1 + 0.2 = 0.30000000000000004`. Hiển thị bằng `formatPrice(289000)` → `289.000đ`.

### Mã đơn, mã đặt bàn
`generateCode('FAB')` / `generateCode('RSV')` → tiền tố + `yyMMdd` (theo giờ Việt Nam) + 6 số ngẫu nhiên (1 triệu mã/ngày). Cột `code` là `@unique`; nếu xui bị trùng, `withUniqueCode` bắt lỗi P2002 rồi sinh mã khác và thử lại (tối đa 5 lần).

### Slug
`slugify('Tôm Sú Hấp Bia')` → `tom-su-hap-bia`: bỏ dấu tiếng Việt (`normalize('NFD')` tách dấu ra rồi xóa), đổi `đ` → `d`, chữ thường, ký tự lạ thành `-`. Dùng cho URL đẹp và tốt cho SEO: `/menu/tom-su-hap-bia` thay vì `/menu/17`.

---

## 30. Hiệu năng và trải nghiệm người dùng

| Kỹ thuật | Ở đâu | Tác dụng |
|---|---|---|
| **Lazy load trang** (`lazy(() => import(...))`) | `App.jsx` | Người vào trang chủ không phải tải code của 8 trang admin. Lúc build, Vite tách mỗi trang ra một file riêng. |
| **Cache** (`staleTime: 30s`) | `main.jsx` | Quay lại trang đã xem trong 30 giây thì không gọi lại API |
| `staleTime: Infinity` cho `/info` | `lib/hooks.js` | Thông tin quán chỉ tải 1 lần mỗi phiên |
| `keepPreviousData` | Menu, các trang admin | Chuyển trang không bị nháy trắng |
| **Debounce** 400ms | Ô tìm kiếm ở Thực đơn | Giảm số request |
| **Polling** | OrderDetail (15 giây), admin Orders (30 giây) | Cập nhật gần như realtime |
| `$transaction([...])` và `Promise.all` | Các API danh sách, Dashboard | Chạy nhiều truy vấn cùng lúc |
| Phân trang phía server | Mọi danh sách | Không tải hết dữ liệu về |
| `loading="lazy"` cho ảnh | DishCard, trang chủ | Ảnh chỉ tải khi cuộn tới |
| Đủ 3 trạng thái: **loading / rỗng / lỗi** | Mọi trang (`Spinner`, `EmptyState`, `ErrorState`) | Người dùng luôn biết chuyện gì đang xảy ra |
| Nút có `loading` | `Button` | Chống bấm 2 lần gửi 2 đơn |
| Toast | khắp nơi | Phản hồi ngay sau mỗi thao tác |
| Responsive | class `sm:`, `md:`, `lg:` của Tailwind | Dùng tốt trên điện thoại (thử F12 → biểu tượng điện thoại) |

---

## 31. Ảnh: lấy từ đâu, lưu ở đâu

| Loại ảnh | Nguồn | Có trong git? | Khi người khác `pull` về |
|---|---|---|---|
| Logo, favicon | `frontend/public/favicon.svg` | ✅ | Có ngay |
| Ảnh món, danh mục **mẫu** | Link Unsplash ghi vào DB khi chạy seed (`img()` trong `seed.js`) | Không cần (là link) | Chạy `npm run setup` là có, **cần Internet** |
| Ảnh trang chủ, trang đặt bàn | Link Unsplash viết cứng (`HERO`, `ABOUT_1`, `ABOUT_2`, `IMG`) | Không cần | **Cần Internet** |
| Món chưa có ảnh | Ảnh giữ chỗ `placehold.co` (`imageUrl()` trong `format.js`) | | |
| Ảnh admin **tự upload** | `backend/uploads/` | ❌ (bị `.gitignore` bỏ qua) | Không có. Mỗi người có database riêng nên ảnh upload ở máy này vốn không dùng được ở máy khác |

Khi deploy thật, nên chuyển ảnh upload sang dịch vụ lưu trữ như Cloudinary hoặc S3 (bài tập 11 trong [07](07-lo-trinh-hoc-va-bai-tap.md)), vì nhiều nền tảng hosting **xóa sạch ổ đĩa** mỗi lần deploy lại.

---

# PHẦN V: TỔNG KẾT

## 32. Những gì vừa được bổ sung (06/10/2026)

Kết quả rà soát toàn bộ web. Mỗi thay đổi đều ghi rõ **vì sao** để bạn học được cách nhìn ra vấn đề.

### Chức năng mới

| Thay đổi | Vì sao | File |
|---|---|---|
| **Tra cứu và hủy lịch đặt bàn cho khách không có tài khoản**: trang `/track` có thêm tab "Đặt bàn", trang mới `/reservations/:code`, nút "Xem chi tiết" sau khi đặt bàn | Trước đây khách vãng lai đặt bàn xong thì **không có cách nào** xem lại hay hủy, dù backend đã có sẵn API `GET /reservations/track/:code`. Đơn hàng thì làm được, đặt bàn thì không: chức năng bị lệch nhau | `pages/TrackOrder.jsx`, `pages/ReservationDetail.jsx` (mới), `pages/Reservation.jsx`, `App.jsx`, `services/index.js`, `Footer.jsx`, `MyReservations.jsx` |
| **Rate limit** cho đăng nhập / đăng ký / đổi mật khẩu (20 lần / 15 phút) và tra cứu (60 lần / 15 phút) | Không giới hạn thì kẻ xấu có thể thử hàng nghìn mật khẩu, hoặc dò SĐT để xem đơn người khác | `middlewares/rateLimit.js` (mới), `auth.routes.js`, `orders.routes.js`, `reservations.routes.js` |
| **Tiêu đề tab riêng cho từng trang** ("Thực đơn \| FAB Seafood", "Tôm sú hấp bia \| FAB Seafood") | Trước đây mọi tab đều cùng một tên, khó phân biệt khi mở nhiều tab; cũng không tốt cho SEO và lịch sử trình duyệt | `lib/hooks.js > useDocumentTitle`, mọi file trong `pages/` |
| **Đồng bộ tài khoản khi mở web** (`GET /auth/me`) | Thông tin user lưu ở localStorage có thể đã cũ. Admin hạ quyền hoặc khóa tài khoản thì giao diện vẫn hiện như cũ cho tới khi đăng xuất | `App.jsx` |

### Sửa lỗi

| Lỗi | Hậu quả | Cách sửa | File |
|---|---|---|---|
| Doanh thu theo ngày bị lệch múi giờ | Đơn đặt từ 0h tới 7h sáng (giờ VN) bị tính vào **ngày hôm trước** trên biểu đồ | SQL đổi giờ đúng cách: `("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Ho_Chi_Minh'` | `stats.controller.js` |
| "Hôm nay" ở Dashboard dùng múi giờ của máy chủ | Deploy lên server chạy giờ UTC thì "đặt bàn hôm nay" và khoảng ngày bị lệch 7 tiếng | Tính 0h theo giờ VN bằng phép cộng 7 giờ | `stats.controller.js` |
| SĐT dạng `+84...` trên URL không được mã hóa | Dấu `+` bị hiểu thành dấu cách → tra cứu đơn / lịch thất bại ngay sau khi đặt | `encodeURIComponent(phone)` | `Checkout.jsx`, `Reservation.jsx`, `TrackOrder.jsx` |
| Tra cứu đặt bàn không bỏ dấu cách trong SĐT | Gõ `0987 654 321` thì báo "không tìm thấy" (phần đơn hàng thì đã xử lý) | `phone.replace(/\s/g, '')` | `reservations.controller.js` |
| Hủy được lịch đặt bàn **đã qua giờ** (khi gọi thẳng API) | Giao diện có ẩn nút, nhưng backend không kiểm tra lại | Backend kiểm tra `r.date < now` → 400 | `reservations.controller.js` |
| Xóa SĐT / địa chỉ trong hồ sơ thì lưu chuỗi rỗng `""` | Dữ liệu không nhất quán (lúc `null`, lúc `""`) | Zod `.transform` đổi `''` thành `null` | `auth.validation.js` |
| Footer và trang chủ viết cứng "500.000đ" | Đổi `FREE_SHIPPING_MIN` trong `.env` thì 2 chỗ này vẫn ghi số cũ | Đọc `info.freeShippingMin` từ API | `Footer.jsx`, `Home.jsx` |

> 🎓 **Bài học rút ra từ đợt rà soát:**
> 1. **Mọi quy tắc ở giao diện đều phải được kiểm tra lại ở backend** (lỗi hủy lịch đã qua giờ).
> 2. **Hai chức năng tương tự nhau thì nên được đối xử như nhau** (đơn hàng có tra cứu, đặt bàn thì không; đơn hàng bỏ dấu cách trong SĐT, đặt bàn thì không).
> 3. **Múi giờ luôn phải nghĩ tới khi code chạy trên máy khác** (máy dev chạy giờ VN, server chạy UTC).
> 4. **Một giá trị chỉ nên được định nghĩa ở một nơi** (mức miễn phí ship).

---

## 33. Giới hạn hiện tại và hướng phát triển

| Giới hạn | Hướng nâng cấp | Bài tập trong [07](07-lo-trinh-hoc-va-bai-tap.md) |
|---|---|---|
| Thanh toán mới có VNPay | Thêm MoMo / QR chuyển khoản (làm theo mẫu module `payments`) | 15 |
| Trạng thái đơn cập nhật bằng polling | WebSocket (Socket.IO), admin có chuông báo đơn mới | 13 |
| Đặt bàn chưa kiểm tra còn bàn trống | Model `Table`, chặn đặt trùng giờ | 16 |
| Ảnh upload lưu trên ổ đĩa server | Cloudinary / S3 | 11 |
| Chưa có quên mật khẩu | Gửi email chứa link có hạn | 9 |
| Chưa có test tự động | vitest + supertest | 12 |
| Món chưa có tùy chọn (size, cách chế biến) | Model `DishOption` | 7 |
| Rate limit lưu trong RAM | Redis khi chạy nhiều server | 8 |
| Chưa có app di động | Flutter, dùng lại toàn bộ API ([06](06-api-reference.md)) | |

---

## 34. Câu hỏi tự kiểm tra

Tự trả lời trước, rồi bấm để xem đáp án.

<details><summary><b>1.</b> Vì sao backend không dùng giá do frontend gửi lên khi tạo đơn?</summary>

Vì mọi thứ ở trình duyệt đều sửa được (localStorage, DevTools, gọi thẳng API). Nếu tin giá từ client, ai cũng có thể mua tôm hùm giá 1đ. Backend lấy giá từ database trong `createOrder`.
</details>

<details><summary><b>2.</b> Vì sao <code>OrderItem</code> lưu cả <code>name</code> và <code>price</code> dù đã có <code>dishId</code>?</summary>

Để hóa đơn cũ không bị thay đổi khi admin đổi tên hoặc giá món sau này (snapshot dữ liệu tại thời điểm đặt).
</details>

<details><summary><b>3.</b> Khác nhau giữa lỗi 401 và 403?</summary>

401: chưa xác thực (chưa đăng nhập, token sai hoặc hết hạn) → frontend đăng xuất. 403: đã biết bạn là ai nhưng bạn không có quyền (khách gọi API admin, tài khoản bị khóa khi đăng nhập, chưa nhận món mà đòi đánh giá).
</details>

<details><summary><b>4.</b> Tra cứu đơn với sai SĐT, vì sao backend trả 404 chứ không phải 403?</summary>

Trả 403 là ngầm thừa nhận mã đơn đó **có tồn tại**. Kẻ xấu sẽ biết mình đoán đúng mã. Trả 404 thì không lộ thông tin gì.
</details>

<details><summary><b>5.</b> Nếu xóa <code>requireAdmin</code> khỏi <code>PATCH /orders/:id/status</code> nhưng vẫn giữ <code>ProtectedRoute role="ADMIN"</code> ở frontend thì có an toàn không?</summary>

Không. `ProtectedRoute` chỉ ẩn giao diện. Ai cũng gọi thẳng API được bằng Postman hoặc curl. Bảo vệ thật phải nằm ở backend.
</details>

<details><summary><b>6.</b> Transaction trong <code>createOrder</code> bảo vệ điều gì?</summary>

Đảm bảo các bước (tạo đơn, tạo chi tiết, tăng lượt dùng mã, tăng `soldCount`) **cùng thành công hoặc cùng không xảy ra**. Lỗi giữa chừng thì toàn bộ được hoàn tác, dữ liệu không bị lệch.
</details>

<details><summary><b>7.</b> Đơn 450.000đ, giao tận nơi, mã <code>WELCOME10</code>. Tổng tiền bao nhiêu?</summary>

subtotal 450.000 → discount = min(45.000, 50.000) = 45.000 → phí ship 20.000 (vì 450.000 < 500.000) → total = 450.000 − 45.000 + 20.000 = **425.000đ**.
</details>

<details><summary><b>8.</b> Vì sao bộ lọc ở trang Thực đơn lưu trên URL thay vì <code>useState</code>?</summary>

F5 không mất bộ lọc, chia sẻ link được, nút Back hoạt động đúng, và React Query dùng chính các tham số đó làm `queryKey`.
</details>

<details><summary><b>9.</b> Muốn đổi quy trình đơn hàng (ví dụ thêm trạng thái <code>READY</code>), phải sửa ở những đâu?</summary>

`schema.prisma` (enum, rồi migrate) → `STATUS_FLOW` (backend) → `orders.validation.js` (danh sách enum) → `NEXT_STATUS`, `ORDER_STATUS`, `STATUS_ACTION_LABEL` (frontend `constants.js`) → `STEPS` trong `OrderDetail.jsx`. Chi tiết ở [09 mục B2](09-muon-sua-gi-thi-sua-o-dau.md).
</details>

<details><summary><b>10.</b> Vì sao xóa một món đã có người đặt lại chỉ chuyển sang "ngừng bán"?</summary>

`OrderItem` có khóa ngoại tới `Dish`. Xóa hẳn sẽ làm hỏng lịch sử đơn (hoặc bị database chặn). Xóa mềm giữ được lịch sử mà khách vẫn không thấy món nữa.
</details>

<details><summary><b>11.</b> JWT có mã hóa nội dung không? Có nên để số điện thoại vào payload?</summary>

Không mã hóa, chỉ **ký**. Ai cũng đọc được payload (dán vào jwt.io là thấy), chỉ là không sửa được. Không nên để thông tin nhạy cảm vào đó.
</details>

<details><summary><b>12.</b> Server deploy chạy giờ UTC. Vì sao <code>new Date().setHours(0,0,0,0)</code> không cho ra "0h hôm nay ở Việt Nam"?</summary>

`setHours` dùng múi giờ của máy chạy code. Trên server UTC nó cho ra 0h UTC, tức 7h sáng ở VN. Phải tự cộng hoặc trừ 7 giờ, hoặc ghi rõ `+07:00`.
</details>

<details><summary><b>13.</b> Đăng nhập sai liên tục thì điều gì xảy ra, và bộ đếm nằm ở đâu?</summary>

Từ lần thứ 21 trong 15 phút (tính trên cùng IP) sẽ nhận lỗi 429 kèm header `Retry-After`. Bộ đếm nằm trong một `Map` ở RAM của tiến trình Node (`middlewares/rateLimit.js`), nên khởi động lại server là bộ đếm về 0.
</details>

<details><summary><b>14.</b> Vì sao <code>useDocumentTitle(dish?.name)</code> trong <code>DishDetail</code> phải đặt TRƯỚC dòng <code>if (isLoading) return ...</code>?</summary>

Quy tắc của React Hooks: hook phải được gọi **cùng số lượng, cùng thứ tự** ở mỗi lần render. Đặt sau một lệnh `return` sớm thì có lần hook được gọi, có lần không → React báo lỗi.
</details>

---

## 35. Từ điển thuật ngữ

| Thuật ngữ | Nghĩa ngắn gọn |
|---|---|
| **API / endpoint** | Một "cửa" của backend, ví dụ `GET /api/v1/dishes` |
| **Body / Query / Params** | Dữ liệu gửi kèm request: trong thân (`req.body`), sau dấu `?` (`req.query`), trong đường dẫn `/:id` (`req.params`) |
| **Cache** | Bản lưu tạm dữ liệu để khỏi tải lại |
| **Cascade** | Xóa bản ghi cha thì xóa luôn bản ghi con (Order → OrderItem) |
| **COD** | Cash On Delivery: trả tiền mặt khi nhận hàng |
| **Component** | Một hàm React trả về giao diện |
| **Controller** | Hàm xử lý request của một route |
| **CORS** | Cơ chế trình duyệt chặn web A gọi API ở domain B, trừ khi B cho phép |
| **Debounce** | Chờ người dùng ngừng thao tác một lúc rồi mới xử lý |
| **Denormalization** | Lưu thêm dữ liệu tính sẵn (`soldCount`, `ratingAvg`) để đọc nhanh |
| **Enum** | Kiểu dữ liệu chỉ nhận một số giá trị cố định |
| **Foreign key** (khóa ngoại) | Cột trỏ tới bản ghi ở bảng khác (`Dish.categoryId` → `Category.id`) |
| **Hash** | Biến đổi một chiều, không dịch ngược được |
| **Hook** | Hàm `use...` của React để dùng state, effect... |
| **Idempotent** | Gọi nhiều lần cho kết quả như gọi một lần (GET, PUT, DELETE) |
| **Index** | "Mục lục" của bảng, giúp tìm nhanh |
| **Interceptor** | Hàm chặn mọi request/response của axios để xử lý chung |
| **JSX** | Cú pháp viết HTML trong JavaScript |
| **JWT** | Token có chữ ký, chứa thông tin người dùng |
| **Lazy load** | Chỉ tải khi cần |
| **localStorage** | Kho lưu trữ nhỏ của trình duyệt, còn nguyên sau khi tắt máy |
| **Middleware** | Hàm chạy trước controller |
| **Migration** | File ghi lại thay đổi cấu trúc database |
| **Mutation** | Thao tác ghi dữ liệu (tạo, sửa, xóa) |
| **ORM** | Thư viện thao tác database bằng code (Prisma) |
| **Pagination** | Chia danh sách thành nhiều trang |
| **Payload** | Phần dữ liệu chính (của request hoặc của JWT) |
| **Polling** | Hỏi lại server định kỳ |
| **Props** | Tham số truyền vào component |
| **Proxy** (Vite) | Khi dev, Vite chuyển `/api` từ cổng 5173 sang 4000 |
| **Query key** | "Tên" của một dữ liệu trong cache React Query |
| **Rate limit** | Giới hạn số request trong một khoảng thời gian |
| **Refine** (Zod) | Điều kiện kiểm tra tự viết, có thể dùng nhiều trường |
| **Route** | Ánh xạ URL → trang (frontend) hoặc URL → hàm xử lý (backend) |
| **Seed** | Tạo dữ liệu mẫu |
| **Selector** | Hàm chọn một phần state (`selectCount`) |
| **Slug** | Chuỗi thân thiện cho URL: `tom-su-hap-bia` |
| **Snapshot** | Bản chụp dữ liệu tại một thời điểm |
| **Soft delete** | Ẩn bản ghi thay vì xóa hẳn |
| **SPA** | Ứng dụng một trang, chuyển trang không tải lại |
| **State** | Dữ liệu thay đổi được, đổi thì giao diện vẽ lại |
| **State machine** | Tập quy tắc trạng thái nào được chuyển sang trạng thái nào |
| **Stateless** | Server không cần nhớ phiên làm việc (JWT) |
| **Toast** | Thông báo nổi tự biến mất |
| **Transaction** | Nhóm thao tác DB "cùng thành công hoặc cùng hủy" |
| **Unique** | Ràng buộc giá trị không được trùng |
| **Upsert** | Có rồi thì cập nhật, chưa có thì tạo mới |
| **UTC** | Giờ quốc tế; giờ VN = UTC + 7 |
| **Validation** | Kiểm tra dữ liệu hợp lệ |

---

👉 **Học tiếp:** làm các bài tập trong [07-lo-trinh-hoc-va-bai-tap.md](07-lo-trinh-hoc-va-bai-tap.md). Khi bắt tay vào sửa code, mở sẵn [08](08-ban-do-ma-nguon.md) và [09](09-muon-sua-gi-thi-sua-o-dau.md) để tra cứu.
