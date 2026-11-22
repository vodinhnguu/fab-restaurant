-- CreateEnum
CREATE TYPE "RepairStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_PARTS', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RepairType" AS ENUM ('REPAIR', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "RepairPriority" AS ENUM ('NORMAL', 'URGENT');

-- CreateTable
CREATE TABLE "Equipment" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "location" TEXT,
    "maintenanceDays" INTEGER,
    "lastMaintainedAt" TIMESTAMP(3),
    "note" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepairTicket" (
    "id" SERIAL NOT NULL,
    "type" "RepairType" NOT NULL DEFAULT 'REPAIR',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "equipmentId" INTEGER NOT NULL,
    "priority" "RepairPriority" NOT NULL DEFAULT 'NORMAL',
    "status" "RepairStatus" NOT NULL DEFAULT 'OPEN',
    "reportedById" INTEGER,
    "assigneeId" INTEGER,
    "waitingNote" TEXT,
    "resolution" TEXT,
    "cost" INTEGER,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepairTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_name_key" ON "Equipment"("name");

-- CreateIndex
CREATE INDEX "RepairTicket_status_idx" ON "RepairTicket"("status");

-- CreateIndex
CREATE INDEX "RepairTicket_equipmentId_status_idx" ON "RepairTicket"("equipmentId", "status");

-- CreateIndex
CREATE INDEX "RepairTicket_assigneeId_idx" ON "RepairTicket"("assigneeId");

-- CreateIndex
CREATE INDEX "RepairTicket_reportedById_idx" ON "RepairTicket"("reportedById");

-- CreateIndex
CREATE INDEX "RepairTicket_completedAt_idx" ON "RepairTicket"("completedAt");

-- AddForeignKey
ALTER TABLE "RepairTicket" ADD CONSTRAINT "RepairTicket_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairTicket" ADD CONSTRAINT "RepairTicket_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairTicket" ADD CONSTRAINT "RepairTicket_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
