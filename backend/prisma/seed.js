// Dữ liệu mẫu cho FAB Seafood. Chạy: npm run db:seed
// CẢNH BÁO: script này XÓA toàn bộ dữ liệu cũ trong database rồi tạo lại.
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const img = (id) => `https://images.unsplash.com/photo-${id}?w=800&q=80&auto=format&fit=crop`;

const slugify = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const categories = [
  { name: 'Khai vị', description: 'Món nhẹ mở đầu bữa tiệc', image: img('1547592180-85f173990554') },
  { name: 'Tôm', description: 'Tôm sú, tôm hùm đất tươi sống', image: img('1565680018434-b513d5e5fd47') },
  { name: 'Cá', description: 'Cá hồi, cá vược, cá biển trong ngày', image: img('1519708227418-c8fd9a32b7a2') },
  { name: 'Mâm hải sản', description: 'Combo nướng & hấp cho nhóm bạn', image: img('1615141982883-c7ad0e69fd62') },
  { name: 'Món Nhật', description: 'Sushi, sashimi chuẩn vị Nhật', image: img('1617196034796-73dfa7b1fd56') },
  { name: 'Cơm & Mì', description: 'Món chính no bụng', image: img('1563379926898-05f4575a45d8') },
  { name: 'Tráng miệng', description: 'Ngọt ngào kết thúc bữa ăn', image: img('1534766555764-ce878a5e3a2b') },
  { name: 'Đồ uống', description: 'Cocktail, nước ép, rượu vang', image: img('1513558161293-cdaf765ed2fd') },
];

