// THỰC ĐƠN FAB SEAFOOD (từ 22/11/2026): 12 nhóm, 70 món. Tài liệu: docs/24-thuc-don-ban-theo-kg.md
//
// - Hải sản sống ở hồ (tôm hùm, tôm sú, cua, cá mú, tôm tít): bán theo KG, đơn vị 'kg', giá là giá 1 kg.
//   Tại quán: phục vụ gọi món → nhân viên hồ hải sản cân → tiền = giá 1 kg × số kg thực tế.
//   Khách KHÔNG đặt giao hàng online món theo kg được (phải chọn con tại hồ), web hiện nút "Đặt bàn".
// - Còn lại (hàu, sò điệp, nghêu, cháo, cơm, rau) bán theo phần; nước uống theo lon / chai.
// - Cột "best" = Best seller (cột isFeatured): hiện nổi bật ở trang chủ web, nhãn "Best seller" trên thẻ món.
//   Admin bật / tắt ở trang Món ăn (ô "Best seller").
//
// Chạy riêng: npm --prefix backend run db:seed-menu
//   Đổi database đang dùng sang thực đơn này, KHÔNG xóa đơn hàng / đánh giá:
//   - Món trong danh sách (trùng slug): cập nhật tên, giá, đơn vị, ảnh, mô tả, bật bán lại; chưa có thì tạo.
//     Ảnh admin đã tự tải lên (trang Món ăn / Danh mục) thì giữ nguyên.
//   - Món cũ không còn trong danh sách: chưa từng bán và chưa có đánh giá thì XÓA; đã nằm trong đơn / có đánh giá
//     thì ẩn (ngừng bán) và gom vào nhóm "Ngừng bán (thực đơn cũ)" để đơn cũ vẫn xem lại được.
//   - Danh mục cũ không còn món nào thì xóa.
// seed.js (npm run setup) cũng gọi applyMenu() nên database mới có sẵn thực đơn này.
//
// Cột "ảnh": mã ảnh Unsplash (phần sau "photo-" trong link https://images.unsplash.com/photo-<mã>), ảnh miễn phí,
// tìm và xem tận mắt ngày 22/11/2026: mỗi món 1 ảnh riêng, riêng 5 món tôm tít dùng chung ảnh tôm tít sống
// (Unsplash không có ảnh tôm tít đã nấu). Vài món Việt chỉ có ảnh gần đúng (cháo hàu, cháo chíp chíp, mồng tơi...).
// null = chưa có ảnh: web và app hiện ô "FAB Seafood". Có ảnh thật thì admin tải lên ở trang Món ăn (lệnh này giữ ảnh đó).
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import { slugify } from '../src/utils/helpers.js';

export const unsplashImg = (id) => (id ? `https://images.unsplash.com/photo-${id}?w=800&q=80&auto=format&fit=crop` : null);
// Ảnh admin tự tải lên (/uploads/...) thì giữ, không thay bằng ảnh Unsplash trong file này
const keepUploaded = (current, fromMenu) => (current && !current.startsWith('https://images.unsplash.com') ? current : fromMenu);

