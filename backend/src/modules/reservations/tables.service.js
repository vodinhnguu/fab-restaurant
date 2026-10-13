import { restaurant } from '../../config/restaurant.js';
import { seedDefaultTables } from '../../config/tables.js';
import { ApiError } from '../../utils/ApiError.js';

// Lịch ở các trạng thái này đang giữ bàn. Lịch đã hủy thì bàn được trả lại.
// COMPLETED = khách đã đến, có thể vẫn đang ăn nên vẫn tính là bàn bận.
const HOLDING = ['PENDING', 'CONFIRMED', 'COMPLETED'];
const DURATION = restaurant.diningMinutes * 60 * 1000;

// Các lịch "đè giờ" lên thời điểm `date`: bắt đầu trong khoảng (date - 2 tiếng, date + 2 tiếng)
function overlapping(date, extraWhere = {}) {
  return {
    status: { in: HOLDING },
    tableId: { not: null },
    date: { gt: new Date(date.getTime() - DURATION), lt: new Date(date.getTime() + DURATION) },
    ...extraWhere,
  };
}

// Sơ đồ bàn theo khu vực + trạng thái tại thời điểm `date`.
// showDetails = nhân viên có quyền xem đặt bàn -> kèm tên, SĐT khách; khách thường chỉ thấy trống / bận.
export async function tableMap(db, date, showDetails) {
  if ((await db.diningTable.count()) === 0) await seedDefaultTables(db); // DB mới -> tự tạo bàn mặc định

  const [tables, busy] = await Promise.all([
    db.diningTable.findMany({ orderBy: [{ y: 'asc' }, { x: 'asc' }] }),
    db.reservation.findMany({ where: overlapping(date), orderBy: { date: 'asc' } }),
  ]);

  const areas = restaurant.reservationAreas.map((name) => {
    const list = tables.filter((t) => t.area === name);
    return {
      name,
      cols: Math.max(1, ...list.map((t) => t.x)),
      rows: Math.max(1, ...list.map((t) => t.y)),
      tables: list.map((t) => {
        const r = busy.find((b) => b.tableId === t.id);
        let status = 'free';
        if (!t.isActive) status = 'inactive';
        else if (r) status = r.status === 'PENDING' ? 'pending' : 'occupied';
        return {
          id: t.id,
          code: t.code,
          seats: t.seats,
          x: t.x,
          y: t.y,
          status,
          reservation: showDetails && r ? { id: r.id, code: r.code, name: r.name, phone: r.phone, guests: r.guests, date: r.date, status: r.status } : undefined,
        };
      }),
    };
  });
  return { diningMinutes: restaurant.diningMinutes, areas };
}

// Kiểm tra bàn khách chọn có đặt được không. Gọi BÊN TRONG transaction tạo lịch.
export async function assertTableAvailable(tx, tableId, date, guests) {
  const table = await tx.diningTable.findUnique({ where: { id: tableId } });
  if (!table || !table.isActive) throw ApiError.badRequest('Bàn này hiện không phục vụ, vui lòng chọn bàn khác');
  if (table.seats < guests) throw ApiError.badRequest(`Bàn ${table.code} chỉ có ${table.seats} ghế, không đủ cho ${guests} khách`);
  const clash = await tx.reservation.findFirst({ where: overlapping(date, { tableId }) });
  if (clash) throw ApiError.conflict(`Bàn ${table.code} đã có khách đặt vào khung giờ này, vui lòng chọn bàn khác`);
  return table;
}
