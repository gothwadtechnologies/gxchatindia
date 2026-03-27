import React from 'react';
import { useLayout } from '../../contexts/LayoutContext.tsx';
import ReelsView from './components/ReelsView.tsx';
import VideosView from './components/VideosView.tsx';
import PostsView from './components/PostsView.tsx';
import { Camera, Edit, CircleDashed } from 'lucide-react';

export default function ReelsTab() {
  const { activeFilters } = useLayout();
  const activeFilter = activeFilters['reels'];

  const renderView = () => {
    switch (activeFilter) {
      case 'Status':
        return <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)] gap-6">
          <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center border border-[var(--border-color)]">
            <CircleDashed size={40} strokeWidth={1.5} />
          </div>
          <p className="text-[11px] font-black uppercase tracking-widest">No Status Updates</p>
        </div>;
      case 'Reels':
        return <ReelsView />;
      case 'Video':
        return <VideosView />;
      case 'Posts':
        return <PostsView />;
      default:
        return <ReelsView />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[var(--bg-card)] overflow-hidden relative">
      {renderView()}

      {/* Floating Actions (Only for Stories) */}
      {activeFilter === 'Stories' && (
        <div className="absolute bottom-24 right-6 flex flex-col gap-4 z-40">
          <button className="p-3 bg-[var(--bg-card)] text-[var(--text-primary)] rounded-full shadow-xl border border-[var(--border-color)] active:scale-95 transition-all">
            <Edit size={20} />
          </button>
          <button className="p-4 bg-[var(--text-primary)] text-[var(--bg-card)] rounded-full shadow-2xl active:scale-95 transition-all">
            <Camera size={24} strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
}
