import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { CalendarClock, Check, MapPin, Pencil, Plus, Wrench } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import TicketActionDialog from '../../../components/maintenance/TicketActionDialog';
import TicketFormModal from '../../../components/maintenance/TicketFormModal';
import PageHeader from '../../../components/PageHeader';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { ErrorState, Spinner } from '../../../components/ui/Feedback';
import { Checkbox, Field, Input, Select, Textarea } from '../../../components/ui/Form';
import Modal from '../../../components/ui/Modal';
import { EQUIPMENT_CATEGORIES } from '../../../lib/constants';
import { formatDate } from '../../../lib/format';
import { useDocumentTitle } from '../../../lib/hooks';
import { useCan } from '../../../lib/permissions';
import { maintenanceApi } from '../../../services';
import { useAuthStore } from '../../../stores/auth';

// Tình trạng 1 thiết bị, ưu tiên: ngưng dùng > có sự cố > quá hạn bảo trì > sắp đến hạn > tốt
function stateOf(e) {
  if (!e.isActive) return { label: 'Ngưng sử dụng', color: 'slate', bar: 'bg-slate-300', card: 'opacity-60' };
  if (e.hasIssue) return { label: `Có sự cố: ${e.openTickets.length} phiếu chưa sửa xong`, color: 'red', bar: 'bg-red-500', card: 'border-red-200 bg-red-50/40' };
  if (e.maintenance === 'overdue') return { label: `Quá hạn bảo trì ${-e.daysLeft} ngày`, color: 'red', bar: 'bg-amber-500', card: 'border-amber-200 bg-amber-50/40' };
  if (e.maintenance === 'soon') return { label: e.daysLeft === 0 ? 'Hôm nay đến hạn bảo trì' : `Còn ${e.daysLeft} ngày đến hạn bảo trì`, color: 'amber', bar: 'bg-amber-400', card: 'border-amber-200 bg-amber-50/30' };
  // Mục "Khác / chưa rõ thiết bị" không phải máy thật -> không ghi "Hoạt động tốt"
  if (e.category === 'Khác') return { label: 'Dùng khi chưa rõ thiết bị', color: 'slate', bar: 'bg-slate-300', card: '' };
  return { label: 'Hoạt động tốt', color: 'green', bar: 'bg-green-500', card: '' };
}

const FILTERS = [['all', 'Tất cả'], ['issue', 'Có sự cố'], ['due', 'Đến hạn bảo trì']];

// 1 phiếu sửa chữa đang mở trên thẻ thiết bị, kèm nút Hoàn thành để kỹ thuật đóng phiếu ngay tại đây
// (không phải sang trang Phiếu sửa chữa). Luật giống TicketCard: phiếu chưa ai nhận / của mình / người có quyền Xóa.
function OpenTicketRow({ t, equipmentName }) {
  const me = useAuthStore((s) => s.user);
  const can = useCan();
  const qc = useQueryClient();
  const [finishing, setFinishing] = useState(false);
  const canFinish = can('FACILITY', 'edit') && (!t.assigneeId || t.assigneeId === me?.id || can('FACILITY', 'delete'));
  const done = useMutation({
    mutationFn: (body) => maintenanceApi.updateStatus(t.id, { status: 'DONE', ...body }),
    onSuccess: () => { toast.success('Đã sửa xong'); setFinishing(false); qc.invalidateQueries({ queryKey: ['maintenance'] }); },
    onError: (err) => { toast.error(err.message); qc.invalidateQueries({ queryKey: ['maintenance'] }); },
  });
  return (
    <li className="flex items-start gap-2">
      <span className={clsx('mt-1.5 h-2 w-2 shrink-0 rounded-full', t.priority === 'URGENT' ? 'bg-red-500' : 'bg-amber-400')} />
      <span className="min-w-0 flex-1 text-slate-800">{t.title}
        <span className="block text-xs text-slate-500">{t.status === 'WAITING_PARTS' ? `Chờ: ${t.waitingNote}` : t.assignee ? `${t.assignee.name} đang xử lý` : 'Chưa ai nhận'}</span>
      </span>
      {canFinish && (
        <Button size="sm" variant="ghost" className="h-7 shrink-0 px-2 text-green-700 hover:bg-green-50" onClick={() => setFinishing(true)}>
          <Check className="h-4 w-4" /> Hoàn thành
        </Button>
      )}
      {finishing && (
        <TicketActionDialog
          mode="done"
          title="Hoàn thành sửa chữa"
          description={`${t.title} · ${equipmentName}`}
          loading={done.isPending}
          onClose={() => setFinishing(false)}
          onConfirm={({ note, cost }) => done.mutate({ note, cost })}
        />
      )}
    </li>
  );
}

