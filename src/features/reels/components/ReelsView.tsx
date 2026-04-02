import React from 'react';
import { Play, Heart, MessageCircle, Share2, Music } from 'lucide-react';

export default function ReelsView() {
  return (
    <div className="flex-1 pb-10 px-4 pt-4">
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5, 6].map((reel) => (
          <div key={reel} className="aspect-[9/16] bg-[var(--bg-chat)] rounded-3xl relative overflow-hidden group border border-[var(--border-color)]">
            <img 
              src={`https://picsum.photos/seed/reel${reel}/400/700`} 
              className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md overflow-hidden border border-white/30">
                  <img src={`https://picsum.photos/seed/user${reel}/50/50`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <p className="text-[10px] font-black text-white uppercase tracking-widest">User {reel}</p>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Play size={12} fill="currentColor" />
                <span className="text-[10px] font-black tracking-widest uppercase">12.4K</span>
              </div>
            </div>
            <div className="absolute top-4 right-4 flex flex-col gap-4 text-white">
              <div className="flex flex-col items-center">
                <Heart size={20} />
                <span className="text-[8px] font-black uppercase tracking-widest mt-1">1.2K</span>
              </div>
              <div className="flex flex-col items-center">
                <MessageCircle size={20} />
                <span className="text-[8px] font-black uppercase tracking-widest mt-1">45</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
