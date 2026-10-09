import { env, isVnpayEnabled } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { withUniqueCode } from '../../utils/helpers.js';
import { applyCoupon } from '../coupons/coupons.service.js';

// Các bước chuyển trạng thái hợp lệ (state machine)
export const STATUS_FLOW = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['DELIVERING', 'COMPLETED', 'CANCELLED'],
  DELIVERING: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

const orderInclude = { items: { include: { dish: { select: { image: true, slug: true } } } } };

export async function createOrder(input, user) {
  if (input.paymentMethod === 'ONLINE' && !isVnpayEnabled()) {
    throw ApiError.badRequest('Nhà hàng chưa bật thanh toán online, vui lòng chọn thanh toán khi nhận hàng');
  }

  // Gộp các dòng trùng món
  const qtyByDish = new Map();
  for (const { dishId, quantity } of input.items) {
    qtyByDish.set(dishId, (qtyByDish.get(dishId) || 0) + quantity);
  }

  // Lỗi trong transaction của PostgreSQL làm hỏng cả transaction -> trùng mã thì phải chạy lại cả transaction
  return withUniqueCode('FAB', (code) => prisma.$transaction(async (tx) => {
    // 1. Lấy giá từ DB - KHÔNG BAO GIỜ tin giá do client gửi lên
    const dishes = await tx.dish.findMany({ where: { id: { in: [...qtyByDish.keys()] } } });
    if (dishes.length !== qtyByDish.size) throw ApiError.badRequest('Có món không tồn tại');

    const items = dishes.map((d) => {
      if (!d.isAvailable) throw ApiError.badRequest(`Món "${d.name}" hiện đã hết`);
      return { dishId: d.id, name: d.name, price: d.salePrice ?? d.price, quantity: qtyByDish.get(d.id) };
    });

    // 2. Tính tiền
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shippingFee = input.type === 'DELIVERY' && subtotal < env.freeShippingMin ? env.shippingFee : 0;

    let discount = 0;
    let couponCode = null;
    if (input.couponCode) {
      const applied = await applyCoupon(tx, input.couponCode, subtotal);
      discount = applied.discount;
      couponCode = applied.coupon.code;
      // Kiểm tra lượt dùng + cộng lượt trong CÙNG 1 câu UPDATE.
      // Nếu tách riêng "đọc usedCount rồi mới cộng", 2 đơn đặt cùng lúc đều thấy "còn 1 lượt" và cùng dùng được mã.
      // PostgreSQL khóa dòng khi UPDATE nên đơn thứ 2 phải chờ, rồi kiểm tra lại điều kiện với số lượt mới nhất.
      const { count } = await tx.coupon.updateMany({
        where: {
          id: applied.coupon.id,
          OR: [{ usageLimit: null }, { usedCount: { lt: tx.coupon.fields.usageLimit } }],
        },
        data: { usedCount: { increment: 1 } },
      });
      if (count === 0) throw ApiError.badRequest('Mã giảm giá đã hết lượt sử dụng');
    }

    // 3. Tạo đơn + chi tiết đơn
    const order = await tx.order.create({
      data: {
        code,
        userId: user?.id ?? null,
        customerName: input.customerName,
        phone: input.phone,
        address: input.type === 'DELIVERY' ? input.address : null,
        type: input.type,
        paymentMethod: input.paymentMethod,
        note: input.note,
        couponCode,
        subtotal,
        discount,
        shippingFee,
        total: subtotal - discount + shippingFee,
        items: { create: items },
      },
      include: orderInclude,
    });

    // 4. Cập nhật số lượng đã bán
    for (const i of items) {
      await tx.dish.update({ where: { id: i.dishId }, data: { soldCount: { increment: i.quantity } } });
    }

    return order;
  }));
}

// Tìm đơn theo mã, chỉ cho xem nếu là chủ đơn / admin / biết đúng SĐT đặt hàng
export async function findAccessibleOrder(code, user, phone) {
  const order = await prisma.order.findUnique({ where: { code }, include: orderInclude });
  if (!order) throw ApiError.notFound('Không tìm thấy đơn hàng');

  const isOwner = user && order.userId === user.id;
  const isAdmin = user?.role === 'ADMIN';
  const phoneMatch = phone && phone.replace(/\s/g, '') === order.phone;
  if (!isOwner && !isAdmin && !phoneMatch) throw ApiError.notFound('Không tìm thấy đơn hàng');

  return order;
}

export async function changeStatus(order, nextStatus) {
  if (!STATUS_FLOW[order.status].includes(nextStatus)) {
    throw ApiError.badRequest(`Không thể chuyển đơn từ ${order.status} sang ${nextStatus}`);
  }

  const data = { status: nextStatus };
  // COD hoàn thành = đã thu tiền
  if (nextStatus === 'COMPLETED' && order.paymentMethod === 'COD') data.paymentStatus = 'PAID';
  // Hủy đơn đã thanh toán = hoàn tiền
  if (nextStatus === 'CANCELLED' && order.paymentStatus === 'PAID') data.paymentStatus = 'REFUNDED';

  return prisma.$transaction(async (tx) => {
    if (nextStatus === 'CANCELLED') {
      // Trả lại số lượng đã bán và lượt dùng mã giảm giá
      const items = await tx.orderItem.findMany({ where: { orderId: order.id } });
      for (const i of items) {
        await tx.dish.update({ where: { id: i.dishId }, data: { soldCount: { decrement: i.quantity } } });
      }
      if (order.couponCode) {
        await tx.coupon.updateMany({ where: { code: order.couponCode }, data: { usedCount: { decrement: 1 } } });
      }
    }
    return tx.order.update({ where: { id: order.id }, data, include: orderInclude });
  });
}
