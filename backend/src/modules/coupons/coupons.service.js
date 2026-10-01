import { ApiError } from '../../utils/ApiError.js';

// Kiểm tra mã giảm giá và tính số tiền được giảm cho 1 đơn có tổng tiền `subtotal`
// db: có thể là prisma hoặc tx (trong transaction)
export async function applyCoupon(db, code, subtotal) {
  const coupon = await db.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
  const now = new Date();

  if (!coupon || !coupon.isActive) throw ApiError.badRequest('Mã giảm giá không tồn tại');
  if (coupon.startsAt && coupon.startsAt > now) throw ApiError.badRequest('Mã giảm giá chưa đến thời gian áp dụng');
  if (coupon.expiresAt && coupon.expiresAt < now) throw ApiError.badRequest('Mã giảm giá đã hết hạn');
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw ApiError.badRequest('Mã giảm giá đã hết lượt sử dụng');
  }
  if (subtotal < coupon.minOrder) {
    throw ApiError.badRequest(`Đơn tối thiểu ${coupon.minOrder.toLocaleString('vi-VN')}đ để dùng mã này`);
  }

  let discount = coupon.type === 'PERCENT' ? Math.floor((subtotal * coupon.value) / 100) : coupon.value;
  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  discount = Math.min(discount, subtotal);

  return { coupon, discount };
}
