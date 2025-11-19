
import React, { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { generatePaletteFromPrompt } from '../services/geminiService';
import { GeneratedPaletteResponse } from '../types';
import { useI18n } from '../services/i18n';

interface AIGeneratorProps {
  onClose: () => void;
  onApply: (data: GeneratedPaletteResponse) => void;
}

export const AIGenerator: React.FC<AIGeneratorProps> = ({ onClose, onApply }) => {
  const { t } = useI18n();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await generatePaletteFromPrompt(prompt);
      if (result) {
        onApply(result);
        onClose();
      } else {
        setError(t('ai.error'));
      }
    } catch (err) {
      setError(t('ai.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 flex justify-between items-center border-b border-white/5">
          <div className="flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold">{t('ai.title')}</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-gray-400 text-sm">
            {t('ai.desc')}
          </p>
          
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t('ai.placeholder')}
            className="w-full h-32 bg-[#1a1a1a] border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 resize-none text-sm font-mono"
            autoFocus
          />

          {error && (
            <div className="text-red-400 text-xs bg-red-900/10 p-3 rounded-lg border border-red-900/30">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="px-6 py-2 bg-white text-black rounded-full text-sm font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
          >
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            {loading ? t('dreaming') : t('generate')}
          </button>
        </div>
      </div>
    </div>
  );
};
