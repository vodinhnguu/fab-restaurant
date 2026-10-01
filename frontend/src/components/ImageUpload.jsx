import { ImagePlus, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { imageUrl } from '../lib/format';
import { uploadApi } from '../services';
import { Input } from './ui/Form';

// Chọn ảnh từ máy (upload lên server) hoặc dán link ảnh
export default function ImageUpload({ value, onChange }) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      onChange(await uploadApi.image(file));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="flex gap-3">
      <label className="relative grid h-24 w-24 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-ocean-400">
        {value ? (
          <img src={imageUrl(value)} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImagePlus className="h-6 w-6 text-slate-400" />
        )}
        {uploading && (
          <span className="absolute inset-0 grid place-items-center bg-white/70">
            <LoaderCircle className="h-5 w-5 animate-spin" />
          </span>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </label>
      <div className="flex-1 space-y-1">
        <Input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="Hoặc dán link ảnh https://..." />
        <p className="text-xs text-slate-500">Bấm vào ô vuông để tải ảnh lên (tối đa 5MB)</p>
      </div>
    </div>
  );
}
