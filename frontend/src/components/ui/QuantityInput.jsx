import { Minus, Plus } from 'lucide-react';

export default function QuantityInput({ value, onChange, min = 1, max = 50, size = 'md' }) {
  const btn = size === 'sm' ? 'h-7 w-7' : 'h-9 w-9';
  return (
    <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white">
      <button type="button" className={`${btn} grid place-items-center text-slate-600 hover:text-ocean-700 disabled:opacity-30`} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Giảm">
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-8 text-center text-sm font-semibold">{value}</span>
      <button type="button" className={`${btn} grid place-items-center text-slate-600 hover:text-ocean-700 disabled:opacity-30`} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Tăng">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
