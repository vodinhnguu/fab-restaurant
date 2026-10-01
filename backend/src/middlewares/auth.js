import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { ApiError } from '../utils/ApiError.js';

// Lấy token từ header "Authorization: Bearer <token>"
function getToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

async function loadUser(token) {
  const payload = jwt.verify(token, env.jwtSecret);
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive) throw ApiError.unauthorized('Tài khoản không tồn tại hoặc đã bị khóa');
  return user;
}

// Bắt buộc đăng nhập
export async function requireAuth(req, res, next) {
  const token = getToken(req);
  if (!token) throw ApiError.unauthorized();
  try {
    req.user = await loadUser(token);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw ApiError.unauthorized('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
  }
  next();
}

// Không bắt buộc: có token hợp lệ thì gắn req.user, không thì bỏ qua (vd: đặt hàng không cần tài khoản)
export async function optionalAuth(req, res, next) {
  const token = getToken(req);
  if (token) {
    try {
      req.user = await loadUser(token);
    } catch {
      // token sai/hết hạn -> coi như khách vãng lai
    }
  }
  next();
}

// Chỉ cho phép các role được liệt kê, dùng SAU requireAuth
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) throw ApiError.forbidden();
    next();
  };
}

export const requireAdmin = [requireAuth, requireRole('ADMIN')];
