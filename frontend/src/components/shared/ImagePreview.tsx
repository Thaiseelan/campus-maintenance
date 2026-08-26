import { useState } from 'react';
import { X } from 'lucide-react';

interface ImagePreviewProps {
  src: string;
  alt: string;
  label?: string;
}

export default function ImagePreview({ src, alt, label }: ImagePreviewProps) {
  const [enlarged, setEnlarged] = useState(false);

  return (
    <>
      <div className="space-y-1.5">
        {label && <p className="font-mono text-xs uppercase tracking-wider text-stamp-gray">{label}</p>}
        <button
          onClick={() => setEnlarged(true)}
          className="block w-full rounded-md overflow-hidden border border-slate/20 hover:border-slate/40 transition-colors focus-ring"
        >
          <img src={src} alt={alt} className="w-full h-48 object-cover transition-transform duration-300 hover:scale-[1.02]" />
        </button>
      </div>

      {enlarged && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 animate-fade-in" onClick={() => setEnlarged(false)}>
          <div className="absolute inset-0 bg-ink-navy/60 backdrop-blur-sm" />
          <div className="relative max-w-3xl max-h-[90vh]">
            <button
              onClick={() => setEnlarged(false)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white focus-ring rounded p-1"
              aria-label="Close image"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={src} alt={alt} className="max-w-full max-h-[85vh] rounded-lg shadow-2xl" />
          </div>
        </div>
      )}
    </>
  );
}
