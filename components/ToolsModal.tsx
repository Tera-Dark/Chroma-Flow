
import React, { useState } from 'react';
import { 
  X, Search, ChevronDown, 
  LayoutGrid, Image as ImageIcon, 
  Sparkles, Eye, Layers, Wand2, Command,
  Palette, ScanEye, Monitor
} from 'lucide-react';
import { useI18n } from '../services/i18n';

interface ToolsModalProps {
  onClose: () => void;
  onSelectTool: (tool: 'ai' | 'image') => void;
}

type Category = 'all' | 'generator' | 'analysis' | 'design';

export const ToolsModal: React.FC<ToolsModalProps> = ({ onClose, onSelectTool }) => {
  const { t } = useI18n();
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const tools = [
    {
      id: 'ai',
      title: t('tools.ai.title'),
      description: t('tools.ai.desc'),
      icon: Sparkles,
      category: 'generator',
      color: 'from-purple-600 to-blue-600',
      tags: ['Generative', 'Gemini 2.5'],
      action: () => onSelectTool('ai'),
      available: true
    },
    {
      id: 'image',
      title: t('tools.img.title'),
      description: t('tools.img.desc'),
      icon: ImageIcon,
      category: 'analysis',
      color: 'from-emerald-500 to-teal-600',
      tags: ['Extraction', 'Image'],
      action: () => onSelectTool('image'),
      available: true
    },
    {
      id: 'contrast',
      title: t('tools.contrast.title'),
      description: t('tools.contrast.desc'),
      icon: Eye,
      category: 'analysis',
      color: 'from-orange-500 to-red-500',
      tags: ['Accessibility', 'WCAG'],
      action: () => {},
      available: false
    },
    {
      id: 'gradient',
      title: t('tools.gradient.title'),
      description: t('tools.gradient.desc'),
      icon: Layers,
      category: 'design',
      color: 'from-pink-500 to-rose-500',
      tags: ['CSS', 'Interpolation'],
      action: () => {},
      available: false
    },
    {
      id: 'blindness',
      title: t('tools.blindness.title'),
      description: t('tools.blindness.desc'),
      icon: ScanEye,
      category: 'analysis',
      color: 'from-yellow-500 to-amber-600',
      tags: ['Sim', 'Accessibility'],
      action: () => {},
      available: false
    },
    {
      id: 'ui_viz',
      title: t('tools.uiviz.title'),
      description: t('tools.uiviz.desc'),
      icon: Monitor,
      category: 'design',
      color: 'from-cyan-500 to-blue-500',
      tags: ['Preview', 'Mockup'],
      action: () => {},
      available: false
    }
  ];

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-8 animate-in fade-in duration-200">
      <div className="w-full h-full max-w-[1400px] bg-[#0c0c0c] rounded-3xl border border-white/10 flex overflow-hidden shadow-2xl relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-50 p-2 rounded-full bg-[#1a1a1a] text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Sidebar */}
        <aside className="w-64 bg-[#111] border-r border-white/5 flex-col hidden md:flex">
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black font-bold">
                 <Command size={18} />
               </div>
               <span className="font-bold text-lg tracking-tight text-white">Toolkit</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8 custom-scrollbar">
             <div>
                <h3 className="px-3 text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{t('cat.header')}</h3>
                <div className="space-y-1">
                  <SidebarItem 
                    icon={LayoutGrid} 
                    label={t('cat.all')} 
                    active={activeCategory === 'all'} 
                    onClick={() => setActiveCategory('all')} 
                  />
                  <SidebarItem 
                    icon={Wand2} 
                    label={t('cat.gen')} 
                    active={activeCategory === 'generator'} 
                    onClick={() => setActiveCategory('generator')} 
                  />
                  <SidebarItem 
                    icon={ScanEye} 
                    label={t('cat.analysis')} 
                    active={activeCategory === 'analysis'} 
                    onClick={() => setActiveCategory('analysis')} 
                  />
                  <SidebarItem 
                    icon={Palette} 
                    label={t('cat.design')} 
                    active={activeCategory === 'design'} 
                    onClick={() => setActiveCategory('design')} 
                  />
                </div>
             </div>
          </div>

          <div className="p-4 border-t border-white/5">
             <div className="bg-[#1a1a1a] rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-2">Credits Remaining</p>
                <div className="flex items-baseline gap-1">
                   <span className="text-xl font-bold text-white">∞</span>
                   <span className="text-xs text-gray-500">/ Unlimited</span>
                </div>
             </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col bg-[#0c0c0c] relative">
           
           {/* Header / Search */}
           <div className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#0c0c0c]/80 backdrop-blur-sm z-10 sticky top-0">
              <div className="relative w-96">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                 <input 
                    type="text" 
                    placeholder="Search tools..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/20 focus:bg-[#222] transition-all"
                 />
              </div>

              <div className="flex items-center gap-3">
                 <FilterDropdown label="Status" />
                 <FilterDropdown label="Version" />
              </div>
           </div>

           {/* Content Grid */}
           <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl font-bold text-white">
                    {activeCategory === 'all' ? t('cat.all') : 
                     activeCategory === 'generator' ? t('cat.gen') :
                     activeCategory === 'analysis' ? t('cat.analysis') : t('cat.design')}
                 </h2>
                 <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Sort by:</span>
                    <button className="text-white flex items-center gap-1 hover:text-gray-300">
                       Popular <ChevronDown size={14} />
                    </button>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                 {filteredTools.map((tool) => (
                    <div 
                      key={tool.id}
                      onClick={tool.available ? tool.action : undefined}
                      className={`
                        group bg-[#161616] border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1
                        ${tool.available ? 'cursor-pointer hover:border-white/20 hover:shadow-xl hover:shadow-black/50' : 'opacity-60 cursor-not-allowed grayscale-[0.5]'}
                      `}
                    >
                       {/* Cover Image Area */}
                       <div className={`h-40 w-full relative bg-gradient-to-br ${tool.color} p-6 flex flex-col justify-between group-hover:saturate-150 transition-all`}>
                          <div className="w-full flex justify-between items-start">
                             <div className="w-10 h-10 rounded-lg bg-black/20 backdrop-blur-md flex items-center justify-center text-white">
                                <tool.icon size={20} />
                             </div>
                             {!tool.available && (
                                <span className="bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Coming Soon</span>
                             )}
                          </div>
                          
                          <div className="flex gap-2 flex-wrap">
                            {tool.tags.map((tag, i) => (
                                <span key={i} className="px-2 py-1 rounded bg-black/20 backdrop-blur-md text-[10px] text-white font-medium">
                                    {tag}
                                </span>
                            ))}
                          </div>
                       </div>

                       {/* Content Area */}
                       <div className="p-5">
                          <div className="flex items-center gap-2 mb-2">
                             <div className="w-5 h-5 rounded-full bg-gray-700/50 flex items-center justify-center text-[10px] text-white font-bold">
                                C
                             </div>
                             <span className="text-xs text-gray-400">Chroma Flow Team</span>
                          </div>
                          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-200 transition-colors">
                             {tool.title}
                          </h3>
                          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                             {tool.description}
                          </p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

        </main>
      </div>
    </div>
  );
};

const SidebarItem: React.FC<{ icon: React.ElementType, label: string, active?: boolean, onClick?: () => void }> = ({ icon: Icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      active 
      ? 'bg-white/10 text-white' 
      : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`}
  >
    <Icon size={18} />
    {label}
  </button>
);

const FilterDropdown: React.FC<{ label: string }> = ({ label }) => (
  <button className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white hover:border-white/20 transition-all">
    {label}
    <ChevronDown size={14} />
  </button>
);
