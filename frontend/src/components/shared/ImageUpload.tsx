import { useRef, useState, type DragEvent } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onUpload: (file: File | string) => void;
  currentUrl?: File | string | null;
  label?: string;
  hint?: string;
  /** May return a File (pass-through) or a string URL after upload */
  uploadFn: (file: File) => Promise<File | string>;
}

export default function ImageUpload({ onUpload, currentUrl, label = 'Upload photo', hint = 'JPG / PNG · Max 5MB', uploadFn }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Only use a string URL for the initial preview; File objects can't be an img src
  const [preview, setPreview] = useState<string | null>(
    currentUrl instanceof File ? null : (currentUrl ?? null)
  );

  async function handleFile(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large. Maximum size is 5MB.');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please upload a JPG or PNG image.');
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const result = await uploadFn(file);
      // If uploadFn returns the File itself (pass-through), create a blob URL
      // just for preview. The actual File object is passed to onUpload.
      const previewUrl = result instanceof File
        ? URL.createObjectURL(result)
        : result;
      setPreview(previewUrl);
      onUpload(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function removeImage() {
    setPreview(null);
    onUpload('');
    if (inputRef.current) inputRef.current.value = '';
  }

  if (preview) {
    return (
      <div className="space-y-2">
        <div className="relative inline-block">
          <img src={preview} alt="Upload preview" className="w-32 h-32 object-cover rounded-md border border-slate/20" />
          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-2 -right-2 w-6 h-6 bg-rust text-white rounded-full flex items-center justify-center hover:bg-rust/80 transition-colors focus-ring"
            aria-label="Remove image"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-xs text-stamp-gray">Image attached</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-display font-medium text-ink-navy">{label}</label>}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 focus-ring ${
          dragging ? 'border-signal-amber bg-signal-amber/5' : 'border-slate/25 hover:border-ink-navy/40'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-ink-navy/20 border-t-ink-navy rounded-full animate-spin" />
            <p className="text-xs text-slate">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-md bg-ink-navy/5 flex items-center justify-center">
              {dragging ? <Upload className="w-5 h-5 text-signal-amber" /> : <ImageIcon className="w-5 h-5 text-slate/50" />}
            </div>
            <p className="text-sm text-ink-navy font-medium">Drag & drop or browse</p>
            <p className="text-xs text-stamp-gray">{hint}</p>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-rust font-medium">{error}</p>}
    </div>
  );
}
