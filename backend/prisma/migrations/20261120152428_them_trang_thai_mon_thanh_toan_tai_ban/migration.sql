-- CreateEnum
CREATE TYPE "OrderItemStatus" AS ENUM ('PENDING', 'COOKING', 'SERVED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "billPrintedAt" TIMESTAMP(3),
ADD COLUMN     "billRequestedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "cancelReason" TEXT,
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "servedAt" TIMESTAMP(3),
ADD COLUMN     "status" "OrderItemStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "OrderItem_orderId_status_idx" ON "OrderItem"("orderId", "status");

-- Dữ liệu cũ: món của đơn ăn tại quán lấy theo trạng thái đơn (đơn online giữ mặc định, không dùng tới)
UPDATE "OrderItem" i SET "status" = 'COOKING'
FROM "Order" o WHERE i."orderId" = o."id" AND o."type" = 'DINE_IN' AND o."status" = 'PREPARING';

UPDATE "OrderItem" i SET "status" = 'SERVED', "servedAt" = o."updatedAt"
FROM "Order" o WHERE i."orderId" = o."id" AND o."type" = 'DINE_IN' AND o."status" IN ('DELIVERING', 'COMPLETED');
