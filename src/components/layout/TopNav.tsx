import React, { useState } from 'react';
import { APP_CONFIG } from '../../config/appConfig';
import { Camera, Bell, MoreVertical, Settings, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSearch } from '../../contexts/SearchContext.tsx';
import { motion, AnimatePresence } from 'motion/react';

export default function TopNav() {
  const { searchTerm, setSearchTerm, isSearchOpen, setIsSearchOpen } = useSearch();

  return (
    <div className="w-full bg-[#00B0FF] px-4 h-13 flex justify-between items-center z-50 shrink-0 relative border-b border-white/10 shadow-[0_8px_30px_rgba(0,176,255,0.2)]">
      <AnimatePresence>
        {isSearchOpen ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#00B0FF] flex items-center px-4 z-50"
          >
            <div className="flex-1 flex items-center bg-white/20 rounded-2xl px-4 py-2">
              <Search size={20} className="text-white/80 mr-3" />
              <input 
                autoFocus
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/60 text-sm font-bold"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')}>
                  <X size={20} className="text-white/80" />
                </button>
              )}
            </div>
            <button 
              onClick={() => {
                setIsSearchOpen(false);
                setSearchTerm('');
              }}
              className="ml-4 text-white text-xs font-black uppercase tracking-widest"
            >
              Cancel
            </button>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <h1 className="text-2xl font-black tracking-tighter italic font-serif text-white">{APP_CONFIG.NAME}</h1>
              </Link>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              >
                <Search size={22} className="text-white" />
              </button>
              <Link to="/notifications" className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
                <Bell size={22} className="text-white" />
              </Link>
              <Link to="/settings" className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
                <Settings size={22} className="text-white" />
              </Link>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
