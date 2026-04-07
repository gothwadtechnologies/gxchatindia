import React, { useEffect, useState, useRef } from 'react';
import { collection, addDoc, query, orderBy, limit, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../services/firebase.ts';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Camera, 
  Type,
  CircleDashed,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { toDate } from '../../utils/dateUtils.ts';
import { ImageService } from '../../services/ImageService.ts';

export default function StatusTab() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "statuses"),
      orderBy("timestamp", "desc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const statusList = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      
      // Group by user
      const grouped: { [key: string]: any } = {};
      statusList.forEach((s: any) => {
        // Filter: Show only current user or people they follow
        const isMe = s.userId === auth.currentUser?.uid;
        const isFollowing = currentUserData?.following?.includes(s.userId);

        if (isMe || isFollowing) {
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
        }
      });

      // Process grouped statuses to determine if all updates are seen
      const processedStatuses = Object.values(grouped).map((userStatus: any) => {
        const allSeen = userStatus.updates.every((u: any) => 
          u.viewers && u.viewers.includes(auth.currentUser?.uid)
        );
        return {
          ...userStatus,
          allSeen
        };
      });

      setStatuses(processedStatuses);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUserData?.following]);

  const myStatuses = statuses.find(s => s.userId === auth.currentUser?.uid);
  const recentUpdates = statuses.filter(s => !s.allSeen);
  const viewedUpdates = statuses.filter(s => s.allSeen);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const url = await ImageService.uploadImage(file, (progress) => {
        setUploadProgress(progress);
      });

      await addDoc(collection(db, "statuses"), {
        userId: auth.currentUser.uid,
        fullName: currentUserData?.fullName || '',
        username: currentUserData?.username || '',
        photoURL: currentUserData?.photoURL || '',
        imageUrl: url,
        type: 'image',
        timestamp: serverTimestamp(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        viewers: []
      });

      setIsUploading(false);
      setUploadProgress(0);
    } catch (error) {
      console.error("Error uploading status image:", error);
      setIsUploading(false);
      alert("Failed to upload status image.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)] font-sans relative overflow-hidden">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange}
      />
      
      {isUploading && (
        <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
          <div className="relative w-24 h-24 flex items-center justify-center mb-4">
            <Loader2 size={48} className="animate-spin text-emerald-500" />
            <span className="absolute text-xs font-black">{uploadProgress}%</span>
          </div>
          <p className="text-sm font-black uppercase tracking-[0.2em] animate-pulse">Uploading Status...</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 pt-2">
        {/* My Status */}
        <section className="px-4 mb-6">
          <div 
            onClick={() => myStatuses ? navigate(`/status/view/${auth.currentUser?.uid}`) : fileInputRef.current?.click()}
            className="flex items-center gap-4 py-2.5 px-4 bg-[var(--box-bg)] rounded-2xl shadow-lg cursor-pointer active:scale-[0.98] transition-all"
          >
            <div className="relative">
              <div className={`w-14 h-14 rounded-full p-[2px] ${myStatuses ? 'border-2 border-[var(--box-text)]' : ''} flex items-center justify-center`}>
                <img 
                  src={currentUserData?.photoURL || DEFAULT_LOGO} 
                  className="w-full h-full rounded-full object-cover border-2 border-[var(--box-bg)]" 
                  referrerPolicy="no-referrer" 
                />
              </div>
              {!myStatuses && (
                <div className="absolute bottom-0.5 right-0.5 bg-[var(--box-text)] text-[var(--box-bg)] p-1 rounded-full border-2 border-[var(--box-bg)]">
                  <Plus size={12} strokeWidth={4} />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-[15px] font-black text-[var(--box-text)]">My status</h4>
              <p className="text-[11px] font-bold text-[var(--box-text)]/70">
                {myStatuses ? 'Tap to view your updates' : 'Tap to add status update'}
              </p>
            </div>
            {myStatuses && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="p-2 text-[var(--box-text)] hover:bg-[var(--box-text)]/10 rounded-full transition-colors"
              >
                <Plus size={20} strokeWidth={3} />
              </button>
            )}
          </div>
        </section>

        {/* Recent Updates */}
        {recentUpdates.length > 0 && (
          <section className="px-4 mb-6">
            <h3 className="px-2 text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4">Recent updates</h3>
            <div className="flex flex-col bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-[var(--border-color)]/50">
              {recentUpdates.map((userStatus, index) => (
                <div 
                  key={userStatus.userId} 
                  onClick={() => navigate(`/status/view/${userStatus.userId}`)}
                  className={`flex items-center gap-4 p-4 hover:bg-[var(--bg-main)] transition-all cursor-pointer group ${index !== recentUpdates.length - 1 ? 'border-b border-[var(--border-color)]/30' : ''}`}
                >
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full p-[2px] border-2 ${userStatus.userId === auth.currentUser?.uid ? 'border-white' : 'border-emerald-500'} flex items-center justify-center`}>
                      <img 
                        src={userStatus.photoURL || DEFAULT_LOGO} 
                        className="w-full h-full rounded-full object-cover border-2 border-[var(--bg-card)]" 
                        referrerPolicy="no-referrer" 
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[14px] font-black text-[var(--text-primary)]">
                      {userStatus.userId === auth.currentUser?.uid ? 'My Status' : (userStatus.fullName || userStatus.username)}
                    </h4>
                    <p className="text-[11px] font-bold text-[var(--text-secondary)] opacity-70">
                      {userStatus.updates[0]?.timestamp ? toDate(userStatus.updates[0].timestamp)?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Viewed Updates */}
        {viewedUpdates.length > 0 && (
          <section className="px-4 mb-6">
            <h3 className="px-2 text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4">Viewed updates</h3>
            <div className="flex flex-col bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-[var(--border-color)]/50">
              {viewedUpdates.map((userStatus, index) => (
                <div 
                  key={userStatus.userId} 
                  onClick={() => navigate(`/status/view/${userStatus.userId}`)}
                  className={`flex items-center gap-4 p-4 hover:bg-[var(--bg-main)] transition-all cursor-pointer group opacity-60 ${index !== viewedUpdates.length - 1 ? 'border-b border-[var(--border-color)]/30' : ''}`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full p-[2px] border-2 border-zinc-300 flex items-center justify-center">
                      <img 
                        src={userStatus.photoURL || DEFAULT_LOGO} 
                        className="w-full h-full rounded-full object-cover border-2 border-[var(--bg-card)]" 
                        referrerPolicy="no-referrer" 
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[14px] font-black text-[var(--text-primary)]">
                      {userStatus.userId === auth.currentUser?.uid ? 'My Status' : (userStatus.fullName || userStatus.username)}
                    </h4>
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
          onClick={() => navigate('/status/create')}
          className="p-3.5 bg-[var(--header-bg)] text-[var(--header-text)] rounded-full shadow-xl border border-[var(--border-color)] flex items-center justify-center"
        >
          <Type size={22} strokeWidth={3} />
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          className="p-3.5 bg-[var(--header-bg)] text-[var(--header-text)] rounded-full shadow-xl border border-[var(--border-color)] flex items-center justify-center"
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera size={22} strokeWidth={3} />
        </motion.button>
      </div>
    </div>
  );
}
