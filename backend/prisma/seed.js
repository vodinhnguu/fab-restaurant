// Dữ liệu mẫu cho FAB Seafood. Chạy: npm run db:seed
// CẢNH BÁO: script này XÓA toàn bộ dữ liệu cũ trong database rồi tạo lại.
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { seedDefaultAreas } from '../src/config/cleaning.js';
import { seedDefaultEquipment } from '../src/config/equipment.js';
import { seedDefaultTables } from '../src/config/tables.js';
import { seedDefaultRoles } from '../src/modules/permissions/permissions.service.js';
import { addDays, startOfVnDay } from '../src/utils/helpers.js';
import { applyMenu } from './menu.js';
import { DEMO_STAFF, seedDemoStaff } from './seed-staff.js';

const prisma = new PrismaClient();

// Thực đơn (12 nhóm, 70 món, món hải sản sống bán theo kg): xem prisma/menu.js

const reviewComments = [
  'Rất tươi và ngon, sẽ quay lại!',
  'Phục vụ nhanh, món vừa miệng.',
  'Giá hơi cao nhưng chất lượng xứng đáng.',
  'Hải sản tươi, nêm nếm vừa phải.',
  'Không gian đẹp, món ăn trình bày bắt mắt.',
];

const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function main() {
  console.log('🧹 Xóa dữ liệu cũ...');
  await prisma.cleaningTask.deleteMany();
  await prisma.repairTicket.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.cleaningArea.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.diningTable.deleteMany();
  await prisma.dish.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.user.deleteMany();
  await prisma.staffRole.deleteMany(); // quyền (RolePermission) tự xóa theo

  console.log('🔐 Tạo vai trò & ma trận phân quyền...');
  await seedDefaultRoles(prisma);

  console.log('👤 Tạo tài khoản...');
  const admin = await prisma.user.create({
    data: {
      name: 'Quản trị viên',
      email: 'admin@fab.vn',
      phone: '0900000000',
      passwordHash: await bcrypt.hash('admin123', 10),
      role: 'ADMIN',
    },
  });
  const customerHash = await bcrypt.hash('123456', 10);
  const customers = [];
  for (const [name, email, phone] of [
    ['Nguyễn Văn An', 'khach@fab.vn', '0901234567'],
    ['Trần Thị Bình', 'binh@fab.vn', '0912345678'],
    ['Lê Minh Châu', 'chau@fab.vn', '0923456789'],
  ]) {
    customers.push(
      await prisma.user.create({
        data: { name, email, phone, passwordHash: customerHash, address: '45 Bạch Đằng, Hải Châu, Đà Nẵng' },
      }),
    );
  }

  // Nhân viên demo (mỗi vai trò 1 tài khoản, mật khẩu 123456): danh sách nằm trong seed-staff.js
  await seedDemoStaff(prisma);

  console.log('📂 Tạo danh mục & món ăn...');
  await applyMenu(prisma);
  const createdDishes = await prisma.dish.findMany({ orderBy: { id: 'asc' } });
  // Đơn online (giao hàng / mang về) chỉ có món bán theo phần: món theo kg phải chọn và cân tại hồ ở quán
  const portionDishes = createdDishes.filter((d) => d.unit !== 'kg');

  console.log('🎟️  Tạo mã giảm giá...');
  const in60Days = new Date(Date.now() + 60 * 24 * 3600 * 1000);
  await prisma.coupon.createMany({
    data: [
      { code: 'WELCOME10', description: 'Giảm 10% cho đơn từ 200.000đ (tối đa 50.000đ)', type: 'PERCENT', value: 10, minOrder: 200000, maxDiscount: 50000, expiresAt: in60Days },
      { code: 'FAB50K', description: 'Giảm 50.000đ cho đơn từ 500.000đ', type: 'FIXED', value: 50000, minOrder: 500000, usageLimit: 100, expiresAt: in60Days },
      { code: 'HAISAN20', description: 'Giảm 20% tối đa 150.000đ cho đơn từ 800.000đ', type: 'PERCENT', value: 20, minOrder: 800000, maxDiscount: 150000, expiresAt: in60Days },
    ],
  });

  console.log('🧾 Tạo đơn hàng mẫu 30 ngày qua...');
  const sold = new Map();
  for (let i = 0; i < 80; i++) {
    const daysAgo = randInt(0, 29);
    const createdAt = new Date(Date.now() - daysAgo * 24 * 3600 * 1000 - randInt(0, 10) * 3600 * 1000);
    const picked = [...portionDishes].sort(() => Math.random() - 0.5).slice(0, randInt(1, 4));
    const items = picked.map((d) => ({ dishId: d.id, name: d.name, price: d.salePrice ?? d.price, quantity: randInt(1, 3) }));
    const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
    const type = Math.random() < 0.7 ? 'DELIVERY' : 'PICKUP';
    const shippingFee = type === 'DELIVERY' && subtotal < 500000 ? 20000 : 0;
    const user = Math.random() < 0.6 ? random(customers) : null;

    // Đơn gần đây có thể đang xử lý, đơn cũ phần lớn đã hoàn thành
    let status = Math.random() < 0.9 ? 'COMPLETED' : 'CANCELLED';
    if (daysAgo === 0) status = random(['PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERING', 'COMPLETED']);
    const paymentMethod = Math.random() < 0.6 ? 'COD' : 'ONLINE';
    const paymentStatus =
      status === 'COMPLETED' ? 'PAID' : status === 'CANCELLED' ? 'UNPAID' : paymentMethod === 'ONLINE' ? 'PAID' : 'UNPAID';

    await prisma.order.create({
      data: {
        code: `FAB${String(createdAt.getFullYear()).slice(2)}${String(createdAt.getMonth() + 1).padStart(2, '0')}${String(createdAt.getDate()).padStart(2, '0')}${String(1000 + i)}`,
        userId: user?.id,
        customerName: user?.name ?? random(['Phạm Quốc Huy', 'Võ Thị Lan', 'Đặng Gia Bảo', 'Hoàng Mai Anh']),
        phone: user?.phone ?? `09${randInt(10000000, 99999999)}`,
        address: type === 'DELIVERY' ? random(['12 Lê Duẩn, Hải Châu', '88 Nguyễn Văn Linh, Thanh Khê', '210 Hoàng Sa, Sơn Trà']) : null,
        type,
        status,
        paymentMethod,
        paymentStatus,
        subtotal,
        shippingFee,
        total: subtotal + shippingFee,
        createdAt,
        items: { create: items },
      },
    });
    if (status !== 'CANCELLED') for (const it of items) sold.set(it.dishId, (sold.get(it.dishId) || 0) + it.quantity);
  }
  for (const [dishId, soldCount] of sold) await prisma.dish.update({ where: { id: dishId }, data: { soldCount } });

  // Đảm bảo tài khoản demo khach@fab.vn có 1 đơn hoàn thành để thử chức năng đánh giá
  const demo = customers[0];
  const demoDishes = portionDishes.filter((d) => d.isFeatured).slice(0, 3);
  const demoSubtotal = demoDishes.reduce((s, d) => s + (d.salePrice ?? d.price), 0);
  await prisma.order.create({
    data: {
      code: 'FAB0000DEMO',
      userId: demo.id,
      customerName: demo.name,
      phone: demo.phone,
      address: demo.address,
      type: 'DELIVERY',
      status: 'COMPLETED',
      paymentMethod: 'COD',
      paymentStatus: 'PAID',
      subtotal: demoSubtotal,
      total: demoSubtotal,
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      items: { create: demoDishes.map((d) => ({ dishId: d.id, name: d.name, price: d.salePrice ?? d.price, quantity: 1 })) },
    },
  });

  console.log('⭐ Tạo đánh giá...');
  for (const dish of createdDishes.filter((d) => d.isFeatured)) {
    const reviewers = customers.slice(1);
    for (const u of reviewers) {
      await prisma.review.create({
        data: { userId: u.id, dishId: dish.id, rating: randInt(4, 5), comment: random(reviewComments) },
      });
    }
    const agg = await prisma.review.aggregate({ where: { dishId: dish.id }, _avg: { rating: true }, _count: true });
    await prisma.dish.update({
      where: { id: dish.id },
      data: { ratingAvg: Math.round(agg._avg.rating * 10) / 10, ratingCount: agg._count },
    });
  }

  console.log('📅 Tạo lịch đặt bàn...');
  const at = (dayOffset, hour) => {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, 0, 0, 0);
    return d;
  };
  await seedDefaultTables(prisma);
  const tables = Object.fromEntries((await prisma.diningTable.findMany()).map((t) => [t.code, t.id]));
  await prisma.reservation.createMany({
    data: [
      { code: 'RSV0000001', tableId: tables.B03, userId: demo.id, name: demo.name, phone: demo.phone, date: at(1, 19), guests: 4, area: 'Ngoài trời - view biển', status: 'CONFIRMED', note: 'Sinh nhật, chuẩn bị giúp bánh kem' },
      { code: 'RSV0000002', tableId: tables.T01, name: 'Phạm Quốc Huy', phone: '0987654321', date: at(0, 20), guests: 2, area: 'Trong nhà', status: 'PENDING' },
      { code: 'RSV0000003', tableId: tables.VIP2, name: 'Công ty ABC', phone: '0977000111', email: 'hr@abc.vn', date: at(3, 18), guests: 12, area: 'Phòng VIP', status: 'PENDING', note: 'Tiệc công ty' },
      { code: 'RSV0000004', tableId: tables.T03, name: 'Võ Thị Lan', phone: '0966000222', date: at(-2, 19), guests: 3, area: 'Trong nhà', status: 'COMPLETED' },
    ],
  });

  console.log('🧽 Tạo khu vực & việc vệ sinh mẫu...');
  await seedCleaning();

  console.log('🔧 Tạo thiết bị & phiếu sửa chữa mẫu...');
  await seedMaintenance();

  console.log('✅ Seed xong!');
  console.log('   Admin:     admin@fab.vn / admin123');
  console.log('   Khách hàng: khach@fab.vn / 123456');
  console.log('   Nhân viên (mật khẩu 123456): ' + DEMO_STAFF.map((s) => s[1]).join(', '));
  console.log(`   (admin id ${admin.id})`);
}

