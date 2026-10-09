import { isVnpayEnabled } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { buildPaymentUrl, parseVnTime, RESPONSE_MESSAGES, verifySignature } from './vnpay.js';

const VNPAY_MIN_AMOUNT = 5000; // VNPay không nhận giao dịch dưới 5.000đ

// Tạo 1 lần thanh toán mới cho đơn và trả về link VNPay
export async function createVnpayPayment(order, ipAddr) {
  if (!isVnpayEnabled()) throw new ApiError(503, 'Nhà hàng chưa bật thanh toán online');
  if (order.paymentMethod !== 'ONLINE') throw ApiError.badRequest('Đơn này thanh toán khi nhận hàng');
  if (order.paymentStatus !== 'UNPAID') throw ApiError.badRequest('Đơn đã được thanh toán');
  if (order.status === 'CANCELLED') throw ApiError.badRequest('Đơn đã bị hủy');
  if (order.total < VNPAY_MIN_AMOUNT) throw ApiError.badRequest('Số tiền quá nhỏ để thanh toán online');

  // Mỗi lần bấm thanh toán dùng 1 mã giao dịch mới: VNPay không cho dùng lại mã cũ
  // (khách hủy rồi bấm trả lại thì phải là giao dịch khác)
  const txnRef = `${order.code}${Date.now().toString(36).toUpperCase()}`;
  await prisma.payment.create({ data: { orderId: order.id, txnRef, amount: order.total } });

  return buildPaymentUrl({
    txnRef,
    amount: order.total,
    orderInfo: `Thanh toan don hang ${order.code}`,
    ipAddr,
  });
}

// Xử lý kết quả VNPay gửi về. Dùng chung cho:
//  - IPN: máy chủ VNPay gọi thẳng vào backend (đáng tin nhất, chạy cả khi khách tắt trình duyệt)
//  - Return URL: khách được chuyển về web kèm kết quả (cũng có chữ ký nên tin được)
// Ai đến trước thì ghi nhận, ai đến sau thấy "đã xử lý" -> không bao giờ ghi 2 lần.
// Trả về { rspCode, message } theo đúng định dạng VNPay yêu cầu cho IPN, kèm payment để trang kết quả dùng.
export async function handleVnpayResult(query) {
  if (!verifySignature(query)) return { rspCode: '97', message: 'Invalid signature' };

  const payment = await prisma.payment.findUnique({
    where: { txnRef: String(query.vnp_TxnRef) },
    include: { order: true },
  });
  if (!payment) return { rspCode: '01', message: 'Order not found' };
  if (Number(query.vnp_Amount) / 100 !== payment.amount) return { rspCode: '04', message: 'Invalid amount', payment };
  if (payment.status !== 'PENDING') return { rspCode: '02', message: 'Order already confirmed', payment };

  // Thành công khi CẢ HAI mã đều là "00"
  const success = query.vnp_ResponseCode === '00' && query.vnp_TransactionStatus === '00';

  const updated = await prisma.$transaction(async (tx) => {
    // where status PENDING: IPN và return đến cùng lúc thì chỉ 1 bên cập nhật được
    const { count } = await tx.payment.updateMany({
      where: { id: payment.id, status: 'PENDING' },
      data: {
        status: success ? 'SUCCESS' : 'FAILED',
        transactionNo: query.vnp_TransactionNo ?? null,
        bankCode: query.vnp_BankCode ?? null,
        responseCode: query.vnp_ResponseCode ?? null,
        paidAt: success ? parseVnTime(query.vnp_PayDate) : null,
        rawData: query,
      },
    });
    if (count === 0) return null;
    if (success) {
      await tx.order.updateMany({ where: { id: payment.orderId, paymentStatus: 'UNPAID' }, data: { paymentStatus: 'PAID' } });
    }
    return tx.payment.findUnique({ where: { id: payment.id }, include: { order: true } });
  });

  if (!updated) {
    // Bên kia (IPN/return) vừa ghi nhận trước -> đọc lại kết quả mới nhất, `payment` ở trên đã cũ (còn PENDING)
    const latest = await prisma.payment.findUnique({ where: { id: payment.id }, include: { order: true } });
    return { rspCode: '02', message: 'Order already confirmed', payment: latest };
  }
  return { rspCode: '00', message: 'Confirm Success', payment: updated };
}

// Lời nhắn cho khách dựa trên kết quả của 1 lần thanh toán
export function describePayment(payment) {
  if (payment.status === 'SUCCESS') return 'Thanh toán thành công';
  if (payment.status === 'PENDING') return 'Đang chờ VNPay xác nhận thanh toán';
  return RESPONSE_MESSAGES[payment.responseCode] ?? 'Thanh toán không thành công';
}
