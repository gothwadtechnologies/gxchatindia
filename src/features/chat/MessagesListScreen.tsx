import React, { useEffect, useState } from 'react';
import { Search, ArrowLeft, Edit, MessageCircle, MoreVertical } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../../services/firebase.ts';
import { toDate } from '../../utils/dateUtils.ts';
import { collection, query, where, onSnapshot, orderBy, getDoc, doc } from 'firebase/firestore';

export default function MessagesListScreen() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!auth.currentUser) return;

    // Request notification permission
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Query messages where user is involved
    const q = query(
      collection(db, "messages"),
      where("chatId", ">=", ""), // Dummy filter to allow ordering if needed, but we'll filter in-memory for simplicity
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const allMsgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data({ serverTimestamps: 'estimate' }) })) as any[];
      
      // Filter messages involving the current user
      const myMsgs = allMsgs.filter(m => m.senderId === auth.currentUser?.uid || m.receiverId === auth.currentUser?.uid);

      // Group by chatId
      const chatGroups: { [key: string]: any } = {};
      myMsgs.forEach(msg => {
        const msgTime = toDate(msg.timestamp)?.getTime() || Date.now();
        const existingTime = toDate(chatGroups[msg.chatId]?.timestamp)?.getTime() || 0;
        if (!chatGroups[msg.chatId] || msgTime > existingTime) {
          chatGroups[msg.chatId] = msg;
        }
      });

      // Convert to array and sort by time
      const sortedChats = Object.values(chatGroups).sort((a, b) => {
        const timeA = toDate(a.timestamp)?.getTime() || Date.now();
        const timeB = toDate(b.timestamp)?.getTime() || Date.now();
        return timeB - timeA;
      });

      // Fetch user details for each chat
      const chatList = await Promise.all(sortedChats.map(async (chat) => {
        const otherUserId = chat.senderId === auth.currentUser?.uid ? chat.receiverId : chat.senderId;
        const userDoc = await getDoc(doc(db, "users", otherUserId));
        const userData = userDoc.exists() ? userDoc.data() : null;
        
        // Count unread messages from this user
        const unreadCount = allMsgs.filter(m => 
          m.chatId === chat.chatId && 
          m.receiverId === auth.currentUser?.uid && 
          !m.isRead
        ).length;

        return {
          id: chat.chatId,
          otherUserId,
          user: userData?.username || 'Unknown User',
          fullName: userData?.fullName || '',
          lastMsg: chat.text,
          time: toDate(chat.timestamp) ? formatTime(toDate(chat.timestamp)) : 'Recently',
          avatar: userData?.photoURL || `https://cdn-icons-png.flaticon.com/512/149/149071.png`,
          unread: unreadCount > 0,
          unreadCount
        };
      }));

      setConversations(chatList);
      setLoading(false);
    });

    return () => unsubscribe();
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
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-[var(--bg-main)] overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 h-16 bg-[var(--bg-card)] z-50 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="hover:bg-[var(--bg-main)] p-2 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-[var(--text-primary)]" />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Messages</span>
            <h2 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">@{auth.currentUser?.displayName || 'My Chats'}</h2>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-[var(--bg-main)] rounded-full transition-colors">
            <Edit size={22} className="text-[var(--text-secondary)]" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        {/* Search */}
        <div className="px-4 my-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
            <input 
              type="text" 
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="mt-2">
          <div className="px-4 flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Recent Chats</span>
            <span className="text-[var(--primary)] text-xs font-bold uppercase tracking-wider cursor-pointer hover:underline">Requests</span>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-8 h-8 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin" />
              <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Loading Chats...</p>
            </div>
          ) : filteredConversations.length > 0 ? (
            <div className="bg-[var(--bg-card)] border-y border-[var(--border-color)] divide-y divide-[var(--border-color)]">
              {filteredConversations.map(chat => (
                <Link 
                  to={`/chat/${chat.otherUserId}`} 
                  key={chat.id} 
                  className="flex items-center gap-4 px-4 py-4 hover:bg-[var(--bg-main)] transition-all active:scale-[0.98]"
                >
                  <div className="relative">
                    <img 
                      src={chat.avatar} 
                      className="w-14 h-14 rounded-full object-cover border-2 border-[var(--bg-card)] shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[var(--bg-card)] rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className={`text-[15px] truncate ${chat.unread ? 'font-bold text-[var(--text-primary)]' : 'font-medium text-[var(--text-primary)]'}`}>
                        {chat.user}
                      </h3>
                      <span className={`text-[10px] whitespace-nowrap ${chat.unread ? 'text-[var(--primary)] font-bold' : 'text-[var(--text-secondary)]'}`}>
                        {chat.time}
                      </span>
                    </div>
                    <p className={`text-xs truncate ${chat.unread ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-secondary)]'}`}>
                      {chat.lastMsg}
                    </p>
                  </div>
                  {chat.unread && (
                    <div className="flex flex-col items-center gap-1">
                      <div className="min-w-[18px] h-[18px] px-1 bg-[var(--primary)] rounded-full flex items-center justify-center shadow-lg shadow-[var(--primary-shadow)]">
                        <span className="text-[10px] text-white font-bold">{chat.unreadCount}</span>
                      </div>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-10 text-center gap-4">
              <div className="p-4 bg-[var(--bg-card)] rounded-full text-[var(--text-secondary)] border border-[var(--border-color)]">
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

        {/* Footer Info */}
        <div className="py-10 flex flex-col items-center gap-1 opacity-50">
          <span className="text-[var(--text-secondary)] text-[10px] font-bold tracking-widest uppercase">GxChat India Messages</span>
          <span className="text-[var(--text-secondary)] text-[8px] uppercase tracking-tighter">End-to-end encrypted</span>
        </div>
      </div>
    </div>
  );
}
