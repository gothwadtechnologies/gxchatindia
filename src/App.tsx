import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../server/firebase.ts';
import ChatsTab from '../tabs/ChatsTab.tsx';
import SearchTab from '../tabs/SearchTab.tsx';
import ProfileTab from '../tabs/ProfileTab.tsx';
import EditProfileScreen from '../screen/EditProfileScreen.tsx';
import StatusTab from '../tabs/StatusTab.tsx';
import CallsTab from '../tabs/CallsTab.tsx';
import SettingsScreen from '../screen/SettingsScreen.tsx';
import LoginScreen from '../user/LoginScreen.tsx';
import SignupScreen from '../user/SignupScreen.tsx';
import VerifyEmailScreen from '../user/VerifyEmailScreen.tsx';
import CompleteProfileScreen from '../user/CompleteProfileScreen.tsx';
import MessagesListScreen from '../screen/MessagesListScreen.tsx';
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../server/firebase.ts';
import { Phone, Video, PhoneOff, Check } from 'lucide-react';
import CallScreen from '../screen/CallScreen.tsx';
import ChatScreen from '../screen/ChatScreen.tsx';
import ReelsScreen from '../screen/ReelsScreen.tsx';
import AdminDashboard from '../admin/AdminDashboard.tsx';
import CreatePostScreen from '../screen/CreatePostScreen.tsx';
import NotificationsScreen from '../screen/NotificationsScreen.tsx';
import UserProfileScreen from '../screen/UserProfileScreen.tsx';
import FollowListScreen from '../screen/FollowListScreen.tsx';
import PrivacySettingsScreen from '../screen/PrivacySettingsScreen.tsx';
import AppPreferencesScreen from '../screen/AppPreferencesScreen.tsx';
import AccountSettingsScreen from '../screen/AccountSettingsScreen.tsx';
import AppLockScreen from '../screen/AppLockScreen.tsx';
import SetupLockScreen from '../screen/SetupLockScreen.tsx';
import VerifyLockScreen from '../screen/VerifyLockScreen.tsx';
import NotificationsSettingsScreen from '../screen/NotificationsSettingsScreen.tsx';
import HelpScreen from '../screen/HelpScreen.tsx';
import AppInfoScreen from '../screen/AppInfoScreen.tsx';
import GlobalLockScreen from '../screen/GlobalLockScreen.tsx';
import { LockService } from '../src/services/LockService.ts';
import { ThemeProvider } from './context/ThemeContext.tsx';
import NotificationHandler from './components/NotificationHandler.tsx';
import { useNavigate } from 'react-router-dom';

