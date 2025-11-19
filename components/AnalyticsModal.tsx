import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { X, Activity } from 'lucide-react';
import { ColorState } from '../types';
import { getLuminance } from '../services/colorUtils';

interface AnalyticsModalProps {
  colors: ColorState[];
  onClose: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ colors, onClose }) => {
  const data = colors.map(c => ({
    name: c.hex,
    luminance: Math.round(getLuminance(c.hex)),
    color: c.hex
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        
        <div className="p-6 flex justify-between items-center border-b border-white/5">
          <div className="flex items-center gap-2 text-white">
            <Activity className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold">Palette Analytics</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 h-80 w-full">
            <p className="text-gray-400 text-xs mb-4 font-mono">LUMINANCE DISTRIBUTION (0-100)</p>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis 
                  dataKey="name" 
                  stroke="#555" 
                  fontSize={12} 
                  tickFormatter={(val) => val}
                  tick={{fill: '#888'}}
                />
                <YAxis stroke="#555" fontSize={12} tick={{fill: '#888'}} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                />
                <Bar dataKey="luminance" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.luminance < 20 ? '#333' : 'none'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};