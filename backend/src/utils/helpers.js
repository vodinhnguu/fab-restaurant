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

// Sinh mã dạng PREFIX + yyMMdd + 4 số ngẫu nhiên, vd: FAB2610014821
export function generateCode(prefix) {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${yy}${mm}${dd}${rand}`;
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