// Thứ tự = thứ tự hiện trên web / app (hải sản theo kg lên đầu)
export const MENU_CATEGORIES = [
  { name: 'Tôm hùm', description: 'Tôm hùm bông, tôm hùm xanh sống tại hồ · bán theo kg', image: '1729707691140-d0a5a1d2bb7a' },
  { name: 'Tôm sú', description: 'Tôm sú sống tại hồ · bán theo kg', image: '1674962296996-b17a771d44b3' },
  { name: 'Cua', description: 'Cua gạch, cua thịt sống · bán theo kg', image: '1675060852223-0d0b52a48fbb' },
  { name: 'Cá mú', description: 'Cá mú bơi tại hồ · bán theo kg', image: '1760504526044-840cade997b2' },
  { name: 'Tôm tít', description: 'Tôm tít (bề bề) sống · bán theo kg', image: '1628428799790-646879281153' }, // ảnh tôm tít sống thật (Unsplash không có ảnh tôm tít đã nấu)
  { name: 'Hàu', description: 'Hàu sữa tươi mỗi sáng · bán theo phần 6 con', image: '1663072302693-d92701c4ef42' },
  { name: 'Sò điệp', description: 'Sò điệp nướng, hấp · bán theo phần 5 con', image: '1771175806857-ee9d5f84d2bb' },
  { name: 'Nghêu', description: 'Nghêu xào, hấp · bán theo phần', image: '1685985873036-f40783a84b32' },
  { name: 'Cháo', description: 'Cháo hải sản nấu nóng · bán theo phần', image: '1653860468845-a53ac4b1059a' },
  { name: 'Cơm', description: 'Cơm chiên ăn kèm hải sản · bán theo phần', image: '1512058564366-18510be2db19' },
  { name: 'Rau', description: 'Rau xào, luộc ăn kèm · bán theo phần', image: '1680676066605-08566beed799' },
  { name: 'Nước uống', description: 'Nước ngọt, nước suối, bia đóng chai / lon', image: '1527960471264-932f39eb5846' },
];

const KG = 'kg';
const PHAN = 'phần';

