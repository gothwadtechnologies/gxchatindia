import React, { useEffect, useState } from 'react';
import { 
  Camera,
  Grid,
  User,
  Bookmark,
  Settings,
  PlusSquare,
  Menu,
  Share2,
  Clapperboard,
  Video
} from 'lucide-react';
import { useLayout } from '../../contexts/LayoutContext.tsx';
import { auth, db } from '../../services/firebase.ts';
import { doc, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

import ProfileContent from './components/ProfileContent.tsx';

export default function ProfileTab() {
  const [userData, setUserData] = useState<any>(null);
  const { activeFilters } = useLayout();
  const activeTab = activeFilters['profile'];
  const navigate = useNavigate();

  const DEFAULT_LOGO = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  // Mock posts for the grid
  const mockPosts = Array.from({ length: 9 }).map((_, i) => ({
    id: i,
    url: `https://picsum.photos/seed/post${i}/400/400`
  }));

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

  return (
    <div className="h-full flex flex-col bg-[var(--bg-card)] overflow-hidden font-sans">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {/* Instagram Style Header */}
        <div className="px-4 pt-6 pb-4">
          <div className="flex items-center gap-8 mb-4">
            {/* Profile Picture */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
                <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-zinc-100">
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
                className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 text-white rounded-full border-2 border-white flex items-center justify-center shadow-sm"
              >
                <PlusSquare size={14} />
              </button>
            </div>

            {/* Stats */}
            <div className="flex-1 flex justify-around items-center">
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-zinc-900">0</span>
                <span className="text-xs text-zinc-500">Posts</span>
              </div>
              <button 
                onClick={() => navigate(`/user/${auth.currentUser?.uid}/followers`)}
                className="flex flex-col items-center"
              >
                <span className="text-lg font-bold text-zinc-900">{userData?.followers?.length || 0}</span>
                <span className="text-xs text-zinc-500">Followers</span>
              </button>
              <button 
                onClick={() => navigate(`/user/${auth.currentUser?.uid}/following`)}
                className="flex flex-col items-center"
              >
                <span className="text-lg font-bold text-zinc-900">{userData?.following?.length || 0}</span>
                <span className="text-xs text-zinc-500">Following</span>
              </button>
            </div>
          </div>

          {/* Name, Username and Edit Button Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <h2 className="text-sm font-bold text-zinc-900 leading-tight">
                {userData?.fullName || 'GxChat User'}
              </h2>
              <p className="text-sm text-zinc-500">
                @{userData?.username || 'username'}
              </p>
            </div>
            <button 
              onClick={() => navigate('/edit-profile')}
              className="px-6 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-sm font-semibold rounded-lg transition-colors border border-zinc-200"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Profile Content (Tabs & Grid) */}
        <ProfileContent posts={mockPosts} activeTab={activeTab} />

        {/* Branding Footer */}
        <div className="py-12 flex flex-col items-center gap-1 opacity-40">
          <span className="text-zinc-400 text-sm font-medium">from</span>
          <span className="text-zinc-900 text-[10px] font-black tracking-[0.3em] uppercase">Gothwad technologies</span>
          <span className="text-zinc-400 text-[8px] uppercase tracking-tighter mt-1">made in india</span>
        </div>
      </div>
    </div>
  );
}


