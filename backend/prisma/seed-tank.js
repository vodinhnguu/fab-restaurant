// Tạo 6 loại hải sản trong hồ và gắn món bán theo kg vào loại của nó (docs/27-ton-ho-hai-san.md).
// Chạy: npm --prefix backend run db:seed-tank
// Chỉ thêm loại còn thiếu và gắn món, KHÔNG xóa tồn kho / lịch sử nhập xuất đang có.
// (seed.js và db:seed-menu cũng tự làm việc này.)
import { PrismaClient } from '@prisma/client';
import { seedTankItems } from '../src/config/tank.js';

const prisma = new PrismaClient();
try {
  const r = await seedTankItems(prisma);
  const items = await prisma.tankItem.findMany({
    orderBy: { sortOrder: 'asc' },
    select: { name: true, stockKg: true, _count: { select: { dishes: true } } },
  });
  console.log(`✅ Hồ hải sản: ${r.items} loại, vừa gắn ${r.linked} món bán theo kg`);
  for (const i of items) {
    console.log(`   🦞 ${i.name}: tồn ${String(i.stockKg).replace('.', ',')} kg · ${i._count.dishes} món trên thực đơn`);
  }
} catch (e) {
  console.error(e);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
