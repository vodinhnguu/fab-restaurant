import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { BellRing, Check, Clock, Pencil, Plus, Settings2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import NoteDialog from '../../../components/cleaning/NoteDialog';
import TaskFormModal from '../../../components/cleaning/TaskFormModal';
import PageHeader from '../../../components/PageHeader';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { ErrorState, Spinner } from '../../../components/ui/Feedback';
import { Checkbox, Field, Input, Textarea } from '../../../components/ui/Form';
import Modal from '../../../components/ui/Modal';
import { fromNow } from '../../../lib/format';
import { useDocumentTitle } from '../../../lib/hooks';
import { useCan } from '../../../lib/permissions';
import { cleaningApi } from '../../../services';

// Trạng thái 1 khu: cần dọn (đang có việc) > lâu chưa dọn > sạch
const STATE = {
  dirty: { label: 'Cần dọn', color: 'red', card: 'border-red-200 bg-red-50/40', bar: 'bg-red-500' },
  stale: { label: 'Lâu chưa dọn', color: 'amber', card: 'border-amber-200 bg-amber-50/40', bar: 'bg-amber-400' },
  clean: { label: 'Sạch', color: 'green', card: '', bar: 'bg-green-500' },
};
const stateOf = (a) => (a.needsCleaning ? 'dirty' : a.isStale ? 'stale' : 'clean');

function AreaCard({ area, onReport, onClean }) {
  const can = useCan();
  const s = STATE[stateOf(area)];
  const urgent = area.openTasks.some((t) => t.priority === 'URGENT');
  return (
    <div className={clsx('card relative flex flex-col overflow-hidden p-4 pl-5', s.card)}>
      <span className={clsx('absolute inset-y-0 left-0 w-1.5', s.bar)} />
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold">{area.name}</h3>
        <span className="flex shrink-0 gap-1">
          {urgent && <Badge color="red">Gấp</Badge>}
          <Badge color={s.color}>{s.label}</Badge>
        </span>
      </div>
      {area.description && <p className="mt-1 text-xs text-slate-500">{area.description}</p>}

      {area.openTasks.length > 0 && (
        <ul className="mt-3 space-y-1.5 text-sm">
          {area.openTasks.map((t) => (
            <li key={t.id} className="flex items-start gap-2">
              <span className={clsx('mt-1.5 h-2 w-2 shrink-0 rounded-full', t.priority === 'URGENT' ? 'bg-red-500' : 'bg-amber-400')} />
              <span className="min-w-0">
                <span className="text-slate-800">{t.title}</span>
                <span className="block text-xs text-slate-500">
                  {t.status === 'IN_PROGRESS' ? `${t.assignee?.name ?? 'Ai đó'} đang làm` : t.assignee ? `Giao cho ${t.assignee.name}` : 'Chưa ai nhận'} · {fromNow(t.createdAt)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
        <p className="flex items-center gap-1 text-xs text-slate-500">
          <Clock className="h-3.5 w-3.5" /> {area.lastCleanedAt ? `Dọn lần cuối ${fromNow(area.lastCleanedAt)}` : 'Chưa có lần dọn nào'}
        </p>
        <div className="flex gap-2">
          {can('CLEANING', 'create') && (
            <Button size="sm" variant="outline" onClick={() => onReport(area)}><BellRing className="h-4 w-4" /> Báo cần dọn</Button>
          )}
          {can('CLEANING', 'edit') && (
            <Button size="sm" variant={area.needsCleaning ? 'primary' : 'outline'} onClick={() => onClean(area)}><Check className="h-4 w-4" /> Đã dọn xong</Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Quản lý danh sách khu vực (người có quyền Xóa, vd Quản lý) ----------
function AreaForm({ area, onClose }) {
  const qc = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: area?.name ?? '', description: area?.description ?? '', sortOrder: area?.sortOrder ?? 0, isActive: area?.isActive ?? true },
  });
  const save = useMutation({
    mutationFn: (v) => {
      const body = { name: v.name, description: v.description || null, sortOrder: Number(v.sortOrder) || 0, isActive: v.isActive };
      return area ? cleaningApi.updateArea(area.id, body) : cleaningApi.createArea(body);
    },
    onSuccess: () => { toast.success('Đã lưu khu vực'); qc.invalidateQueries({ queryKey: ['cleaning'] }); onClose(); },
    onError: (e) => toast.error(e.message),
  });
  return (
    <Modal open onClose={onClose} title={area ? 'Sửa khu vực' : 'Thêm khu vực'} size="sm"
      footer={<><Button variant="outline" onClick={onClose}>Hủy</Button><Button onClick={handleSubmit((v) => save.mutate(v))} loading={save.isPending}>Lưu</Button></>}>
      <div className="space-y-4">
        <Field label="Tên khu vực" required error={errors.name?.message}>
          <Input {...register('name', { required: 'Nhập tên khu vực' })} placeholder="Vd: Kho chứa đồ" />
        </Field>
        <Field label="Việc thường làm"><Textarea rows={2} {...register('description')} placeholder="Vd: Quét, lau sàn; sắp xếp kệ" /></Field>
        <Field label="Thứ tự hiển thị" hint="Số nhỏ đứng trước"><Input type="number" min={0} {...register('sortOrder')} /></Field>
        <Checkbox label="Đang dùng (bỏ chọn để ẩn khu này, vd đang sửa chữa)" {...register('isActive')} />
      </div>
    </Modal>
  );
}

function AreaManager({ onClose }) {
  const [editing, setEditing] = useState(null);
  const { data: areas = [], isLoading } = useQuery({ queryKey: ['cleaning', 'areas', true], queryFn: () => cleaningApi.areas({ all: true }) });
  return (
    <Modal open onClose={onClose} title="Quản lý khu vực" size="lg"
      footer={<Button onClick={() => setEditing({})}><Plus className="h-4 w-4" /> Thêm khu vực</Button>}>
      {isLoading ? <Spinner /> : (
        <ul className="divide-y divide-slate-100">
          {areas.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className={clsx('font-medium', !a.isActive && 'text-slate-400 line-through')}>{a.sortOrder}. {a.name}</p>
                {a.description && <p className="truncate text-xs text-slate-500">{a.description}</p>}
              </div>
              <span className="flex shrink-0 items-center gap-1">
                {!a.isActive && <Badge>Đang ẩn</Badge>}
                <Button size="icon" variant="ghost" onClick={() => setEditing(a)} aria-label={`Sửa ${a.name}`}><Pencil className="h-4 w-4" /></Button>
              </span>
            </li>
          ))}
        </ul>
      )}
      {editing && <AreaForm area={editing.id ? editing : null} onClose={() => setEditing(null)} />}
    </Modal>
  );
}

// Khu vực cần dọn: mỗi khu 1 ô, đỏ = đang có việc, vàng = lâu chưa dọn, xanh = sạch
export default function CleaningAreas() {
  useDocumentTitle('Vệ sinh - Khu vực cần dọn');
  const can = useCan();
  const qc = useQueryClient();
  const [onlyDirty, setOnlyDirty] = useState(false);
  const [reporting, setReporting] = useState(null); // khu đang báo cần dọn
  const [cleaning, setCleaning] = useState(null); // khu đang bấm "Đã dọn xong"
  const [managing, setManaging] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['cleaning', 'areas', false],
    queryFn: () => cleaningApi.areas(),
    refetchInterval: 30000,
  });

  const clean = useMutation({
    mutationFn: ({ id, note }) => cleaningApi.cleanArea(id, note),
    onSuccess: (res) => { toast.success(res.message); setCleaning(null); qc.invalidateQueries({ queryKey: ['cleaning'] }); },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const dirty = data.filter((a) => a.needsCleaning).length;
  const stale = data.filter((a) => a.isStale).length;
  const shown = onlyDirty ? data.filter((a) => a.needsCleaning || a.isStale) : data;

  return (
    <>
      <PageHeader
        title="Khu vực cần dọn"
        subtitle={can('CLEANING', 'edit') ? 'Dọn xong khu nào thì bấm "Đã dọn xong" để lưu vào lịch sử.' : 'Thấy chỗ nào cần dọn thì bấm "Báo cần dọn", tạp vụ sẽ thấy ngay.'}
        actions={can('CLEANING', 'delete') && <Button variant="outline" onClick={() => setManaging(true)}><Settings2 className="h-4 w-4" /> Quản lý khu vực</Button>}
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-sm">
          <Badge color="red">{dirty} khu cần dọn</Badge>
          <Badge color="amber">{stale} khu lâu chưa dọn</Badge>
          <Badge color="green">{data.length - dirty - stale} khu sạch</Badge>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" className="h-4 w-4 accent-ocean-600" checked={onlyDirty} onChange={(e) => setOnlyDirty(e.target.checked)} />
          Chỉ hiện khu cần dọn / lâu chưa dọn
        </label>
      </div>

      {shown.length === 0 ? (
        <p className="card flex items-center justify-center gap-2 px-4 py-10 text-green-700"><Sparkles className="h-5 w-5" /> Mọi khu vực đều sạch</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((a) => <AreaCard key={a.id} area={a} onReport={setReporting} onClean={setCleaning} />)}
        </div>
      )}

      {reporting && <TaskFormModal areaId={reporting.id} title={`Báo cần dọn: ${reporting.name}`} onClose={() => setReporting(null)} />}
      {cleaning && (
        <NoteDialog
          title={`Đã dọn xong: ${cleaning.name}`}
          description={cleaning.openTasks.length
            ? `Các việc đang chờ ở khu này (${cleaning.openTasks.length} việc) sẽ được đánh dấu xong. Việc người khác đang làm thì giữ nguyên.`
            : 'Khu này chưa có việc nào, hệ thống sẽ ghi 1 lần "Dọn định kỳ" vào lịch sử.'}
          confirmLabel="Đã dọn xong"
          loading={clean.isPending}
          onClose={() => setCleaning(null)}
          onConfirm={(note) => clean.mutate({ id: cleaning.id, note })}
        />
      )}
      {managing && <AreaManager onClose={() => setManaging(false)} />}
    </>
  );
}