// Việc vệ sinh mẫu cho tạp vụ (docs/20-ve-sinh.md): vài việc đang chờ / đang làm + lịch sử 7 ngày
async function seedCleaning() {
  await seedDefaultAreas(prisma);
  const area = Object.fromEntries((await prisma.cleaningArea.findMany()).map((a) => [a.name, a.id]));
  const user = Object.fromEntries(
    (await prisma.user.findMany({ where: { email: { in: ['tapvu@fab.vn', 'quanly@fab.vn', 'phucvu@fab.vn', 'letan@fab.vn', 'totruong@fab.vn'] } } })).map((u) => [u.email.split('@')[0], u.id]),
  );
  const now = Date.now();
  const minutesAgo = (m) => new Date(now - m * 60 * 1000);

  // Việc chưa xong: hiện ở Nhiệm vụ vệ sinh, Khu vực cần dọn, Tổng quan
  await prisma.cleaningTask.createMany({
    data: [
      { title: 'Nhà vệ sinh nữ hết giấy', note: 'Khách báo ở quầy lễ tân', areaId: area['Nhà vệ sinh nữ'], priority: 'URGENT', createdById: user.letan, createdAt: minutesAgo(5) },
      { title: 'Lau sàn sảnh, khách làm đổ nước', areaId: area['Sảnh & lối vào'], priority: 'URGENT', createdById: user.phucvu, createdAt: minutesAgo(12) },
      { title: 'Rửa chén bát ca trưa', areaId: area['Khu rửa chén bát'], status: 'IN_PROGRESS', assigneeId: user.tapvu, createdById: user.quanly, startedAt: minutesAgo(20), createdAt: minutesAgo(40) },
      { title: 'Rửa và lau khô ly bia', areaId: area['Quầy rửa ly'], assigneeId: user.tapvu, createdById: user.quanly, createdAt: minutesAgo(30) },
      { title: 'Quét lá, cát quanh khu bàn', note: 'Trước 17h đón khách tối', areaId: area['Sân ngoài trời - view biển'], createdById: user.totruong, createdAt: minutesAgo(60) },
    ],
  });

  // Lịch sử: mỗi ngày các việc định kỳ, giờ theo giờ Việt Nam [khu vực, tên việc, giờ, phút, làm mất bao nhiêu phút]
  const routine = [
    ['Sảnh & lối vào', 'Quét, lau sàn sảnh đầu ca', 9, 30, 20],
    ['Nhà vệ sinh nam', 'Dọn định kỳ', 10, 15, 15],
    ['Nhà vệ sinh nữ', 'Dọn định kỳ', 10, 35, 15],
    ['Khu rửa chén bát', 'Rửa chén bát ca trưa', 14, 0, 60],
    ['Quầy rửa ly', 'Rửa ly ca trưa', 14, 30, 25],
    ['Nhà vệ sinh nữ', 'Dọn định kỳ', 15, 0, 15],
    ['Sàn phòng ăn trong nhà', 'Lau sàn sau ca trưa', 15, 30, 30],
    ['Khu tập kết rác', 'Đổ rác, rửa thùng cuối ngày', 22, 30, 20],
  ];
  const today = startOfVnDay();
  const done = [];
  for (let d = 6; d >= 0; d--) {
    for (const [i, [areaName, title, h, m, took]] of routine.entries()) {
      const completedAt = new Date(addDays(today, -d).getTime() + (h * 60 + m) * 60 * 1000);
      if (completedAt > new Date(now)) continue; // hôm nay chưa tới giờ
      // Thỉnh thoảng tổ trưởng làm phụ cho tạp vụ
      const doer = (d + i) % 7 === 0 ? user.totruong : user.tapvu;
      done.push({
        title,
        areaId: area[areaName],
        status: 'DONE',
        assigneeId: doer,
        createdById: doer,
        createdAt: new Date(completedAt.getTime() - took * 60 * 1000),
        startedAt: new Date(completedAt.getTime() - took * 60 * 1000),
        completedAt,
        resultNote: areaName === 'Nhà vệ sinh nữ' && d === 2 ? 'Hết xà phòng, đã báo kho' : null,
      });
    }
  }
  await prisma.cleaningTask.createMany({ data: done });

  // Lần dọn gần nhất của từng khu = việc xong muộn nhất
  for (const id of Object.values(area)) {
    const last = done.filter((t) => t.areaId === id).at(-1);
    if (last) await prisma.cleaningArea.update({ where: { id }, data: { lastCleanedAt: last.completedAt } });
  }
}

