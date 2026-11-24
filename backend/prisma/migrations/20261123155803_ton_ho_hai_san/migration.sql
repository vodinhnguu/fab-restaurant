-- CreateEnum
CREATE TYPE "TankEntryType" AS ENUM ('IMPORT', 'SALE', 'RETURN', 'AUDIT', 'LOSS');

-- AlterTable
ALTER TABLE "Dish" ADD COLUMN     "tankItemId" INTEGER;

-- CreateTable
CREATE TABLE "TankItem" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "note" TEXT,
    "stockKg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lowStockKg" DOUBLE PRECISION NOT NULL DEFAULT 2,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TankItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TankEntry" (
    "id" SERIAL NOT NULL,
    "tankItemId" INTEGER NOT NULL,
    "type" "TankEntryType" NOT NULL,
    "deltaKg" DOUBLE PRECISION NOT NULL,
    "stockAfter" DOUBLE PRECISION NOT NULL,
    "unitCost" INTEGER,
    "supplier" TEXT,
    "note" TEXT,
    "userId" INTEGER,
    "orderId" INTEGER,
    "orderItemId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TankEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TankItem_name_key" ON "TankItem"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TankItem_slug_key" ON "TankItem"("slug");

-- CreateIndex
CREATE INDEX "TankEntry_tankItemId_createdAt_idx" ON "TankEntry"("tankItemId", "createdAt");

-- CreateIndex
CREATE INDEX "TankEntry_type_createdAt_idx" ON "TankEntry"("type", "createdAt");

-- CreateIndex
CREATE INDEX "TankEntry_orderItemId_idx" ON "TankEntry"("orderItemId");

-- CreateIndex
CREATE INDEX "Dish_tankItemId_idx" ON "Dish"("tankItemId");

-- AddForeignKey
ALTER TABLE "Dish" ADD CONSTRAINT "Dish_tankItemId_fkey" FOREIGN KEY ("tankItemId") REFERENCES "TankItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TankEntry" ADD CONSTRAINT "TankEntry_tankItemId_fkey" FOREIGN KEY ("tankItemId") REFERENCES "TankItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TankEntry" ADD CONSTRAINT "TankEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TankEntry" ADD CONSTRAINT "TankEntry_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
