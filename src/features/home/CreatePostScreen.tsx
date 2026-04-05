import React, { useState } from 'react';
import { X, Image as ImageIcon, Film, MapPin, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CreatePostScreen() {
  const navigate = useNavigate();
  const [caption, setCaption] = useState('');

  return (
    <div className="min-h-screen bg-white w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 bg-gradient-to-r from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] border-b border-white/10 shadow-lg">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-white hover:bg-white/10 p-1 rounded-full transition-colors">
            <X size={28} />
          </button>
          <h2 className="text-xl font-bold text-white">New post</h2>
        </div>
        <button className="text-white font-bold text-lg hover:bg-white/10 px-3 py-1 rounded-lg transition-colors">Share</button>
      </div>

      {/* Content */}
      <div className="p-4 flex gap-4 border-b border-zinc-100">
        <div className="w-20 h-20 bg-zinc-100 rounded-md overflow-hidden">
          <img src="https://picsum.photos/seed/newpost/200/200" className="w-full h-full object-cover" />
        </div>
        <textarea 
          placeholder="Write a caption..."
          className="flex-1 py-2 text-sm focus:outline-none resize-none"
          rows={4}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
      </div>

      {/* Options */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <MapPin size={20} />
            <span className="text-sm">Add location</span>
          </div>
          <ChevronRight size={20} className="text-zinc-400" />
        </div>
        <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <User size={20} />
            <span className="text-sm">Tag people</span>
          </div>
          <ChevronRight size={20} className="text-zinc-400" />
        </div>
        <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <Music size={20} />
            <span className="text-sm">Add music</span>
          </div>
          <ChevronRight size={20} className="text-zinc-400" />
        </div>
      </div>

      {/* Footer / Gallery hint */}
      <div className="p-4 mt-auto">
        <p className="text-xs text-zinc-400">Your post will be shared with your followers.</p>
      </div>
    </div>
  );
}

import { User, Music } from 'lucide-react';
