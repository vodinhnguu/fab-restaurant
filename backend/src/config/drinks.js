// =============================================================
//  Bia nước & kiểm kho quầy. Tài liệu: docs/29-kiem-bia-nuoc.md
//
//  Đồ uống đóng lon / chai (nhóm thực đơn "Nước uống") xuất từ kho ra quầy theo THÙNG,
//  cuối NGÀY kiểm số còn lại trả về kho:
//
//     lệch = (xuất ra quầy) − (bán theo đơn) − (trả lại cuối ngày)
//     dương = còn thừa / quên ghi đơn        âm = thiếu hàng (mất, uống không ghi)
//
//  PACK_SIZES: số lon / chai mỗi thùng. Bia lon và nước ngọt lon thường thùng 24;
//  két bia chai 20 chai. Loại không khai báo ở đây dùng DEFAULT_PACK_SIZE (sửa được trên giao diện).
// =============================================================

/** Nhóm thực đơn chứa đồ uống đóng lon / chai. */
export const DRINK_CATEGORY = 'Nước uống';

/** Số lon / chai mỗi thùng khi chưa khai báo riêng. */
export const DEFAULT_PACK_SIZE = 24;

/** Quy cách thùng theo tên món (so khớp không phân biệt chữ hoa, chỉ cần CHỨA từ khóa). */
const PACK_SIZES = [
  ['bia sài gòn special', 20], // két chai 20
  ['bia larue', 24],
  ['bia tiger', 24],
  ['bia heineken', 24],
  ['nước suối', 24],
  ['trà xanh', 24],
];

/** Số lon / chai mỗi thùng của món [name]. */
export function packSizeForDish(name) {
  const lower = (name || '').toLowerCase();
  return PACK_SIZES.find(([keyword]) => lower.includes(keyword))?.[1] ?? DEFAULT_PACK_SIZE;
}

/**
 * Tạo bản ghi quy cách thùng cho mọi món trong nhóm "Nước uống" (chưa có thì tạo, có rồi thì giữ
 * quy cách người dùng đã sửa). Dùng bởi seed.js, applyMenu() và lệnh db:seed-drinks.
 */
export async function seedDrinkProducts(db) {
  const dishes = await db.dish.findMany({
    where: { category: { name: DRINK_CATEGORY } },
    orderBy: { id: 'asc' },
    select: { id: true, name: true, unit: true, drink: { select: { id: true } } },
  });

  let created = 0;
  for (const [i, dish] of dishes.entries()) {
    if (dish.drink) continue; // đã có: không ghi đè packSize người dùng sửa
    await db.drinkProduct.create({
      data: { dishId: dish.id, packSize: packSizeForDish(dish.name), sortOrder: i + 1 },
    });
    created += 1;
  }
  return { products: dishes.length, created };
}
