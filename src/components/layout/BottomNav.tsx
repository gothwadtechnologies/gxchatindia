import React, { useEffect, useState } from 'react';
import { MessageCircle, Compass, PlayCircle, LayoutGrid, UserCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { auth, db } from '../../services/firebase.ts';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { motion } from 'motion/react';

export default function BottomNav() {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "messages"),
      where("receiverId", "==", auth.currentUser.uid),
      where("isRead", "==", false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.size);
    });

    return () => unsubscribe();
  }, []);
  
  const navItems = [
    { icon: MessageCircle, path: '/chats', label: 'Chats', badge: unreadCount },
    { icon: PlayCircle, path: '/reels', label: 'Reels' },
    { icon: Compass, path: '/', label: 'Explore' },
    { icon: LayoutGrid, path: '/hub', label: 'Hub' },
    { icon: UserCircle, path: '/profile', label: 'Profile' },
  ];

  return (
    <div className="w-full bg-[var(--header-gradient)] px-2 py-1 flex justify-around items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] shrink-0 border-t border-white/10 pb-safe">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Link 
            key={item.path} 
            to={item.path} 
            className="relative flex flex-col items-center justify-center py-2 px-1 min-w-[64px] transition-all duration-300 group"
          >
            <div className="relative flex flex-col items-center">
              <motion.div 
                animate={{ 
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -2 : 0
                }}
                className={`transition-colors duration-300 ${isActive ? 'text-white' : 'text-white/50 group-hover:text-white/80'}`}
              >
                <Icon 
                  size={26} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </motion.div>
              
              {item.badge !== undefined && item.badge > 0 && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#1d4ed8] shadow-sm z-10"
                >
                  {item.badge > 9 ? '9+' : item.badge}
                </motion.div>
              )}
            </div>
            
            <span className={`text-[10px] mt-1 font-bold transition-all duration-300 ${isActive ? 'text-white opacity-100' : 'text-white/40 opacity-70 group-hover:opacity-100'}`}>
              {item.label}
            </span>


            {isActive && (
              <motion.div 
                layoutId="nav-indicator"
                className="absolute top-0 w-8 h-1 bg-[var(--primary)] rounded-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </Link>
        );
      })}
    </div>
  );
}
