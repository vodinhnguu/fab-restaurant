import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import ImageUpload from '../../components/ImageUpload';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { EmptyState, Pagination, Spinner } from '../../components/ui/Feedback';
import { Checkbox, Field, Input, Select, Textarea } from '../../components/ui/Form';
import Modal from '../../components/ui/Modal';
import { Table, Td, Th } from '../../components/ui/Table';
import { formatPrice, imageUrl } from '../../lib/format';
import { useCategories, useDocumentTitle } from '../../lib/hooks';
import { dishApi } from '../../services';

const EMPTY = { name: '', description: '', price: '', salePrice: '', unit: 'phần', image: '', categoryId: '', isAvailable: true, isFeatured: false };

function DishForm({ dish, onClose }) {
  const qc = useQueryClient();
  const { data: categories } = useCategories();
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm({
    defaultValues: dish ? { ...dish, salePrice: dish.salePrice ?? '', description: dish.description ?? '' } : EMPTY,
  });

  const save = useMutation({
    mutationFn: (body) => (dish ? dishApi.update(dish.id, body) : dishApi.create(body)),
    onSuccess: () => {
      toast.success(dish ? 'Đã cập nhật món' : 'Đã thêm món mới');
      qc.invalidateQueries({ queryKey: ['admin-dishes'] });
      qc.invalidateQueries({ queryKey: ['dishes'] });
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  const onSubmit = (v) =>
    save.mutate({
      name: v.name,
      description: v.description || null,
      price: Number(v.price),
      salePrice: v.salePrice ? Number(v.salePrice) : null,
      unit: v.unit,
      image: v.image || null,
      categoryId: Number(v.categoryId),
      isAvailable: v.isAvailable,
      isFeatured: v.isFeatured,
    });

  return (
    <Modal
      open
      onClose={onClose}
      title={dish ? 'Sửa món' : 'Thêm món mới'}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={save.isPending}>Lưu</Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Field label="Ảnh món">
          <Controller name="image" control={control} render={({ field }) => <ImageUpload value={field.value} onChange={field.onChange} />} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tên món" required error={errors.name?.message}>
            <Input {...register('name', { required: 'Vui lòng nhập tên món' })} />
          </Field>
          <Field label="Danh mục" required error={errors.categoryId?.message}>
            <Select {...register('categoryId', { required: 'Chọn danh mục' })}>
              <option value="">-- Chọn --</option>
              {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Giá (VNĐ)" required error={errors.price?.message}>
            <Input type="number" {...register('price', { required: 'Nhập giá', min: { value: 1000, message: 'Giá không hợp lệ' } })} />
          </Field>
          <Field label="Giá khuyến mãi" error={errors.salePrice?.message}>
            <Input type="number" {...register('salePrice', { validate: (v) => !v || Number(v) < Number(watch('price')) || 'Phải nhỏ hơn giá gốc' })} />
          </Field>
          <Field label="Đơn vị">
            <Input {...register('unit')} placeholder="phần, đĩa, kg..." />
          </Field>
        </div>
        <Field label="Mô tả">
          <Textarea rows={3} {...register('description')} />
        </Field>
        <div className="flex gap-6">
          <Checkbox label="Đang bán" {...register('isAvailable')} />
          <Checkbox label="Món nổi bật (hiện ở trang chủ)" {...register('isFeatured')} />
        </div>
      </form>
    </Modal>
  );
}

export default function Dishes() {
  useDocumentTitle('Quản trị - Món ăn');
  const [filters, setFilters] = useState({ search: '', category: '', page: 1 });
  const [editing, setEditing] = useState(null); // null: đóng, {}: thêm mới, dish: sửa
  const { data: categories } = useCategories();
  const qc = useQueryClient();

  const query = { ...filters, available: 'all', limit: 15, sort: 'newest' };
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dishes', query],
    queryFn: () => dishApi.list(query),
    placeholderData: keepPreviousData,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-dishes'] });
    qc.invalidateQueries({ queryKey: ['dishes'] });
  };
  const toggle = useMutation({ mutationFn: dishApi.toggle, onSuccess: invalidate, onError: (e) => toast.error(e.message) });
  const remove = useMutation({
    mutationFn: dishApi.remove,
    onSuccess: (res) => { toast.success(res.message); invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v, page: k === 'page' ? v : 1 }));

  return (
    <>
      <PageHeader title="Món ăn" subtitle={data && `${data.meta.total} món`} actions={<Button onClick={() => setEditing({})}><Plus className="h-4 w-4" /> Thêm món</Button>} />

      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={filters.search} onChange={(e) => set('search', e.target.value)} placeholder="Tìm tên món..." className="pl-9" />
        </div>
        <Select value={filters.category} onChange={(e) => set('category', e.target.value)} className="w-48">
          <option value="">Tất cả danh mục</option>
          {categories?.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </Select>
      </div>

      {isLoading ? (
        <Spinner />
      ) : data.data.length === 0 ? (
        <EmptyState title="Không có món nào" />
      ) : (
        <>
          <Table>
            <thead>
              <tr><Th>Món</Th><Th>Danh mục</Th><Th className="text-right">Giá</Th><Th className="text-center">Đã bán</Th><Th className="text-center">Đánh giá</Th><Th>Trạng thái</Th><Th /></tr>
            </thead>
            <tbody>
              {data.data.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <Td>
                    <div className="flex items-center gap-3">
                      <img src={imageUrl(d.image)} alt="" className="h-12 w-12 rounded-lg object-cover" />
                      <div>
                        <p className="font-medium">{d.name}</p>
                        {d.isFeatured && <Badge color="coral">Nổi bật</Badge>}
                      </div>
                    </div>
                  </Td>
                  <Td>{d.category?.name}</Td>
                  <Td className="text-right whitespace-nowrap">
                    <p className="font-semibold">{formatPrice(d.salePrice ?? d.price)}</p>
                    {d.salePrice && <p className="text-xs text-slate-400 line-through">{formatPrice(d.price)}</p>}
                  </Td>
                  <Td className="text-center">{d.soldCount}</Td>
                  <Td className="text-center">{d.ratingCount ? `${d.ratingAvg} ★` : '-'}</Td>
                  <Td>
                    {/* Công tắc bật/tắt nhanh "còn món" */}
                    <button
                      onClick={() => toggle.mutate(d.id)}
                      className={`relative h-6 w-11 rounded-full transition ${d.isAvailable ? 'bg-green-500' : 'bg-slate-300'}`}
                      aria-label="Bật/tắt bán"
                      title={d.isAvailable ? 'Đang bán' : 'Ngừng bán'}
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${d.isAvailable ? 'left-5.5' : 'left-0.5'}`} />
                    </button>
                  </Td>
                  <Td className="whitespace-nowrap">
                    <Button size="icon" variant="ghost" onClick={() => setEditing(d)} aria-label="Sửa"><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="text-red-500" onClick={() => window.confirm(`Xóa món "${d.name}"?`) && remove.mutate(d.id)} aria-label="Xóa"><Trash2 className="h-4 w-4" /></Button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination page={filters.page} totalPages={data.meta.totalPages} onChange={(p) => set('page', p)} />
        </>
      )}

      {editing && <DishForm dish={editing.id ? editing : null} onClose={() => setEditing(null)} />}
    </>
  );
}
