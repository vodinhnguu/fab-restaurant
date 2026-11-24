-- CreateTable
CREATE TABLE "DrinkProduct" (
    "id" SERIAL NOT NULL,
    "dishId" INTEGER NOT NULL,
    "packSize" INTEGER NOT NULL DEFAULT 24,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DrinkProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrinkDayCheck" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "issuedPacks" INTEGER NOT NULL DEFAULT 0,
    "issuedUnits" INTEGER NOT NULL DEFAULT 0,
    "returnedUnits" INTEGER NOT NULL DEFAULT 0,
    "soldUnits" INTEGER NOT NULL DEFAULT 0,
    "diffUnits" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DrinkDayCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DrinkProduct_dishId_key" ON "DrinkProduct"("dishId");

-- CreateIndex
CREATE INDEX "DrinkDayCheck_date_idx" ON "DrinkDayCheck"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DrinkDayCheck_productId_date_key" ON "DrinkDayCheck"("productId", "date");

-- AddForeignKey
ALTER TABLE "DrinkProduct" ADD CONSTRAINT "DrinkProduct_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "Dish"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrinkDayCheck" ADD CONSTRAINT "DrinkDayCheck_productId_fkey" FOREIGN KEY ("productId") REFERENCES "DrinkProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrinkDayCheck" ADD CONSTRAINT "DrinkDayCheck_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
