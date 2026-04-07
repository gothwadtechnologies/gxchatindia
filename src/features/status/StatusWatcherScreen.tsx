import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../../services/firebase.ts';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toDate } from '../../utils/dateUtils.ts';

export default function StatusWatcherScreen() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [updates, setUpdates] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  const DURATION = 5000; // 5 seconds per status

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, "statuses"),
      where("userId", "==", userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort manually on client side to avoid composite index
      const sortedList = list.sort((a: any, b: any) => {
        const timeA = toDate(a.timestamp)?.getTime() || 0;
        const timeB = toDate(b.timestamp)?.getTime() || 0;
        return timeA - timeB;
      });
      setUpdates(sortedList);
      setLoading(false);
      if (list.length === 0) navigate('/status');
    });

    return () => unsubscribe();
  }, [userId, navigate]);

  // Record view when currentIndex changes
  useEffect(() => {
    const recordView = async () => {
      if (updates.length > 0 && auth.currentUser) {
        const currentStatus = updates[currentIndex];
        if (currentStatus && !currentStatus.viewers?.includes(auth.currentUser.uid)) {
          try {
            await updateDoc(doc(db, "statuses", currentStatus.id), {
              viewers: arrayUnion(auth.currentUser.uid)
            });
          } catch (error) {
            console.error("Error recording status view:", error);
          }
        }
      }
    };
    recordView();
  }, [currentIndex, updates]);

  useEffect(() => {
    if (updates.length === 0) return;

    const interval = 50;
    const step = (interval / DURATION) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (currentIndex < updates.length - 1) {
            setCurrentIndex(currentIndex + 1);
            return 0;
          } else {
            navigate('/status');
            return 100;
          }
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, updates, navigate]);

  const handleNext = () => {
    if (currentIndex < updates.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      navigate('/status');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  if (loading) return (
    <div className="h-full bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const current = updates[currentIndex];

  return (
    <div className={`h-full flex flex-col relative ${current?.imageUrl ? 'bg-black' : (current?.color || 'bg-zinc-900')}`}>
      {/* Progress Bars */}
      <div className="absolute top-4 left-4 right-4 flex gap-1 z-50">
        {updates.map((_, idx) => (
          <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-50"
              style={{ 
                width: idx === currentIndex ? `${progress}%` : idx < currentIndex ? '100%' : '0%' 
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <img 
            src={current?.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
            className="w-10 h-10 rounded-full border border-white/20"
            alt="User"
          />
          <div>
            <h4 className="text-white text-sm font-bold">{current?.fullName || current?.username}</h4>
            <p className="text-white/60 text-[10px] font-medium">
              {current?.timestamp ? toDate(current.timestamp)?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
            </p>
          </div>
        </div>
        <button onClick={() => navigate('/status')} className="p-2 text-white/80 hover:text-white">
          <X size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        <AnimatePresence mode="wait">
          {current?.imageUrl ? (
            <motion.img 
              key={current?.id}
              src={current.imageUrl}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          ) : (
            <motion.p 
              key={current?.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className={`text-white font-bold px-8 text-center ${current?.fontSize || 'text-2xl'}`}
            >
              {current?.text}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="absolute inset-0 flex">
        <div className="flex-1 cursor-pointer" onClick={handlePrev} />
        <div className="flex-1 cursor-pointer" onClick={handleNext} />
      </div>
    </div>
  );
}
