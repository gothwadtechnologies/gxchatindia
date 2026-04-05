import React from 'react';
import ReelsView from './components/ReelsView.tsx';

export default function ReelsTab() {
  return (
    <div className="flex flex-col bg-[var(--bg-card)] relative h-full overflow-y-auto no-scrollbar pb-24">
      <ReelsView />
    </div>
  );
}
