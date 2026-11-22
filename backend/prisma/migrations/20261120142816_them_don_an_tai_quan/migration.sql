-- Đơn ăn tại quán: nhân viên phục vụ ghi món tại bàn bằng app mobile (docs/23-app-nhan-vien-phuc-vu.md)

-- AlterEnum
ALTER TYPE "OrderType" ADD VALUE 'DINE_IN';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "staffId" INTEGER,
ADD COLUMN     "tableId" INTEGER;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Order_tableId_status_idx" ON "Order"("tableId", "status");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "DiningTable"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
