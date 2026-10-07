import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Feedback';
import { Checkbox, Field, Input, Select } from '../../components/ui/Form';
import Modal from '../../components/ui/Modal';
import { Table, Td, Th } from '../../components/ui/Table';
import { formatDate, formatPrice } from '../../lib/format';
import { useDocumentTitle } from '../../lib/hooks';
import { couponApi } from '../../services';

const toInputDate = (d) => (d ? dayjs(d).format('YYYY-MM-DD') : '');
const numOrNull = (v) => (v === '' || v === null || v === undefined ? null : Number(v));

function CouponForm({ coupon, onClose }) {
  const qc = useQueryClient();
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: coupon
      ? { ...coupon, maxDiscount: coupon.maxDiscount ?? '', usageLimit: coupon.usageLimit ?? '', startsAt: toInputDate(coupon.startsAt), expiresAt: toInputDate(coupon.expiresAt), description: coupon.description ?? '' }
      : { code: '', description: '', type: 'PERCENT', value: 10, minOrder: 0, maxDiscount: '', usageLimit: '', startsAt: '', expiresAt: '', isActive: true },
  });

  const save = useMutation({
    mutationFn: (v) => {
      const body = {
        code: v.code,
        description: v.description || null,
        type: v.type,
        value: Number(v.value),
        minOrder: Number(v.minOrder) || 0,
        maxDiscount: numOrNull(v.maxDiscount),
        usageLimit: numOrNull(v.usageLimit),
        startsAt: v.startsAt ? new Date(`${v.startsAt}T00:00:00+07:00`) : null,
        expiresAt: v.expiresAt ? new Date(`${v.expiresAt}T23:59:59+07:00`) : null,
        isActive: v.isActive,
      };
      return coupon ? couponApi.update(coupon.id, body) : couponApi.create(body);
    },
    onSuccess: () => {
      toast.success('Đã lưu mã giảm giá');
      qc.invalidateQueries({ queryKey: ['coupons'] });
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Modal open onClose={onClose} title={coupon ? 'Sửa mã giảm giá' : 'Tạo mã giảm giá'} size="lg"
      footer={<><Button variant="outline" onClick={onClose}>Hủy</Button><Button onClick={handleSubmit((v) => save.mutate(v))} loading={save.isPending}>Lưu</Button></>}
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Mã" required error={errors.code?.message}>
            <Input className="font-mono uppercase" {...register('code', { required: 'Nhập mã' })} />
          </Field>
          <Field label="Loại">
            <Select {...register('type')}>
              <option value="PERCENT">Giảm theo %</option>
              <option value="FIXED">Giảm số tiền</option>
            </Select>
          </Field>
        </div>
        <Field label="Mô tả"><Input {...register('description')} /></Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={watch('type') === 'PERCENT' ? 'Phần trăm (%)' : 'Số tiền (đ)'} required><Input type="number" {...register('value', { required: true })} /></Field>
          <Field label="Đơn tối thiểu (đ)"><Input type="number" {...register('minOrder')} /></Field>
          <Field label="Giảm tối đa (đ)" hint="Bỏ trống = không giới hạn"><Input type="number" {...register('maxDiscount')} /></Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Số lượt dùng" hint="Bỏ trống = không giới hạn"><Input type="number" {...register('usageLimit')} /></Field>
          <Field label="Bắt đầu"><Input type="date" {...register('startsAt')} /></Field>
          <Field label="Hết hạn"><Input type="date" {...register('expiresAt')} /></Field>
        </div>
        <Checkbox label="Đang kích hoạt" {...register('isActive')} />
      </div>
    </Modal>
  );
}

export default function Coupons() {
  useDocumentTitle('Quản trị - Mã giảm giá');
  const { data, isLoading } = useQuery({ queryKey: ['coupons', 'admin'], queryFn: couponApi.list });
  const [editing, setEditing] = useState(null);
  const qc = useQueryClient();
  const remove = useMutation({
    mutationFn: couponApi.remove,
    onSuccess: () => { toast.success('Đã xóa'); qc.invalidateQueries({ queryKey: ['coupons'] }); },
    onError: (e) => toast.error(e.message),
  });

  const statusOf = (c) => {
    if (!c.isActive) return <Badge>Tắt</Badge>;
    if (c.expiresAt && new Date(c.expiresAt) < new Date()) return <Badge color="red">Hết hạn</Badge>;
    if (c.usageLimit && c.usedCount >= c.usageLimit) return <Badge color="amber">Hết lượt</Badge>;
    return <Badge color="green">Hoạt động</Badge>;
  };

  return (
    <>
      <PageHeader title="Mã giảm giá" actions={<Button onClick={() => setEditing({})}><Plus className="h-4 w-4" /> Tạo mã</Button>} />
      {isLoading ? <Spinner /> : (
        <Table>
          <thead><tr><Th>Mã</Th><Th>Giảm</Th><Th>Điều kiện</Th><Th className="text-center">Đã dùng</Th><Th>Hết hạn</Th><Th>Trạng thái</Th><Th /></tr></thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <Td><p className="font-mono font-semibold">{c.code}</p><p className="text-xs text-slate-500">{c.description}</p></Td>
                <Td className="whitespace-nowrap">{c.type === 'PERCENT' ? `${c.value}%` : formatPrice(c.value)}{c.maxDiscount && <p className="text-xs text-slate-500">tối đa {formatPrice(c.maxDiscount)}</p>}</Td>
                <Td className="whitespace-nowrap">Từ {formatPrice(c.minOrder)}</Td>
                <Td className="text-center">{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</Td>
                <Td className="whitespace-nowrap">{c.expiresAt ? formatDate(c.expiresAt) : 'Không'}</Td>
                <Td>{statusOf(c)}</Td>
                <Td className="whitespace-nowrap">
                  <Button size="icon" variant="ghost" onClick={() => setEditing(c)} aria-label="Sửa"><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-red-500" onClick={() => window.confirm(`Xóa mã ${c.code}?`) && remove.mutate(c.id)} aria-label="Xóa"><Trash2 className="h-4 w-4" /></Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      {editing && <CouponForm coupon={editing.id ? editing : null} onClose={() => setEditing(null)} />}
    </>
  );
}
