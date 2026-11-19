import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { CLEANING_SUGGESTIONS } from '../../lib/constants';
import { useCan } from '../../lib/permissions';
import { cleaningApi } from '../../services';
import Button from '../ui/Button';
import { Field, Input, Select, Textarea } from '../ui/Form';
import Modal from '../ui/Modal';

// Thêm / sửa 1 việc vệ sinh.
// - task: việc đang sửa (bỏ trống = thêm mới)
// - areaId: khu vực điền sẵn (vd bấm "Báo cần dọn" ở 1 khu)
// - title: tiêu đề hộp thoại
// Ô "Giao cho" chỉ hiện với người có quyền Sửa (tạp vụ, tổ trưởng, quản lý). Phục vụ / lễ tân báo thì để trống,
// tạp vụ nào rảnh sẽ nhận.
export default function TaskFormModal({ task, areaId, title, onClose }) {
  const can = useCan();
  const qc = useQueryClient();
  const canAssign = can('CLEANING', 'edit');

  const { data: areas = [] } = useQuery({ queryKey: ['cleaning', 'areas', false], queryFn: () => cleaningApi.areas() });
  const { data: staff = [] } = useQuery({ queryKey: ['cleaning', 'staff'], queryFn: cleaningApi.staff, enabled: canAssign, staleTime: 5 * 60 * 1000 });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      title: task?.title ?? '',
      note: task?.note ?? '',
      areaId: String(task?.areaId ?? areaId ?? ''),
      priority: task?.priority ?? 'NORMAL',
      assigneeId: task?.assigneeId ? String(task.assigneeId) : '',
    },
  });
  const priority = watch('priority');

  const save = useMutation({
    mutationFn: (v) => {
      const body = {
        title: v.title,
        note: v.note || null,
        areaId: Number(v.areaId),
        priority: v.priority,
        ...(canAssign && { assigneeId: v.assigneeId ? Number(v.assigneeId) : null }),
      };
      return task ? cleaningApi.updateTask(task.id, body) : cleaningApi.createTask(body);
    },
    onSuccess: () => {
      toast.success(task ? 'Đã lưu thay đổi' : 'Đã thêm việc, tạp vụ sẽ thấy ngay');
      qc.invalidateQueries({ queryKey: ['cleaning'] });
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Modal
      open
      onClose={onClose}
      title={title ?? (task ? 'Sửa việc' : 'Thêm việc')}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSubmit((v) => save.mutate(v))} loading={save.isPending}>{task ? 'Lưu' : 'Thêm việc'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Khu vực" required error={errors.areaId?.message}>
          <Select {...register('areaId', { required: 'Chọn khu vực' })} invalid={!!errors.areaId}>
            <option value="">Chọn khu vực...</option>
            {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </Select>
        </Field>

        <Field label="Việc cần làm" required error={errors.title?.message}>
          <Input
            placeholder="Vd: Nhà vệ sinh nữ hết giấy"
            invalid={!!errors.title}
            {...register('title', { required: 'Nhập việc cần làm', minLength: { value: 2, message: 'Tối thiểu 2 ký tự' }, maxLength: 120 })}
          />
        </Field>
        {/* Bấm để điền nhanh tên việc hay gặp */}
        <div className="-mt-2 flex flex-wrap gap-1.5">
          {CLEANING_SUGGESTIONS.map((s) => (
            <button key={s} type="button" onClick={() => setValue('title', s, { shouldValidate: true })}
              className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:border-ocean-300 hover:bg-ocean-50">
              {s}
            </button>
          ))}
        </div>

        <Field label="Mô tả thêm">
          <Textarea rows={2} maxLength={500} placeholder="Vd: Khách làm đổ nước gần cửa ra vào" {...register('note')} />
        </Field>

        {/* Không dùng <Field> (thẻ label) vì bọc nút trong label làm bấm nhầm và đọc sai tên nút */}
        <div role="radiogroup" aria-labelledby="priority-label">
          <span id="priority-label" className="mb-1.5 block text-sm font-medium text-slate-700">Mức độ</span>
          <div className="grid grid-cols-2 gap-2">
            {[['NORMAL', 'Bình thường'], ['URGENT', 'Gấp, làm ngay']].map(([value, label]) => (
              <button key={value} type="button" role="radio" aria-checked={priority === value} onClick={() => setValue('priority', value)}
                className={clsx(
                  'h-10 rounded-xl border text-sm font-medium transition',
                  priority === value
                    ? value === 'URGENT' ? 'border-red-500 bg-red-50 text-red-700' : 'border-ocean-600 bg-ocean-50 text-ocean-800'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-50',
                )}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {canAssign && (
          <Field label="Giao cho" hint="Để trống: tạp vụ nào rảnh thì nhận">
            <Select {...register('assigneeId')}>
              <option value="">Chưa giao (ai rảnh thì nhận)</option>
              {staff.map((u) => <option key={u.id} value={u.id}>{u.name}{u.staffRole ? ` · ${u.staffRole.name}` : ''}</option>)}
            </Select>
          </Field>
        )}
      </div>
    </Modal>
  );
}
