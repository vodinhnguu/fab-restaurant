-- CreateTable
CREATE TABLE "ReservationTableChange" (
    "id" SERIAL NOT NULL,
    "reservationId" INTEGER NOT NULL,
    "fromTableCode" TEXT,
    "fromArea" TEXT,
    "toTableCode" TEXT NOT NULL,
    "toArea" TEXT NOT NULL,
    "reason" TEXT,
    "changedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReservationTableChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReservationTableChange_reservationId_idx" ON "ReservationTableChange"("reservationId");

-- AddForeignKey
ALTER TABLE "ReservationTableChange" ADD CONSTRAINT "ReservationTableChange_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationTableChange" ADD CONSTRAINT "ReservationTableChange_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