// Thiết bị + phiếu sửa chữa mẫu cho kỹ thuật (docs/22-ky-thuat-bao-tri.md)
async function seedMaintenance() {
  await seedDefaultEquipment(prisma);
  const eq = Object.fromEntries((await prisma.equipment.findMany()).map((e) => [e.name, e]));
  const user = Object.fromEntries(
    (await prisma.user.findMany({ where: { email: { in: ['kythuat@fab.vn', 'bep@fab.vn', 'letan@fab.vn', 'hohaisan@fab.vn', 'phucvu@fab.vn', 'tapvu@fab.vn', 'quanly@fab.vn'] } } })).map((u) => [u.email.split('@')[0], u.id]),
  );
  const DAY = 24 * 3600 * 1000;
  const ago = (days, hours = 0) => new Date(Date.now() - days * DAY - hours * 3600 * 1000);

  // Lần bảo trì gần nhất: vài máy quá hạn / sắp đến hạn để trang Tổng quan có dữ liệu
  const lastMaintained = {
    'Máy sục khí hồ tôm hùm': 33, // chu kỳ 30 ngày -> quá hạn 3 ngày
    'Máy hút khói bếp': 26, // chu kỳ 30 -> còn 4 ngày
    'Hệ thống lọc nước hồ hải sản': 12,
    'Bếp gas công nghiệp': 20,
    'Tủ đông hải sản': 40,
    'Máy lạnh phòng ăn trong nhà 1': 45,
    'Máy lạnh phòng ăn trong nhà 2': 45,
    'Máy lạnh phòng VIP': 85, // chu kỳ 90 -> còn 5 ngày
    'Máy phát điện dự phòng': 60,
    'Bình chữa cháy': 150,
  };
  const maintenanceLogs = [];
  for (const [name, days] of Object.entries(lastMaintained)) {
    await prisma.equipment.update({ where: { id: eq[name].id }, data: { lastMaintainedAt: ago(days) } });
    maintenanceLogs.push({
      type: 'MAINTENANCE', title: 'Bảo trì định kỳ', equipmentId: eq[name].id, status: 'DONE',
      reportedById: user.kythuat, assigneeId: user.kythuat, resolution: 'Bảo trì định kỳ: vệ sinh, kiểm tra hoạt động',
      cost: name.startsWith('Máy lạnh') ? 250000 : null, startedAt: ago(days), completedAt: ago(days), createdAt: ago(days),
    });
  }
  await prisma.repairTicket.createMany({ data: maintenanceLogs.filter((l) => l.completedAt > ago(30)) });

  // Phiếu đang mở
  await prisma.repairTicket.createMany({
    data: [
      { title: 'Tủ đông hải sản không đủ lạnh', description: 'Nhiệt độ lên -8 độ, đá tan ở ngăn dưới', equipmentId: eq['Tủ đông hải sản'].id, priority: 'URGENT', reportedById: user.bep, createdAt: ago(0, 1) },
      { title: 'Máy lạnh phòng VIP chảy nước', description: 'Nước nhỏ giọt xuống bàn VIP2', equipmentId: eq['Máy lạnh phòng VIP'].id, reportedById: user.letan, createdAt: ago(0, 3) },
      { title: 'Đèn sân ngoài trời gần bàn B05 không sáng', equipmentId: eq['Đèn chiếu sáng sân ngoài trời'].id, status: 'IN_PROGRESS', reportedById: user.phucvu, assigneeId: user.kythuat, startedAt: ago(0, 2), createdAt: ago(1) },
      { title: 'Máy sục khí hồ tôm hùm kêu to', description: 'Tiếng rè liên tục, bọt khí yếu', equipmentId: eq['Máy sục khí hồ tôm hùm'].id, priority: 'URGENT', status: 'WAITING_PARTS', waitingNote: 'Đã đặt màng bơm mới, 2 ngày nữa giao', reportedById: user.hohaisan, assigneeId: user.kythuat, startedAt: ago(1, 5), createdAt: ago(1, 6) },
      { title: 'Vòi nước nhà vệ sinh nữ rò rỉ', equipmentId: eq['Khác / chưa rõ thiết bị'].id, reportedById: user.tapvu, createdAt: ago(0, 5) },
    ],
  });

  // Lịch sử sửa chữa 30 ngày (có chi phí)
  const done = [
    ['Bếp gas công nghiệp', 'Bếp số 2 lửa yếu', 'Vệ sinh béc đốt, thay van điều áp', 350000, 25, user.bep],
    ['Máy bơm nước', 'Nước yếu ở khu rửa chén', 'Thay rơ-le áp suất', 180000, 18, user.tapvu],
    ['Camera an ninh', 'Camera cửa sau mất hình', 'Bấm lại đầu dây mạng', null, 12, user.quanly],
    ['Tủ mát đồ uống', 'Tủ mát không lạnh', 'Thay quạt dàn lạnh (thợ hãng)', 1200000, 8, user.phucvu],
    ['Máy làm lạnh nước hồ (chiller)', 'Nước hồ lên 22 độ', 'Vệ sinh dàn nóng, nạp gas', 800000, 4, user.hohaisan],
    ['Máy lạnh phòng ăn trong nhà 1', 'Máy lạnh có mùi hôi', 'Vệ sinh lưới lọc, xịt khử khuẩn', null, 1, user.letan],
  ];
  await prisma.repairTicket.createMany({
    data: done.map(([name, title, resolution, cost, days, reporter]) => ({
      title, equipmentId: eq[name].id, status: 'DONE', reportedById: reporter, assigneeId: user.kythuat,
      createdAt: ago(days, 6), startedAt: ago(days, 4), completedAt: ago(days, 2), resolution, cost,
    })),
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
