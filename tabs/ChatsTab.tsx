import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, getDoc, doc, limit, orderBy } from 'firebase/firestore';
import { auth, db } from '../server/firebase.ts';
import { toDate } from '../src/utils/dateUtils.ts';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Edit, Plus, MessageCircle, MoreVertical } from 'lucide-react';
import { CacheService } from '../src/services/CacheService.ts';

export default function ChatsTab() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
        ...snapshot1.docs.map((d: any) => ({ id: d.id, ...d.data() })),
        ...snapshot2.docs.map((d: any) => ({ id: d.id, ...d.data() }))
      ];

      // Group by chatId and keep the latest message
      const chatGroups: { [key: string]: any } = {};
      allMsgs.forEach(msg => {
        if (!chatGroups[msg.chatId] || (msg.timestamp?.seconds || 0) > (chatGroups[msg.chatId].timestamp?.seconds || 0)) {
          chatGroups[msg.chatId] = msg;
        }
      });

      // Sort by time descending and limit to 100 recent chats
      const sortedChats = Object.values(chatGroups).sort((a, b) => 
        (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)
      ).slice(0, 100);

      const chatList = await Promise.all(sortedChats.map(async (chat) => {
        const otherUserId = chat.senderId === auth.currentUser?.uid ? chat.receiverId : chat.senderId;
        
        // Try cache first
        let userData: any = CacheService.getUser(otherUserId);
        if (!userData) {
          const userDoc = await getDoc(doc(db, "users", otherUserId));
          userData = userDoc.exists() ? userDoc.data() : null;
          if (userData) CacheService.saveUser(otherUserId, userData);
        }
        
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
      }));

      setConversations(chatList);
      setLoading(false);
    };

    let snap1: any = { docs: [] };
    let snap2: any = { docs: [] };

    const unsub1 = onSnapshot(qSender, (s) => {
      snap1 = s;
      processMessages(snap1, snap2);
    });

    const unsub2 = onSnapshot(qReceiver, (s) => {
      snap2 = s;
      processMessages(snap1, snap2);
    });

    return () => {
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

  const filteredConversations = conversations.filter(c => 
    c.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-[var(--bg-card)] overflow-hidden">
      <TopNav />
      
      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
        {/* Search Bar */}
        <div className="px-4 py-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
            <input 
              type="text" 
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-main)] rounded-2xl text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
            />
          </div>
          <button className="p-2 hover:bg-[var(--bg-main)] rounded-full text-[var(--text-secondary)] transition-all active:scale-90">
            <MoreVertical size={20} />
          </button>
        </div>

        {/* Chat List Filters */}
        <div className="px-4 py-2 flex items-center gap-2">
          <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1">
            <button className="px-3 py-1.5 bg-sky-100 text-sky-600 rounded-full text-[13px] font-bold whitespace-nowrap transition-all active:scale-95">
              All
            </button>
            <button className="px-3 py-1.5 bg-[var(--bg-main)] text-[var(--text-secondary)] rounded-full text-[13px] font-bold whitespace-nowrap transition-all active:scale-95">
              Chats
            </button>
            <button className="px-3 py-1.5 bg-[var(--bg-main)] text-[var(--text-secondary)] rounded-full text-[13px] font-bold whitespace-nowrap transition-all active:scale-95">
              Groups
            </button>
            <button className="px-3 py-1.5 bg-[var(--bg-main)] text-[var(--text-secondary)] rounded-full text-[13px] font-bold whitespace-nowrap transition-all active:scale-95">
              Requests
            </button>
            <button className="px-3 py-1.5 bg-[var(--bg-main)] text-[var(--text-secondary)] rounded-full text-[13px] font-bold whitespace-nowrap transition-all active:scale-95 flex items-center gap-2">
              <Plus size={16} />
              Edit
            </button>
          </div>
        </div>

        {/* User List (Chats) */}
        <div className="flex flex-col">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-8 h-8 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
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
                    <span className={`text-[10px] whitespace-nowrap ${chat.unread ? 'text-sky-600 font-bold' : 'text-[var(--text-secondary)]'}`}>
                      {chat.time}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-xs truncate ${chat.unread ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-secondary)]'}`}>
                      {chat.lastMsg}
                    </p>
                    {chat.unread && (
                      <div className="min-w-[18px] h-[18px] px-1 bg-sky-600 rounded-full flex items-center justify-center shadow-lg shadow-sky-200 ml-2">
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
                className="mt-2 bg-sky-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-sky-100 hover:bg-sky-700 transition-all"
              >
                Find Friends
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="absolute bottom-24 right-6 z-40">
        <button 
          onClick={() => navigate('/explore')}
          className="p-4 bg-sky-600 text-white rounded-full shadow-xl hover:bg-sky-700 transition-all active:scale-95"
        >
          <Plus size={24} />
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
