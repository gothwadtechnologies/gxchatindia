import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit, where, doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../services/firebase.ts';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Camera, 
  MoreVertical, 
  Search,
  CircleDashed,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { toDate } from '../../utils/dateUtils.ts';

export default function StoriesTab() {
  const navigate = useNavigate();
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserData, setCurrentUserData] = useState<any>(null);

  const DEFAULT_LOGO = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  useEffect(() => {
    if (auth.currentUser) {
      const unsubscribeMe = onSnapshot(doc(db, "users", auth.currentUser.uid), (docSnap) => {
        if (docSnap.exists()) {
          setCurrentUserData(docSnap.data());
        }
      });
      return () => unsubscribeMe();
    }
  }, []);

  const recentStories = stories.filter(s => s.hasUnseen);
  const viewedStories = stories.filter(s => !s.hasUnseen);

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)] font-sans">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 pt-6">
        {/* My Status */}
        <section className="px-4 mb-6">
          <div className="flex items-center gap-4 p-4 bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-color)] shadow-sm cursor-pointer active:scale-[0.98] transition-all">
            <div className="relative">
              <img 
                src={currentUserData?.photoURL || DEFAULT_LOGO} 
                className="w-14 h-14 rounded-full object-cover border-2 border-[var(--bg-card)]" 
                referrerPolicy="no-referrer" 
              />
              <div className="absolute bottom-0 right-0 bg-[var(--primary)] text-white p-1 rounded-full border-2 border-[var(--bg-card)]">
                <Plus size={14} strokeWidth={3} />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-[15px] font-black text-[var(--text-primary)]">My status</h4>
              <p className="text-[11px] font-bold text-[var(--text-secondary)] opacity-70">Tap to add status update</p>
            </div>
          </div>
        </section>

        {/* Recent Updates */}
        {recentStories.length > 0 && (
          <section className="px-4 mb-6">
            <h3 className="px-2 text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4">Recent updates</h3>
            <div className="flex flex-col gap-2">
              {recentStories.map((story) => (
                <div key={story.id} className="flex items-center gap-4 p-4 hover:bg-[var(--bg-card)] rounded-[2.5rem] transition-all cursor-pointer group">
                  <div className="relative p-[2px] rounded-full border-2 border-[var(--primary)]">
                    <img 
                      src={story.photoURL || DEFAULT_LOGO} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-[var(--bg-main)]" 
                      referrerPolicy="no-referrer" 
                    />
                  </div>
                  <div className="flex-1 border-b border-[var(--border-color)]/50 pb-2 group-last:border-0">
                    <h4 className="text-[14px] font-black text-[var(--text-primary)]">{story.fullName || story.username}</h4>
                    <p className="text-[11px] font-bold text-[var(--text-secondary)] opacity-70">{story.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Viewed Updates */}
        {viewedStories.length > 0 && (
          <section className="px-4 mb-6">
            <h3 className="px-2 text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4">Viewed updates</h3>
            <div className="flex flex-col gap-2 opacity-60">
              {viewedStories.map((story) => (
                <div key={story.id} className="flex items-center gap-4 p-4 hover:bg-[var(--bg-card)] rounded-[2.5rem] transition-all cursor-pointer group">
                  <div className="relative p-[2px] rounded-full border-2 border-[var(--border-color)]">
                    <img 
                      src={story.photoURL || DEFAULT_LOGO} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-[var(--bg-main)]" 
                      referrerPolicy="no-referrer" 
                    />
                  </div>
                  <div className="flex-1 border-b border-[var(--border-color)]/50 pb-2 group-last:border-0">
                    <h4 className="text-[14px] font-black text-[var(--text-primary)]">{story.fullName || story.username}</h4>
                    <p className="text-[11px] font-bold text-[var(--text-secondary)] opacity-70">{story.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="absolute bottom-4 right-6 flex flex-col gap-3 items-center z-40">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          className="p-3 bg-[var(--bg-card)] text-[var(--text-secondary)] rounded-full shadow-lg border border-[var(--border-color)]"
        >
          <Camera size={20} />
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          className="p-3.5 bg-[var(--header-bg)] text-[var(--header-text)] rounded-full shadow-xl border border-[var(--border-color)] flex items-center justify-center"
        >
          <Plus size={22} strokeWidth={3} />
        </motion.button>
      </div>
    </div>
  );
}
