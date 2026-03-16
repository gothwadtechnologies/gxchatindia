import React, { useEffect, useState } from 'react';
import { MessageSquare, CircleDashed, Search, Phone, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { auth, db } from '../server/firebase.ts';
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
    { icon: MessageSquare, path: '/', label: 'Chats', badge: unreadCount },
    { icon: CircleDashed, path: '/status', label: 'Status' },
    { icon: Search, path: '/explore', label: 'Search' },
    { icon: Phone, path: '/calls', label: 'Calls' },
    { icon: User, path: '/profile', label: 'Profile' },
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
            className="relative flex flex-col items-center justify-center py-1 px-2 min-w-[64px] transition-all duration-300 group"
          >
            <div className="relative flex flex-col items-center">
              <div className={`px-5 py-1 rounded-2xl transition-all duration-300 ${isActive ? 'bg-white text-[#00B0FF] shadow-lg' : 'text-white/80 group-hover:bg-white/10 group-hover:text-white'}`}>
                <Icon 
                  size={22} 
                  className="transition-transform duration-300" 
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              
              {item.badge !== undefined && item.badge > 0 && (
                <div className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 shadow-sm z-10 ${isActive ? 'border-white' : 'border-[#00B0FF]'}`}>
                  {item.badge > 9 ? '9+' : item.badge}
                </div>
              )}
              
              <span className={`text-[10px] font-bold mt-1 transition-colors duration-300 ${isActive ? 'text-white' : 'text-white/80'}`}>
                {item.label}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
