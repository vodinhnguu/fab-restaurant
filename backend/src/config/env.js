// Đọc biến môi trường từ file .env một lần duy nhất và export ra để dùng chung
import 'dotenv/config';

const required = ['DATABASE_URL', 'JWT_SECRET'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Thiếu biến môi trường ${key}. Hãy copy .env.example thành .env`);
  }
}

export const env = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim()),
  shippingFee: Number(process.env.SHIPPING_FEE) || 20000,
  freeShippingMin: Number(process.env.FREE_SHIPPING_MIN) || 500000,

  // VNPay - không bắt buộc: bỏ trống thì web chỉ nhận thanh toán tiền mặt (COD)
  vnpay: {
    tmnCode: process.env.VNP_TMN_CODE || '',
    hashSecret: process.env.VNP_HASH_SECRET || '',
    payUrl: process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    // Trang frontend mà VNPay đưa khách quay về sau khi trả tiền
    returnUrl: process.env.VNP_RETURN_URL || 'http://localhost:5173/payment/vnpay-return',
  },
};

export const isVnpayEnabled = () => Boolean(env.vnpay.tmnCode && env.vnpay.hashSecret);
