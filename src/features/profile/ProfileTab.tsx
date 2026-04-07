import React, { useEffect, useState } from 'react';
import { 
  PlusSquare,
  Grid,
  Bookmark,
  UserSquare,
  Camera,
  Clapperboard,
  Upload
} from 'lucide-react';
import { auth, db } from '../../services/firebase.ts';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export default function ProfileTab() {
  const [userData, setUserData] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'tagged'>('posts');
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

    // Fetch user posts
    const fetchPosts = async () => {
      const q = query(collection(db, "posts"), where("userId", "==", auth.currentUser?.uid));
      const querySnapshot = await getDocs(q);
      const userPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(userPosts);
    };
    fetchPosts();

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col bg-[var(--bg-main)] font-sans h-full overflow-y-auto no-scrollbar">
      <div className="flex-1 pb-24">
        {/* Profile Header */}
        <div className="px-4 pt-6 pb-4">
          <div className="flex items-center gap-8 mb-6">
            {/* Profile Picture */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
                <div className="w-full h-full rounded-full border-2 border-[var(--bg-main)] overflow-hidden bg-zinc-100">
                  <img 
                    src={userData?.photoURL || DEFAULT_LOGO} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    alt="Profile"
                  />
                </div>
              </div>
              <button 
                onClick={() => navigate('/edit-profile')}
                className="absolute bottom-0 right-0 w-6 h-6 bg-[var(--primary)] text-white rounded-full border-2 border-[var(--bg-main)] flex items-center justify-center shadow-sm"
              >
                <PlusSquare size={14} />
              </button>
            </div>

            {/* Stats Box (Single) */}
            <div className="flex-1 bg-[var(--box-bg)] rounded-xl p-2 flex justify-between items-center min-h-[60px]">
              <div className="flex flex-col items-center flex-1">
                <span className="text-sm font-bold text-[var(--box-text)]">{posts.length}</span>
                <span className="text-[10px] text-[var(--box-text)] opacity-80 uppercase font-bold tracking-wider">Reels</span>
              </div>
              <button 
                onClick={() => navigate(`/user/${auth.currentUser?.uid}/followers`)}
                className="flex flex-col items-center flex-1 active:scale-95 transition-all"
              >
                <span className="text-sm font-bold text-[var(--box-text)]">{userData?.followers?.length || 0}</span>
                <span className="text-[10px] text-[var(--box-text)] opacity-80 uppercase font-bold tracking-wider">Followers</span>
              </button>
              <button 
                onClick={() => navigate(`/user/${auth.currentUser?.uid}/following`)}
                className="flex flex-col items-center flex-1 active:scale-95 transition-all"
              >
                <span className="text-sm font-bold text-[var(--box-text)]">{userData?.following?.length || 0}</span>
                <span className="text-[10px] text-[var(--box-text)] opacity-80 uppercase font-bold tracking-wider">Following</span>
              </button>
            </div>
          </div>

          {/* 4 Boxes Layout */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {/* Name & Username Box */}
            <div className="bg-[var(--box-bg)] p-3 rounded-xl text-[var(--box-text)] flex flex-col justify-center min-h-[60px]">
              <h2 className="text-[13px] font-bold leading-tight truncate">
                {userData?.fullName || 'GxChat User'}
              </h2>
              <p className="text-[11px] opacity-80 truncate">
                @{userData?.username || 'username'}
              </p>
            </div>

            {/* Bio Box */}
            <div className="bg-[var(--box-bg)] p-3 rounded-xl text-[var(--box-text)] flex flex-col justify-center min-h-[60px]">
              <p className="text-[11px] leading-tight line-clamp-3">
                {userData?.bio || 'Available'}
              </p>
            </div>

            {/* Edit Profile Box */}
            <button 
              onClick={() => navigate('/edit-profile')}
              className="bg-[var(--box-bg)] text-[var(--box-text)] px-4 py-3 rounded-xl text-[13px] font-bold active:scale-[0.98] transition-all text-left"
            >
              Edit Profile
            </button>

            {/* Share Profile Box */}
            <button 
              className="bg-[var(--box-bg)] text-[var(--box-text)] px-4 py-3 rounded-xl text-[13px] font-bold active:scale-[0.98] transition-all text-left"
            >
              Share Profile
            </button>
          </div>

          {/* Tabs Strip */}
          <div className="flex bg-[var(--box-bg)] rounded-xl mb-4 overflow-hidden h-[46px] items-stretch">
            <button 
              onClick={() => setActiveTab('posts')}
              className={`flex-1 flex justify-center items-center transition-colors ${activeTab === 'posts' ? 'bg-white/10 text-[var(--box-text)]' : 'text-[var(--box-text)] opacity-50'}`}
            >
              <Clapperboard size={20} />
            </button>
            <button 
              onClick={() => setActiveTab('tagged')}
              className={`flex-1 flex justify-center items-center transition-colors ${activeTab === 'tagged' ? 'bg-white/10 text-[var(--box-text)]' : 'text-[var(--box-text)] opacity-50'}`}
            >
              <UserSquare size={20} />
            </button>
            <button 
              onClick={() => setActiveTab('saved')}
              className={`flex-1 flex justify-center items-center transition-colors ${activeTab === 'saved' ? 'bg-white/10 text-[var(--box-text)]' : 'text-[var(--box-text)] opacity-50'}`}
            >
              <Upload size={20} />
            </button>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-3 gap-0.5">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="aspect-square bg-zinc-100 relative group overflow-hidden">
                <img 
                  src={post.imageUrl || `https://picsum.photos/seed/${post.id}/400/400`} 
                  className="w-full h-full object-cover"
                  alt="Post"
                />
              </div>
            ))
          ) : (
            <div className="col-span-3 py-20 flex flex-col items-center justify-center text-[var(--text-secondary)]">
              <div className="w-16 h-16 rounded-full border-2 border-[var(--text-secondary)] flex items-center justify-center mb-4">
                <Camera size={32} />
              </div>
              <p className="text-sm font-bold">No posts yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


