// Tạo 1 instance PrismaClient dùng chung cho toàn app (tránh mở quá nhiều kết nối DB)
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
