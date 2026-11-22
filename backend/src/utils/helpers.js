import crypto from 'node:crypto';

// Bỏ dấu tiếng Việt và chuyển thành slug: "Tôm Hấp Bia" -> "tom-hap-bia"
export function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Sinh mã dạng PREFIX + yyMMdd + 6 số ngẫu nhiên, vd: FAB261001482913
// - Ngày lấy theo giờ Việt Nam: server deploy thường chạy giờ UTC, dùng getDate() sẽ lệch ngày lúc 0h-7h sáng
// - 6 số = 1 triệu mã/ngày (4 số chỉ có 9.000 mã -> ~100 đơn/ngày đã có ~40% khả năng trùng)
// - crypto.randomInt khó đoán hơn Math.random
export function generateCode(prefix) {
  const ymd = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }); // "2026-10-01"
  const [yyyy, mm, dd] = ymd.split('-');
  const rand = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
  return `${prefix}${yyyy.slice(2)}${mm}${dd}${rand}`;
}

// Chạy `create(code)` với một mã mới; nếu xui bị trùng mã (lỗi unique P2002 ở cột code) thì sinh mã khác và thử lại
export async function withUniqueCode(prefix, create, attempts = 5) {
  for (let i = 1; ; i++) {
    try {
      return await create(generateCode(prefix));
    } catch (err) {
      const isCodeConflict = err?.code === 'P2002' && String(err.meta?.target ?? '').includes('code');
      if (!isCodeConflict || i >= attempts) throw err;
    }
  }
}

// Đọc ?page=&limit= từ query, trả về skip/take cho Prisma
export function getPagination(query, defaultLimit = 12) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit, take: limit };
}

export function paginationMeta(total, page, limit) {
  return { total, page, limit, totalPages: Math.ceil(total / limit) };
}

// ---- Ngày theo giờ Việt Nam (UTC+7) ----
// Server deploy thường chạy giờ UTC: dùng setHours(0) sẽ lệch 7 tiếng, việc làm lúc 0h-7h sáng bị tính sang hôm trước.
const DAY_MS = 24 * 3600 * 1000;
const VN_OFFSET_MS = 7 * 3600 * 1000;

// 0h (giờ VN) của ngày chứa thời điểm `date`, mặc định hôm nay
export function startOfVnDay(date = new Date()) {
  return new Date(Math.floor((date.getTime() + VN_OFFSET_MS) / DAY_MS) * DAY_MS - VN_OFFSET_MS);
}

// "2026-11-19" -> 0h ngày 19/11/2026 giờ VN
export const vnDate = (ymd) => new Date(`${ymd}T00:00:00+07:00`);

// Cộng / trừ số ngày
export const addDays = (date, days) => new Date(date.getTime() + days * DAY_MS);

// Món bán theo kg (hải sản sống ở hồ: tôm hùm, tôm sú, cua, cá mú, tôm tít). Giá của món là giá 1 kg;
// tại quán nhân viên hồ hải sản cân rồi mới tính tiền. Online không đặt được. Xem docs/24-thuc-don-ban-theo-kg.md
export const WEIGHT_UNIT = 'kg';
export const isSoldByWeight = (dish) => dish?.unit === WEIGHT_UNIT;
