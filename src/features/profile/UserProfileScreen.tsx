import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  MessageSquare, 
  ShieldAlert, 
  UserX, 
  Info,
  Calendar,
  Clock,
  MoreVertical,
  CheckCircle2,
  Bell,
  Settings,
  QrCode,
  ChevronRight,
  Edit3,
  UserPlus,
  UserCheck,
  LockKeyhole,
  PlusSquare,
  X
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../../services/firebase.ts';
import { toDate } from '../../utils/dateUtils.ts';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp, onSnapshot } from 'firebase/firestore';
import ProfileContent from './components/ProfileContent.tsx';
import { motion, AnimatePresence } from 'motion/react';

export default function UserProfileScreen() {
  const { id: userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Post');
  const [showMenu, setShowMenu] = useState(false);

  const DEFAULT_LOGO = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  // Mock posts for the grid
  const mockPosts = Array.from({ length: 9 }).map((_, i) => ({
    id: i,
    url: `https://picsum.photos/seed/post${i}/400/400`
  }));

  useEffect(() => {
    if (!userId) return;

    // Listen to target user data for real-time counts
    const unsubscribeUser = onSnapshot(doc(db, "users", userId), (docSnap) => {
      if (docSnap.exists()) {
        setUser(docSnap.data());
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching user:", error);
      setLoading(false);
    });

    // Check if blocked and following (listen to current user data)
    let unsubscribeMe: any;
    if (auth.currentUser) {
      unsubscribeMe = onSnapshot(doc(db, "users", auth.currentUser.uid), (myDocSnap) => {
        if (myDocSnap.exists()) {
          const myData = myDocSnap.data();
          setIsBlocked(myData.blockedUsers?.includes(userId) || false);
          setIsFollowing(myData.following?.includes(userId) || false);
        }
      });
    }

    return () => {
      unsubscribeUser();
      if (unsubscribeMe) unsubscribeMe();
    };
  }, [userId]);

  const handleToggleFollow = async () => {
    if (!auth.currentUser || !userId || followLoading) return;
    setFollowLoading(true);
    
    try {
      const myDocRef = doc(db, "users", auth.currentUser.uid);
      const targetDocRef = doc(db, "users", userId);
      const newFollowState = !isFollowing;
      
      // Update my following list
      await updateDoc(myDocRef, {
        following: newFollowState ? arrayUnion(userId) : arrayRemove(userId)
      });
      
      // Update target user's followers list
      await updateDoc(targetDocRef, {
        followers: newFollowState ? arrayUnion(auth.currentUser.uid) : arrayRemove(auth.currentUser.uid)
      });
      
      setIsFollowing(newFollowState);
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleToggleBlock = async () => {
    if (!auth.currentUser || !userId) return;
    
    try {
      const myDocRef = doc(db, "users", auth.currentUser.uid);
      const newBlockedState = !isBlocked;
      
      await updateDoc(myDocRef, {
        blockedUsers: newBlockedState ? arrayUnion(userId) : arrayRemove(userId)
      });
      
      setIsBlocked(newBlockedState);
      setShowMenu(false);
    } catch (error) {
      console.error("Error toggling block:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white p-6 text-center">
        <p className="text-zinc-500 mb-4">User not found or has been removed.</p>
        <button onClick={() => navigate(-1)} className="text-blue-600 font-bold">Go Back</button>
      </div>
    );
  }

  const isPrivate = user.profileType === 'private' && !isFollowing && auth.currentUser?.uid !== userId;

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden font-sans">
      {/* Header matching TopNav style but with back button */}
      <div className="w-full bg-[#00B0FF] px-4 h-13 flex justify-between items-center z-50 shrink-0 relative border-b border-white/10 shadow-[0_8px_30px_rgba(0,176,255,0.2)]">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="hover:bg-white/10 p-2 rounded-full transition-colors cursor-pointer">
            <ArrowLeft size={22} className="text-white" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-white tracking-tight">{user.fullName || 'GxChat User'}</h1>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
            <Bell size={22} className="text-white" />
          </button>
          <button 
            onClick={() => setShowMenu(true)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <MoreVertical size={22} className="text-white" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {/* Instagram Style Header */}
        <div className="px-4 pt-6 pb-4">
          <div className="flex items-center gap-8 mb-4">
            {/* Profile Picture */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
                <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-zinc-100">
                  <img 
                    src={user.hidePhoto ? DEFAULT_LOGO : (user.photoURL || DEFAULT_LOGO)} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    alt="Profile"
                  />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1 flex justify-around items-center">
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-zinc-900">0</span>
                <span className="text-xs text-zinc-500">Posts</span>
              </div>
              <button 
                onClick={() => !isPrivate && navigate(`/user/${userId}/followers`)}
                className={`flex flex-col items-center ${isPrivate ? 'opacity-50 cursor-default' : ''}`}
              >
                <span className="text-lg font-bold text-zinc-900">{user.followers?.length || 0}</span>
                <span className="text-xs text-zinc-500">Followers</span>
              </button>
              <button 
                onClick={() => !isPrivate && navigate(`/user/${userId}/following`)}
                className={`flex flex-col items-center ${isPrivate ? 'opacity-50 cursor-default' : ''}`}
              >
                <span className="text-lg font-bold text-zinc-900">{user.following?.length || 0}</span>
                <span className="text-xs text-zinc-500">Following</span>
              </button>
            </div>
          </div>

          {/* Name, Username and Action Buttons Row */}
          <div className="flex flex-col mb-4">
            <div className="flex flex-col mb-4">
              <h2 className="text-sm font-bold text-zinc-900 leading-tight">
                {user.fullName || 'GxChat User'}
              </h2>
              <p className="text-sm text-zinc-500">
                @{user.username || 'username'}
              </p>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={handleToggleFollow}
                disabled={followLoading}
                className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-colors border ${
                  isFollowing 
                  ? 'bg-zinc-100 text-zinc-900 border-zinc-200' 
                  : 'bg-blue-500 text-white border-blue-600'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <button 
                onClick={() => navigate(`/chat/${userId}`)}
                className="flex-1 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-sm font-semibold rounded-lg transition-colors border border-zinc-200"
              >
                Message
              </button>
            </div>
          </div>
        </div>

        {/* Profile Content (Tabs & Grid) */}
        {isPrivate ? (
          <div className="bg-white p-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 mb-4">
              <LockKeyhole size={32} />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-tight mb-2">This Account is Private</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Follow this account to see their photos, videos and profile details.
            </p>
          </div>
        ) : (
          <ProfileContent posts={mockPosts} activeTab={activeFilter} />
        )}

        {/* Branding Footer */}
        <div className="py-12 flex flex-col items-center gap-1 opacity-40">
          <span className="text-zinc-400 text-sm font-medium">from</span>
          <span className="text-zinc-900 text-[10px] font-black tracking-[0.3em] uppercase">Gothwad technologies</span>
          <span className="text-zinc-400 text-[8px] uppercase tracking-tighter mt-1">made in india</span>
        </div>
      </div>

      {/* Action Menu */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
              className="fixed inset-0 bg-black/40 z-[60]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[70] p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-zinc-900">Options</h3>
                <button onClick={() => setShowMenu(false)} className="p-2 hover:bg-zinc-100 rounded-full">
                  <X size={20} className="text-zinc-500" />
                </button>
              </div>
              
              <div className="space-y-2">
                <button 
                  onClick={handleToggleBlock}
                  className="w-full flex items-center gap-4 p-4 hover:bg-zinc-50 rounded-2xl transition-colors text-red-600"
                >
                  <UserX size={20} />
                  <span className="font-bold">{isBlocked ? 'Unblock User' : 'Block User'}</span>
                </button>
                <button 
                  onClick={() => setShowMenu(false)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-zinc-50 rounded-2xl transition-colors text-orange-600"
                >
                  <ShieldAlert size={20} />
                  <span className="font-bold">Report User</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
