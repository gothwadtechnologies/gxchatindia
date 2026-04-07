import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../services/firebase.ts';
import { Send, Palette, Triangle, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SettingHeader from '../../components/layout/SettingHeader.tsx';

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

export default function StatusMakerScreen() {
  const navigate = useNavigate();
  const [statusText, setStatusText] = useState('');
  const [selectedColor, setSelectedColor] = useState(STATUS_COLORS[0]);
  const [selectedFontSize, setSelectedFontSize] = useState(FONT_SIZES[1].value);
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'color' | 'font'>('color');

  useEffect(() => {
    if (auth.currentUser) {
      const unsubscribe = onSnapshot(doc(db, "users", auth.currentUser.uid), (docSnap) => {
        if (docSnap.exists()) {
          setCurrentUserData(docSnap.data());
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const handlePostStatus = async () => {
    if (!statusText.trim() || !auth.currentUser || isSubmitting) return;

    setIsSubmitting(true);
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
      navigate('/status');
    } catch (error) {
      console.error("Error posting status:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`flex flex-col h-full ${selectedColor} transition-colors duration-500`}>
      <SettingHeader 
        title="Status Maker" 
        rightElement={
          <button 
            onClick={handlePostStatus}
            disabled={!statusText.trim() || isSubmitting}
            className={`p-2 rounded-full transition-all ${statusText.trim() && !isSubmitting ? 'text-white scale-110' : 'text-white/40 cursor-not-allowed'}`}
          >
            <Send size={24} />
          </button>
        }
      />

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

      {/* Expandable Footer */}
      <motion.div 
        initial={false}
        animate={{ height: isExpanded ? 'auto' : '85px' }}
        className="bg-[#375a7f] rounded-t-[2.5rem] border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] overflow-hidden"
      >
        {/* Pull Handle */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="flex justify-center py-3 cursor-pointer group"
        >
          <Triangle 
            size={14} 
            className={`text-white transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
            fill="currentColor" 
          />
        </div>

        {/* Main Row */}
        <div className="flex items-center justify-center gap-16 pb-4">
          <button 
            onClick={() => {
              setActiveTab('color');
              setIsExpanded(true);
            }}
            className={`p-3 rounded-full transition-all ${activeTab === 'color' && isExpanded ? 'bg-white/20 scale-110' : 'text-white/60 hover:text-white'}`}
          >
            <Palette size={26} className="text-white" />
          </button>
          <button 
            onClick={() => {
              setActiveTab('font');
              setIsExpanded(true);
            }}
            className={`p-3 rounded-full transition-all ${activeTab === 'font' && isExpanded ? 'bg-white/20 scale-110' : 'text-white/60 hover:text-white'}`}
          >
            <Type size={26} className="text-white" />
          </button>
        </div>

        {/* Sub Row (Options) */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="px-6 pb-10 pt-4 border-t border-white/5 bg-black/5"
            >
              {activeTab === 'color' ? (
                <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
                  {STATUS_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-12 h-12 rounded-full shrink-0 ${color} border-2 transition-all ${selectedColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'}`}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex justify-around items-center py-2">
                  {FONT_SIZES.map((font) => (
                    <button
                      key={font.value}
                      onClick={() => setSelectedFontSize(font.value)}
                      className={`px-4 py-2 rounded-xl transition-all ${selectedFontSize === font.value ? 'bg-white text-[#375a7f] font-bold scale-110' : 'text-white/60 hover:text-white'}`}
                    >
                      {font.label}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
