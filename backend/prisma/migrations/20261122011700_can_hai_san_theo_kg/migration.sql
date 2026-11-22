-- AlterEnum
ALTER TYPE "OrderItemStatus" ADD VALUE 'WEIGHING';

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "weighedAt" TIMESTAMP(3),
ADD COLUMN     "weight" DOUBLE PRECISION;
