
import React, { useState, useRef, useEffect } from 'react';
import { Lock, Unlock, Copy, GripVertical, Sliders } from 'lucide-react';
import { ColorState, LayoutMode } from '../types';
import { getContrastColor, hexToHSL, hslToHex } from '../services/colorUtils';
import { useI18n } from '../services/i18n';

interface PaletteColumnProps {
  color: ColorState;
  index: number;
  total: number;
  layoutMode: LayoutMode;
  toggleLock: (id: string) => void;
  updateColor: (id: string, newHex: string) => void;
  copyToClipboard: (hex: string) => void;
  onDragStart: (index: number) => void;
  onDrop: (index: number) => void;
  onDragEnter: (index: number) => void;
}

export const PaletteColumn: React.FC<PaletteColumnProps> = ({ 
  color, 
  index, 
  total,
  layoutMode,
  toggleLock, 
  updateColor,
  copyToClipboard,
  onDragStart,
  onDrop,
  onDragEnter
}) => {
  const { t } = useI18n();
  const [showAdjust, setShowAdjust] = useState(false);
  const textColor = getContrastColor(color.hex);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  // HSL State for sliders
  const hsl = hexToHSL(color.hex);

  const handleHSLChange = (type: 'h' | 's' | 'l', value: number) => {
    const newHSL = { ...hsl, [type]: value };
    updateColor(color.id, hslToHex(newHSL));
  };

  // Close popover on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowAdjust(false);
      }
    };
    if (showAdjust) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAdjust]);

  const btnClass = `p-3 rounded-xl backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-95 border shadow-lg`;
  const btnStyle = {
    borderColor: textColor === '#ffffff' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
    backgroundColor: textColor === '#ffffff' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    color: textColor
  };

  const isVertical = layoutMode === LayoutMode.VERTICAL;

  // Dynamic Font Sizing Logic
  const isCompact = total > 5;
  const isVeryCompact = total >= 8;

  const hexSizeClass = isVeryCompact 
    ? 'text-lg md:text-2xl' 
    : isCompact 
      ? 'text-xl md:text-3xl' 
      : 'text-2xl md:text-4xl';

  const nameSizeClass = isVeryCompact
    ? 'text-[10px] md:text-xs'
    : 'text-xs md:text-sm';

  return (
    <div 
      className={`relative flex-1 flex items-center justify-center group transition-[background-color] duration-500 ease-out border-white/5
        ${isVertical ? 'min-h-[120px] w-full flex-row border-b' : 'h-full flex-col border-r px-4'} 
      `}
      style={{ backgroundColor: color.hex, color: textColor }}
      draggable={!color.locked}
      onDragStart={(e) => {
        if(color.locked) { e.preventDefault(); return; }
        onDragStart(index);
        e.dataTransfer.effectAllowed = "move";
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={() => onDragEnter(index)}
      onDrop={() => onDrop(index)}
    >
      {/* Hover Gradient Highlight for Premium feel */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-overlay" />

      {/* Drag Handle */}
      <div 
        className={`absolute ${isVertical ? 'left-4 top-1/2 -translate-y-1/2' : 'top-6'} cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-50 transition-opacity duration-300 ${color.locked ? 'invisible' : ''} z-10`}
      >
        <GripVertical size={24} />
      </div>

      {/* Center Content */}
      <div className="flex flex-col items-center gap-3 z-10 relative px-2 text-center">
        <button 
          onClick={() => copyToClipboard(color.hex)}
          className={`font-mono font-bold tracking-wider uppercase hover:opacity-75 transition-opacity drop-shadow-sm ${hexSizeClass}`}
        >
          {color.hex}
        </button>
        <span className={`font-semibold tracking-widest opacity-60 uppercase ${nameSizeClass}`}>
          {color.name}
        </span>
      </div>

      {/* Floating Action Bar */}
      <div 
        className={`
          absolute gap-3 transition-all duration-300 flex z-20
          ${isVertical 
            ? 'right-8 flex-row opacity-100 translate-y-0' 
            : 'bottom-12 flex-row opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0'
          }
          ${color.locked || showAdjust ? '!opacity-100 !translate-y-0' : ''}
        `}
      >
        <button 
          onClick={(e) => { e.stopPropagation(); setShowAdjust(!showAdjust); }}
          className={btnClass}
          style={btnStyle}
          title={t('action.tune')}
        >
          <Sliders size={20} />
        </button>

        <button 
          onClick={(e) => { e.stopPropagation(); toggleLock(color.id); }}
          className={btnClass}
          style={btnStyle}
          title={color.locked ? t('action.unlock') : t('action.lock')}
        >
          {color.locked ? <Lock size={20} /> : <Unlock size={20} />}
        </button>

        <button 
          onClick={(e) => { e.stopPropagation(); copyToClipboard(color.hex); }}
          className={btnClass}
          style={btnStyle}
          title={t('action.copy')}
        >
          <Copy size={20} />
        </button>
      </div>

      {/* HSL Adjustment Popover */}
      {showAdjust && (
        <div 
          ref={popoverRef}
          className={`absolute z-50 bg-[#111] border border-white/10 p-4 rounded-2xl shadow-2xl w-48 animate-in fade-in zoom-in-95 duration-200 ${isVertical ? 'right-full mr-4 top-1/2 -translate-y-1/2' : 'bottom-28'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400 uppercase font-bold">
                <span>Hue</span>
                <span>{hsl.h}°</span>
              </div>
              <input 
                type="range" min="0" max="360" value={hsl.h} 
                onChange={(e) => handleHSLChange('h', parseInt(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400 uppercase font-bold">
                <span>Sat</span>
                <span>{hsl.s}%</span>
              </div>
              <input 
                type="range" min="0" max="100" value={hsl.s} 
                onChange={(e) => handleHSLChange('s', parseInt(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400 uppercase font-bold">
                <span>Lum</span>
                <span>{hsl.l}%</span>
              </div>
              <input 
                type="range" min="0" max="100" value={hsl.l} 
                onChange={(e) => handleHSLChange('l', parseInt(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Overlay for fast touch copy */}
      <div className="md:hidden absolute inset-0 z-0" onClick={() => copyToClipboard(color.hex)} />
    </div>
  );
};
