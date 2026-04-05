import React from 'react';
import { Play, Heart, MessageCircle, Share2, Music } from 'lucide-react';

export default function ReelsView() {
  return (
    <div className="flex-1 pb-10 px-0.5 pt-0.5">
      <div className="grid grid-cols-3 gap-0.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((reel) => (
          <div key={reel} className="aspect-[9/16] bg-[var(--bg-chat)] relative overflow-hidden group border border-[var(--border-color)]/20">
            <img 
              src={`https://picsum.photos/seed/reel${reel}/400/700`} 
              className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-500" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex flex-col justify-end p-2">
              <div className="flex items-center gap-1 text-white/90">
                <Play size={10} fill="currentColor" />
                <span className="text-[8px] font-black tracking-widest uppercase">12.4K</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
