import React from 'react';
import ReelsView from './components/ReelsView.tsx';

export default function ReelsTab() {
  return (
    <div className="flex flex-col bg-[var(--bg-card)] relative h-full overflow-y-auto no-scrollbar pb-24">
      <div className="px-4 pt-6 pb-2">
        <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tighter italic italic">Channels</h2>
        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] mt-1">Trending Videos</p>
      </div>
      <ReelsView />
    </div>
  );
}
