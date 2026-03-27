import React, { useState } from 'react';
import { APP_CONFIG } from '../../config/appConfig';
import { Camera, Bell, MoreVertical, Settings, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSearch } from '../../contexts/SearchContext.tsx';
import { motion, AnimatePresence } from 'motion/react';

export default function TopNav() {
  const { searchTerm, setSearchTerm, isSearchOpen, setIsSearchOpen } = useSearch();

  return (
    <div className="w-full bg-gradient-to-r from-[#4f46e5] via-[#9333ea] to-[#ec4899] px-4 h-14 flex justify-between items-center z-50 shrink-0 relative border-b border-white/10 shadow-lg">
      <AnimatePresence>
        {isSearchOpen ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#4f46e5] flex items-center px-4 z-50"
          >
            <div className="flex-1 flex items-center bg-white/10 rounded-full px-4 py-1.5 border border-white/10">
              <Search size={18} className="text-white/60 mr-3" />
              <input 
                autoFocus
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/40 text-sm font-medium"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')}>
                  <X size={18} className="text-white/60" />
                </button>
              )}
            </div>
            <button 
              onClick={() => {
                setIsSearchOpen(false);
                setSearchTerm('');
              }}
              className="ml-4 text-white text-sm font-bold"
            >
              Cancel
            </button>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tighter italic">
                  GxChat India
                </h1>
              </Link>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              >
                <Search size={22} className="text-white/80" />
              </button>
              <Link to="/notifications" className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
                <Bell size={22} className="text-white/80" />
              </Link>
              <Link to="/settings" className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
                <Settings size={22} className="text-white/80" />
              </Link>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
