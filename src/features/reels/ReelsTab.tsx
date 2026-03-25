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
        return <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 gap-4">
          <CircleDashed size={48} />
          <p className="text-sm font-bold uppercase tracking-widest">No Status Updates</p>
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
        <div className="absolute bottom-24 right-6 flex flex-col gap-3 z-40">
          <button className="p-3 bg-white text-zinc-600 rounded-full shadow-lg border border-zinc-100">
            <Edit size={20} />
          </button>
          <button className="p-4 bg-blue-600 text-white rounded-full shadow-xl">
            <Camera size={24} />
          </button>
        </div>
      )}
    </div>
  );
}
