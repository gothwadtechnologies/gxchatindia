import React, { useEffect, useState } from 'react';
import { MessageSquare, Home, Clapperboard, LayoutGrid, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { auth, db } from '../../services/firebase.ts';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { motion } from 'motion/react';

export default function BottomNav() {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Query unread messages directly
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
    { icon: MessageSquare, path: '/chats', badge: unreadCount },
    { icon: Clapperboard, path: '/reels' },
    { icon: Home, path: '/' },
    { icon: LayoutGrid, path: '/hub' },
    { icon: User, path: '/profile' },
  ];

  return (
    <div className="w-full bg-[#00B0FF] px-4 py-2 flex justify-around items-center z-50 shadow-[0_-8px_30px_rgba(0,176,255,0.2)] shrink-0 border-t border-white/10">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Link 
            key={item.path} 
            to={item.path} 
            className="relative flex flex-col items-center justify-center py-1 px-2 min-w-[50px] transition-all duration-300 group"
          >
            <div className="relative flex flex-col items-center">
              <div className={`px-4 py-1.5 rounded-2xl transition-all duration-300 ${isActive ? 'bg-white text-[#00B0FF] shadow-lg' : 'text-white/80 group-hover:bg-white/10 group-hover:text-white'}`}>
                <Icon 
                  size={24} 
                  className="transition-transform duration-300" 
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              
              {item.badge !== undefined && item.badge > 0 && (
                <div className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 shadow-sm z-10 ${isActive ? 'border-white' : 'border-[#00B0FF]'}`}>
                  {item.badge > 9 ? '9+' : item.badge}
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