// [tên, danh mục, giá (VNĐ, theo kg nếu đơn vị 'kg'), đơn vị, ảnh, best seller, mô tả]
export const MENU_DISHES = [
  // ---- Tôm hùm (kg) ----
  ['Tôm hùm nướng phô mai', 'Tôm hùm', 1890000, KG, '1615761136599-86165bdf1a83', true, 'Tôm hùm bổ đôi nướng bơ, phủ phô mai mozzarella béo ngậy.'],
  ['Tôm hùm sốt bơ tỏi', 'Tôm hùm', 1890000, KG, '1758796626175-cfbb6ed524d5', false, 'Tôm hùm chặt khúc xào bơ tỏi thơm lừng, ăn kèm bánh mì nướng.'],
  ['Tôm hùm sốt tiêu đen', 'Tôm hùm', 1890000, KG, '1588791174744-7e9bf4378277', false, 'Sốt tiêu đen cay nồng thấm vào từng thớ thịt tôm hùm.'],
  ['Tôm hùm sốt chua ngọt', 'Tôm hùm', 1890000, KG, '1738231670072-ab51e6bf483e', false, 'Tôm hùm chiên sơ, sốt chua ngọt cà chua và dứa.'],
  ['Tôm hùm sashimi', 'Tôm hùm', 2090000, KG, '1792862221836-f52dbf88397d', false, 'Thịt tôm hùm sống thái lát trên đá, chấm mù tạt; đầu và càng nấu cháo.'],

  // ---- Tôm sú (kg) ----
  ['Tôm sú sốt bơ tỏi', 'Tôm sú', 690000, KG, '1625943553852-781c6dd46faa', false, 'Tôm sú xào bơ tỏi thơm béo, ăn kèm bánh mì.'],
  ['Tôm sú sốt chua ngọt', 'Tôm sú', 690000, KG, '1788462613187-b10c1ac2ea60', false, 'Tôm sú sốt chua ngọt đậm đà, rắc mè rang.'],
  ['Tôm sú sốt tiêu đen', 'Tôm sú', 690000, KG, '1633504581786-316c8002b1b9', false, 'Tôm sú xào sốt tiêu đen cay nồng.'],
  ['Tôm sú cháy tỏi', 'Tôm sú', 690000, KG, '1750680229961-1b0e607eb2c7', false, 'Tôm sú chiên giòn với tỏi phi vàng ruộm.'],
  ['Tôm sú sốt trứng muối', 'Tôm sú', 720000, KG, '1726455418076-a60ccd6085c2', true, 'Tôm sú chiên giòn áo sốt trứng muối béo bùi.'],
  ['Tôm sú rang muối', 'Tôm sú', 690000, KG, '1702650770029-b91afe8d7b3d', false, 'Tôm sú rang muối ớt, vỏ giòn, thịt ngọt.'],
  ['Tôm sú sashimi', 'Tôm sú', 750000, KG, '1744360515494-8be4a761f9bb', false, 'Tôm sú sống bóc vỏ, ướp lạnh trên đá, chấm mù tạt xì dầu.'],
  ['Tôm sú hấp bia', 'Tôm sú', 690000, KG, '1565680018434-b513d5e5fd47', false, 'Tôm sú hấp bia và sả, giữ trọn vị ngọt tự nhiên.'],

  // ---- Cua (kg) ----
  ['Cua gạch hấp bia', 'Cua', 990000, KG, '1788620379419-054adc0e0310', true, 'Cua gạch son đầy, hấp bia và sả, chấm muối tiêu chanh.'],
  ['Cua gạch rang me', 'Cua', 990000, KG, '1597805539244-3f0848b99ad7', false, 'Cua gạch rang sốt me chua ngọt sền sệt.'],
  ['Cua thịt hấp bia', 'Cua', 790000, KG, '1550586554-a5a846e56593', false, 'Cua thịt chắc ngọt, hấp bia giữ nguyên vị.'],
  ['Cua thịt rang muối', 'Cua', 790000, KG, '1710508852956-f1eba75d7580', false, 'Cua thịt rang muối ớt, thơm cay.'],
  ['Cua thịt sốt ớt Singapore', 'Cua', 820000, KG, '1587209310286-b61cdacd694c', false, 'Cua thịt sốt ớt cà chua kiểu Singapore, ăn kèm bánh mì chiên.'],

  // ---- Cá mú (kg) ----
  ['Cá mú hấp Hồng Kông', 'Cá mú', 690000, KG, '1726452842860-e7e8066f3341', true, 'Cá mú hấp xì dầu, hành, gừng kiểu Hồng Kông.'],
  ['Cá mú nướng muối ớt', 'Cá mú', 690000, KG, '1765265432611-17d3f2da2d5d', false, 'Cá mú nướng than hồng tẩm muối ớt.'],
  ['Cá mú sashimi', 'Cá mú', 790000, KG, '1794045421514-083d12bb1fcd', false, 'Phi lê cá mú sống thái lát mỏng, chấm mù tạt; xương nấu cháo.'],
  ['Cá mú chiên giòn sốt mắm', 'Cá mú', 690000, KG, '1665401015549-712c0dc5ef85', false, 'Cá mú chiên giòn nguyên con, rưới nước mắm tỏi ớt.'],
  ['Lẩu cá mú chua cay', 'Cá mú', 690000, KG, '1776651993696-a7e4fb747f52', false, 'Cá mú nấu lẩu măng chua, cà chua, thơm; kèm rau và bún.'],

  // ---- Tôm tít (kg) ----
  ['Tôm tít cháy tỏi', 'Tôm tít', 590000, KG, '1628428799790-646879281153', true, 'Tôm tít chiên giòn với tỏi phi, cắn giòn rụm.'],
  ['Tôm tít sốt bơ tỏi', 'Tôm tít', 590000, KG, '1628428799790-646879281153', false, 'Tôm tít xào bơ tỏi thơm béo.'],
  ['Tôm tít rang muối', 'Tôm tít', 590000, KG, '1628428799790-646879281153', false, 'Tôm tít rang muối ớt đậm đà.'],
  ['Tôm tít hấp sả', 'Tôm tít', 560000, KG, '1628428799790-646879281153', false, 'Tôm tít hấp sả gừng, chấm muối tiêu chanh.'],
  ['Tôm tít rang me', 'Tôm tít', 590000, KG, '1628428799790-646879281153', false, 'Tôm tít rang sốt me chua ngọt.'],

  // ---- Hàu (phần 6 con) ----
  ['Hàu tái chanh', 'Hàu', 109000, PHAN, '1776857400424-d059448ad0bd', false, '6 con hàu sữa tái chanh, rau thơm, hành phi.'],
  ['Hàu nướng mỡ hành', 'Hàu', 119000, PHAN, '1660737840488-78f91c14aa96', true, '6 con hàu nướng than với mỡ hành và đậu phộng rang.'],
  ['Hàu nướng phô mai', 'Hàu', 139000, PHAN, '1584813913376-6efd13af70a3', false, '6 con hàu nướng phủ phô mai mozzarella.'],
  ['Hàu nướng bơ tỏi', 'Hàu', 129000, PHAN, '1676250251001-611fca15951a', false, '6 con hàu nướng bơ tỏi thơm lừng.'],
  ['Hàu sống mù tạt', 'Hàu', 119000, PHAN, '1700913281386-e2cfc713f117', false, '6 con hàu sống ướp đá, chấm mù tạt xì dầu.'],

  // ---- Sò điệp (phần 5 con) ----
  ['Sò điệp nướng mỡ hành', 'Sò điệp', 129000, PHAN, '1758872044232-449046a48b26', false, '5 con sò điệp nướng mỡ hành, đậu phộng.'],
  ['Sò điệp nướng phô mai', 'Sò điệp', 149000, PHAN, '1761314036797-8b6ef2c159c7', true, '5 con sò điệp nướng phô mai béo ngậy.'],
  ['Sò điệp nướng bơ tỏi', 'Sò điệp', 139000, PHAN, '1730302737756-0bf0cb6b496b', false, '5 con sò điệp nướng bơ tỏi.'],
  ['Sò điệp hấp gừng sả', 'Sò điệp', 129000, PHAN, '1636797912828-7e3903954cd8', false, '5 con sò điệp hấp gừng sả, chấm muối tiêu chanh.'],

  // ---- Nghêu (phần) ----
  ['Nghêu xào sả ớt', 'Nghêu', 89000, PHAN, '1665110760252-b095346c78e4', false, 'Nghêu xào sả ớt cay thơm.'],
  ['Nghêu hấp sả', 'Nghêu', 79000, PHAN, '1767415743096-96e1c2a9ea12', false, 'Nghêu hấp sả gừng, nước ngọt thanh.'],
  ['Nghêu hấp Thái', 'Nghêu', 89000, PHAN, '1741196777225-f6cb9c60c105', false, 'Nghêu hấp nước dùng chua cay kiểu Thái, lá chanh, sả.'],
  ['Nghêu xào bơ tỏi', 'Nghêu', 89000, PHAN, '1693491464124-2cc9400ab078', false, 'Nghêu xào bơ tỏi, ăn kèm bánh mì.'],
  ['Nghêu nướng mỡ hành', 'Nghêu', 89000, PHAN, '1785769395250-c156893c8f57', false, 'Nghêu nướng mỡ hành, đậu phộng.'],

  // ---- Cháo (phần) ----
  ['Cháo hải sản', 'Cháo', 89000, PHAN, '1623188509153-bbdc6eb44893', false, 'Cháo nấu tôm, mực, nghêu với gừng và hành.'],
  ['Cháo hàu', 'Cháo', 79000, PHAN, '1775883375112-64fe8e37a9e1', false, 'Cháo hàu sữa nấu gừng, tiêu, hành.'],
  ['Cháo nghêu', 'Cháo', 69000, PHAN, '1560684352-8497838a2229', false, 'Cháo nghêu ngọt nước, rắc tiêu và rau răm.'],
  ['Cháo chíp chíp', 'Cháo', 69000, PHAN, '1538837043432-ebf239af5883', false, 'Cháo chíp chíp (sò nhỏ) nấu gừng, hành phi.'],
  ['Cháo cua', 'Cháo', 89000, PHAN, '1682596044586-76c1d9ee1a97', false, 'Cháo thịt cua gạch thơm béo.'],
  ['Cháo tôm', 'Cháo', 79000, PHAN, '1766761562530-c8dd12c96d9a', false, 'Cháo tôm sú băm, hành ngò.'],

  // ---- Cơm (phần) ----
  ['Cơm chiên hải sản', 'Cơm', 89000, PHAN, '1680674774705-90b4904b3a7f', true, 'Cơm chiên tơi hạt cùng tôm, mực, trứng.'],
  ['Cơm chiên dưa bò', 'Cơm', 79000, PHAN, '1680674814945-7945d913319c', false, 'Cơm chiên với bò xào dưa cải chua.'],
  ['Cơm chiên tỏi', 'Cơm', 49000, PHAN, '1642972420043-4736c570a716', false, 'Cơm chiên tỏi thơm, ăn kèm các món hải sản sốt.'],
  ['Cơm chiên trứng', 'Cơm', 45000, PHAN, '1609570324378-ec0c4c9b6ba8', false, 'Cơm chiên trứng, hành lá.'],
  ['Cơm chiên cá mặn', 'Cơm', 69000, PHAN, '1637759079728-3f900db7a782', false, 'Cơm chiên cá mặn, trứng, giá đỗ.'],
  ['Cơm chiên Dương Châu', 'Cơm', 69000, PHAN, '1630914441929-0d8ea69f95e6', false, 'Cơm chiên lạp xưởng, tôm, đậu, cà rốt.'],

  // ---- Rau (phần) ----
  ['Rau muống xào tỏi', 'Rau', 49000, PHAN, '1766375884263-016cd780fa1e', false, 'Rau muống xào tỏi giòn xanh.'],
  ['Rau rừng xào tỏi', 'Rau', 69000, PHAN, '1771573042838-8b3adf17562e', false, 'Rau rừng theo mùa xào tỏi.'],
  ['Cải thìa xào tỏi', 'Rau', 49000, PHAN, '1590759525295-dd43b5522ad8', false, 'Cải thìa xào tỏi, dầu hào.'],
  ['Mồng tơi xào tỏi', 'Rau', 45000, PHAN, '1719784521246-a944c11b8f97', false, 'Mồng tơi xào tỏi mềm ngọt.'],
  ['Bông bí xào tỏi', 'Rau', 59000, PHAN, '1791763259247-b8df2baa2f44', false, 'Bông bí xào tỏi giòn.'],
  ['Đậu bắp luộc', 'Rau', 39000, PHAN, '1624797989459-e830e71dc9e9', false, 'Đậu bắp luộc chấm chao.'],

  // ---- Nước uống (lon / chai) ----
  ['Coca-Cola', 'Nước uống', 20000, 'lon', '1622483767028-3f66f32aef97', false, 'Lon 330ml ướp lạnh.'],
  ['7 Up', 'Nước uống', 20000, 'lon', '1658527693525-ce2270bdd9e3', false, 'Lon 330ml ướp lạnh.'],
  ['Fanta cam', 'Nước uống', 20000, 'lon', '1624517452488-04869289c4ca', false, 'Lon 330ml ướp lạnh.'],
  ['Sprite', 'Nước uống', 20000, 'lon', '1680404005217-a441afdefe83', false, 'Lon 330ml ướp lạnh.'],
  ['Trà xanh Không Độ', 'Nước uống', 20000, 'chai', '1777500393733-6ae9b0b9acb3', false, 'Chai 455ml ướp lạnh.'],
  ['Nước suối Aquafina', 'Nước uống', 15000, 'chai', '1550505095-81378a674395', false, 'Chai 500ml.'],
  ['Bia Larue', 'Nước uống', 22000, 'lon', '1608270586620-248524c67de9', false, 'Bia Larue lon 330ml ướp lạnh.'],
  ['Bia Tiger', 'Nước uống', 28000, 'lon', '1633785586918-aecf1088218d', false, 'Bia Tiger lon 330ml ướp lạnh.'],
  ['Bia Heineken', 'Nước uống', 32000, 'lon', '1522997169209-1629f3f89fdf', false, 'Bia Heineken lon 330ml ướp lạnh.'],
  ['Bia Sài Gòn Special', 'Nước uống', 25000, 'chai', '1767105168730-e04b9d9a0992', false, 'Bia Sài Gòn Special chai 330ml ướp lạnh.'],
];

