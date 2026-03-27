import React, { useState } from 'react';
import { 
  Grid, 
  Clapperboard, 
  UserSquare2,
  Video,
  PlusSquare
} from 'lucide-react';

interface ProfileContentProps {
  posts: any[];
  activeTab: string;
}

export default function ProfileContent({ posts, activeTab }: ProfileContentProps) {
  return (
    <div className="flex flex-col">
      {/* Content Area */}
      {activeTab === 'Post' && (
        <div className="grid grid-cols-3 gap-0.5 bg-[var(--border-color)]">
          {posts.map((post) => (
            <div key={post.id} className="aspect-square bg-[var(--bg-main)] relative group overflow-hidden">
              <img 
                src={post.url} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
                alt={`Post ${post.id}`}
              />
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Reels' && (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--text-secondary)]">
          <Clapperboard size={48} strokeWidth={1.5} />
          <p className="mt-4 text-[11px] font-bold uppercase tracking-widest">No Reels yet</p>
        </div>
      )}

      {activeTab === 'Video' && (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--text-secondary)]">
          <Video size={48} strokeWidth={1.5} />
          <p className="mt-4 text-[11px] font-bold uppercase tracking-widest">No Videos yet</p>
        </div>
      )}

      {activeTab === 'Upload' && (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--text-secondary)]">
          <PlusSquare size={48} strokeWidth={1.5} />
          <p className="mt-4 text-[11px] font-bold uppercase tracking-widest">Upload Content</p>
        </div>
      )}
    </div>
  );
}
