import clsx from 'clsx';
import { NotebookPen } from 'lucide-react';
import { useCartStore } from '../stores/cart';
import { Textarea } from './ui/Form';

// Gợi ý bấm nhanh theo danh mục món (tên danh mục trong DB). Không có trong bảng thì dùng DEFAULT.
const SUGGESTIONS = {
  Tôm: ['Ít cay', 'Không hành', 'Hấp', 'Nướng', 'Bóc vỏ sẵn'],
  'Mâm hải sản': ['Ít cay', 'Không hành', 'Hấp', 'Nướng', 'Bóc vỏ sẵn'],
  Cá: ['Ít xương', 'Chiên giòn', 'Hấp xì dầu', 'Không hành'],
  'Đồ uống': ['Ít đá', 'Không đá', 'Ít đường'],
};
const DEFAULT = ['Ít cay', 'Không hành', 'Không rau thơm'];

// Nút mở ghi chú khẩu vị của 1 món trong giỏ. open / onToggle do trang cha giữ để bấm vào món cũng mở được.
export function ItemNoteToggle({ item, open, onToggle }) {
  return (
    <button type="button" onClick={onToggle} className={clsx('flex items-start gap-1 text-left text-xs', item.note ? 'text-ocean-700' : 'text-slate-400 hover:text-coral-600')}>
      <NotebookPen className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      {item.note ? <span className="line-clamp-2">{item.note}</span> : !open && 'Thêm ghi chú khẩu vị'}
    </button>
  );
}

// Ô ghi chú + gợi ý của 1 món. Lưu thẳng vào giỏ hàng (giữ lại khi tải lại trang).
export default function ItemNote({ item, onDone }) {
  const setNote = useCartStore((s) => s.setNote);
  const note = item.note || '';
  const add = (s) => {
    if (note.toLowerCase().includes(s.toLowerCase())) return;
    setNote(item.dishId, (note.trim() ? `${note.trim()}, ${s}` : s).slice(0, 200));
  };

  return (
    <div className="mt-2 rounded-xl bg-slate-50 p-3">
      <div className="mb-2 flex flex-wrap gap-1.5">
        {(SUGGESTIONS[item.category] ?? DEFAULT).map((s) => (
          <button key={s} type="button" onClick={() => add(s)}
            className="rounded-full border border-slate-300 bg-white px-2.5 py-0.5 text-xs text-slate-700 hover:border-coral-400 hover:text-coral-600">
            + {s}
          </button>
        ))}
      </div>
      <Textarea
        rows={2}
        autoFocus
        maxLength={200}
        value={note}
        onChange={(e) => setNote(item.dishId, e.target.value)}
        placeholder={`Khẩu vị riêng cho ${item.name}, vd: 2 phần ít cay, 1 phần không hành`}
        className="text-sm"
      />
      <div className="mt-1 flex justify-between text-xs text-slate-400">
        <span>{note.length}/200</span>
        <button type="button" onClick={onDone} className="font-medium text-ocean-700 hover:underline">Xong</button>
      </div>
    </div>
  );
}
