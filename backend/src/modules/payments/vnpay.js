// Các hàm làm việc với VNPay (phiên bản API 2.1.0). Tài liệu: docs/11-thanh-toan-vnpay.md
// File này chỉ tính toán, không đụng DB -> dễ đọc, dễ test.
import crypto from 'node:crypto';
import { env } from '../../config/env.js';

// Sắp xếp tham số theo tên (a-z) rồi nối thành chuỗi "k1=v1&k2=v2".
// Giá trị được mã hóa URL, dấu cách thành "+" - đúng cách code mẫu của VNPay làm,
// lệch 1 ký tự là chữ ký sai và VNPay báo "Sai chữ ký".
function buildQuery(params) {
  return Object.keys(params)
    .sort()
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key]).replace(/%20/g, '+')}`)
    .join('&');
}

// Chữ ký = HMAC-SHA512(chuỗi tham số, khóa bí mật). Chỉ ai giữ khóa (mình + VNPay) mới tạo được
function sign(query) {
  return crypto.createHmac('sha512', env.vnpay.hashSecret).update(Buffer.from(query, 'utf-8')).digest('hex');
}

// "yyyyMMddHHmmss" theo giờ Việt Nam (VNPay yêu cầu GMT+7)
function vnTime(date) {
  const d = new Date(date.getTime() + 7 * 3600 * 1000);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}`;
}

// Tạo link thanh toán để chuyển khách sang trang VNPay
export function buildPaymentUrl({ txnRef, amount, orderInfo, ipAddr, expireMinutes = 15 }) {
  const now = new Date();
  const params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: env.vnpay.tmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: orderInfo, // Nên viết không dấu
    vnp_OrderType: 'other',
    vnp_Amount: amount * 100, // VNPay tính theo đơn vị nhỏ nhất: 100.000đ -> 10000000
    vnp_ReturnUrl: env.vnpay.returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: vnTime(now),
    vnp_ExpireDate: vnTime(new Date(now.getTime() + expireMinutes * 60 * 1000)),
  };
  const query = buildQuery(params);
  return `${env.vnpay.payUrl}?${query}&vnp_SecureHash=${sign(query)}`;
}

// Kiểm tra dữ liệu VNPay gửi về (IPN hoặc return URL) có đúng là của VNPay không.
// Bỏ 2 trường chữ ký ra, ký lại phần còn lại rồi so sánh.
export function verifySignature(query) {
  const { vnp_SecureHash: received, vnp_SecureHashType, ...rest } = query; // eslint-disable-line no-unused-vars
  if (typeof received !== 'string') return false;
  const expected = sign(buildQuery(rest));
  // timingSafeEqual: so sánh mất thời gian như nhau dù sai ở ký tự nào -> không đoán dần được chữ ký
  const a = Buffer.from(expected, 'utf-8');
  const b = Buffer.from(received.toLowerCase(), 'utf-8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Ý nghĩa một số vnp_ResponseCode hay gặp (bảng đầy đủ trong tài liệu VNPay)
export const RESPONSE_MESSAGES = {
  '00': 'Giao dịch thành công',
  '07': 'Trừ tiền thành công nhưng giao dịch bị nghi ngờ, vui lòng liên hệ nhà hàng',
  '09': 'Thẻ/Tài khoản chưa đăng ký Internet Banking',
  10: 'Xác thực thông tin thẻ/tài khoản sai quá 3 lần',
  11: 'Đã hết thời gian chờ thanh toán',
  12: 'Thẻ/Tài khoản bị khóa',
  13: 'Nhập sai mật khẩu OTP',
  24: 'Bạn đã hủy giao dịch',
  51: 'Tài khoản không đủ số dư',
  65: 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày',
  75: 'Ngân hàng thanh toán đang bảo trì',
  79: 'Nhập sai mật khẩu thanh toán quá số lần quy định',
  99: 'Lỗi không xác định',
};

// Chuyển chuỗi "yyyyMMddHHmmss" (giờ VN) của VNPay thành Date
export function parseVnTime(s) {
  const m = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(s ?? '');
  return m ? new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}+07:00`) : null;
}
