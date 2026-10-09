import { ApiError } from '../../utils/ApiError.js';
import { findAccessibleOrder } from '../orders/orders.service.js';
import * as paymentService from './payments.service.js';

// IP của khách (VNPay bắt buộc gửi kèm). "::ffff:1.2.3.4" là IPv4 viết dạng IPv6 -> bỏ phần đầu
function clientIp(req) {
  const ip = (req.ip || '127.0.0.1').replace(/^::ffff:/, '');
  return ip === '::1' ? '127.0.0.1' : ip;
}

// POST /payments/vnpay/:code  { phone }  -> { paymentUrl }
// Frontend nhận link rồi chuyển khách sang trang VNPay
export async function createVnpay(req, res) {
  const order = await findAccessibleOrder(req.params.code, req.user, req.body.phone);
  const paymentUrl = await paymentService.createVnpayPayment(order, clientIp(req));
  res.status(201).json({ success: true, data: { paymentUrl } });
}

// GET /payments/vnpay/ipn?vnp_...  - CHỈ máy chủ VNPay gọi.
// Phải luôn trả HTTP 200 + { RspCode, Message } đúng mẫu, nếu không VNPay sẽ gọi lại nhiều lần.
export async function vnpayIpn(req, res) {
  try {
    const { rspCode, message } = await paymentService.handleVnpayResult(req.query);
    res.json({ RspCode: rspCode, Message: message });
  } catch (err) {
    console.error('[VNPay IPN]', err);
    res.json({ RspCode: '99', Message: 'Unknown error' });
  }
}

// GET /payments/vnpay/return?vnp_...  - trang /payment/vnpay-return của frontend gửi nguyên query lên đây.
// Kiểm tra chữ ký rồi ghi nhận luôn (khi chạy ở máy cá nhân, VNPay không gọi IPN vào localhost được).
export async function vnpayReturn(req, res) {
  const { rspCode, payment } = await paymentService.handleVnpayResult(req.query);
  if (rspCode === '97') throw ApiError.badRequest('Dữ liệu thanh toán không hợp lệ (sai chữ ký)');
  if (!payment) throw ApiError.notFound('Không tìm thấy giao dịch');
  if (rspCode === '04') throw ApiError.badRequest('Số tiền thanh toán không khớp với đơn hàng');

  res.json({
    success: true,
    data: {
      paid: payment.status === 'SUCCESS',
      message: paymentService.describePayment(payment),
      amount: payment.amount,
      transactionNo: payment.transactionNo,
      bankCode: payment.bankCode,
      // Để trang kết quả mở được chi tiết đơn (khách không đăng nhập cần cả SĐT)
      orderCode: payment.order.code,
      phone: payment.order.phone,
    },
  });
}
