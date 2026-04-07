import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, MoreVertical, Settings, UserPlus, Users, Laptop, Star, Archive } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSearch } from '../../contexts/SearchContext.tsx';

export default function TabHeader() {
  const { setIsSearchOpen } = useSearch();
  const location = useLocation();
  const navigate = useNavigate();
  const isProfilePage = location.pathname === '/profile';
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuOptions = [
    { label: 'New group', icon: Users },
    { label: 'New broadcast', icon: UserPlus },
    { label: 'Linked devices', icon: Laptop },
    { label: 'Starred messages', icon: Star },
    { label: 'Archived', icon: Archive },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

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
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <MoreVertical size={22} className="text-[var(--header-text)]" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-[var(--bg-card)] rounded-xl shadow-2xl border border-[var(--border-color)] py-2 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                {menuOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setShowMenu(false);
                      if (option.path) navigate(option.path);
                    }}
                    className="w-full px-4 py-3 text-left text-[14px] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-main)] flex items-center gap-3 transition-colors"
                  >
                    <option.icon size={18} className="text-[var(--text-secondary)]" />
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
