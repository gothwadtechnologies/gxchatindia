import React, { useState } from 'react';
import { APP_CONFIG } from '../../config/appConfig';
import { Camera, Bell, MoreVertical, Settings, Search, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSearch } from '../../contexts/SearchContext.tsx';
import { motion, AnimatePresence } from 'motion/react';

export default function TopNav() {
  const { searchTerm, setSearchTerm, isSearchOpen, setIsSearchOpen } = useSearch();
  const location = useLocation();
  const navigate = useNavigate();
  const isProfilePage = location.pathname === '/profile';

  return (
    <div className="w-full bg-[var(--header-bg)] px-4 h-14 flex justify-between items-center z-50 shrink-0 relative border-b border-[var(--border-color)] shadow-sm rounded-b-2xl">
      <AnimatePresence>
        {isSearchOpen ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[var(--header-bg)] flex items-center px-4 z-50"
          >
            <div className="flex-1 flex items-center bg-[var(--bg-chat)] rounded-full px-4 py-1.5 border border-[var(--border-color)]">
              <Search size={18} className="text-[var(--text-secondary)] mr-3" />
              <input 
                autoFocus
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] text-sm font-medium"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')}>
                  <X size={18} className="text-[var(--text-secondary)]" />
                </button>
              )}
            </div>
            <button 
              onClick={() => {
                setIsSearchOpen(false);
                setSearchTerm('');
              }}
              className="ml-4 text-[var(--header-text)] text-sm font-bold"
            >
              Cancel
            </button>
          </motion.div>
        ) : (
          <>
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
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
