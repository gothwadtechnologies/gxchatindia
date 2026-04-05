import React, { useEffect, useState } from 'react';
import { 
  PlusSquare,
  Grid,
  Bookmark,
  UserSquare,
  Camera,
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

            {/* Stats Row */}
            <div className="flex-1 flex justify-between items-center pr-4">
              <div className="flex flex-col items-center">
                <span className="text-base font-bold text-[var(--text-primary)]">{posts.length}</span>
                <span className="text-xs text-[var(--text-secondary)]">Posts</span>
              </div>
              <button 
                onClick={() => navigate(`/user/${auth.currentUser?.uid}/followers`)}
                className="flex flex-col items-center"
              >
                <span className="text-base font-bold text-[var(--text-primary)]">{userData?.followers?.length || 0}</span>
                <span className="text-xs text-[var(--text-secondary)]">Followers</span>
              </button>
              <button 
                onClick={() => navigate(`/user/${auth.currentUser?.uid}/following`)}
                className="flex flex-col items-center"
              >
                <span className="text-base font-bold text-[var(--text-primary)]">{userData?.following?.length || 0}</span>
                <span className="text-xs text-[var(--text-secondary)]">Following</span>
              </button>
            </div>
          </div>

          {/* Name & Bio */}
          <div className="mb-6">
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              {userData?.fullName || 'GxChat User'}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] font-medium">
              @{userData?.username || 'username'}
            </p>
            {userData?.bio && (
              <p className="text-sm text-[var(--text-primary)] mt-1 whitespace-pre-wrap">
                {userData.bio}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-8">
            <button 
              onClick={() => navigate('/edit-profile')}
              className="flex-1 bg-[var(--bg-chat)] text-[var(--text-primary)] py-2 rounded-lg text-sm font-bold border border-[var(--border-color)] active:scale-[0.98] transition-all"
            >
              Edit Profile
            </button>
            <button 
              className="flex-1 bg-[var(--bg-chat)] text-[var(--text-primary)] py-2 rounded-lg text-sm font-bold border border-[var(--border-color)] active:scale-[0.98] transition-all"
            >
              Share Profile
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-[var(--border-color)]">
          <button 
            onClick={() => setActiveTab('posts')}
            className={`flex-1 flex justify-center py-3 border-t-2 transition-colors ${activeTab === 'posts' ? 'border-[var(--text-primary)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)]'}`}
          >
            <Grid size={22} />
          </button>
          <button 
            onClick={() => setActiveTab('saved')}
            className={`flex-1 flex justify-center py-3 border-t-2 transition-colors ${activeTab === 'saved' ? 'border-[var(--text-primary)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)]'}`}
          >
            <Bookmark size={22} />
          </button>
          <button 
            onClick={() => setActiveTab('tagged')}
            className={`flex-1 flex justify-center py-3 border-t-2 transition-colors ${activeTab === 'tagged' ? 'border-[var(--text-primary)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)]'}`}
          >
            <UserSquare size={22} />
          </button>
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