const RETIRED_CATEGORY = { name: 'Ngừng bán (thực đơn cũ)', description: 'Món cũ đã có trong đơn hàng, ẩn khỏi thực đơn' };

/**
 * Đưa database về đúng thực đơn ở trên (xem đầu file). Không xóa đơn hàng / đánh giá.
 * Trả về { created, updated, deleted, retired, removedCategories } (danh sách tên) để in ra màn hình.
 */
export async function applyMenu(db) {
  const report = { created: [], updated: [], deleted: [], retired: [], removedCategories: [] };

  // 1. Danh mục: tạo / cập nhật theo slug
  const catIds = {};
  for (const [i, c] of MENU_CATEGORIES.entries()) {
    const slug = slugify(c.name);
    const current = await db.category.findUnique({ where: { slug }, select: { image: true } });
    const data = { name: c.name, description: c.description, image: keepUploaded(current?.image, unsplashImg(c.image)), sortOrder: i };
    const cat = await db.category.upsert({ where: { slug }, create: { ...data, slug }, update: data });
    catIds[c.name] = cat.id;
  }

  // 2. Món: tạo / cập nhật theo slug
  const keepSlugs = new Set();
  for (const [name, catName, price, unit, imageId, isFeatured, description] of MENU_DISHES) {
    const slug = slugify(name);
    keepSlugs.add(slug);
    const exists = await db.dish.findUnique({ where: { slug }, select: { id: true, image: true } });
    const image = keepUploaded(exists?.image, unsplashImg(imageId));
    const data = { name, categoryId: catIds[catName], price, salePrice: null, unit, image, isFeatured, isAvailable: true, description };
    if (exists) {
      await db.dish.update({ where: { id: exists.id }, data });
      report.updated.push(name);
    } else {
      await db.dish.create({ data: { ...data, slug } });
      report.created.push(name);
    }
  }

  // 3. Món cũ: chưa bán, chưa đánh giá → xóa; còn lại → ẩn, gom vào nhóm "Ngừng bán"
  const old = await db.dish.findMany({
    where: { slug: { notIn: [...keepSlugs] } },
    select: { id: true, name: true, _count: { select: { orderItems: true, reviews: true } } },
  });
  const toRetire = old.filter((d) => d._count.orderItems > 0 || d._count.reviews > 0);
  const toDelete = old.filter((d) => !toRetire.includes(d));
  if (toDelete.length) {
    await db.dish.deleteMany({ where: { id: { in: toDelete.map((d) => d.id) } } });
    report.deleted.push(...toDelete.map((d) => d.name));
  }
  if (toRetire.length) {
    const slug = slugify(RETIRED_CATEGORY.name);
    const retired = await db.category.upsert({
      where: { slug },
      create: { ...RETIRED_CATEGORY, slug, sortOrder: 999 },
      update: { sortOrder: 999 },
    });
    await db.dish.updateMany({
      where: { id: { in: toRetire.map((d) => d.id) } },
      data: { categoryId: retired.id, isAvailable: false, isFeatured: false },
    });
    report.retired.push(...toRetire.map((d) => d.name));
  }

  // 4. Danh mục cũ không còn món nào → xóa
  const empty = await db.category.findMany({ where: { dishes: { none: {} } }, select: { id: true, name: true } });
  if (empty.length) {
    await db.category.deleteMany({ where: { id: { in: empty.map((c) => c.id) } } });
    report.removedCategories.push(...empty.map((c) => c.name));
  }
  return report;
}

// Chỉ chạy đoạn này khi gọi trực tiếp `node prisma/menu.js` (seed.js import thì không chạy)
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const prisma = new PrismaClient();
  try {
    const r = await prisma.$transaction((tx) => applyMenu(tx), { timeout: 60000 });
    console.log(`✅ Thực đơn mới: ${MENU_CATEGORIES.length} nhóm, ${MENU_DISHES.length} món`);
    console.log(`   + Tạo mới ${r.created.length} món, cập nhật ${r.updated.length} món có sẵn${r.updated.length ? ` (${r.updated.join(', ')})` : ''}`);
    if (r.deleted.length) console.log(`   🗑️  Xóa ${r.deleted.length} món cũ chưa từng bán`);
    if (r.retired.length) console.log(`   📦 Ẩn ${r.retired.length} món cũ đã có trong đơn / đánh giá, gom vào "${RETIRED_CATEGORY.name}"`);
    if (r.removedCategories.length) console.log(`   🗂️  Xóa danh mục cũ: ${r.removedCategories.join(', ')}`);
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}
