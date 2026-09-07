import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { FiUploadCloud, FiX } from 'react-icons/fi';
import uploadService from '../services/uploadService';

const ImageUploader = ({ value, onChange, label = 'Cover image', aspect = 'aspect-[16/9]' }) => {
  const inputRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    setUploading(true);
    setProgress(0);
    try {
      const { url, public_id } = await uploadService.uploadImage(file, setProgress);
      onChange({ url, public_id });
      toast.success('Image uploaded');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-ink dark:text-paper">{label}</label>

      {value?.url ? (
        <div className={`relative overflow-hidden rounded-lg ${aspect}`}>
          <img src={value.url} alt="Cover" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange({ url: '', public_id: '' })}
            className="absolute right-2 top-2 rounded-full bg-ink/70 p-1.5 text-paper hover:bg-ink"
            aria-label="Remove image"
          >
            <FiX size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`flex ${aspect} w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-line text-slate hover:border-accent hover:text-accent dark:border-line-dark`}
        >
          <FiUploadCloud size={22} />
          <span className="text-sm">{uploading ? `Uploading… ${progress}%` : 'Click to upload an image'}</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
};

export default ImageUploader;
