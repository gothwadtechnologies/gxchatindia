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
  LockKeyhole
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../server/firebase.ts';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp, onSnapshot } from 'firebase/firestore';

export default function UserProfileScreen() {
  const { id: userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

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
      alert(newBlockedState ? "User blocked successfully" : "User unblocked successfully");
    } catch (error) {
      console.error("Error toggling block:", error);
    }
  };

  const DEFAULT_LOGO = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  // Calculate account age (mock logic for now, using createdAt if available)
  const getAccountAge = () => {
    if (!user?.createdAt) return "New Member";
    const created = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days on GxChat`;
    const months = Math.floor(diffDays / 30);
    if (months < 12) return `${months} months on GxChat`;
    const years = Math.floor(months / 12);
    return `${years} years on GxChat`;
  };

  const getJoinedDate = () => {
    if (!user?.createdAt) return "Unknown";
    const created = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
    return created.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatLastSeen = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
      return `last seen at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    } else if (isYesterday) {
      return 'last seen at Yesterday';
    } else {
      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
      if (date.getFullYear() !== now.getFullYear()) {
        options.year = 'numeric';
      }
      return `last seen at ${date.toLocaleDateString('en-GB', options)}`;
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
    <div className="h-full flex flex-col bg-zinc-50 overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 h-16 bg-sky-500 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="hover:bg-sky-600 p-2 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-white" />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-sky-100 uppercase tracking-wider">@{user.username}</span>
            <h1 className="text-sm font-black text-white tracking-tight uppercase">{user.fullName || 'GxChat User'}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-sky-600 rounded-full transition-colors">
            <Bell size={22} className="text-white" />
          </button>
          <button className="p-2 hover:bg-sky-600 rounded-full transition-colors">
            <MoreVertical size={22} className="text-white" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
        {/* Top Profile Section */}
        <div className="bg-white px-6 pt-6 pb-4 flex flex-col items-center border-b border-zinc-100 shadow-sm">
          <div className="relative mb-4">
            <div className="p-0.5 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-xl shadow-blue-100">
              <div className="p-0.5 bg-white rounded-full">
                <img 
                  src={user.hidePhoto ? DEFAULT_LOGO : (user.photoURL || DEFAULT_LOGO)} 
                  alt={user.username}
                  className="w-24 h-24 rounded-full object-cover border-2 border-zinc-50"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            {!isPrivate && <div className="absolute bottom-0 right-0 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>}
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <h2 className="text-lg font-black text-zinc-900 tracking-tight">{user.fullName || 'GxChat User'}</h2>
              <CheckCircle2 size={16} className="text-blue-500 fill-blue-500 text-white" />
            </div>
            <p className="text-zinc-500 font-bold text-xs tracking-wide mb-4">@{user.username}</p>

            <div className="flex items-center gap-8 mb-2">
              <button 
                onClick={() => !isPrivate && navigate(`/user/${userId}/followers`)}
                className={`flex flex-col items-center ${isPrivate ? 'opacity-50 cursor-default' : ''}`}
              >
                <span className="text-lg font-black text-zinc-900 leading-none">{user.followers?.length || 0}</span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Followers</span>
              </button>
              <div className="w-[1px] h-6 bg-zinc-100"></div>
              <button 
                onClick={() => !isPrivate && navigate(`/user/${userId}/following`)}
                className={`flex flex-col items-center ${isPrivate ? 'opacity-50 cursor-default' : ''}`}
              >
                <span className="text-lg font-black text-zinc-900 leading-none">{user.following?.length || 0}</span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Following</span>
              </button>
            </div>
          </div>

          <div className="flex gap-3 mt-6 w-full px-2">
            <button 
              onClick={handleToggleFollow}
              disabled={followLoading}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold active:scale-95 transition-all text-sm ${
                isFollowing 
                ? 'bg-zinc-100 text-zinc-900 border border-zinc-200' 
                : 'bg-zinc-900 text-white shadow-lg shadow-zinc-200'
              }`}
            >
              {isFollowing ? <UserCheck size={18} /> : <UserPlus size={18} />}
              <span>{isFollowing ? 'Following' : 'Follow'}</span>
            </button>
            <button 
              onClick={() => navigate(`/chat/${userId}`)}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all text-sm"
            >
              <MessageSquare size={18} />
              <span>Message</span>
            </button>
          </div>
        </div>

        {/* Details Section */}
        <div className="px-4 mt-4 space-y-4">
          {isPrivate ? (
            <div className="bg-white rounded-3xl p-10 border border-zinc-100 shadow-sm flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 mb-4">
                <LockKeyhole size={32} />
              </div>
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight mb-2">This Account is Private</h3>
              <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
                Follow this account to see their photos, videos and profile details.
              </p>
            </div>
          ) : (
            <div className="bg-zinc-100/50 rounded-3xl border border-zinc-200/50 shadow-sm overflow-hidden">
              <div className="p-5 space-y-4">
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-1">About User</h3>
                
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Joined Date</p>
                    <p className="text-xs font-bold text-zinc-900">{getJoinedDate()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">GxChat India Age</p>
                    <p className="text-xs font-bold text-zinc-900">{getAccountAge()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-2 bg-zinc-200 rounded-xl text-zinc-600">
                    <Info size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Status</p>
                    <p className="text-xs font-bold text-zinc-900">
                      {user.isOnline ? (
                        <span className="text-emerald-600">Online Now</span>
                      ) : (
                        <span className="text-zinc-500">{formatLastSeen(user.lastSeen)}</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-200/50">
                <div className="flex items-center justify-between p-4 hover:bg-zinc-100/50 transition-colors border-b border-zinc-200/50">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-red-50 rounded-xl text-red-600">
                      <UserX size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900">Block User</p>
                      <p className="text-[9px] text-zinc-500">Stop receiving messages</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleToggleBlock}
                    className={`w-10 h-5 rounded-full transition-colors relative ${isBlocked ? 'bg-red-600' : 'bg-zinc-300'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isBlocked ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
                <button className="w-full flex items-center justify-between p-4 hover:bg-zinc-100/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-orange-50 rounded-xl text-orange-600">
                      <ShieldAlert size={18} />
                    </div>
                    <span className="text-xs font-bold text-zinc-900">Report User</span>
                  </div>
                  <ChevronRight size={16} className="text-zinc-300" />
                </button>
              </div>
            </div>
          )}

          {/* Footer Info */}
          <div className="py-8 flex flex-col items-center gap-1">
            <span className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase">GxChat India Profile</span>
            <span className="text-zinc-400 text-[8px] uppercase tracking-tighter">Secure & Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
