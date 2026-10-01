import { prisma } from '../../lib/prisma.js';
import { applyCoupon } from './coupons.service.js';

// Khách: kiểm tra mã trước khi đặt hàng
export async function check(req, res) {
  const { coupon, discount } = await applyCoupon(prisma, req.body.code, req.body.subtotal);
  res.json({ success: true, data: { code: coupon.code, description: coupon.description, discount } });
}

// Khách: danh sách mã đang có hiệu lực (hiển thị gợi ý ở trang thanh toán)
export async function listPublic(req, res) {
  const now = new Date();
  const coupons = await prisma.coupon.findMany({
    where: {
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
      AND: [{ OR: [{ startsAt: null }, { startsAt: { lte: now } }] }],
    },
    select: { code: true, description: true, type: true, value: true, minOrder: true, maxDiscount: true, expiresAt: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: coupons });
}

// ---- Admin ----
export async function list(req, res) {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ success: true, data: coupons });
}

export async function create(req, res) {
  const coupon = await prisma.coupon.create({ data: req.body });
  res.status(201).json({ success: true, data: coupon });
}

export async function update(req, res) {
  const coupon = await prisma.coupon.update({ where: { id: Number(req.params.id) }, data: req.body });
  res.json({ success: true, data: coupon });
}

export async function remove(req, res) {
  await prisma.coupon.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true, message: 'Đã xóa mã giảm giá' });
}