function CallListener() {
  const navigate = useNavigate();
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [caller, setCaller] = useState<any>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "calls"),
      where("receiverId", "==", auth.currentUser.uid),
      where("status", "==", "ringing")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (!snapshot.empty) {
        const callData = snapshot.docs[0].data();
        setIncomingCall({ id: snapshot.docs[0].id, ...callData });
        
        const userDoc = await getDoc(doc(db, "users", callData.callerId));
        if (userDoc.exists()) setCaller(userDoc.data());
      } else {
        setIncomingCall(null);
        setCaller(null);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!incomingCall || !caller) return null;

  const acceptCall = () => {
    navigate(`/call/${incomingCall.callerId}?type=${incomingCall.type}&role=receiver`);
    setIncomingCall(null);
  };

  const rejectCall = async () => {
    await updateDoc(doc(db, "calls", incomingCall.id), { status: 'ended' });
    setIncomingCall(null);
  };

  return (
    <div className="fixed inset-x-4 top-4 z-[200]">
      <div className="bg-zinc-900 border border-white/10 rounded-3xl p-4 shadow-2xl flex items-center gap-4">
        <img 
          src={caller.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
          className="w-12 h-12 rounded-full object-cover border border-white/10"
          referrerPolicy="no-referrer"
        />
        <div className="flex-1">
          <h4 className="text-white text-sm font-black uppercase tracking-tight">{caller.fullName || 'Incoming Call'}</h4>
          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
            {incomingCall.type === 'video' ? <Video size={10} /> : <Phone size={10} />}
            GxChat {incomingCall.type} Call...
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={rejectCall}
            className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <PhoneOff size={18} />
          </button>
          <button 
            onClick={acceptCall}
            className="p-3 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors animate-pulse"
          >
            <Check size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [splashLoading, setSplashLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(!LockService.getLockData().isEnabled);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserData(userDoc.data());
          // Set user as online
          await updateDoc(userDocRef, {
            isOnline: true,
            lastSeen: serverTimestamp()
          });
        } else {
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      setAuthLoading(false);
    });

    // Handle offline status on tab close/visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && auth.currentUser) {
        updateDoc(doc(db, "users", auth.currentUser.uid), {
          isOnline: false,
          lastSeen: serverTimestamp()
        });
      } else if (document.visibilityState === 'visible' && auth.currentUser) {
        updateDoc(doc(db, "users", auth.currentUser.uid), {
          isOnline: true,
          lastSeen: serverTimestamp()
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const timer = setTimeout(() => {
      setSplashLoading(false);
    }, 2000);

    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(timer);
    };
  }, []);

  const loading = authLoading || splashLoading;

  // Global Back Button Handler for Mobile
  useEffect(() => {
    // Ensure there is at least one history entry so back button doesn't exit immediately
    if (window.history.length === 1) {
      window.history.pushState({ entry: 1 }, '');
    }

    const handlePopState = (e: PopStateEvent) => {
      // If the user is at the root and tries to go back, we can handle it
      // but for now, we just let React Router do its thing.
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (loading) {
    return (
      <div className="h-[100dvh] flex justify-center bg-zinc-50 overflow-hidden">
        <div className="w-full max-w-[450px] h-full bg-white shadow-[0_0_40px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center">
          <div className="flex-1 flex flex-col items-center justify-center">
            <img 
              src="https://i.ibb.co/4RFKFmPR/file-00000000bf907207abbf3e9db6cfe8a1.png" 
              alt="GxChat India Logo" 
              className="w-24 h-24 mb-4 object-contain"
              referrerPolicy="no-referrer"
            />
            <h1 className="text-3xl font-bold italic font-serif text-zinc-800">GxChat India</h1>
            <div className="mt-8 flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-zinc-100 border-t-[#00B0FF] rounded-full animate-spin"></div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Loading...</span>
            </div>
          </div>
          <div className="pb-12 flex flex-col items-center gap-1">
            <span className="text-zinc-400 text-sm font-medium">from</span>
            <span className="text-zinc-800 font-bold tracking-widest uppercase text-xs">Gothwad technologies</span>
            <span className="text-zinc-400 text-[10px] uppercase tracking-tighter mt-1">made in india</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return <GlobalLockScreen onUnlock={() => setIsUnlocked(true)} />;
  }

  // Guard Logic
  const needsVerification = user && !user.emailVerified && !user.providerData.some((p: any) => p.providerId === 'google.com');
  const needsProfileCompletion = user && !userData && !authLoading;

  return (
    <ThemeProvider>
      <Router>
        <div className="h-[100dvh] bg-[var(--bg-main)] flex justify-center overflow-hidden">
        {/* Centered Mobile Layout for all screens */}
        <div className="w-full max-w-[450px] h-full bg-[var(--bg-card)] shadow-[0_0_40px_rgba(0,0,0,0.05)] relative overflow-hidden flex flex-col">
          <CallListener />
          {user && <NotificationHandler />}
          <div className="flex-1 h-full relative overflow-hidden">
            <Routes>
            <Route path="/" element={
              !user ? <Navigate to="/login" /> : 
              needsVerification ? <Navigate to="/verify-email" /> :
              needsProfileCompletion ? <Navigate to="/complete-profile" /> :
              <ChatsTab />
            } />
            
            <Route path="/verify-email" element={
              user && !user.emailVerified ? <VerifyEmailScreen /> : <Navigate to="/" />
            } />

            <Route path="/complete-profile" element={
              user && !userData ? <CompleteProfileScreen /> : <Navigate to="/" />
            } />
            <Route path="/status" element={user ? <StatusTab /> : <Navigate to="/login" />} />
            <Route path="/explore" element={user ? <SearchTab /> : <Navigate to="/login" />} />
            <Route path="/calls" element={user ? <CallsTab /> : <Navigate to="/login" />} />
            <Route path="/call/:id" element={user ? <CallScreen /> : <Navigate to="/login" />} />
            <Route path="/settings" element={user ? <SettingsScreen /> : <Navigate to="/login" />} />
            <Route path="/reels" element={user ? <ReelsScreen /> : <Navigate to="/login" />} />
            <Route path="/create" element={user ? <CreatePostScreen /> : <Navigate to="/login" />} />
            <Route path="/profile" element={user ? <ProfileTab /> : <Navigate to="/login" />} />
            <Route path="/notifications" element={user ? <NotificationsScreen /> : <Navigate to="/login" />} />
            <Route path="/edit-profile" element={user ? <EditProfileScreen /> : <Navigate to="/login" />} />
            <Route path="/privacy-settings" element={user ? <PrivacySettingsScreen /> : <Navigate to="/login" />} />
            <Route path="/app-preferences" element={user ? <AppPreferencesScreen /> : <Navigate to="/login" />} />
            <Route path="/account-settings" element={user ? <AccountSettingsScreen /> : <Navigate to="/login" />} />
            <Route path="/app-lock" element={user ? <AppLockScreen /> : <Navigate to="/login" />} />
            <Route path="/setup-lock/:type" element={user ? <SetupLockScreen /> : <Navigate to="/login" />} />
            <Route path="/verify-lock" element={user ? <VerifyLockScreen /> : <Navigate to="/login" />} />
            <Route path="/notifications-settings" element={user ? <NotificationsSettingsScreen /> : <Navigate to="/login" />} />
            <Route path="/help" element={user ? <HelpScreen /> : <Navigate to="/login" />} />
            <Route path="/app-info" element={user ? <AppInfoScreen /> : <Navigate to="/login" />} />
            <Route path="/login" element={!user ? <LoginScreen /> : <Navigate to="/" />} />
            <Route path="/signup" element={!user ? <SignupScreen /> : <Navigate to="/" />} />
            <Route path="/messages" element={user ? <MessagesListScreen /> : <Navigate to="/login" />} />
            <Route path="/chat/:id" element={user ? <ChatScreen /> : <Navigate to="/login" />} />
            <Route path="/user/:id" element={user ? <UserProfileScreen /> : <Navigate to="/login" />} />
            <Route path="/user/:id/:type" element={user ? <FollowListScreen /> : <Navigate to="/login" />} />
            <Route path="/admin" element={user ? <AdminDashboard /> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </div>
    </Router>
    </ThemeProvider>
  );
}
