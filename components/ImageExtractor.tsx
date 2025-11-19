
import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { extractColorsFromImage } from '../services/colorUtils';
import { useI18n } from '../services/i18n';

interface ImageExtractorProps {
  onClose: () => void;
  onApply: (colors: string[]) => void;
}

export const ImageExtractor: React.FC<ImageExtractorProps> = ({ onClose, onApply }) => {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        
        const colors = await extractColorsFromImage(objectUrl);
        if (colors.length > 0) {
             // Simulate a small delay for better UX
             setTimeout(() => {
                onApply(colors);
                onClose();
             }, 500);
        } else {
            setError(t('img.error'));
            setLoading(false);
        }
    } catch (err) {
        console.error(err);
        setError(t('img.error'));
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden m-4">
        
        <div className="p-6 flex justify-between items-center border-b border-white/5">
          <div className="flex items-center gap-2 text-white">
            <ImageIcon className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-semibold">{t('img.title')}</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 flex flex-col items-center gap-6 text-center">
            {preview ? (
                <div className="relative w-48 h-48 rounded-xl overflow-hidden border border-white/20 shadow-lg">
                     <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                     {loading && (
                         <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                             <Loader2 className="animate-spin text-white" />
                         </div>
                     )}
                </div>
            ) : (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-48 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-4 hover:bg-white/5 hover:border-white/20 transition-colors cursor-pointer group"
                >
                    <div className="p-4 bg-white/5 rounded-full group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-400 text-sm">{t('img.click_upload')}</p>
                </div>
            )}

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
            />
            
            <p className="text-xs text-gray-500 max-w-xs">
                {t('img.desc')}
            </p>
        </div>
      </div>
    </div>
  );
};
