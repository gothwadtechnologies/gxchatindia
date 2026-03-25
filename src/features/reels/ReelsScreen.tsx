import React from 'react';
import { ArrowLeft, MoreVertical, Heart, MessageCircle, Send, Bookmark, Music, User } from 'lucide-react';
import BottomNav from '../../components/layout/BottomNav.tsx';

export default function ReelsScreen() {
  const reels = [
    {
      id: 1,
      user: 'travel_vibes',
      caption: 'Exploring the hidden gems of the world 🌍✨ #travel #reels',
      audio: 'Original Audio - travel_vibes',
      likes: '124K',
      comments: '1.2K',
      video: 'https://picsum.photos/seed/reel1/1080/1920'
    }
  ];

  return (
    <div className="h-full flex flex-col bg-black text-white relative overflow-hidden w-full">
      {/* Top Bar */}
      <div className="shrink-0 p-4 flex justify-between items-center z-20 bg-black/20">
        <h2 className="text-xl font-bold">Reels</h2>
        <Camera size={24} />
      </div>

      <div className="flex-1 relative overflow-hidden">
        <img 
          src={reels[0].video} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60"></div>

        {/* Side Actions */}
        <div className="absolute right-4 bottom-10 flex flex-col gap-6 items-center z-20">
          <div className="flex flex-col items-center gap-1">
            <Heart size={32} />
            <span className="text-xs">{reels[0].likes}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <MessageCircle size={32} />
            <span className="text-xs">{reels[0].comments}</span>
          </div>
          <Send size={32} />
          <MoreVertical size={28} />
          <div className="w-8 h-8 rounded-lg border-2 border-white overflow-hidden">
            <img src="https://picsum.photos/seed/audio/50/50" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Bottom Info */}
        <div className="absolute left-4 bottom-10 right-16 z-20">
          <div className="flex items-center gap-3 mb-3">
            <img 
              src="https://picsum.photos/seed/user1/100/100" 
              className="w-8 h-8 rounded-full border border-white"
            />
            <span className="font-semibold text-sm">{reels[0].user}</span>
            <button className="border border-white px-3 py-1 rounded-lg text-xs font-semibold">Follow</button>
          </div>
          <p className="text-sm mb-3 line-clamp-2">{reels[0].caption}</p>
          <div className="flex items-center gap-2">
            <Music size={14} />
            <span className="text-xs">{reels[0].audio}</span>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

import { Camera } from 'lucide-react';
