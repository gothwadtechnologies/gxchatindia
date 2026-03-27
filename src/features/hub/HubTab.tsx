import React from 'react';
import { useLayout } from '../../contexts/LayoutContext.tsx';
import { 
  Calculator, 
  FileText, 
  Gamepad2, 
  BookOpen, 
  Film, 
  Image as ImageIcon, 
  Music, 
  Cpu, 
  Globe, 
  Zap,
  LayoutGrid,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';

import { useNavigate } from 'react-router-dom';

const tools = [
  { id: 'gx-ai', name: 'Gx Chat AI', icon: Cpu, color: 'bg-primary', category: 'AI', path: '/chat/gx-ai' },
  { id: 'calculator', name: 'Calculator', icon: Calculator, color: 'bg-orange-500', category: 'Utility' },
  { id: 'pdf', name: 'PDF Tools', icon: FileText, color: 'bg-red-500', category: 'Utility' },
  { id: 'image', name: 'Image Editor', icon: ImageIcon, color: 'bg-primary', category: 'Creative' },
  { id: 'games', name: 'Instant Games', icon: Gamepad2, color: 'bg-purple-500', category: 'Entertainment' },
  { id: 'stories', name: 'Stories Hub', icon: Zap, color: 'bg-yellow-500', category: 'Entertainment' },
  { id: 'books', name: 'Book Library', icon: BookOpen, color: 'bg-emerald-500', category: 'Education' },
  { id: 'movies', name: 'Movie Hub', icon: Film, color: 'bg-rose-500', category: 'Entertainment' },
  { id: 'music', name: 'Music Player', icon: Music, color: 'bg-indigo-500', category: 'Entertainment' },
  { id: 'web', name: 'Web Browser', icon: Globe, color: 'bg-zinc-800', category: 'Utility' },
];

export default function HubTab() {
  const navigate = useNavigate();
  const { activeFilters } = useLayout();
  const activeFilter = activeFilters['hub'];

  const filteredTools = tools.filter(tool => {
    if (activeFilter === 'Others') return !['AI', 'Utility', 'Creative', 'Entertainment', 'Education'].includes(tool.category);
    if (activeFilter === 'Tools') return tool.category === 'Utility' || tool.category === 'Creative' || tool.category === 'AI';
    if (activeFilter === 'Apps') return tool.category === 'Utility' || tool.category === 'Creative';
    if (activeFilter === 'Games') return tool.category === 'Entertainment';
    return true;
  });

  return (
    <div className="h-full flex flex-col bg-[var(--bg-card)] overflow-hidden font-sans">
      <div className="flex-1 pb-24">
        {/* Categories / Grid */}
        <div className="px-4 mt-6">
          <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Featured {activeFilter}</h3>
            <button className="text-[10px] font-black text-primary uppercase tracking-widest">View All</button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {filteredTools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => tool.path && navigate(tool.path)}
                className="bg-white rounded-[1.5rem] p-3 shadow-sm border border-zinc-100 flex flex-col items-center text-center gap-3 group cursor-pointer"
              >
                <div className={`w-10 h-10 ${tool.color} rounded-xl flex items-center justify-center text-white shadow-lg shadow-${tool.color.split('-')[1]}-100 group-hover:rotate-6 transition-transform`}>
                  <tool.icon size={20} />
                </div>
                <div>
                  <p className="text-[7px] font-black text-zinc-400 uppercase tracking-widest mb-1">{tool.category}</p>
                  <h4 className="text-[11px] font-black text-zinc-900 tracking-tight leading-tight">
                    {tool.name}
                  </h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="px-4 mt-8 mb-4">
          <div className="bg-zinc-900 rounded-[2rem] p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white">
                <Zap size={20} className="animate-pulse text-yellow-400" />
              </div>
              <div>
                <h4 className="text-white text-xs font-black uppercase tracking-widest">More Tools</h4>
                <p className="text-zinc-500 text-[10px] font-bold">New tools arriving every week</p>
              </div>
            </div>
            <button className="bg-white text-zinc-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Suggest</button>
          </div>
        </div>
      </div>
    </div>
  );
}
