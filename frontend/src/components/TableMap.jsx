import clsx from 'clsx';
import { Users, Waves } from 'lucide-react';
import { TABLE_STATUS, tableState } from '../lib/reservation';

export function TableLegend({ keys = ['free', 'selected', 'pending', 'occupied', 'small'] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600">
      {keys.map((k) => (
        <span key={k} className="inline-flex items-center gap-1.5">
          <span className={clsx('h-3 w-3 rounded-full', TABLE_STATUS[k].dot)} /> {TABLE_STATUS[k].label}
        </span>
      ))}
    </div>
  );
}

// Sơ đồ 1 khu vực. Bàn đặt theo lưới (x = cột, y = hàng) giống vị trí thật trong nhà hàng.
// - Khách: bấm bàn trống để chọn (onSelect)
// - Admin: bấm bàn bất kỳ để xem thông tin khách (onSelect nhận cả bàn bận)
export default function TableMap({ area, guests, selectedId, onSelect, selectBusy = false }) {
  const isOutdoor = area.name.toLowerCase().includes('biển');
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
      {isOutdoor && (
        <div className="mb-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-100 via-cyan-100 to-sky-100 py-2 text-xs font-medium text-sky-700">
          <Waves className="h-4 w-4" /> Biển
        </div>
      )}
      <div className="grid min-w-[280px] gap-2 sm:gap-3" style={{ gridTemplateColumns: `repeat(${area.cols}, minmax(0, 1fr))` }}>
        {area.tables.map((t) => {
          const state = tableState(t, { guests, selectedId });
          const clickable = selectBusy || state === 'free' || state === 'selected';
          return (
            <button
              key={t.id}
              type="button"
              disabled={!clickable}
              onClick={() => onSelect?.(t)}
              style={{ gridColumn: t.x, gridRow: t.y }}
              title={`${t.code} · ${t.seats} ghế · ${TABLE_STATUS[state].label}`}
              className={clsx(
                'flex min-h-16 flex-col items-center justify-center border-2 px-1 py-2 transition disabled:cursor-not-allowed',
                t.seats >= 8 ? 'rounded-xl' : 'rounded-full sm:rounded-2xl',
                t.seats <= 2 && 'mx-auto aspect-square w-full max-w-20',
                TABLE_STATUS[state].box,
              )}
            >
              <span className="text-sm font-bold">{t.code}</span>
              <span className="inline-flex items-center gap-0.5 text-[11px] opacity-80"><Users className="h-3 w-3" />{t.seats}</span>
            </button>
          );
        })}
      </div>
      {!isOutdoor && area.name.toLowerCase().includes('trong') && (
        <div className="mt-3 border-t-4 border-dotted border-slate-200 pt-1 text-center text-[11px] text-slate-400">Cửa ra vào</div>
      )}
    </div>
  );
}
