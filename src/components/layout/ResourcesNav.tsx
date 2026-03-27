import React from 'react';
import { motion } from 'motion/react';
import { 
  Phone, 
  MessageSquare, 
  Users, 
  UserPlus, 
  CircleDashed, 
  Clapperboard, 
  Video, 
  Grid, 
  Heart, 
  Search, 
  Compass, 
  Bell, 
  Wrench, 
  LayoutGrid, 
  Gamepad2, 
  MoreHorizontal, 
  Upload 
} from 'lucide-react';

import { useLayout } from '../../contexts/LayoutContext.tsx';

export type TabType = 'home' | 'reels' | 'chats' | 'hub' | 'profile';

interface ResourcesNavProps {
  tab: TabType;
}

const tabFilters: Record<TabType, { id: string; label: string; icon: any }[]> = {
  home: [
    { id: 'For You', label: 'For You', icon: Heart },
    { id: 'Search', label: 'Search', icon: Search },
    { id: 'Explore', label: 'Explore', icon: Compass },
    { id: 'Updates', label: 'Updates', icon: Bell }
  ],
  reels: [
    { id: 'Status', label: 'Status', icon: CircleDashed },
    { id: 'Reels', label: 'Reels', icon: Clapperboard },
    { id: 'Video', label: 'Video', icon: Video },
    { id: 'Posts', label: 'Posts', icon: Grid }
  ],
  chats: [
    { id: 'Calls', label: 'Calls', icon: Phone },
    { id: 'Chats', label: 'Chats', icon: MessageSquare },
    { id: 'Groups', label: 'Groups', icon: Users },
    { id: 'Requests', label: 'Requests', icon: UserPlus }
  ],
  hub: [
    { id: 'Tools', label: 'Tools', icon: Wrench },
    { id: 'Apps', label: 'Apps', icon: LayoutGrid },
    { id: 'Games', label: 'Games', icon: Gamepad2 },
    { id: 'Others', label: 'Others', icon: MoreHorizontal }
  ],
  profile: [
    { id: 'Post', label: 'Post', icon: Grid },
    { id: 'Reels', label: 'Reels', icon: Clapperboard },
    { id: 'Video', label: 'Video', icon: Video },
    { id: 'Upload', label: 'Upload', icon: Upload }
  ]
};

export default function ResourcesNav({ tab }: ResourcesNavProps) {
  const { activeFilters, setActiveFilter } = useLayout();
  const activeFilter = activeFilters[tab];
  const filters = tabFilters[tab] || [];

  return (
    <div className="w-full bg-transparent px-2 h-14 flex items-center shrink-0 z-40">
      <div className="flex gap-1.5 w-full">
        {filters.map((filter) => {
          const isActive = activeFilter.toLowerCase() === filter.id.toLowerCase();
          const Icon = filter.icon;

          return (
            <motion.button
              key={filter.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter(tab, filter.id)}
              className={`flex-1 flex items-center justify-center gap-1 px-1 py-2.5 rounded-xl transition-all duration-300 border min-w-0 ${
                isActive 
                  ? 'bg-white text-[#9333ea] border-white shadow-md' 
                  : 'bg-black/5 text-black/60 border-transparent hover:text-black hover:bg-black/10'
              }`}
            >
              <Icon size={14} strokeWidth={isActive ? 3 : 2} className="shrink-0" />
              <span className="text-[9px] font-bold uppercase tracking-tighter truncate">
                {filter.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
