// =============================================================
//  Tồn hồ hải sản. Tài liệu: docs/27-ton-ho-hai-san.md
//
//  Hồ nuôi hải sản sống và bán theo kg. Thực đơn có 28 món bán theo kg nhưng hồ chỉ có 6 LOẠI hàng:
//  5 món tôm hùm (nướng phô mai, sốt bơ tỏi, sashimi...) đều bắt cùng một con tôm hùm trong hồ.
//  Vì vậy tồn kho tính theo TankItem (loại hải sản), không theo từng món.
//
//  Nhóm món "Cua" tách thành 2 loại hồ: cua gạch (990.000đ/kg) và cua thịt (790.000đ/kg) -
//  cùng nhóm trên thực đơn nhưng là 2 loại hàng khác nhau, giá nhập khác nhau.
//
//  - TANK_ITEMS: loại hải sản tạo sẵn lần đầu. Sau đó hồ hải sản tự thêm / sửa trên trang Tồn hồ.
//  - dishMatch: cách gắn món bán theo kg vào loại hồ (theo nhóm món + tên món).
// =============================================================

// [tên loại, nhóm món trên thực đơn, ngưỡng "gần hết" (kg), từ khóa trong tên món (null = cả nhóm), ghi chú]
const items = [
  ['Tôm hùm', 'Tôm hùm', 3, null, 'Tôm hùm bông / xanh sống, cỡ 0,8 - 1,5 kg mỗi con'],
  ['Tôm sú', 'Tôm sú', 5, null, 'Tôm sú sống, cỡ 20 - 30 con / kg'],
  ['Cua gạch', 'Cua', 3, 'cua gạch', 'Cua gạch son, cỡ 0,4 - 0,6 kg mỗi con'],
  ['Cua thịt', 'Cua', 3, 'cua thịt', 'Cua thịt chắc, cỡ 0,4 - 0,7 kg mỗi con'],
  ['Cá mú', 'Cá mú', 5, null, 'Cá mú bơi tại hồ, cỡ 1 - 2 kg mỗi con'],
  ['Tôm tít', 'Tôm tít', 3, null, 'Tôm tít (bề bề) sống'],
];

export const TANK_ITEMS = items.map(([name, category, lowStockKg, nameKeyword, note], i) => ({
  name,
  category,
  lowStockKg,
  nameKeyword,
  note,
  sortOrder: i + 1,
}));

/**
 * Món bán theo kg [dish] (có `name` và `category.name`) thuộc loại hải sản nào trong hồ?
 * Trả về tên loại, hoặc null nếu không khớp loại nào (vd món theo phần, hoặc nhóm món mới chưa khai báo).
 */
export function tankItemNameForDish(dish) {
  const dishName = (dish?.name || '').toLowerCase();
  const catName = dish?.category?.name;
  // Loại có từ khóa (cua gạch / cua thịt) xét trước, rồi mới tới loại áp cho cả nhóm
  const matches = TANK_ITEMS.filter((t) => t.category === catName);
  const byKeyword = matches.find((t) => t.nameKeyword && dishName.includes(t.nameKeyword));
  return (byKeyword ?? matches.find((t) => !t.nameKeyword))?.name ?? null;
}

/**
 * Tạo 6 loại hải sản mặc định nếu chưa có, rồi gắn mọi món bán theo kg (unit = 'kg') vào loại của nó.
 * Chạy lại nhiều lần không sao: không tạo trùng (name unique), không xóa tồn kho đang có.
 * Dùng bởi seed.js (npm run setup), applyMenu() (db:seed-menu) và db:seed-tank.
 */
export async function seedTankItems(db) {
  const { slugify } = await import('../utils/helpers.js');
  for (const t of TANK_ITEMS) {
    const slug = slugify(t.name);
    const data = { name: t.name, lowStockKg: t.lowStockKg, note: t.note, sortOrder: t.sortOrder };
    await db.tankItem.upsert({
      where: { slug },
      create: { ...data, slug },
      update: { note: t.note, sortOrder: t.sortOrder }, // giữ nguyên tồn và ngưỡng hồ hải sản đã sửa
    });
  }

  const tanks = await db.tankItem.findMany({ select: { id: true, name: true } });
  const idByName = new Map(tanks.map((t) => [t.name, t.id]));
  const byWeightDishes = await db.dish.findMany({
    where: { unit: 'kg' },
    select: { id: true, name: true, tankItemId: true, category: { select: { name: true } } },
  });

  let linked = 0;
  for (const dish of byWeightDishes) {
    const tankId = idByName.get(tankItemNameForDish(dish));
    if (tankId && dish.tankItemId !== tankId) {
      await db.dish.update({ where: { id: dish.id }, data: { tankItemId: tankId } });
      linked += 1;
    }
  }
  return { items: tanks.length, linked };
}
