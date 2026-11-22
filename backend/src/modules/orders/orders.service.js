import { env, isVnpayEnabled } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { can } from '../permissions/permissions.service.js';
import { ApiError } from '../../utils/ApiError.js';
import { isSoldByWeight, withUniqueCode } from '../../utils/helpers.js';
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

// Đơn ăn tại quán (DINE_IN, docs/23-app-nhan-vien-phuc-vu.md): tạo ra là CONFIRMED; DELIVERING nghĩa là "Đã lên món";
// thu tiền (COMPLETED) được ở mọi bước vì khách có thể trả tiền trước khi bếp làm xong món cuối
export const DINE_IN_FLOW = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'DELIVERING', 'COMPLETED', 'CANCELLED'],
  PREPARING: ['DELIVERING', 'COMPLETED', 'CANCELLED'],
  DELIVERING: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

export const orderInclude = {
  items: { orderBy: { id: 'asc' }, include: { dish: { select: { image: true, slug: true } } } },
  table: { select: { id: true, code: true, area: true } },
};

export async function createOrder(input, user) {
  if (input.paymentMethod === 'ONLINE' && !isVnpayEnabled()) {
    throw ApiError.badRequest('Nhà hàng chưa bật thanh toán online, vui lòng chọn thanh toán khi nhận hàng');
  }

  // Gộp các dòng trùng món (ghi chú của các dòng trùng nối lại bằng "; ")
  const qtyByDish = new Map();
  const noteByDish = new Map();
  for (const { dishId, quantity, note } of input.items) {
    qtyByDish.set(dishId, (qtyByDish.get(dishId) || 0) + quantity);
    if (note) noteByDish.set(dishId, [noteByDish.get(dishId), note].filter(Boolean).join('; '));
  }

  // Lỗi trong transaction của PostgreSQL làm hỏng cả transaction -> trùng mã thì phải chạy lại cả transaction
  return withUniqueCode('FAB', (code) => prisma.$transaction(async (tx) => {
    // 1. Lấy giá từ DB - KHÔNG BAO GIỜ tin giá do client gửi lên
    const dishes = await tx.dish.findMany({ where: { id: { in: [...qtyByDish.keys()] } } });
    if (dishes.length !== qtyByDish.size) throw ApiError.badRequest('Có món không tồn tại');

    const items = dishes.map((d) => {
      if (!d.isAvailable) throw ApiError.badRequest(`Món "${d.name}" hiện đã hết`);
      if (isSoldByWeight(d)) {
        throw ApiError.badRequest(`Món "${d.name}" bán theo kg, cần chọn và cân tại hồ. Vui lòng đặt bàn để thưởng thức tại quán`);
      }
      return { dishId: d.id, name: d.name, price: d.salePrice ?? d.price, quantity: qtyByDish.get(d.id), note: noteByDish.get(d.id) ?? null };
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

// Tìm đơn theo mã, chỉ cho xem nếu là chủ đơn / nhân viên có quyền / biết đúng SĐT đặt hàng.
// action: quyền cần có trên ORDERS (xem = 'view', hủy = 'edit')
export async function findAccessibleOrder(code, user, phone, action = 'view') {
  const order = await prisma.order.findUnique({ where: { code }, include: orderInclude });
  if (!order) throw ApiError.notFound('Không tìm thấy đơn hàng');

  const isOwner = user && order.userId === user.id;
  const isStaff = can(user, 'ORDERS', action);
  const phoneMatch = phone && phone.replace(/\s/g, '') === order.phone;
  if (!isOwner && !isStaff && !phoneMatch) throw ApiError.notFound('Không tìm thấy đơn hàng');

  return order;
}

// cancelReason: lý do khi NHÀ HÀNG hủy (khách tự hủy thì không truyền -> để trống)
export async function changeStatus(order, nextStatus, cancelReason = null) {
  const flow = order.type === 'DINE_IN' ? DINE_IN_FLOW : STATUS_FLOW;
  if (!flow[order.status].includes(nextStatus)) {
    throw ApiError.badRequest(`Không thể chuyển đơn từ ${order.status} sang ${nextStatus}`);
  }

  const data = { status: nextStatus };
  if (nextStatus === 'CANCELLED') data.cancelReason = cancelReason || null;
  // COD hoàn thành = đã thu tiền
  if (nextStatus === 'COMPLETED' && order.paymentMethod === 'COD') data.paymentStatus = 'PAID';
  // Hủy đơn đã thanh toán = hoàn tiền
  if (nextStatus === 'CANCELLED' && order.paymentStatus === 'PAID') data.paymentStatus = 'REFUNDED';

  return prisma.$transaction(async (tx) => {
    if (nextStatus === 'CANCELLED') {
      // Trả lại số lượng đã bán và lượt dùng mã giảm giá (món đã hủy lẻ trước đó thì đã trả rồi, bỏ qua)
      const items = await tx.orderItem.findMany({ where: { orderId: order.id, status: { not: 'CANCELLED' } } });
      for (const i of items) {
        await tx.dish.update({ where: { id: i.dishId }, data: { soldCount: { decrement: i.quantity } } });
      }
      if (order.couponCode) {
        await tx.coupon.updateMany({ where: { code: order.couponCode }, data: { usedCount: { decrement: 1 } } });
      }
    }
    if (order.type === 'DINE_IN') await syncDineInItems(tx, order.id, nextStatus, cancelReason);
    return tx.order.update({ where: { id: order.id }, data, include: orderInclude });
  });
}

// Đơn tại quán bị đổi trạng thái cả đơn trên web (trang Đơn hàng) -> đổi trạng thái các món cho khớp
// (bình thường trạng thái đơn tự suy ra từ món, xem syncOrderStatus trong dine-in.service.js)
async function syncDineInItems(tx, orderId, nextStatus, cancelReason) {
  const where = (from) => ({ orderId, status: { in: from } });
  if (nextStatus === 'PREPARING') {
    await tx.orderItem.updateMany({ where: where(['PENDING']), data: { status: 'COOKING' } });
  } else if (nextStatus === 'DELIVERING') {
    await tx.orderItem.updateMany({ where: where(['PENDING', 'COOKING']), data: { status: 'SERVED', servedAt: new Date() } });
  } else if (nextStatus === 'CANCELLED') {
    await tx.orderItem.updateMany({
      where: where(['PENDING', 'COOKING', 'SERVED']),
      data: { status: 'CANCELLED', cancelReason: cancelReason || 'Hủy cả đơn', cancelledAt: new Date() },
    });
  }
}
