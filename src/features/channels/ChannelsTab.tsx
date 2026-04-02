import React from 'react';
import { Radio, Search, Plus, MoreVertical, Globe, Lock, Users, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function ChannelsTab() {
  const channels = [
    { id: '1', name: 'GxChat India Official', members: '1.2M', description: 'Official updates and news from GxChat team.', image: 'https://picsum.photos/seed/gx/200/200', verified: true },
    { id: '2', name: 'Tech News Daily', members: '450K', description: 'Stay updated with the latest in technology.', image: 'https://picsum.photos/seed/tech/200/200', verified: true },
    { id: '3', name: 'Movie Buffs', members: '890K', description: 'Discussion about latest movies and series.', image: 'https://picsum.photos/seed/movie/200/200', verified: false },
    { id: '4', name: 'Sports Hub', members: '2.1M', description: 'Live scores and sports updates.', image: 'https://picsum.photos/seed/sports/200/200', verified: true },
  ];

  return (
    <div className="flex flex-col h-full bg-[var(--bg-card)] font-sans">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-[var(--border-color)]">
        <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tighter italic">Channels</h1>
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-[var(--bg-chat)] rounded-full transition-colors">
            <Search size={20} className="text-[var(--text-secondary)]" />
          </button>
          <button className="p-2 hover:bg-[var(--bg-chat)] rounded-full transition-colors">
            <Plus size={20} className="text-[var(--text-secondary)]" />
          </button>
          <button className="p-2 hover:bg-[var(--bg-chat)] rounded-full transition-colors">
            <MoreVertical size={20} className="text-[var(--text-secondary)]" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {/* Featured Section */}
        <section className="px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Featured Channels</h3>
            <button className="text-[10px] font-black text-primary uppercase tracking-widest">Explore All</button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {channels.map(channel => (
              <motion.div 
                whileTap={{ scale: 0.95 }}
                key={channel.id} 
                className="min-w-[160px] bg-[var(--bg-chat)] rounded-[2rem] p-5 flex flex-col items-center text-center border border-[var(--border-color)] shadow-sm"
              >
                <div className="relative mb-3">
                  <img src={channel.image} className="w-16 h-16 rounded-full object-cover border-2 border-[var(--primary)]/10" referrerPolicy="no-referrer" />
                  {channel.verified && (
                    <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1 rounded-full border-2 border-[var(--bg-chat)]">
                      <Globe size={10} />
                    </div>
                  )}
                </div>
                <h4 className="text-[13px] font-black text-[var(--text-primary)] truncate w-full mb-1">{channel.name}</h4>
                <p className="text-[10px] font-bold text-[var(--text-secondary)] mb-3">{channel.members} Members</p>
                <button className="w-full py-2 bg-[var(--primary)] text-white rounded-xl text-[9px] font-black uppercase tracking-widest">Follow</button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* List Section */}
        <section className="px-6">
          <h3 className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4">Your Subscriptions</h3>
          <div className="flex flex-col gap-4">
            {channels.slice(0, 2).map(channel => (
              <div key={channel.id} className="flex items-center gap-4 p-4 bg-[var(--bg-chat)] rounded-[2rem] border border-[var(--border-color)] hover:bg-[var(--bg-chat)]/80 transition-all cursor-pointer">
                <img src={channel.image} className="w-14 h-14 rounded-full object-cover" referrerPolicy="no-referrer" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <h4 className="text-[15px] font-black text-[var(--text-primary)] truncate">{channel.name}</h4>
                    {channel.verified && <Globe size={14} className="text-primary" />}
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] font-bold truncate opacity-80">{channel.description}</p>
                </div>
                <ChevronRight size={18} className="text-[var(--text-secondary)] opacity-30" />
              </div>
            ))}
          </div>
        </section>

        {/* Create Section */}
        <section className="px-6 py-8">
          <div className="bg-gradient-to-br from-primary/10 to-indigo-500/10 rounded-[2.5rem] p-8 flex flex-col items-center text-center border border-primary/10">
            <div className="w-16 h-16 bg-primary text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-primary/20 mb-4">
              <Radio size={32} />
            </div>
            <h3 className="text-lg font-black text-[var(--text-primary)] mb-2">Create Your Channel</h3>
            <p className="text-[11px] text-[var(--text-secondary)] font-bold leading-relaxed mb-6 max-w-[200px]">Reach millions of people and share your updates with the world.</p>
            <button className="px-8 py-3 bg-[var(--text-primary)] text-[var(--bg-card)] rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all">Get Started</button>
          </div>
        </section>
      </div>
    </div>
  );
}
