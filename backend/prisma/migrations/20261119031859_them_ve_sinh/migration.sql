-- CreateEnum
CREATE TYPE "CleaningStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CleaningPriority" AS ENUM ('NORMAL', 'URGENT');

-- CreateTable
CREATE TABLE "CleaningArea" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastCleanedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CleaningArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CleaningTask" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT,
    "areaId" INTEGER NOT NULL,
    "priority" "CleaningPriority" NOT NULL DEFAULT 'NORMAL',
    "status" "CleaningStatus" NOT NULL DEFAULT 'TODO',
    "assigneeId" INTEGER,
    "createdById" INTEGER,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "resultNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CleaningTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CleaningArea_name_key" ON "CleaningArea"("name");

-- CreateIndex
CREATE INDEX "CleaningTask_status_idx" ON "CleaningTask"("status");

-- CreateIndex
CREATE INDEX "CleaningTask_areaId_status_idx" ON "CleaningTask"("areaId", "status");

-- CreateIndex
CREATE INDEX "CleaningTask_assigneeId_idx" ON "CleaningTask"("assigneeId");

-- CreateIndex
CREATE INDEX "CleaningTask_completedAt_idx" ON "CleaningTask"("completedAt");

-- AddForeignKey
ALTER TABLE "CleaningTask" ADD CONSTRAINT "CleaningTask_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "CleaningArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CleaningTask" ADD CONSTRAINT "CleaningTask_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CleaningTask" ADD CONSTRAINT "CleaningTask_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- =============================================================
-- Dữ liệu: cấp quyền chức năng mới "Vệ sinh & dọn dẹp" (CLEANING) cho các vai trò có sẵn,
-- khớp DEFAULT_ROLES trong src/config/permissions.js. Database mới (chưa có vai trò) thì không
-- làm gì ở đây: seedDefaultRoles() tạo đủ quyền từ file config.
-- Vai trò đã có dòng CLEANING (admin tự tích) thì giữ nguyên (ON CONFLICT DO NOTHING).
-- =============================================================
INSERT INTO "RolePermission" ("roleId", "module", "canView", "canCreate", "canEdit", "canDelete")
SELECT r."id", 'CLEANING', p.v, p.c, p.e, p.d
FROM "StaffRole" r
JOIN (VALUES
  ('OWNER',        true, true, true, true),
  ('ADMIN',        true, true, true, true),
  ('MANAGER',      true, true, true, true),
  ('TEAM_LEAD',    true, true, true, false),
  ('WAITER',       true, true, false, false),
  ('RECEPTIONIST', true, true, false, false),
  ('KITCHEN',      true, true, false, false),
  ('CLEANER',      true, true, true, false)
) AS p(key, v, c, e, d) ON p.key = r."key"
ON CONFLICT ("roleId", "module") DO NOTHING;

-- Tạp vụ không dọn bàn (việc của phục vụ) nên không cần xem Đặt bàn.
-- Thiết bị & bảo trì: chỉ giữ quyền Thêm để báo hỏng (vòi nước rò, đèn nhà vệ sinh hỏng...).
UPDATE "RolePermission" SET "canView" = false, "canCreate" = false, "canEdit" = false, "canDelete" = false
WHERE "module" = 'RESERVATIONS' AND "roleId" IN (SELECT "id" FROM "StaffRole" WHERE "key" = 'CLEANER');

UPDATE "RolePermission" SET "canView" = false, "canCreate" = true, "canEdit" = false, "canDelete" = false
WHERE "module" = 'FACILITY' AND "roleId" IN (SELECT "id" FROM "StaffRole" WHERE "key" = 'CLEANER');

UPDATE "StaffRole"
SET "description" = 'Vệ sinh quanh nhà hàng: rửa chén bát, rửa ly, quét lau sàn, dọn nhà vệ sinh, đổ rác (dọn bàn là việc của phục vụ)'
WHERE "key" = 'CLEANER' AND "description" = 'Vệ sinh khu vực ăn uống, nhà vệ sinh, dọn bàn sau khi khách về';

UPDATE "StaffRole"
SET "description" = 'Đón khách tại bàn, ghi món, tư vấn hải sản trong hồ, dọn bàn sau khi khách về'
WHERE "key" = 'WAITER' AND "description" = 'Đón khách tại bàn, ghi món, tư vấn hải sản trong hồ';