function EquipmentCard({ e, onReport, onMaintain, onEdit }) {
  const can = useCan();
  const s = stateOf(e);
  return (
    <div className={clsx('card relative flex flex-col overflow-hidden p-4 pl-5', s.card)}>
      <span className={clsx('absolute inset-y-0 left-0 w-1.5', s.bar)} />
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold">{e.name}</h3>
        {can('FACILITY', 'delete') && (
          <Button size="icon" variant="ghost" className="-mt-1 -mr-2 h-8 w-8 shrink-0" onClick={() => onEdit(e)} aria-label={`Sửa ${e.name}`}><Pencil className="h-4 w-4" /></Button>
        )}
      </div>
      {e.location && <p className="flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-3 w-3" /> {e.location}</p>}
      <div className="mt-2"><Badge color={s.color}>{s.label}</Badge></div>

      {e.openTickets.length > 0 && (
        <ul className="mt-3 space-y-1.5 text-sm">
          {e.openTickets.map((t) => <OpenTicketRow key={t.id} t={t} equipmentName={e.name} />)}
        </ul>
      )}
      {e.note && <p className="mt-2 text-xs text-slate-500">{e.note}</p>}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
        <p className="flex items-center gap-1 text-xs text-slate-500">
          <CalendarClock className="h-3.5 w-3.5 shrink-0" />
          {e.maintenanceDays
            ? `Mỗi ${e.maintenanceDays} ngày · ${e.lastMaintainedAt ? `lần cuối ${formatDate(e.lastMaintainedAt)}` : 'chưa ghi lần nào'} · hạn ${formatDate(e.nextDueAt)}`
            : 'Không bảo trì định kỳ'}
        </p>
        {e.isActive && (
          <div className="flex gap-2">
            {can('FACILITY', 'create') && <Button size="sm" variant="outline" onClick={() => onReport(e)}><Wrench className="h-4 w-4" /> Báo hỏng</Button>}
            {/* Hôm nay đã ghi bảo trì thì khóa nút, tránh bấm nhiều lần ra nhiều dòng lịch sử trùng (backend cũng chặn) */}
            {can('FACILITY', 'edit') && e.maintenanceDays && (e.maintainedToday ? (
              <Button size="sm" variant="outline" disabled title="Mỗi máy chỉ ghi bảo trì 1 lần / ngày"><Check className="h-4 w-4" /> Đã bảo trì hôm nay</Button>
            ) : (
              <Button size="sm" variant={['overdue', 'soon'].includes(e.maintenance) ? 'primary' : 'outline'} onClick={() => onMaintain(e)}><Check className="h-4 w-4" /> Đã bảo trì</Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Thêm / sửa / ngưng dùng thiết bị (người có quyền Xóa: kỹ thuật)
function EquipmentForm({ equipment: e, onClose }) {
  const qc = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: e?.name ?? '', category: e?.category ?? EQUIPMENT_CATEGORIES[0], location: e?.location ?? '',
      maintenanceDays: e?.maintenanceDays ?? '', note: e?.note ?? '', sortOrder: e?.sortOrder ?? 0, isActive: e?.isActive ?? true,
    },
  });
  const save = useMutation({
    mutationFn: (v) => {
      const body = {
        name: v.name, category: v.category, location: v.location || null, note: v.note || null,
        maintenanceDays: v.maintenanceDays === '' ? null : Number(v.maintenanceDays), sortOrder: Number(v.sortOrder) || 0, isActive: v.isActive,
      };
      return e ? maintenanceApi.updateEquipment(e.id, body) : maintenanceApi.createEquipment(body);
    },
    onSuccess: () => { toast.success('Đã lưu thiết bị'); qc.invalidateQueries({ queryKey: ['maintenance'] }); onClose(); },
    onError: (err) => toast.error(err.message),
  });
  return (
    <Modal open onClose={onClose} title={e ? 'Sửa thiết bị' : 'Thêm thiết bị'}
      footer={<><Button variant="outline" onClick={onClose}>Hủy</Button><Button onClick={handleSubmit((v) => save.mutate(v))} loading={save.isPending}>Lưu</Button></>}>
      <div className="space-y-4">
        <Field label="Tên thiết bị" required error={errors.name?.message}><Input {...register('name', { required: 'Nhập tên thiết bị' })} placeholder="Vd: Máy làm đá quầy bar" /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nhóm"><Select {...register('category')}>{EQUIPMENT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
          <Field label="Vị trí"><Input {...register('location')} placeholder="Vd: Quầy bar" /></Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Chu kỳ bảo trì (ngày)" hint="Để trống nếu không bảo trì định kỳ"><Input type="number" min={1} {...register('maintenanceDays')} /></Field>
          <Field label="Thứ tự hiển thị"><Input type="number" min={0} {...register('sortOrder')} /></Field>
        </div>
        <Field label="Ghi chú" hint="Hãng, số điện thoại thợ bảo hành..."><Textarea rows={2} {...register('note')} /></Field>
        <Checkbox label="Đang sử dụng (bỏ chọn khi máy hỏng hẳn / thanh lý)" {...register('isActive')} />
      </div>
    </Modal>
  );
}

// Thiết bị & bảo trì định kỳ: gom theo nhóm, mỗi máy 1 ô kèm tình trạng và hạn bảo trì
export default function MaintenanceEquipment() {
  useDocumentTitle('Kỹ thuật - Thiết bị');
  const can = useCan();
  const qc = useQueryClient();
  const [params, setParams] = useSearchParams();
  const filter = params.get('filter') ?? 'all';
  const [showRetired, setShowRetired] = useState(false);
  const [reporting, setReporting] = useState(null);
  const [maintaining, setMaintaining] = useState(null);
  const [editing, setEditing] = useState(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['maintenance', 'equipment', showRetired],
    queryFn: () => maintenanceApi.equipment(showRetired ? { all: true } : undefined),
    refetchInterval: 30000,
  });

  const maintain = useMutation({
    mutationFn: ({ id, ...body }) => maintenanceApi.maintain(id, body),
    onSuccess: (res) => { toast.success(res.message); setMaintaining(null); qc.invalidateQueries({ queryKey: ['maintenance'] }); },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const issue = data.filter((e) => e.isActive && e.hasIssue).length;
  const due = data.filter((e) => e.isActive && ['overdue', 'soon'].includes(e.maintenance)).length;
  const shown = data.filter((e) => filter === 'all' || (filter === 'issue' ? e.hasIssue : ['overdue', 'soon'].includes(e.maintenance)));
  const groups = EQUIPMENT_CATEGORIES.map((c) => [c, shown.filter((e) => e.category === c)]).filter(([, list]) => list.length);

  return (
    <>
      <PageHeader
        title="Thiết bị & bảo trì"
        subtitle={can('FACILITY', 'edit') ? 'Bảo trì xong máy nào thì bấm "Đã bảo trì" để tính lại hạn.' : 'Thấy máy nào hỏng thì bấm "Báo hỏng", kỹ thuật sẽ xử lý.'}
        actions={can('FACILITY', 'delete') && <Button onClick={() => setEditing({})}><Plus className="h-4 w-4" /> Thêm thiết bị</Button>}
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
          {FILTERS.map(([key, label]) => (
            <button key={key} onClick={() => setParams(key === 'all' ? {} : { filter: key }, { replace: true })}
              className={clsx('shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap', filter === key ? 'bg-white text-ocean-900 shadow-sm' : 'text-slate-600 hover:text-slate-900')}>
              {label}{key === 'issue' ? ` (${issue})` : key === 'due' ? ` (${due})` : ''}
            </button>
          ))}
        </div>
        {can('FACILITY', 'delete') && (
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" className="h-4 w-4 accent-ocean-600" checked={showRetired} onChange={(e) => setShowRetired(e.target.checked)} />
            Hiện cả máy ngưng sử dụng
          </label>
        )}
      </div>

      {groups.length === 0 ? (
        <p className="card px-4 py-10 text-center text-green-700">Không có thiết bị nào {filter === 'issue' ? 'đang có sự cố' : 'đến hạn bảo trì'}.</p>
      ) : (
        <div className="space-y-6">
          {groups.map(([cat, list]) => (
            <section key={cat}>
              <h2 className="mb-2 text-sm font-semibold text-slate-600">{cat} ({list.length})</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {list.map((e) => <EquipmentCard key={e.id} e={e} onReport={setReporting} onMaintain={setMaintaining} onEdit={setEditing} />)}
              </div>
            </section>
          ))}
        </div>
      )}

      {reporting && <TicketFormModal equipmentId={reporting.id} title={`Báo hỏng: ${reporting.name}`} onClose={() => setReporting(null)} />}
      {maintaining && (
        <TicketActionDialog
          mode="maintain"
          title={`Bảo trì: ${maintaining.name}`}
          description="Ghi lại lần bảo trì định kỳ vào lịch sử, hạn bảo trì tiếp theo được tính lại từ hôm nay."
          openTickets={maintaining.openTickets}
          loading={maintain.isPending}
          onClose={() => setMaintaining(null)}
          onConfirm={(body) => maintain.mutate({ id: maintaining.id, ...body })}
        />
      )}
      {editing && <EquipmentForm equipment={editing.id ? editing : null} onClose={() => setEditing(null)} />}
    </>
  );
}
