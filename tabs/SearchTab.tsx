import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit, where, doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db } from '../server/firebase.ts';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MessageCircle, Sparkles, TrendingUp, ShieldCheck, Users, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SearchTab() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [recommendedUsers, setRecommendedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(3);
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [followLoading, setFollowLoading] = useState<string | null>(null);
  const maxVisible = 9;

  const DEFAULT_LOGO = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, "users");
        
        // Fetch all users (for search)
        const allUsersQuery = query(usersRef, where("uid", "!=", auth.currentUser?.uid));
        const allUsersSnapshot = await getDocs(allUsersQuery);
        const allUsersList = allUsersSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter((user: any) => !user.hideFromSearch); // Filter out hidden users
        setUsers(allUsersList);

        // Fetch up to 9 newest users (recent)
        const recentQuery = query(
          usersRef, 
          orderBy("createdAt", "desc"),
          limit(15) // Fetch more to filter
        );
        const recentSnapshot = await getDocs(recentQuery);
        const recentList = recentSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...(doc.data() as any)
          }))
          .filter((user: any) => user.uid !== auth.currentUser?.uid && !user.hideFromSearch)
          .slice(0, maxVisible);
        
        setRecommendedUsers(recentList);

      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

    // Listen to current user data for following list
    let unsubscribeMe: any;
    if (auth.currentUser) {
      unsubscribeMe = onSnapshot(doc(db, "users", auth.currentUser.uid), (docSnap) => {
        if (docSnap.exists()) {
          setCurrentUserData(docSnap.data());
        }
      });
    }

    return () => {
      if (unsubscribeMe) unsubscribeMe();
    };
  }, []);

  const handleToggleFollow = async (e: React.MouseEvent, targetId: string) => {
    e.stopPropagation();
    if (!auth.currentUser || !targetId || followLoading) return;
    
    setFollowLoading(targetId);
    try {
      const isFollowing = currentUserData?.following?.includes(targetId);
      const myDocRef = doc(db, "users", auth.currentUser.uid);
      const targetDocRef = doc(db, "users", targetId);
      
      // Update my following list
      await updateDoc(myDocRef, {
        following: !isFollowing ? arrayUnion(targetId) : arrayRemove(targetId)
      });
      
      // Update target user's followers list
      await updateDoc(targetDocRef, {
        followers: !isFollowing ? arrayUnion(auth.currentUser.uid) : arrayRemove(auth.currentUser.uid)
      });
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

  const handleViewMore = () => {
    setVisibleCount(prev => Math.min(prev + 3, maxVisible));
  };

  return (
    <div className="h-full flex flex-col bg-zinc-50 overflow-hidden font-sans">
      <TopNav />
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 overflow-y-auto no-scrollbar pb-10"
      >
        {/* Search Bar Section */}
        <div className="px-4 pt-4 pb-2">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-600 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {searchTerm ? (
            /* Search Results */
            <motion.div 
              key="results"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="px-4 mt-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Search Results</h3>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{filteredUsers.length} Found</span>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <motion.div 
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => navigate(`/user/${user.uid}`)}
                      key={user.uid} 
                      className="flex items-center gap-3 p-3 bg-sky-500 rounded-2xl shadow-md shadow-sky-100 transition-all cursor-pointer border border-white/10"
                    >
                      <div className="relative shrink-0">
                        <img 
                          src={user.hidePhoto ? DEFAULT_LOGO : (user.photoURL || DEFAULT_LOGO)} 
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 flex-wrap">
                          <h4 className="text-[14px] font-black text-white leading-tight break-words">
                            {user.fullName || 'GxChat Member'}
                          </h4>
                          <ShieldCheck size={12} className="text-white fill-white/20 shrink-0" />
                        </div>
                        <p className="text-[11px] font-bold text-sky-100 truncate opacity-90">@{user.username}</p>
                      </div>
                      <div className="flex items-center shrink-0">
                        <button 
                          onClick={(e) => handleToggleFollow(e, user.uid)}
                          disabled={followLoading === user.uid}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm transition-all active:scale-95 ${
                            currentUserData?.following?.includes(user.uid)
                            ? 'bg-sky-600 text-white border border-white/20'
                            : 'bg-white text-sky-600 hover:bg-sky-50'
                          }`}
                        >
                          {currentUserData?.following?.includes(user.uid) ? 'Following' : 'Follow'}
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                      <Search size={24} className="text-zinc-300" />
                    </div>
                    <p className="text-sm font-bold text-zinc-900">No users found</p>
                    <p className="text-xs text-zinc-500 mt-1">Try searching with a different name</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            /* Recent & Discovery Section */
            <motion.div 
              key="discovery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 mt-6 pb-24"
            >
              {/* Suggested for you Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex flex-col">
                    <h3 className="text-lg font-black text-zinc-800 tracking-tight">Suggested for you</h3>
                    <div className="h-1 w-12 bg-sky-500 rounded-full mt-1"></div>
                  </div>
                  <Users size={20} className="text-sky-500 opacity-50" />
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {loading ? (
                    <div className="flex justify-center p-10 bg-white rounded-3xl border border-zinc-100">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  ) : recommendedUsers.length > 0 ? (
                    <>
                      {recommendedUsers.slice(0, visibleCount).map((user) => (
                        <motion.div 
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => navigate(`/user/${user.uid}`)}
                          key={user.uid} 
                          className="flex items-center gap-3 p-3 bg-sky-500 rounded-2xl shadow-md shadow-sky-100 transition-all cursor-pointer border border-white/10"
                        >
                          <div className="relative shrink-0">
                            <img 
                              src={user.hidePhoto ? DEFAULT_LOGO : (user.photoURL || DEFAULT_LOGO)} 
                              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 flex-wrap">
                              <h4 className="text-[14px] font-black text-white leading-tight break-words">
                                {user.fullName || 'GxChat Member'}
                              </h4>
                              <ShieldCheck size={12} className="text-white fill-white/20 shrink-0" />
                            </div>
                            <p className="text-[11px] font-bold text-sky-100 truncate opacity-90">@{user.username}</p>
                          </div>
                          <div className="flex items-center shrink-0">
                            <button 
                              onClick={(e) => handleToggleFollow(e, user.uid)}
                              disabled={followLoading === user.uid}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm transition-all active:scale-95 ${
                                currentUserData?.following?.includes(user.uid)
                                ? 'bg-sky-600 text-white border border-white/20'
                                : 'bg-white text-sky-600 hover:bg-sky-50'
                              }`}
                            >
                              {currentUserData?.following?.includes(user.uid) ? 'Following' : 'Follow'}
                            </button>
                          </div>
                        </motion.div>
                      ))}
                      
                      {visibleCount < recommendedUsers.length && (
                        <button 
                          onClick={handleViewMore}
                          className="mt-2 py-4 flex items-center justify-center gap-2 bg-white border border-zinc-100 rounded-2xl text-xs font-black text-sky-600 uppercase tracking-widest shadow-sm hover:bg-sky-50 transition-all active:scale-95"
                        >
                          View More Members
                          <ArrowRight size={14} />
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="p-10 text-center text-xs text-zinc-400 bg-white rounded-3xl border border-dashed border-zinc-200">No suggestions found.</p>
                  )}
                </div>
              </div>

              {/* Safety Section */}
              <div className="bg-white rounded-[2rem] border border-zinc-100 p-8 shadow-sm mt-[-16px]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-emerald-50 rounded-xl">
                    <ShieldCheck size={20} className="text-emerald-600" />
                  </div>
                  <h3 className="font-black text-zinc-900 tracking-tight uppercase text-sm">Safety Guidelines</h3>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-[10px] font-black text-zinc-400 border border-zinc-100 shrink-0">01</div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 mb-1">Trusted Connections</h4>
                      <p className="text-[11px] text-zinc-500 leading-relaxed">Only chat with people you know and trust in real life.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-[10px] font-black text-zinc-400 border border-zinc-100 shrink-0">02</div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 mb-1">Privacy First</h4>
                      <p className="text-[11px] text-zinc-500 leading-relaxed">Never share your OTP, passwords or sensitive personal data.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-[10px] font-black text-zinc-400 border border-zinc-100 shrink-0">03</div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 mb-1">Report Abuse</h4>
                      <p className="text-[11px] text-zinc-500 leading-relaxed">Use the report feature for any suspicious or harmful activity.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <BottomNav />
    </div>
  );
}
