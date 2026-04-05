import React from 'react';
import { 
  Radio, 
  Search, 
  Plus, 
  MoreVertical, 
  Globe, 
  Lock, 
  Users, 
  ChevronRight,
  Cpu,
  Github,
  ShoppingBag,
  Gamepad2,
  Trophy,
  Archive,
  Image,
  Wrench,
  LayoutGrid
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function HubTab() {
  const navigate = useNavigate();

  const apps: any[] = [];
  const channels: any[] = [];

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)] font-sans">
      {/* Header */}
      <div className="px-6 py-6 flex items-center justify-between">
        <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter italic italic">Hub</h1>
        <div className="flex items-center gap-3">
          <button className="p-2.5 bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-color)]">
            <Search size={20} className="text-[var(--text-secondary)]" />
          </button>
          <button className="p-2.5 bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-color)]">
            <Plus size={20} className="text-[var(--text-secondary)]" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {/* Apps & Games Grid */}
        <section className="px-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Apps & Games</h3>
            <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest">8 Available</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {apps.map((app) => (
              <motion.div
                key={app.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => app.path.startsWith('http') ? window.open(app.path, '_blank') : navigate(app.path)}
                className="bg-[var(--bg-card)] p-5 rounded-[2.5rem] border border-[var(--border-color)] shadow-sm flex flex-col items-center text-center group cursor-pointer"
              >
                <div className={`w-14 h-14 ${app.color} rounded-[1.5rem] flex items-center justify-center text-white shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                  <app.icon size={28} />
                </div>
                <h4 className="text-[14px] font-black text-[var(--text-primary)] mb-1">{app.name}</h4>
                <p className="text-[10px] font-bold text-[var(--text-secondary)] opacity-70">{app.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
