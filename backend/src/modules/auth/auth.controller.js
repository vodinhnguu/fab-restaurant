import { prisma } from '../../lib/prisma.js';
import * as authService from './auth.service.js';

export async function register(req, res) {
  const data = await authService.register(req.body);
  res.status(201).json({ success: true, data });
}

export async function login(req, res) {
  const data = await authService.login(req.body);
  res.json({ success: true, data });
}

export async function me(req, res) {
  res.json({ success: true, data: authService.toPublicUser(req.user) });
}

export async function updateProfile(req, res) {
  const user = await prisma.user.update({ where: { id: req.user.id }, data: req.body });
  res.json({ success: true, data: authService.toPublicUser(user) });
}

export async function changePassword(req, res) {
  await authService.changePassword(req.user, req.body);
  res.json({ success: true, message: 'Đổi mật khẩu thành công' });
}
