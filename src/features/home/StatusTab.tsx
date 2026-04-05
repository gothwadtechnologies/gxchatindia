import React, { useEffect, useState } from 'react';
import { collection, addDoc, query, orderBy, limit, where, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../services/firebase.ts';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Camera, 
  Type,
  X,
  Send,
  Palette,
  Type as TypeIcon,
  Check,
  CircleDashed
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toDate } from '../../utils/dateUtils.ts';

const STATUS_COLORS = [
  'bg-rose-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 
  'bg-purple-500', 'bg-zinc-800', 'bg-indigo-500', 'bg-pink-500'
];

const FONT_SIZES = [
  { label: 'S', value: 'text-lg' },
  { label: 'M', value: 'text-2xl' },
  { label: 'L', value: 'text-4xl' },
  { label: 'XL', value: 'text-6xl' }
];

export default function StatusTab() {
  const navigate = useNavigate();
  const [statuses, setStatuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [selectedColor, setSelectedColor] = useState(STATUS_COLORS[0]);
  const [selectedFontSize, setSelectedFontSize] = useState(FONT_SIZES[1].value);

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

  useEffect(() => {
    const q = query(
      collection(db, "statuses"),
      orderBy("timestamp", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const statusList = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      
      // Group by user
      const grouped: { [key: string]: any } = {};
      statusList.forEach((s: any) => {
        if (!grouped[s.userId]) {
          grouped[s.userId] = {
            userId: s.userId,
            fullName: s.fullName,
            username: s.username,
            photoURL: s.photoURL,
            updates: []
          };
        }
        grouped[s.userId].updates.push(s);
      });

      setStatuses(Object.values(grouped));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handlePostStatus = async () => {
    if (!statusText.trim() || !auth.currentUser) return;

    try {
      await addDoc(collection(db, "statuses"), {
        userId: auth.currentUser.uid,
        fullName: currentUserData?.fullName || '',
        username: currentUserData?.username || '',
        photoURL: currentUserData?.photoURL || '',
        text: statusText,
        color: selectedColor,
        fontSize: selectedFontSize,
        timestamp: serverTimestamp(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });

      setStatusText('');
      setIsCreating(false);
    } catch (error) {
      console.error("Error posting status:", error);
    }
  };

  const myStatuses = statuses.find(s => s.userId === auth.currentUser?.uid);
  const otherStatuses = statuses.filter(s => s.userId !== auth.currentUser?.uid);

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)] font-sans relative overflow-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 pt-6">
        {/* My Status */}
        <section className="px-4 mb-6">
          <div 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-4 p-4 bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-color)] shadow-sm cursor-pointer active:scale-[0.98] transition-all"
          >
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
              <p className="text-[11px] font-bold text-[var(--text-secondary)] opacity-70">
                {myStatuses ? 'Tap to add another update' : 'Tap to add status update'}
              </p>
            </div>
          </div>
        </section>

        {/* Recent Updates */}
        {otherStatuses.length > 0 && (
          <section className="px-4 mb-6">
            <h3 className="px-2 text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4">Recent updates</h3>
            <div className="flex flex-col gap-2">
              {otherStatuses.map((userStatus) => (
                <div key={userStatus.userId} className="flex items-center gap-4 p-4 hover:bg-[var(--bg-card)] rounded-[2.5rem] transition-all cursor-pointer group">
                  <div className="relative">
                    {/* WhatsApp-like status ring */}
                    <div className="w-14 h-14 rounded-full p-[2px] border-2 border-emerald-500 flex items-center justify-center">
                      <img 
                        src={userStatus.photoURL || DEFAULT_LOGO} 
                        className="w-full h-full rounded-full object-cover border-2 border-[var(--bg-main)]" 
                        referrerPolicy="no-referrer" 
                      />
                    </div>
                  </div>
                  <div className="flex-1 border-b border-[var(--border-color)]/50 pb-2 group-last:border-0">
                    <h4 className="text-[14px] font-black text-[var(--text-primary)]">{userStatus.fullName || userStatus.username}</h4>
                    <p className="text-[11px] font-bold text-[var(--text-secondary)] opacity-70">
                      {userStatus.updates[0]?.timestamp ? toDate(userStatus.updates[0].timestamp)?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {!loading && statuses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-10 text-center opacity-50">
            <CircleDashed size={48} className="mb-4 text-[var(--text-secondary)]" />
            <p className="text-sm font-bold text-[var(--text-secondary)]">No status updates yet</p>
          </div>
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="absolute bottom-4 right-6 flex flex-col gap-3 items-center z-40">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsCreating(true)}
          className="p-3 bg-[var(--bg-card)] text-[var(--text-secondary)] rounded-full shadow-lg border border-[var(--border-color)]"
        >
          <Type size={20} />
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          className="p-3.5 bg-[var(--header-bg)] text-[var(--header-text)] rounded-full shadow-xl border border-[var(--border-color)] flex items-center justify-center"
        >
          <Camera size={22} strokeWidth={3} />
        </motion.button>
      </div>

      {/* Status Creator Modal */}
      <AnimatePresence>
        {isCreating && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed inset-0 z-[100] flex flex-col ${selectedColor} transition-colors duration-500`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-6">
              <button 
                onClick={() => setIsCreating(false)}
                className="p-2 text-white/80 hover:text-white transition-colors"
              >
                <X size={28} />
              </button>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => {
                    const currentIndex = STATUS_COLORS.indexOf(selectedColor);
                    const nextIndex = (currentIndex + 1) % STATUS_COLORS.length;
                    setSelectedColor(STATUS_COLORS[nextIndex]);
                  }}
                  className="p-2 text-white/80 hover:text-white transition-colors"
                >
                  <Palette size={24} />
                </button>
                <button 
                  onClick={() => {
                    const currentIndex = FONT_SIZES.findIndex(f => f.value === selectedFontSize);
                    const nextIndex = (currentIndex + 1) % FONT_SIZES.length;
                    setSelectedFontSize(FONT_SIZES[nextIndex].value);
                  }}
                  className="p-2 text-white/80 hover:text-white transition-colors flex items-center justify-center"
                >
                  <span className="font-bold text-lg">{FONT_SIZES.find(f => f.value === selectedFontSize)?.label}</span>
                </button>
              </div>
            </div>

            {/* Input Area */}
            <div className="flex-1 flex items-center justify-center px-8">
              <textarea
                autoFocus
                placeholder="Type a status"
                value={statusText}
                onChange={(e) => setStatusText(e.target.value)}
                className={`w-full bg-transparent border-none focus:ring-0 text-white text-center font-bold placeholder:text-white/40 resize-none ${selectedFontSize}`}
                rows={4}
              />
            </div>

            {/* Footer */}
            <div className="px-6 py-8 flex justify-end">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handlePostStatus}
                disabled={!statusText.trim()}
                className={`p-4 rounded-full shadow-2xl flex items-center justify-center transition-all ${statusText.trim() ? 'bg-white text-zinc-900 scale-110' : 'bg-white/20 text-white/40 cursor-not-allowed'}`}
              >
                <Send size={24} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
