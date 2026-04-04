import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, getDoc, getDocs, doc, limit, orderBy } from 'firebase/firestore';
import { auth, db } from '../../services/firebase.ts';
import { toDate } from '../../utils/dateUtils.ts';
import { useSearch } from '../../contexts/SearchContext.tsx';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MessageCircle, MoreVertical, Phone, Video, ArrowUpRight, ArrowDownLeft, Plus } from 'lucide-react';
import { CacheService } from '../../services/CacheService.ts';

export default function ChatsTab() {
  const navigate = useNavigate();
  const { searchTerm } = useSearch();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Optimized query: Fetch messages involving the user
    // We'll use two queries to get messages where user is sender or receiver
    // We remove orderBy and limit to avoid needing composite indexes
    const qSender = query(
      collection(db, "messages"),
      where("senderId", "==", auth.currentUser.uid)
    );

    const qReceiver = query(
      collection(db, "messages"),
      where("receiverId", "==", auth.currentUser.uid)
    );

    const processMessages = async (snapshot1: any, snapshot2: any) => {
      const allMsgs = [
        ...snapshot1.docs.map((d: any) => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) })),
        ...snapshot2.docs.map((d: any) => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }))
      ];

      // Group by chatId and keep the latest message
      const chatGroups: { [key: string]: any } = {};
      allMsgs.forEach(msg => {
        const msgTime = toDate(msg.timestamp)?.getTime() || Date.now();
        const existingTime = toDate(chatGroups[msg.chatId]?.timestamp)?.getTime() || 0;
        if (!chatGroups[msg.chatId] || msgTime > existingTime) {
          chatGroups[msg.chatId] = msg;
        }
      });

      // Sort by time descending and limit to 100 recent chats
      const sortedChats = Object.values(chatGroups).sort((a, b) => {
        const timeA = toDate(a.timestamp)?.getTime() || Date.now();
        const timeB = toDate(b.timestamp)?.getTime() || Date.now();
        return timeB - timeA;
      }).slice(0, 100);

      // Batch fetch user data for performance
      const otherUserIds = Array.from(new Set(sortedChats.map(chat => 
        chat.senderId === auth.currentUser?.uid ? chat.receiverId : chat.senderId
      )));

      // Filter out cached users
      const uncachedIds = otherUserIds.filter(id => !CacheService.getUser(id));
      
      // Fetch uncached users in chunks of 30 (Firestore limit for 'in' query)
      const userMap = new Map();
      // Add cached users to map
      otherUserIds.forEach(id => {
        const cached = CacheService.getUser(id);
        if (cached) userMap.set(id, cached);
      });

      if (uncachedIds.length > 0) {
        for (let i = 0; i < uncachedIds.length; i += 30) {
          const chunk = uncachedIds.slice(i, i + 30);
          const userSnap = await getDocs(query(collection(db, "users"), where("uid", "in", chunk)));
          userSnap.docs.forEach(d => {
            const data = d.data();
            userMap.set(d.id, data);
            CacheService.saveUser(d.id, data);
          });
        }
      }

      const chatList = sortedChats.map((chat) => {
        const otherUserId = chat.senderId === auth.currentUser?.uid ? chat.receiverId : chat.senderId;
        const userData = userMap.get(otherUserId);
        
        const unreadCount = allMsgs.filter(m => 
          m.chatId === chat.chatId && 
          m.receiverId === auth.currentUser?.uid && 
          !m.isRead
        ).length;

        return {
          id: chat.chatId,
          otherUserId,
          user: userData?.fullName || userData?.username || 'Unknown User',
          username: userData?.username || '',
          fullName: userData?.fullName || '',
          lastMsg: chat.text,
          time: toDate(chat.timestamp) ? formatTime(toDate(chat.timestamp)) : 'Recently',
          avatar: userData?.photoURL || `https://cdn-icons-png.flaticon.com/512/149/149071.png`,
          unread: unreadCount > 0,
          unreadCount,
          isOnline: userData?.isOnline || false
        };
      });

      setConversations(chatList);
      setLoading(false);
    };

    let snap1: any = { docs: [] };
    let snap2: any = { docs: [] };
    let timeout: any;

    const debouncedProcess = (s1: any, s2: any) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => processMessages(s1, s2), 100);
    };

    const unsub1 = onSnapshot(qSender, (s) => {
      snap1 = s;
      debouncedProcess(snap1, snap2);
    });

    const unsub2 = onSnapshot(qReceiver, (s) => {
      snap2 = s;
      debouncedProcess(snap1, snap2);
    });

    return () => {
      if (timeout) clearTimeout(timeout);
      unsub1();
      unsub2();
    };
  }, []);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (days === 1) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const filteredConversations = conversations.filter(c => {
    const matchesSearch = c.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="h-full flex flex-col bg-[var(--bg-card)] overflow-hidden">
      <div className="px-4 pt-6 pb-2">
        <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tighter italic italic">Chats</h2>
        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] mt-1">Messages</p>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {/* User List (Chats) */}
        <div className="flex flex-col">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-8 h-8 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin" />
              <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Loading Chats...</p>
            </div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map(chat => (
              <Link 
                to={`/chat/${chat.otherUserId}`} 
                key={chat.id} 
                className="flex items-center gap-4 px-4 py-4 hover:bg-[var(--bg-main)] transition-all active:scale-[0.98] group"
              >
                <div className="relative">
                  <img 
                    src={chat.avatar} 
                    className="w-14 h-14 rounded-full object-cover border-2 border-[var(--bg-card)] shadow-sm group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  {chat.isOnline && (
                    <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-[var(--bg-card)] rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className={`text-[15px] truncate ${chat.unread ? 'font-black text-[var(--text-primary)]' : 'font-bold text-[var(--text-primary)]'}`}>
                      {chat.user}
                    </h3>
                    <span className={`text-[10px] whitespace-nowrap ${chat.unread ? 'text-[var(--primary)] font-bold' : 'text-[var(--text-secondary)]'}`}>
                      {chat.time}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-xs truncate ${chat.unread ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-secondary)]'}`}>
                      {chat.lastMsg}
                    </p>
                    {chat.unread && (
                      <div className="min-w-[18px] h-[18px] px-1 bg-[var(--primary)] rounded-full flex items-center justify-center shadow-lg shadow-[var(--primary-shadow)] ml-2">
                        <span className="text-[10px] text-white font-bold">{chat.unreadCount}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-10 text-center gap-4">
              <div className="p-4 bg-[var(--bg-main)] rounded-full text-[var(--text-secondary)]">
                <MessageCircle size={40} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">No messages yet</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Start a conversation with your friends in GxChat India.
                </p>
              </div>
              <button 
                onClick={() => navigate('/explore')}
                className="mt-2 bg-[var(--primary)] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-[var(--primary-shadow)] hover:opacity-90 transition-all"
              >
                Find Friends
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="absolute bottom-20 right-6 z-40">
        <button 
          onClick={() => navigate('/explore')}
          className="p-4 bg-[var(--primary)] text-white rounded-full shadow-xl hover:opacity-90 transition-all active:scale-95 border-2 border-white/20"
        >
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
}
