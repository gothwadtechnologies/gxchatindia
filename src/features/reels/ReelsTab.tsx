import React from 'react';
import ReelsView from './components/ReelsView.tsx';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export default function ReelsTab() {
  const navigate = useNavigate();

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="h-full overflow-y-auto no-scrollbar pb-24 bg-[var(--bg-card)]">
        <ReelsView />
      </div>

      {/* Floating Action Button */}
      <div className="absolute bottom-4 right-6 z-40">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/reels/create')}
          className="p-3.5 bg-[var(--header-bg)] text-[var(--header-text)] rounded-full shadow-xl border border-[var(--border-color)] flex items-center justify-center"
        >
          <Plus size={24} strokeWidth={3} />
        </motion.button>
      </div>
    </div>
  );
}
