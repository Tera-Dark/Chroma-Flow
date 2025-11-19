
import React from 'react';
import { X, Globe, Info, Check } from 'lucide-react';
import { useI18n } from '../services/i18n';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { t, language, setLanguage } = useI18n();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        
        <div className="p-6 flex justify-between items-center border-b border-white/5">
          <div className="flex items-center gap-2 text-white">
            <h2 className="text-lg font-semibold">{t('settings.title')}</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          
          {/* Language Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-300 mb-2">
              <Globe size={18} />
              <span className="font-semibold">{t('settings.language')}</span>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <button 
                onClick={() => setLanguage('en')}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  language === 'en' 
                    ? 'bg-white/10 border-white/30 text-white' 
                    : 'bg-transparent border-white/5 text-gray-400 hover:bg-white/5'
                }`}
              >
                <span>{t('settings.language.en')}</span>
                {language === 'en' && <Check size={18} />}
              </button>
              
              <button 
                onClick={() => setLanguage('zh')}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  language === 'zh' 
                    ? 'bg-white/10 border-white/30 text-white' 
                    : 'bg-transparent border-white/5 text-gray-400 hover:bg-white/5'
                }`}
              >
                <span className="font-sans">中文 (Chinese)</span>
                {language === 'zh' && <Check size={18} />}
              </button>
            </div>
          </div>

          {/* About Section */}
          <div className="pt-6 border-t border-white/5">
            <div className="flex items-center gap-2 text-gray-300 mb-2">
              <Info size={18} />
              <span className="font-semibold">{t('settings.about')}</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              {t('settings.desc')}
            </p>
            <div className="mt-4 text-xs text-gray-700">
              v1.2.0 • Built with React & Gemini AI
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