// [tên, danh mục, giá, giá KM, đơn vị, ảnh, nổi bật, mô tả]
const dishes = [
  ['Salad hải sản sốt chanh dây', 'Khai vị', 129000, null, 'đĩa', '1547592180-85f173990554', false, 'Tôm, mực, rau xanh trộn sốt chanh dây chua ngọt thanh mát.'],
  ['Tacos cá chiên giòn', 'Khai vị', 99000, 89000, 'phần', '1551504734-5ee1c4a1479b', false, '3 bánh tacos nhân cá chiên giòn, xốt bơ và rau thơm.'],
  ['Sashimi cá hồi Na Uy', 'Khai vị', 189000, null, 'phần', '1599084993091-1cb5c0721cc6', true, 'Cá hồi Na Uy nhập khẩu, cắt lát dày ăn kèm mù tạt và gừng hồng.'],

  ['Tôm sú hấp bia', 'Tôm', 289000, null, 'đĩa', '1565680018434-b513d5e5fd47', true, 'Tôm sú tươi hấp bia và sả, giữ trọn vị ngọt tự nhiên.'],
  ['Tôm sú nướng muối ớt', 'Tôm', 299000, 269000, 'đĩa', '1559737558-2f5a35f4523b', false, 'Tôm sú nướng than hồng tẩm muối ớt cay nồng.'],
  ['Tôm xào bơ tỏi', 'Tôm', 259000, null, 'chảo', '1625943553852-781c6dd46faa', true, 'Tôm bóc nõn xào bơ tỏi thơm lừng, ăn kèm bánh mì nướng.'],
  ['Cà ri tôm kiểu Thái', 'Tôm', 199000, null, 'tô', '1559847844-5315695dadae', false, 'Cà ri nước cốt dừa cay nhẹ với tôm và rau củ.'],

  ['Cá hồi áp chảo sốt chanh', 'Cá', 279000, null, 'phần', '1519708227418-c8fd9a32b7a2', true, 'Phi lê cá hồi áp chảo da giòn, sốt chanh bơ.'],
  ['Cá vược nướng rau củ', 'Cá', 249000, null, 'phần', '1611599537845-1c7aca0091c0', false, 'Phi lê cá vược nướng, ăn kèm cà chua bi và salad.'],
  ['Cá hồi bỏ lò sốt kem', 'Cá', 289000, 259000, 'chảo', '1485921325833-c519f76c4927', false, 'Cá hồi bỏ lò cùng rau bina và sốt kem phô mai.'],
  ['Steak cá hồi sốt cà chua', 'Cá', 299000, null, 'phần', '1580959375944-abd7e991f971', false, 'Miếng cá hồi dày nướng chín vừa, sốt cà chua thảo mộc.'],
  ['Cá nướng nguyên con', 'Cá', 359000, null, 'con', '1510130387422-82bed34b37e9', false, 'Cá biển trong ngày nướng nguyên con, chấm muối tiêu chanh.'],

  ['Mâm hải sản nướng FAB', 'Mâm hải sản', 899000, 799000, 'mâm', '1606850780554-b55ea4dd0b70', true, 'Bạch tuộc, tôm, mực, cá nướng cho 3-4 người.'],
  ['Mâm hải sản tươi sống', 'Mâm hải sản', 1290000, null, 'mâm', '1615141982883-c7ad0e69fd62', false, 'Chọn hải sản tươi trên đá, chế biến theo yêu cầu cho 4-6 người.'],

  ['Sushi set Omakase', 'Món Nhật', 459000, null, 'set', '1617196034796-73dfa7b1fd56', true, '12 miếng sushi tuyển chọn bởi đầu bếp.'],
  ['Nigiri cá hồi', 'Món Nhật', 119000, null, '2 miếng', '1615361200141-f45040f367be', false, 'Cơm nắm nigiri phủ cá hồi tươi béo ngậy.'],

  ['Mì Ý hải sản sốt cà', 'Cơm & Mì', 189000, null, 'đĩa', '1563379926898-05f4575a45d8', true, 'Spaghetti với tôm, mực, nghêu sốt cà chua tươi.'],
  ['Cơm chiên hải sản', 'Cơm & Mì', 139000, null, 'đĩa', '1512058564366-18510be2db19', false, 'Cơm chiên tơi hạt cùng tôm, mực, trứng.'],
  ['Mì Ý sốt kem tôm', 'Cơm & Mì', 179000, 159000, 'đĩa', '1579631542720-3a87824fff86', false, 'Tagliatelle sốt kem phô mai Parmesan và tôm.'],

  ['Tiramisu', 'Tráng miệng', 69000, null, 'phần', '1534766555764-ce878a5e3a2b', false, 'Bánh tiramisu cà phê Ý chuẩn vị.'],
  ['Panna cotta dâu', 'Tráng miệng', 59000, null, 'ly', '1488477181946-6428a0291777', false, 'Panna cotta mềm mịn với sốt dâu tây tươi.'],
  ['Kem tươi', 'Tráng miệng', 45000, null, 'cốc', '1497034825429-c343d7c6a68f', false, 'Kem tươi dâu mát lạnh.'],

  ['Mojito chanh bạc hà', 'Đồ uống', 79000, null, 'ly', '1513558161293-cdaf765ed2fd', false, 'Chanh, bạc hà, soda mát lạnh (có tùy chọn không cồn).'],
  ['Trà chanh sả', 'Đồ uống', 45000, null, 'ly', '1556679343-c7306c1976bc', false, 'Trà đen pha chanh và sả thơm.'],
  ['Cocktail Old Fashioned', 'Đồ uống', 129000, null, 'ly', '1514362545857-3bc16c4c7d1b', false, 'Whisky, bitters, vỏ cam.'],
  ['Rượu vang trắng', 'Đồ uống', 149000, null, 'ly', '1437418747212-8d9709afab22', false, 'Vang trắng Chardonnay hợp với hải sản.'],
];

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
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.dish.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.user.deleteMany();

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

  console.log('📂 Tạo danh mục & món ăn...');
  const catMap = {};
  for (const [i, c] of categories.entries()) {
    const cat = await prisma.category.create({ data: { ...c, slug: slugify(c.name), sortOrder: i } });
    catMap[c.name] = cat.id;
  }

  const createdDishes = [];
  for (const [name, cat, price, salePrice, unit, imageId, isFeatured, description] of dishes) {
    createdDishes.push(
      await prisma.dish.create({
        data: {
          name,
          slug: slugify(name),
          categoryId: catMap[cat],
          price,
          salePrice,
          unit,
          image: img(imageId),
          isFeatured,
          description,
        },
      }),
    );
  }

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
    const picked = [...createdDishes].sort(() => Math.random() - 0.5).slice(0, randInt(1, 4));
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
  const demoDishes = createdDishes.filter((d) => d.isFeatured).slice(0, 3);
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
  await prisma.reservation.createMany({
    data: [
      { code: 'RSV0000001', userId: demo.id, name: demo.name, phone: demo.phone, date: at(1, 19), guests: 4, area: 'Ngoài trời - view biển', status: 'CONFIRMED', note: 'Sinh nhật, chuẩn bị giúp bánh kem' },
      { code: 'RSV0000002', name: 'Phạm Quốc Huy', phone: '0987654321', date: at(0, 20), guests: 2, area: 'Trong nhà', status: 'PENDING' },
      { code: 'RSV0000003', name: 'Công ty ABC', phone: '0977000111', email: 'hr@abc.vn', date: at(3, 18), guests: 12, area: 'Phòng VIP', status: 'PENDING', note: 'Tiệc công ty' },
      { code: 'RSV0000004', name: 'Võ Thị Lan', phone: '0966000222', date: at(-2, 19), guests: 3, area: 'Trong nhà', status: 'COMPLETED' },
    ],
  });

  console.log('✅ Seed xong!');
  console.log('   Admin:     admin@fab.vn / admin123');
  console.log('   Khách hàng: khach@fab.vn / 123456');
  console.log(`   (admin id ${admin.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
