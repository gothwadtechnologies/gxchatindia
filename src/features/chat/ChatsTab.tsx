import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, getDoc, getDocs, doc, limit, orderBy } from 'firebase/firestore';
import { auth, db } from '../../services/firebase.ts';
import { toDate } from '../../utils/dateUtils.ts';
import { useSearch } from '../../contexts/SearchContext.tsx';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MessageCircle, MoreVertical, Phone, Video, ArrowUpRight, ArrowDownLeft, Plus, PhoneMissed, Info } from 'lucide-react';
import { CacheService } from '../../services/CacheService.ts';
import { useLayout } from '../../contexts/LayoutContext.tsx';
import { motion } from 'motion/react';

export default function ChatsTab() {
  const navigate = useNavigate();
  const { searchTerm } = useSearch();
  const { activeFilters } = useLayout();
  const activeFilter = activeFilters['chats'] || 'Chats';
  
  const [conversations, setConversations] = useState<any[]>([]);
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Conversations
  useEffect(() => {
    if (!auth.currentUser) return;
    if (activeFilter === 'Calls') return;

    // Optimized query: Fetch messages involving the user
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
      
      // Fetch uncached users in chunks of 30
      const userMap = new Map();
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
        
        // Skip AI user if it accidentally got into Firebase
        if (otherUserId === 'gx-ai') return null;

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
      }).filter(Boolean);

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
  }, [activeFilter]);

  // Fetch Calls
  useEffect(() => {
    if (!auth.currentUser) return;
    if (activeFilter !== 'Calls') return;

    setLoading(true);
    const q = query(collection(db, "calls"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const allCalls = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data({ serverTimestamps: 'estimate' }) }));
      
      const relevantCalls = allCalls.filter((data: any) => {
        const isCaller = data.callerId === auth.currentUser?.uid;
        const isReceiver = data.receiverId === auth.currentUser?.uid;
        return (isCaller || isReceiver) && data.status === 'ended';
      }).sort((a: any, b: any) => {
        const timeA = toDate(a.timestamp)?.getTime() || Date.now();
        const timeB = toDate(b.timestamp)?.getTime() || Date.now();
        return timeB - timeA;
      });

      const callList = await Promise.all(relevantCalls.map(async (data: any) => {
        const isCaller = data.callerId === auth.currentUser?.uid;
        const otherUserId = isCaller ? data.receiverId : data.callerId;
        
        const userDoc = await getDoc(doc(db, "users", otherUserId || 'unknown'));
        const userData = userDoc.data();

        return {
          id: data.id,
          otherUserId,
          user: userData?.fullName || userData?.username || 'Unknown User',
          avatar: userData?.photoURL || `https://cdn-icons-png.flaticon.com/512/149/149071.png`,
          type: data.type,
          isIncoming: !isCaller,
          isMissed: data.isMissed || false,
          time: toDate(data.timestamp) ? new Date(toDate(data.timestamp)!).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'
        };
      }));

      setCalls(callList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeFilter]);

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
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {/* User List (Chats or Calls) */}
        <div className="flex flex-col h-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-8 h-8 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin" />
              <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Loading {activeFilter === 'Calls' ? 'Calls' : 'Chats'}...</p>
            </div>
          ) : activeFilter === 'Calls' ? (
            calls.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-10 text-center gap-4">
                <div className="p-4 bg-[var(--bg-main)] rounded-full text-[var(--text-secondary)]">
                  <Phone size={40} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">No calls yet</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Your recent calls will appear here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-color)]">
                {calls.map((call) => (
                  <motion.div 
                    key={call.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-[15px] px-4 py-3 hover:bg-[var(--bg-main)] transition-all active:scale-[0.98] group"
                  >
                    <div className="relative shrink-0">
                      <img 
                        src={call.avatar} 
                        alt={call.user} 
                        className="w-[52px] h-[52px] rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0 border-b border-[var(--border-color)]/50 pb-3 group-last:border-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h3 className={`text-[15px] truncate font-bold ${call.isMissed ? 'text-rose-500' : 'text-[var(--text-primary)]'}`}>
                          {call.user}
                        </h3>
                        <span className="text-[10px] whitespace-nowrap text-[var(--text-secondary)]">
                          {call.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[var(--text-secondary)] text-[11px]">
                        {call.isMissed ? (
                          <PhoneMissed size={12} className="text-rose-500" />
                        ) : call.isIncoming ? (
                          <ArrowDownLeft size={12} className="text-emerald-500" />
                        ) : (
                          <ArrowUpRight size={12} className="text-[var(--primary)]" />
                        )}
                        <span>{call.isMissed ? 'Missed' : call.isIncoming ? 'Incoming' : 'Outgoing'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-[var(--primary)]">
                      <Link to={`/call/${call.otherUserId}?type=${call.type}`}>
                        {call.type === 'video' ? <Video size={20} /> : <Phone size={20} />}
                      </Link>
                      <button className="text-[var(--text-secondary)]">
                        <Info size={20} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )
          ) : (
            <>
              {/* GxChat AI - Always at top */}
              <div 
                onClick={() => navigate('/chat/gx-ai')}
                className="flex items-center gap-[15px] px-4 py-3 hover:bg-[var(--bg-main)] transition-all active:scale-[0.98] group cursor-pointer"
              >
                <div 
                  className="relative shrink-0 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/profile/gx-ai');
                  }}
                >
                  <img 
                    src="/assets/favicon.png" 
                    className="w-[52px] h-[52px] rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-[var(--bg-card)] rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0 border-b border-[var(--border-color)]/50 pb-3">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="text-[15px] truncate font-bold text-[var(--text-primary)]">
                      GxChat AI
                    </h3>
                    <span className="text-[10px] whitespace-nowrap text-[var(--text-secondary)]">
                      Online
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs truncate text-[var(--text-secondary)] font-medium">
                      Ask me anything! I'm here to help.
                    </p>
                  </div>
                </div>
              </div>

              {filteredConversations.length > 0 ? (
                filteredConversations.map(chat => (
                  <Link 
                    to={`/chat/${chat.otherUserId}`} 
                    key={chat.id} 
                    className="flex items-center gap-[15px] px-4 py-3 hover:bg-[var(--bg-main)] transition-all active:scale-[0.98] group"
                  >
                    <div className="relative shrink-0">
                      <img 
                        src={chat.avatar} 
                        className="w-[52px] h-[52px] rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      {chat.isOnline && (
                        <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-[var(--bg-card)] rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 border-b border-[var(--border-color)]/50 pb-3 group-last:border-0">
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
