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
import { auth, db } from '../../services/firebase.ts';
import { doc, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

import ProfileContent from './components/ProfileContent.tsx';

export default function ProfileTab() {
  const [userData, setUserData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Post');
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

  const tabs = [
    { id: 'Post', icon: Grid, label: 'Posts' },
    { id: 'Videos', icon: Clapperboard, label: 'Videos' },
    { id: 'Upload', icon: PlusSquare, label: 'Upload' }
  ];

  return (
    <div className="flex flex-col bg-[var(--bg-card)] font-sans h-full overflow-y-auto no-scrollbar">
      <div className="flex-1 pb-24">
        {/* Instagram Style Header */}
        <div className="px-4 pt-6 pb-4">
          <div className="flex items-center gap-8 mb-4">
            {/* Profile Picture */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full p-0.5 bg-[var(--primary)]">
                <div className="w-full h-full rounded-full border-2 border-[var(--bg-card)] overflow-hidden bg-zinc-100">
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
                className="absolute bottom-0 right-0 w-6 h-6 bg-[var(--primary)] text-white rounded-full border-2 border-[var(--bg-card)] flex items-center justify-center shadow-sm"
              >
                <PlusSquare size={14} />
              </button>
            </div>

            {/* Stats */}
            <div className="flex-1 flex justify-around items-center">
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-[var(--text-primary)]">0</span>
                <span className="text-xs text-[var(--text-secondary)]">Posts</span>
              </div>
              <button 
                onClick={() => navigate(`/user/${auth.currentUser?.uid}/followers`)}
                className="flex flex-col items-center"
              >
                <span className="text-lg font-bold text-[var(--text-primary)]">{userData?.followers?.length || 0}</span>
                <span className="text-xs text-[var(--text-secondary)]">Followers</span>
              </button>
              <button 
                onClick={() => navigate(`/user/${auth.currentUser?.uid}/following`)}
                className="flex flex-col items-center"
              >
                <span className="text-lg font-bold text-[var(--text-primary)]">{userData?.following?.length || 0}</span>
                <span className="text-xs text-[var(--text-secondary)]">Following</span>
              </button>
            </div>
          </div>

          {/* Name, Username and Edit Button Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <h2 className="text-sm font-bold text-[var(--text-primary)] leading-tight">
                {userData?.fullName || 'GxChat User'}
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                @{userData?.username || 'username'}
              </p>
            </div>
            <button 
              onClick={() => navigate('/edit-profile')}
              className="px-6 py-1.5 bg-[var(--bg-chat)] hover:bg-[var(--bg-chat)]/80 text-[var(--text-primary)] text-sm font-semibold rounded-lg transition-colors border border-[var(--border-color)]"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-t border-[var(--border-color)]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-3 transition-all relative ${
                activeTab === tab.id ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'
              }`}
            >
              <tab.icon size={20} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="profile-tab-indicator"
                  className="absolute top-0 w-full h-0.5 bg-[var(--primary)]"
                />
              )}
            </button>
          ))}
        </div>

        {/* Profile Content (Tabs & Grid) */}
        <ProfileContent posts={mockPosts} activeTab={activeTab} />

        {/* Branding Footer */}
        <div className="py-12 flex flex-col items-center gap-1 opacity-40">
          <span className="text-[var(--text-secondary)] text-sm font-medium">from</span>
          <span className="text-[var(--text-primary)] text-[10px] font-black tracking-[0.3em] uppercase">Gothwad technologies</span>
          <span className="text-[var(--text-secondary)] text-[8px] uppercase tracking-tighter mt-1">made in india</span>
        </div>
      </div>
    </div>
  );
}


