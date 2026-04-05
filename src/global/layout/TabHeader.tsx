import React from 'react';
import { Search, Bell, MoreVertical, Settings } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSearch } from '../../contexts/SearchContext.tsx';

export default function TabHeader() {
  const { setIsSearchOpen } = useSearch();
  const location = useLocation();
  const navigate = useNavigate();
  const isProfilePage = location.pathname === '/profile';

  return (
    <div className="w-full bg-[var(--header-bg)] px-4 h-14 flex justify-between items-center z-50 shrink-0 relative border-b border-[var(--border-color)] shadow-sm rounded-b-2xl">
      <div className="flex items-center">
        <Link to="/" className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-[var(--header-text)] tracking-tighter italic">
            GxChat India
          </h1>
        </Link>
      </div>
      <div className="flex items-center gap-1">
        <button 
          onClick={() => setIsSearchOpen(true)}
          className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
        >
          <Search size={22} className="text-[var(--header-text)]" />
        </button>
        <Link to="/notifications" className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
          <Bell size={22} className="text-[var(--header-text)]" />
        </Link>
        {isProfilePage ? (
          <button 
            onClick={() => navigate('/settings')}
            className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <Settings size={22} className="text-[var(--header-text)]" />
          </button>
        ) : (
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
            <MoreVertical size={22} className="text-[var(--header-text)]" />
          </button>
        )}
      </div>
    </div>
  );
}
