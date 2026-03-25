import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit, where, doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db } from '../../services/firebase.ts';
import { useNavigate, Link } from 'react-router-dom';
import { useSearch } from '../../contexts/SearchContext.tsx';
import { 
  Home, 
  MessageCircle, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  Search, 
  Play, 
  LayoutGrid, 
  Cpu, 
  Zap, 
  ChevronRight,
  MessageSquare,
  Clapperboard,
  Gamepad2,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CacheService } from '../../services/CacheService.ts';
import { toDate } from '../../utils/dateUtils.ts';

import { useLayout } from '../../contexts/LayoutContext.tsx';

export default function HomeTab() {
  const navigate = useNavigate();
  const { searchTerm } = useSearch();
  const { activeFilters } = useLayout();
  const activeFilter = activeFilters['home'];
  const [users, setUsers] = useState<any[]>([]);
  const [recommendedUsers, setRecommendedUsers] = useState<any[]>([]);
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [followLoading, setFollowLoading] = useState<string | null>(null);

  const DEFAULT_LOGO = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRef = collection(db, "users");
        
        // Fetch suggested users
        const recentQuery = query(
          usersRef, 
          orderBy("createdAt", "desc"),
          limit(10)
        );
        const recentSnapshot = await getDocs(recentQuery);
        const recentList = recentSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...(doc.data() as any)
          }))
          .filter((user: any) => user.uid !== auth.currentUser?.uid && !user.hideFromSearch)
          .slice(0, 8);
        
        setRecommendedUsers(recentList);

        // Fetch Recent Chats (Top 3)
        if (auth.currentUser) {
          const qSender = query(
            collection(db, "messages"),
            where("senderId", "==", auth.currentUser.uid),
            limit(20)
          );
          const qReceiver = query(
            collection(db, "messages"),
            where("receiverId", "==", auth.currentUser.uid),
            limit(20)
          );

          const [snap1, snap2] = await Promise.all([getDocs(qSender), getDocs(qReceiver)]);
          const allMsgs = [
            ...snap1.docs.map(d => d.data()),
            ...snap2.docs.map(d => d.data())
          ];

          const chatGroups: { [key: string]: any } = {};
          allMsgs.forEach(msg => {
            const msgTime = toDate(msg.timestamp)?.getTime() || 0;
            const existingTime = toDate(chatGroups[msg.chatId]?.timestamp)?.getTime() || 0;
            if (!chatGroups[msg.chatId] || msgTime > existingTime) {
              chatGroups[msg.chatId] = msg;
            }
          });

          const sortedChats = Object.values(chatGroups).sort((a, b) => {
            const timeA = toDate(a.timestamp)?.getTime() || 0;
            const timeB = toDate(b.timestamp)?.getTime() || 0;
            return timeB - timeA;
          }).slice(0, 3);

          const chatList = await Promise.all(sortedChats.map(async (chat: any) => {
            const otherUserId = chat.senderId === auth.currentUser?.uid ? chat.receiverId : chat.senderId;
            let userData = CacheService.getUser(otherUserId);
            if (!userData) {
              const userDoc = await getDocs(query(collection(db, "users"), where("uid", "==", otherUserId)));
              userData = userDoc.docs[0]?.data() as any;
              if (userData) CacheService.saveUser(otherUserId, userData);
            }
            return {
              id: otherUserId,
              name: userData?.fullName || userData?.username || 'User',
              avatar: userData?.photoURL || DEFAULT_LOGO,
              lastMsg: chat.text,
              time: toDate(chat.timestamp)?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Now'
            };
          }));
          setRecentChats(chatList);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    if (auth.currentUser) {
      const unsubscribeMe = onSnapshot(doc(db, "users", auth.currentUser.uid), (docSnap) => {
        if (docSnap.exists()) {
          setCurrentUserData(docSnap.data());
        }
      });
      return () => unsubscribeMe();
    }
  }, []);

  // Separate effect for search to avoid blocking initial render
  useEffect(() => {
    if (!searchTerm.trim()) {
      setUsers([]);
      return;
    }

    const searchUsers = async () => {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("uid", "!=", auth.currentUser?.uid),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const list = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((user: any) => 
          !user.hideFromSearch && 
          (user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.username?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      setUsers(list);
    };

    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleToggleFollow = async (e: React.MouseEvent, targetId: string) => {
    e.stopPropagation();
    if (!auth.currentUser || !targetId || followLoading) return;
    setFollowLoading(targetId);
    try {
      const isFollowing = currentUserData?.following?.includes(targetId);
      const myDocRef = doc(db, "users", auth.currentUser.uid);
      const targetDocRef = doc(db, "users", targetId);
      await updateDoc(myDocRef, { following: !isFollowing ? arrayUnion(targetId) : arrayRemove(targetId) });
      await updateDoc(targetDocRef, { followers: !isFollowing ? arrayUnion(auth.currentUser.uid) : arrayRemove(auth.currentUser.uid) });
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setFollowLoading(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hubShortcuts = [
    { id: 'ai', name: 'AI Chat', icon: Cpu, color: 'bg-sky-600', path: '/chat/gx-ai' },
    { id: 'reels', name: 'Reels', icon: Clapperboard, color: 'bg-rose-600', path: '/reels' },
    { id: 'games', name: 'Games', icon: Gamepad2, color: 'bg-purple-600', path: '/hub' },
    { id: 'hub', name: 'More', icon: LayoutGrid, color: 'bg-zinc-800', path: '/hub' },
  ];

  return (
    <div className="h-full flex flex-col bg-[var(--bg-card)] overflow-hidden font-sans">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 overflow-y-auto no-scrollbar pb-24"
      >
        <AnimatePresence mode="wait">
          {searchTerm || activeFilter === 'Search' ? (
            /* Search Results */
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 mt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Search Results</h3>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{filteredUsers.length} Found</span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {filteredUsers.map(user => (
                  <div onClick={() => navigate(`/user/${user.uid}`)} key={user.uid} className="flex items-center gap-3 p-3 bg-sky-500 rounded-2xl shadow-md cursor-pointer">
                    <img src={user.hidePhoto ? DEFAULT_LOGO : (user.photoURL || DEFAULT_LOGO)} className="w-12 h-12 rounded-full object-cover border-2 border-white" referrerPolicy="no-referrer" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[14px] font-black text-white truncate">{user.fullName || 'Gx Member'}</h4>
                      <p className="text-[11px] font-bold text-sky-100 truncate opacity-90">@{user.username}</p>
                    </div>
                    <button onClick={(e) => handleToggleFollow(e, user.uid)} className="px-4 py-2 bg-white text-sky-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                      {currentUserData?.following?.includes(user.uid) ? 'Following' : 'Follow'}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            /* Dashboard UI */
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-8 pt-4">
              
              {/* 1. Suggested Users (Horizontal) - Only for Explore or For You */}
              {(activeFilter === 'Explore' || activeFilter === 'For You') && (
                <section className="px-4">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-[11px] font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                      <Sparkles size={14} className="text-sky-500" />
                      Suggested for you
                    </h3>
                    <button onClick={() => navigate('/explore')} className="text-[10px] font-black text-sky-600 uppercase tracking-widest">See All</button>
                  </div>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    {recommendedUsers.map(user => (
                      <motion.div 
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/user/${user.uid}`)}
                        key={user.uid} 
                        className="min-w-[120px] bg-white rounded-[2rem] p-4 flex flex-col items-center text-center shadow-sm border border-zinc-100 relative"
                      >
                        <img src={user.photoURL || DEFAULT_LOGO} className="w-16 h-16 rounded-full object-cover mb-3 border-2 border-sky-50" referrerPolicy="no-referrer" />
                        <h4 className="text-[12px] font-black text-zinc-900 truncate w-full mb-1">{user.fullName?.split(' ')[0] || 'Member'}</h4>
                        <button 
                          onClick={(e) => handleToggleFollow(e, user.uid)}
                          className={`w-full py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                            currentUserData?.following?.includes(user.uid) ? 'bg-zinc-100 text-zinc-400' : 'bg-sky-600 text-white'
                          }`}
                        >
                          {currentUserData?.following?.includes(user.uid) ? 'Following' : 'Follow'}
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Updates Section */}
              {activeFilter === 'Updates' && (
                <section className="px-4">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-[11px] font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                      <Bell size={14} className="text-sky-500" />
                      Recent Updates
                    </h3>
                  </div>
                  <div className="flex flex-col gap-3">
                    {recommendedUsers.slice(0, 3).map(user => (
                      <div key={user.uid} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-zinc-100">
                        <div className="w-10 h-10 bg-sky-50 rounded-full flex items-center justify-center text-sky-600">
                          <Zap size={18} />
                        </div>
                        <div className="flex-1">
                          <p className="text-[11px] text-zinc-900 font-bold">
                            <span className="text-sky-600">@{user.username}</span> posted a new update.
                          </p>
                          <p className="text-[9px] text-zinc-400 mt-0.5">Just now</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 2. Recent Chats - Only for For You */}
              {activeFilter === 'For You' && (
                <section className="px-4">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-[11px] font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                      <MessageSquare size={14} className="text-emerald-500" />
                      Recent Chats
                    </h3>
                    <button onClick={() => navigate('/chats')} className="text-[10px] font-black text-sky-600 uppercase tracking-widest">View Chats</button>
                  </div>
                  <div className="bg-white rounded-[2.5rem] p-2 shadow-sm border border-zinc-100">
                    {recentChats.length > 0 ? (
                      recentChats.map((chat, idx) => (
                        <Link 
                          to={`/chat/${chat.id}`} 
                          key={chat.id} 
                          className={`flex items-center gap-4 p-4 hover:bg-zinc-50 transition-all ${idx !== recentChats.length - 1 ? 'border-b border-zinc-50' : ''}`}
                        >
                          <img src={chat.avatar} className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer" />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-0.5">
                              <h4 className="text-[14px] font-black text-zinc-900 truncate">{chat.name}</h4>
                              <span className="text-[10px] font-bold text-zinc-400">{chat.time}</span>
                            </div>
                            <p className="text-[12px] text-zinc-500 truncate">{chat.lastMsg}</p>
                          </div>
                          <ChevronRight size={16} className="text-zinc-300" />
                        </Link>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">No recent chats</p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* 3. Reels Preview - Only for Trending or For You */}
              {(activeFilter === 'Trending' || activeFilter === 'For You') && (
                <section className="px-4">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-[11px] font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                      <Clapperboard size={14} className="text-rose-500" />
                      Trending Reels
                    </h3>
                    <button onClick={() => navigate('/reels')} className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Watch Reels</button>
                  </div>
                  <div className="flex gap-3 overflow-x-auto no-scrollbar">
                    {[1, 2, 3, 4].map((i) => (
                      <motion.div 
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/reels')}
                        key={i} 
                        className="min-w-[140px] aspect-[9/16] bg-zinc-900 rounded-[2rem] relative overflow-hidden shadow-lg"
                      >
                        <img src={`https://picsum.photos/seed/reel${i}/300/533`} className="w-full h-full object-cover opacity-70" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                          <div className="flex items-center gap-2 text-white">
                            <Play size={10} fill="currentColor" />
                            <span className="text-[9px] font-black tracking-widest uppercase">1.2K</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* 4. Hub Shortcuts (Grid) - Always show or only for For You */}
              {activeFilter === 'For You' && (
                <section className="px-4 mb-4">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-[11px] font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                      <LayoutGrid size={14} className="text-indigo-500" />
                      Quick Access
                    </h3>
                    <button onClick={() => navigate('/hub')} className="text-[10px] font-black text-sky-600 uppercase tracking-widest">All Apps</button>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {hubShortcuts.map(item => (
                      <motion.div 
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(item.path)}
                        key={item.id} 
                        className="bg-white rounded-[1.5rem] p-3 flex flex-col items-center gap-2 shadow-sm border border-zinc-100 cursor-pointer"
                      >
                        <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                          <item.icon size={20} />
                        </div>
                        <span className="text-[9px] font-black text-zinc-900 uppercase tracking-tight">{item.name}</span>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
