import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
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

        // Fetch top 3 newest users (recent)
        const recentQuery = query(
          usersRef, 
          orderBy("createdAt", "desc"),
          limit(10) // Fetch more to filter
        );
        const recentSnapshot = await getDocs(recentQuery);
        const recentList = recentSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...(doc.data() as any)
          }))
          .filter((user: any) => user.uid !== auth.currentUser?.uid && !user.hideFromSearch)
          .slice(0, 3);
        
        setRecommendedUsers(recentList);

      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              
              <div className="space-y-2">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <motion.div 
                      layout
                      onClick={() => navigate(`/user/${user.uid}`)}
                      key={user.uid} 
                      className="flex items-center gap-4 p-3 bg-white border border-zinc-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="relative">
                        <img 
                          src={user.hidePhoto ? DEFAULT_LOGO : (user.photoURL || DEFAULT_LOGO)} 
                          className="w-12 h-12 rounded-full object-cover border border-zinc-100"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">{user.username}</h4>
                        <p className="text-[11px] text-zinc-500">{user.fullName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/chat/${user.uid}`);
                          }}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm hover:bg-blue-700 transition-all"
                        >
                          Chat
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/user/${user.uid}`);
                          }}
                          className="px-3 py-1.5 bg-zinc-100 text-zinc-600 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-zinc-200 transition-all"
                        >
                          View
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
              {/* Recent Users - Now exactly 3 */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-orange-100 rounded-lg">
                      <Sparkles size={14} className="text-orange-600" />
                    </div>
                    <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">New Members</h3>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {loading ? (
                    <div className="flex justify-center p-10 bg-white rounded-3xl border border-zinc-100">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  ) : recommendedUsers.length > 0 ? (
                    recommendedUsers.map((user, index) => (
                      <motion.div 
                        whileHover={{ x: 4 }}
                        onClick={() => navigate(`/user/${user.uid}`)}
                        key={user.uid} 
                        className="flex items-center gap-4 p-4 bg-white border border-zinc-100 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="relative">
                          <img 
                            src={user.hidePhoto ? DEFAULT_LOGO : (user.photoURL || DEFAULT_LOGO)} 
                            className="w-14 h-14 rounded-full object-cover border-2 border-zinc-50 shadow-sm"
                            referrerPolicy="no-referrer"
                          />
                          {index === 0 && (
                            <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm">
                              NEW
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-[15px] font-black text-zinc-900 tracking-tight">{user.username}</h4>
                          <p className="text-[11px] font-medium text-zinc-500">{user.fullName || 'GxChat Member'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/chat/${user.uid}`);
                            }}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm hover:bg-blue-700 transition-all"
                          >
                            Chat
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/user/${user.uid}`);
                            }}
                            className="px-3 py-1.5 bg-zinc-100 text-zinc-600 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-zinc-200 transition-all"
                          >
                            View
                          </button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <p className="p-10 text-center text-xs text-zinc-400 bg-white rounded-3xl border border-dashed border-zinc-200">No recent users found.</p>
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
