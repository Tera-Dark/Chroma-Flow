
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Menu, RefreshCw, Download, Undo2, LayoutDashboard, Github, ChevronDown, Settings, Layout, Layers } from 'lucide-react';
import { PaletteColumn } from './components/PaletteColumn';
import { AIGenerator } from './components/AIGenerator';
import { DashboardModal } from './components/DashboardModal';
import { ImageExtractor } from './components/ImageExtractor';
import { SettingsModal } from './components/SettingsModal';
import { ToolsModal } from './components/ToolsModal';
import { ColorState, ModalType, GeneratedPaletteResponse, PaletteHistory, HarmonyMode, LayoutMode } from './types';
import { generateRandomHex, getColorName, generateInitialPalette, generateHarmoniousColors } from './services/colorUtils';
import { I18nProvider, useI18n } from './services/i18n';

const DEFAULT_SIZE = 5;

const AppContent: React.FC = () => {
  const { t } = useI18n();
  const [paletteSize, setPaletteSize] = useState(DEFAULT_SIZE);
  const [colors, setColors] = useState<ColorState[]>([]);
  const [history, setHistory] = useState<PaletteHistory[]>([]);
  const [activeModal, setActiveModal] = useState<ModalType>(ModalType.NONE);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [harmonyMode, setHarmonyMode] = useState<HarmonyMode>(HarmonyMode.RANDOM);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(LayoutMode.HORIZONTAL);
  
  // Menus state
  const [showHarmonyMenu, setShowHarmonyMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);

  // Drag and Drop state
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // Initialize
  useEffect(() => {
    const initial = generateInitialPalette(paletteSize).map((c, i) => ({
      id: `col-${i}`,
      hex: c.hex,
      name: c.name,
      locked: false
    }));
    setColors(initial);
    addToHistory(initial);
    
    // Check mobile and default to vertical if needed, but allow override
    if (window.innerWidth < 768) {
        setLayoutMode(LayoutMode.VERTICAL);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addToHistory = (newColors: ColorState[]) => {
    setHistory(prev => {
      const newHistory = [...prev, { colors: JSON.parse(JSON.stringify(newColors)), timestamp: Date.now() }];
      if (newHistory.length > 20) return newHistory.slice(newHistory.length - 20);
      return newHistory;
    });
  };

  // Handle Palette Size Change
  const handleSizeChange = (newSize: number) => {
    if (newSize === paletteSize) {
        setShowSizeMenu(false);
        return;
    }

    setColors(prev => {
        let nextColors = [...prev];
        if (newSize < prev.length) {
            // Shrink: Remove from end
            nextColors = prev.slice(0, newSize);
        } else {
            // Grow: Add new colors
            const countToAdd = newSize - prev.length;
            const newItems = generateInitialPalette(countToAdd).map((c, i) => ({
                id: `col-${prev.length + i}-${Date.now()}`,
                hex: c.hex,
                name: c.name,
                locked: false
            }));
            nextColors = [...prev, ...newItems];
        }
        addToHistory(nextColors);
        return nextColors;
    });
    
    setPaletteSize(newSize);
    setShowSizeMenu(false);
  };

  const handleGenerate = useCallback(() => {
    setColors(prevColors => {
      // 1. Identify locked colors vs unlocked
      const lockedColors = prevColors.filter(c => c.locked);
      const unlockedIndices = prevColors.map((c, i) => c.locked ? -1 : i).filter(i => i !== -1);

      if (unlockedIndices.length === 0) return prevColors;

      // 2. Determine generation strategy
      let newHexValues: string[] = [];

      if (harmonyMode === HarmonyMode.RANDOM) {
        // Pure Random for unlocked slots
        newHexValues = unlockedIndices.map(() => generateRandomHex());
      } else {
        // Harmony Based
        const baseColor = lockedColors.length > 0 ? lockedColors[0].hex : generateRandomHex();
        const harmonized = generateHarmoniousColors(baseColor, harmonyMode, paletteSize + 3);
        newHexValues = harmonized.slice(0, unlockedIndices.length);
      }
      
      // 3. Construct new state
      const nextColors = [...prevColors];
      unlockedIndices.forEach((index, i) => {
        const newHex = newHexValues[i] || generateRandomHex(); // Fallback
        nextColors[index] = {
          ...nextColors[index],
          hex: newHex,
          name: getColorName(newHex)
        };
      });

      addToHistory(nextColors);
      return nextColors;
    });
  }, [harmonyMode, paletteSize]);

  const handleUndo = () => {
    if (history.length <= 1) return;
    const previousState = history[history.length - 2];
    setColors(previousState.colors);
    setPaletteSize(previousState.colors.length); // Sync size state
    setHistory(prev => prev.slice(0, prev.length - 1));
  };

  const handleRestoreHistory = (restoredColors: ColorState[]) => {
    setColors(restoredColors);
    setPaletteSize(restoredColors.length);
    addToHistory(restoredColors);
    showToast(t('toast.restored'));
  };

  const handleAIPaletteApply = (data: GeneratedPaletteResponse) => {
    const newColors = data.colors.map((c, i) => ({
      id: `col-${i}-${Date.now()}`,
      hex: c.hex,
      name: c.name,
      locked: false
    }));
    
    setColors(newColors);
    setPaletteSize(newColors.length);
    addToHistory(newColors);
    showToast(`AI: ${data.palette_name}`);
  };

  const handleImagePaletteApply = (extractedColors: string[]) => {
     const newColors = extractedColors.map((hex, i) => ({
         id: `col-img-${i}-${Date.now()}`,
         hex: hex,
         name: getColorName(hex),
         locked: false
     }));
     
     setColors(newColors);
     setPaletteSize(newColors.length);
     addToHistory(newColors);
     showToast(t('tool.image'));
  };

  const toggleLock = (id: string) => {
    setColors(prev => prev.map(c => c.id === id ? { ...c, locked: !c.locked } : c));
  };

  const updateColor = (id: string, newHex: string) => {
    setColors(prev => prev.map(c => c.id === id ? { ...c, hex: newHex, name: getColorName(newHex) } : c));
  };

  // --- Drag and Drop Handlers ---
  const onDragStart = (index: number) => {
    dragItem.current = index;
  };
  
  const onDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const onDrop = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;

    const _colors = [...colors];
    const draggedItemContent = _colors[dragItem.current];
    _colors.splice(dragItem.current, 1);
    _colors.splice(dragOverItem.current, 0, draggedItemContent);

    setColors(_colors);
    addToHistory(_colors);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  // --- Utils ---
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${t('toast.copied')} ${text}`);
  };

  const exportCSS = () => {
    const cssVars = colors.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n');
    const cssBlock = `:root {\n${cssVars}\n}`;
    copyToClipboard(cssBlock);
    showToast(t('toast.css_copied'));
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeModal !== ModalType.NONE) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleGenerate();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGenerate, activeModal, history]);

  const closeAllMenus = () => {
    setShowHarmonyMenu(false);
    setShowSizeMenu(false);
    setShowLayoutMenu(false);
  }

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-[#050505] font-sans">
      
      {/* --- Sidebar Toolbar --- */}
      <nav className={`
        fixed md:relative top-0 left-0 h-16 md:h-full w-full md:w-20 z-40
        bg-glass backdrop-blur-xl border-b md:border-b-0 md:border-r border-border
        flex md:flex-col items-center justify-between px-4 md:py-8
      `}>
        <div className="font-bold text-xl tracking-tighter text-white md:rotate-90 md:mb-12 md:whitespace-nowrap origin-center hidden md:block">
          {t('app.name')}
        </div>
        
        {/* Mobile Hamburger */}
        <button className="md:hidden text-white" onClick={() => setShowMobileMenu(!showMobileMenu)}>
          <Menu />
        </button>
        <div className="md:hidden font-bold text-lg text-white">{t('app.name')}</div>

        {/* Tool Buttons */}
        <div className={`
          fixed md:static top-16 left-0 w-full md:w-auto bg-black md:bg-transparent p-4 md:p-0
          flex flex-col gap-6 items-center transition-transform duration-300
          ${showMobileMenu ? 'translate-y-0' : '-translate-y-[150%] md:translate-y-0'}
        `}>
          <div className="flex md:flex-col gap-4">
            <button 
              onClick={handleGenerate} 
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              title={t('tool.generate')}
            >
              <RefreshCw size={20} />
            </button>

            {/* Central Toolkit Hub Button */}
            <button 
              onClick={() => setActiveModal(ModalType.TOOLS)} 
              className="tool-btn w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition"
              title={t('tool.toolkit')}
            >
              <Layers size={20} />
            </button>

            <button 
              onClick={() => setActiveModal(ModalType.DASHBOARD)} 
              className="tool-btn w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition"
              title={t('tool.dashboard')}
            >
              <LayoutDashboard size={20} />
            </button>

            <button 
              onClick={handleUndo} 
              className={`tool-btn w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition ${history.length < 2 ? 'opacity-30 cursor-not-allowed' : ''}`}
              disabled={history.length < 2}
              title={t('tool.undo')}
            >
              <Undo2 size={20} />
            </button>

             <button 
              onClick={exportCSS} 
              className="tool-btn w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition"
              title={t('tool.export')}
            >
              <Download size={20} />
            </button>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-center gap-6 mb-4">
          <button 
            onClick={() => setActiveModal(ModalType.SETTINGS)}
            className="text-gray-600 hover:text-white transition"
            title={t('tool.settings')}
          >
            <Settings size={20} />
          </button>
          <a href="#" className="text-gray-600 hover:text-white transition"><Github size={20} /></a>
        </div>
      </nav>

      {/* --- Main Content Wrapper --- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Control Bar (Harmony & Size) */}
        <div className="absolute top-20 md:top-6 left-0 right-0 z-30 flex justify-center pointer-events-none">
            <div className="pointer-events-auto relative flex gap-2 flex-wrap justify-center px-4">
                
                {/* Harmony Selector */}
                <div className="relative">
                    <button 
                        onClick={() => { closeAllMenus(); setShowHarmonyMenu(!showHarmonyMenu); }}
                        className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-lg border border-white/10 rounded-full text-white text-sm font-medium hover:bg-black/60 transition shadow-lg"
                    >
                        <span>{t('mode')}: {t(`harmony.${harmonyMode}`)}</span>
                        <ChevronDown size={14} className={`transition-transform ${showHarmonyMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {showHarmonyMenu && (
                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 bg-[#0f0f0f] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col py-1 animate-in fade-in slide-in-from-top-2">
                            {Object.values(HarmonyMode).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => { setHarmonyMode(mode); setShowHarmonyMenu(false); }}
                                    className={`px-4 py-2 text-left text-sm hover:bg-white/10 transition ${harmonyMode === mode ? 'text-white bg-white/5' : 'text-gray-400'}`}
                                >
                                    {t(`harmony.${mode}`)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Size Selector */}
                <div className="relative">
                    <button 
                        onClick={() => { closeAllMenus(); setShowSizeMenu(!showSizeMenu); }}
                        className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-lg border border-white/10 rounded-full text-white text-sm font-medium hover:bg-black/60 transition shadow-lg"
                    >
                        <span>{t('count')}: {paletteSize}</span>
                        <ChevronDown size={14} className={`transition-transform ${showSizeMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {showSizeMenu && (
                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-20 bg-[#0f0f0f] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col py-1 animate-in fade-in slide-in-from-top-2">
                            {[3, 4, 5, 6, 7, 8].map((size) => (
                                <button
                                    key={size}
                                    onClick={() => handleSizeChange(size)}
                                    className={`px-4 py-2 text-center text-sm hover:bg-white/10 transition ${paletteSize === size ? 'text-white bg-white/5' : 'text-gray-400'}`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Layout Selector - Simplified */}
                <div className="relative">
                    <button 
                        onClick={() => { closeAllMenus(); setShowLayoutMenu(!showLayoutMenu); }}
                        className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-lg border border-white/10 rounded-full text-white text-sm font-medium hover:bg-black/60 transition shadow-lg"
                    >
                        <Layout size={14} />
                        <span>{t(`layout.${layoutMode}`)}</span>
                        <ChevronDown size={14} className={`transition-transform ${showLayoutMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {showLayoutMenu && (
                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-32 bg-[#0f0f0f] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col py-1 animate-in fade-in slide-in-from-top-2">
                            {Object.values(LayoutMode).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => { setLayoutMode(mode); setShowLayoutMenu(false); }}
                                    className={`px-4 py-2 text-left text-sm hover:bg-white/10 transition ${layoutMode === mode ? 'text-white bg-white/5' : 'text-gray-400'}`}
                                >
                                    {t(`layout.${mode}`)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>

        {/* --- Main Color Area --- */}
        <main className={`
            flex-1 h-full pt-16 md:pt-0 flex relative overflow-y-auto overflow-x-hidden
            ${layoutMode === LayoutMode.VERTICAL ? 'flex-col' : 'flex-row'}
        `}>
            {colors.map((color, index) => (
            <PaletteColumn 
                key={color.id}
                index={index}
                total={paletteSize}
                color={color}
                layoutMode={layoutMode}
                toggleLock={toggleLock}
                updateColor={updateColor}
                copyToClipboard={copyToClipboard}
                onDragStart={onDragStart}
                onDragEnter={onDragEnter}
                onDrop={onDrop}
            />
            ))}
        </main>
      </div>

      {/* Hint Overlay */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none text-center mix-blend-overlay opacity-50 text-xs md:text-sm font-bold tracking-widest text-white hidden md:block z-20">
        {t('hint.space')}
      </div>

      {/* --- Toast --- */}
      <div className={`
        fixed bottom-10 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full shadow-2xl border border-white/10
        flex items-center gap-3 transition-all duration-300 z-50
        ${toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}
      `}>
        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
        <span className="font-medium text-sm">{toastMessage}</span>
      </div>

      {/* --- Modals --- */}
      
      {activeModal === ModalType.TOOLS && (
        <ToolsModal 
          onClose={() => setActiveModal(ModalType.NONE)}
          onSelectTool={(tool) => {
            setActiveModal(tool === 'ai' ? ModalType.AI_GENERATE : ModalType.IMAGE_UPLOAD);
          }}
        />
      )}

      {activeModal === ModalType.AI_GENERATE && (
        <AIGenerator 
          onClose={() => setActiveModal(ModalType.NONE)} 
          onApply={handleAIPaletteApply} 
        />
      )}

      {activeModal === ModalType.DASHBOARD && (
        <DashboardModal 
          colors={colors}
          history={history}
          onClose={() => setActiveModal(ModalType.NONE)} 
          onRestore={handleRestoreHistory}
        />
      )}

      {activeModal === ModalType.IMAGE_UPLOAD && (
        <ImageExtractor 
          onClose={() => setActiveModal(ModalType.NONE)}
          onApply={handleImagePaletteApply}
        />
      )}

      {activeModal === ModalType.SETTINGS && (
        <SettingsModal
          onClose={() => setActiveModal(ModalType.NONE)}
        />
      )}

    </div>
  );
};

const App: React.FC = () => {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
};

export default App;
