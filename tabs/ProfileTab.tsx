import React, { useEffect, useState } from 'react';
import { 
  Bell,
  Settings,
  Camera,
  QrCode,
  ChevronRight,
  Calendar,
  Clock,
  Info,
  CheckCircle2,
  Lock,
  Database,
  Edit3,
  EyeOff,
  UserCircle,
  ShieldCheck,
  User,
  Users,
  UserPlus,
  ExternalLink,
  X,
  Globe
} from 'lucide-react';
import BottomNav from '../components/BottomNav.tsx';
import TopNav from '../components/TopNav.tsx';
import { auth, db } from '../server/firebase.ts';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function ProfileTab() {
  const [userData, setUserData] = useState<any>(null);
  const [showQR, setShowQR] = useState(false);
  const navigate = useNavigate();

  const DEFAULT_LOGO = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  useEffect(() => {
    if (!auth.currentUser) return;

    const docRef = doc(db, "users", auth.currentUser.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    });

    return () => unsubscribe();
  }, []);

  const getAccountAge = () => {
    if (!userData?.createdAt) return "7 days on GxChat"; // Default fallback
    const created = userData.createdAt.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days on GxChat`;
  };

  const getJoinedDate = () => {
    if (!userData?.createdAt) return "9 March 2026"; // Default fallback
    const created = userData.createdAt.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt);
    return created.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const hidePhoto = userData?.hidePhoto || false;

  return (
    <div className="h-full flex flex-col bg-[#F8F9FA] overflow-hidden font-sans">
      <TopNav />

      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
        {/* Profile Hero Section */}
        <div className="relative px-4 py-6 bg-white border-b border-zinc-100">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg border-2 border-white">
                <img 
                  src={hidePhoto ? DEFAULT_LOGO : (userData?.photoURL || DEFAULT_LOGO)} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <button 
                onClick={() => navigate('/edit-profile')}
                className="absolute -bottom-1 -right-1 bg-sky-500 p-1.5 rounded-xl text-white border-2 border-white shadow-md hover:scale-110 transition-transform"
              >
                <Camera size={12} />
              </button>
            </div>
            
            <div className="flex-1 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h2 className="text-lg font-black text-zinc-900 tracking-tight">{userData?.fullName || 'GxChat User'}</h2>
                  <CheckCircle2 size={14} className="text-sky-500 fill-sky-500 text-white" />
                </div>
                <p className="text-zinc-400 font-bold text-xs">@{userData?.username || 'username'}</p>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                    <ShieldCheck size={10} />
                    <span className="text-[9px] font-black uppercase tracking-wider">Official Member</span>
                  </div>
                  <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border ${
                    userData?.profileType === 'private' 
                    ? 'bg-zinc-900 text-white border-zinc-800' 
                    : 'bg-blue-50 text-blue-600 border-blue-100'
                  }`}>
                    {userData?.profileType === 'private' ? <Lock size={10} /> : <Globe size={10} />}
                    <span className="text-[9px] font-black uppercase tracking-wider">
                      {userData?.profileType === 'private' ? 'Private' : 'Public'}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => navigate('/edit-profile')}
                className="p-2 bg-zinc-50 rounded-xl text-zinc-400 hover:text-sky-500 hover:bg-sky-50 transition-all"
              >
                <Edit3 size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 px-4 mt-4">
          <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
            <div className="w-8 h-8 bg-sky-50 rounded-xl flex items-center justify-center text-sky-500 mb-3">
              <Calendar size={16} />
            </div>
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Joined Date</p>
            <p className="text-xs font-black text-zinc-900">{getJoinedDate()}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
            <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 mb-3">
              <Clock size={16} />
            </div>
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">GxChat Age</p>
            <p className="text-xs font-black text-zinc-900">{getAccountAge()}</p>
          </div>
          <button 
            onClick={() => navigate(`/user/${auth.currentUser?.uid}/followers`)}
            className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm text-left active:scale-95 transition-all"
          >
            <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 mb-3">
              <Users size={16} />
            </div>
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Followers</p>
            <p className="text-xs font-black text-zinc-900">{userData?.followers?.length || 0}</p>
          </button>
          <button 
            onClick={() => navigate(`/user/${auth.currentUser?.uid}/following`)}
            className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm text-left active:scale-95 transition-all"
          >
            <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 mb-3">
              <UserPlus size={16} />
            </div>
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Following</p>
            <p className="text-xs font-black text-zinc-900">{userData?.following?.length || 0}</p>
          </button>
        </div>

        {/* About Me Section */}
        <div className="px-4 mt-4">
          <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">About Me</h3>
              <button onClick={() => navigate('/edit-profile')} className="text-sky-500">
                <Edit3 size={14} />
              </button>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed font-medium">
              {userData?.bio || "No bio added yet. Tell the world about yourself!"}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="py-8 flex flex-col items-center gap-1 opacity-40">
          <span className="text-zinc-900 text-[9px] font-black tracking-[0.2em] uppercase">GxChat India V 1.0.0</span>
          <span className="text-zinc-500 text-[7px] uppercase tracking-tighter">Secured by Gothwad Technologies</span>
        </div>
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[3rem] overflow-hidden relative"
            >
              <button 
                onClick={() => setShowQR(false)}
                className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full text-zinc-500"
              >
                <X size={20} />
              </button>

              <div className="p-8 pt-12 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-3xl overflow-hidden mb-4 border-4 border-zinc-50 shadow-lg">
                  <img src={userData?.photoURL || DEFAULT_LOGO} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <h3 className="text-xl font-black text-zinc-900">{userData?.fullName}</h3>
                <p className="text-zinc-400 font-bold text-sm mb-8">@{userData?.username}</p>

                <div className="p-6 bg-zinc-50 rounded-[2.5rem] border-4 border-zinc-100 mb-8">
                  {/* Mock QR Code */}
                  <div className="w-48 h-48 bg-white p-4 rounded-3xl shadow-inner flex items-center justify-center">
                    <div className="grid grid-cols-4 gap-2">
                      {[...Array(16)].map((_, i) => (
                        <div key={i} className={`w-8 h-8 rounded-md ${Math.random() > 0.5 ? 'bg-zinc-900' : 'bg-zinc-100'}`} />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] leading-relaxed">
                  Scan this code to quickly<br />add me on GxChat India
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}

