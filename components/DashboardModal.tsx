
import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  History, 
  BarChart3, 
  Keyboard, 
  Lock, 
  MoveHorizontal, 
  Sliders 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ColorState, PaletteHistory } from '../types';
import { getLuminance } from '../services/colorUtils';
import { useI18n } from '../services/i18n';

interface DashboardModalProps {
  colors: ColorState[];
  history: PaletteHistory[];
  onClose: () => void;
  onRestore: (colors: ColorState[]) => void;
}

type Tab = 'guide' | 'history' | 'analytics';

export const DashboardModal: React.FC<DashboardModalProps> = ({ colors, history, onClose, onRestore }) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<Tab>('guide');

  // Analytics Data
  const analyticsData = colors.map(c => ({
    name: c.hex,
    luminance: Math.round(getLuminance(c.hex)),
    color: c.hex
  }));

  const tabs = [
    { id: 'guide', label: t('dash.tab.guide'), icon: BookOpen },
    { id: 'history', label: t('dash.tab.history'), icon: History },
    { id: 'analytics', label: t('dash.tab.analytics'), icon: BarChart3 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="w-full max-w-4xl bg-[#0f0f0f] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[80vh] md:h-[600px]">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 bg-black/40 border-b md:border-b-0 md:border-r border-white/5 p-4 md:p-6 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible">
          <div className="mb-0 md:mb-8 px-2 hidden md:block">
            <h2 className="text-xl font-bold text-white tracking-tight">{t('dash.title')}</h2>
            <p className="text-xs text-gray-500 mt-1">{t('dash.subtitle')}</p>
          </div>
          
          {tabs.map((tab) => {
             const Icon = tab.icon;
             const isActive = activeTab === tab.id;
             return (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as Tab)}
                 className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 whitespace-nowrap ${
                   isActive 
                     ? 'bg-white text-black shadow-lg shadow-white/5' 
                     : 'text-gray-400 hover:bg-white/5 hover:text-white'
                 }`}
               >
                 <Icon size={18} />
                 <span className="font-medium text-sm">{tab.label}</span>
               </button>
             )
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          
          {/* Header (Mobile only mostly) */}
          <div className="absolute top-4 right-4 z-10">
            <button onClick={onClose} className="p-2 bg-black/50 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors backdrop-blur-md">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
            
            {/* === GUIDE TAB === */}
            {activeTab === 'guide' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{t('guide.title')}</h3>
                  <p className="text-gray-400">{t('guide.subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <GuideCard 
                    icon={<Keyboard />} 
                    title={t('guide.gen.title')} 
                    desc={t('guide.gen.desc')} 
                  />
                  <GuideCard 
                    icon={<Lock />} 
                    title={t('guide.lock.title')} 
                    desc={t('guide.lock.desc')} 
                  />
                  <GuideCard 
                    icon={<MoveHorizontal />} 
                    title={t('guide.drag.title')} 
                    desc={t('guide.drag.desc')} 
                  />
                  <GuideCard 
                    icon={<Sliders />} 
                    title={t('guide.tune.title')} 
                    desc={t('guide.tune.desc')} 
                  />
                </div>
                
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                   <h4 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider">{t('guide.shortcuts')}</h4>
                   <div className="grid grid-cols-2 gap-y-3 text-sm">
                      <div className="flex justify-between pr-8"><span className="text-gray-500">{t('guide.gen.title')}</span> <span className="text-white font-mono bg-white/10 px-2 rounded">Space</span></div>
                      <div className="flex justify-between pr-8"><span className="text-gray-500">{t('tool.undo')}</span> <span className="text-white font-mono bg-white/10 px-2 rounded">Ctrl + Z</span></div>
                      <div className="flex justify-between pr-8"><span className="text-gray-500">{t('action.copy')}</span> <span className="text-white font-mono bg-white/10 px-2 rounded">Click</span></div>
                      <div className="flex justify-between pr-8"><span className="text-gray-500">{t('action.lock')}</span> <span className="text-white font-mono bg-white/10 px-2 rounded">L</span></div>
                   </div>
                </div>
              </div>
            )}

            {/* === HISTORY TAB === */}
            {activeTab === 'history' && (
               <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{t('history.title')}</h3>
                    <p className="text-gray-400">{t('history.desc')}</p>
                  </div>

                  <div className="space-y-3">
                    {history.slice().reverse().map((entry, i) => (
                      <div 
                        key={entry.timestamp}
                        onClick={() => { onRestore(entry.colors); onClose(); }}
                        className="group flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 cursor-pointer transition-all"
                      >
                        <span className="text-gray-500 font-mono text-xs w-8">#{history.length - i}</span>
                        <div className="flex-1 h-12 flex rounded-lg overflow-hidden">
                          {entry.colors.map((c, idx) => (
                            <div key={idx} className="flex-1 h-full" style={{ backgroundColor: c.hex }} />
                          ))}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity px-2">
                           <span className="text-xs font-bold text-white bg-white/20 px-3 py-1 rounded-full">{t('history.restore')}</span>
                        </div>
                      </div>
                    ))}
                    {history.length === 0 && (
                      <div className="text-center py-20 text-gray-600">{t('history.empty')}</div>
                    )}
                  </div>
               </div>
            )}

            {/* === ANALYTICS TAB === */}
            {activeTab === 'analytics' && (
               <div className="h-full flex flex-col animate-in slide-in-from-bottom-4 duration-300">
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">{t('analytics.title')}</h3>
                    <p className="text-gray-400">{t('analytics.desc')}</p>
                  </div>
                  
                  <div className="flex-1 min-h-[300px] w-full bg-black/20 rounded-2xl p-4 border border-white/5">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <XAxis 
                          dataKey="name" 
                          stroke="#555" 
                          fontSize={10} 
                          tickFormatter={(val) => val}
                          tick={{fill: '#666'}}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis hide />
                        <Tooltip 
                            cursor={{fill: 'rgba(255,255,255,0.05)'}}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-black border border-white/10 p-3 rounded-lg shadow-xl">
                                    <div className="flex items-center gap-2 mb-1">
                                      <div className="w-3 h-3 rounded-full" style={{background: data.color}}></div>
                                      <p className="text-white font-mono text-xs">{data.name}</p>
                                    </div>
                                    <p className="text-gray-400 text-xs">Luminance: {data.luminance}%</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                        />
                        <Bar dataKey="luminance" radius={[6, 6, 6, 6]}>
                          {analyticsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={1} stroke="rgba(255,255,255,0.1)" />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-3 gap-4">
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                          <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">{t('analytics.avg')}</div>
                          <div className="text-xl font-mono font-bold text-white">
                            {Math.round(analyticsData.reduce((acc, cur) => acc + cur.luminance, 0) / analyticsData.length)}%
                          </div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                          <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">{t('analytics.contrast')}</div>
                          <div className="text-xl font-mono font-bold text-white">High</div>
                      </div>
                       <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                          <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">{t('analytics.mode')}</div>
                          <div className="text-xl font-mono font-bold text-white">Mixed</div>
                      </div>
                  </div>
               </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Component for Guide Cards
const GuideCard: React.FC<{ icon: React.ReactNode, title: string, desc: string }> = ({ icon, title, desc }) => (
  <div className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h4 className="text-white font-bold mb-2">{title}</h4>
    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
  </div>
);
