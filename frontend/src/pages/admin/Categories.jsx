import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import ImageUpload from '../../components/ImageUpload';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Feedback';
import { Field, Input, Textarea } from '../../components/ui/Form';
import Modal from '../../components/ui/Modal';
import { Table, Td, Th } from '../../components/ui/Table';
import { imageUrl } from '../../lib/format';
import { useCategories } from '../../lib/hooks';
import { categoryApi } from '../../services';

function CategoryForm({ category, onClose }) {
  const qc = useQueryClient();
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: category ?? { name: '', description: '', image: '', sortOrder: 0 },
  });
  const save = useMutation({
    mutationFn: (v) => {
      const body = { name: v.name, description: v.description || null, image: v.image || null, sortOrder: Number(v.sortOrder) };
      return category ? categoryApi.update(category.id, body) : categoryApi.create(body);
    },
    onSuccess: () => {
      toast.success('Đã lưu danh mục');
      qc.invalidateQueries({ queryKey: ['categories'] });
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Modal open onClose={onClose} title={category ? 'Sửa danh mục' : 'Thêm danh mục'}
      footer={<><Button variant="outline" onClick={onClose}>Hủy</Button><Button onClick={handleSubmit((v) => save.mutate(v))} loading={save.isPending}>Lưu</Button></>}
    >
      <div className="space-y-4">
        <Field label="Ảnh"><Controller name="image" control={control} render={({ field }) => <ImageUpload value={field.value} onChange={field.onChange} />} /></Field>
        <Field label="Tên danh mục" required error={errors.name?.message}>
          <Input {...register('name', { required: 'Vui lòng nhập tên' })} />
        </Field>
        <Field label="Mô tả"><Textarea {...register('description')} /></Field>
        <Field label="Thứ tự hiển thị" hint="Số nhỏ hiển thị trước"><Input type="number" {...register('sortOrder')} /></Field>
      </div>
    </Modal>
  );
}

export default function Categories() {
  const { data, isLoading } = useCategories();
  const [editing, setEditing] = useState(null);
  const qc = useQueryClient();
  const remove = useMutation({
    mutationFn: categoryApi.remove,
    onSuccess: () => { toast.success('Đã xóa'); qc.invalidateQueries({ queryKey: ['categories'] }); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <>
      <PageHeader title="Danh mục" actions={<Button onClick={() => setEditing({})}><Plus className="h-4 w-4" /> Thêm danh mục</Button>} />
      {isLoading ? <Spinner /> : (
        <Table>
          <thead><tr><Th>Danh mục</Th><Th>Mô tả</Th><Th className="text-center">Số món</Th><Th className="text-center">Thứ tự</Th><Th /></tr></thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <Td><div className="flex items-center gap-3"><img src={imageUrl(c.image)} alt="" className="h-10 w-10 rounded-lg object-cover" /><span className="font-medium">{c.name}</span></div></Td>
                <Td className="text-slate-500">{c.description}</Td>
                <Td className="text-center">{c._count.dishes}</Td>
                <Td className="text-center">{c.sortOrder}</Td>
                <Td className="whitespace-nowrap">
                  <Button size="icon" variant="ghost" onClick={() => setEditing(c)} aria-label="Sửa"><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-red-500" onClick={() => window.confirm(`Xóa danh mục "${c.name}"?`) && remove.mutate(c.id)} aria-label="Xóa"><Trash2 className="h-4 w-4" /></Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      {editing && <CategoryForm category={editing.id ? editing : null} onClose={() => setEditing(null)} />}
    </>
  );
}
