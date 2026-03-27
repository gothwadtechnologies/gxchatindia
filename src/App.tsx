import React, { useEffect, useState } from 'react';
import { APP_CONFIG } from './config/appConfig';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LockService } from './services/LockService.ts';
import { CacheService } from './services/CacheService.ts';
import NotificationHandler from './components/NotificationHandler.tsx';
import { motion } from 'motion/react';
import { useAuth } from './providers/AuthProvider';
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center bg-zinc-50 p-6 text-center">
      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
          <img src={APP_CONFIG.LOGO_URL} className="w-10 h-10 object-contain grayscale opacity-50" alt="Error" />
        </motion.div>
      </div>
      <h2 className="text-xl font-bold text-zinc-900 mb-2">Something went wrong</h2>
      <p className="text-sm text-zinc-500 mb-6 max-w-xs">{error.message}</p>
      <button 
        onClick={() => window.location.href = '/'}
        className="bg-emerald-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-100 active:scale-95 transition-all"
      >
        Restart App
      </button>
    </div>
  );
}

// Lazy Loading Features & Screens
const ChatsTab = React.lazy(() => import('./features/chat').then(m => ({ default: m.ChatsTab })));
const ChatScreen = React.lazy(() => import('./features/chat').then(m => ({ default: m.ChatScreen })));
const MessagesListScreen = React.lazy(() => import('./features/chat').then(m => ({ default: m.MessagesListScreen })));

const HomeTab = React.lazy(() => import('./features/home').then(m => ({ default: m.HomeTab })));
const CreatePostScreen = React.lazy(() => import('./features/home').then(m => ({ default: m.CreatePostScreen })));
const NotificationsScreen = React.lazy(() => import('./features/home').then(m => ({ default: m.NotificationsScreen })));

const ProfileTab = React.lazy(() => import('./features/profile').then(m => ({ default: m.ProfileTab })));
const EditProfileScreen = React.lazy(() => import('./features/profile').then(m => ({ default: m.EditProfileScreen })));
const UserProfileScreen = React.lazy(() => import('./features/profile').then(m => ({ default: m.UserProfileScreen })));
const FollowListScreen = React.lazy(() => import('./features/profile').then(m => ({ default: m.FollowListScreen })));

const ReelsTab = React.lazy(() => import('./features/reels').then(m => ({ default: m.ReelsTab })));
const ReelsScreen = React.lazy(() => import('./features/reels').then(m => ({ default: m.ReelsScreen })));

const HubTab = React.lazy(() => import('./features/hub').then(m => ({ default: m.HubTab })));
const CameraTab = React.lazy(() => import('./features/camera').then(m => ({ default: m.CameraTab })));

const SettingsScreen = React.lazy(() => import('./features/settings').then(m => ({ default: m.SettingsScreen })));
const PrivacySettingsScreen = React.lazy(() => import('./features/settings').then(m => ({ default: m.PrivacySettingsScreen })));
const AppPreferencesScreen = React.lazy(() => import('./features/settings').then(m => ({ default: m.AppPreferencesScreen })));
const AccountSettingsScreen = React.lazy(() => import('./features/settings').then(m => ({ default: m.AccountSettingsScreen })));
const NotificationsSettingsScreen = React.lazy(() => import('./features/settings').then(m => ({ default: m.NotificationsSettingsScreen })));
const HelpScreen = React.lazy(() => import('./features/settings').then(m => ({ default: m.HelpScreen })));
const AppInfoScreen = React.lazy(() => import('./features/settings').then(m => ({ default: m.AppInfoScreen })));

const LoginScreen = React.lazy(() => import('./features/auth').then(m => ({ default: m.LoginScreen })));
const SignupScreen = React.lazy(() => import('./features/auth').then(m => ({ default: m.SignupScreen })));
const VerifyEmailScreen = React.lazy(() => import('./features/auth').then(m => ({ default: m.VerifyEmailScreen })));
const CompleteProfileScreen = React.lazy(() => import('./features/auth').then(m => ({ default: m.CompleteProfileScreen })));

const AppLockScreen = React.lazy(() => import('./features/lock').then(m => ({ default: m.AppLockScreen })));
const SetupLockScreen = React.lazy(() => import('./features/lock').then(m => ({ default: m.SetupLockScreen })));
const VerifyLockScreen = React.lazy(() => import('./features/lock').then(m => ({ default: m.VerifyLockScreen })));
const GlobalLockScreen = React.lazy(() => import('./features/lock').then(m => ({ default: m.GlobalLockScreen })));

const CallScreen = React.lazy(() => import('./features/call').then(m => ({ default: m.CallScreen })));
const AdminDashboard = React.lazy(() => import('./features/admin').then(m => ({ default: m.AdminDashboard })));

import MainLayout from './components/layout/MainLayout.tsx';

// ... (rest of imports)

import { LayoutProvider } from './contexts/LayoutContext.tsx';
import { NavProvider } from './contexts/NavContext.tsx';

export default function App() {
  const { user, userData, loading: authLoading, isAuthReady } = useAuth();
  const [splashLoading, setSplashLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(!LockService.getLockData().isEnabled);

  useEffect(() => {
    CacheService.clearOldCache();
    const timer = setTimeout(() => {
      setSplashLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Global Back Button Handler for Mobile
  useEffect(() => {
    if (window.history.length === 1) {
      window.history.pushState({ entry: 1 }, '');
    }
    const handlePopState = () => {};
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const loading = !isAuthReady || authLoading || splashLoading;

  if (loading) {
    return (
      <div className="h-[100dvh] flex justify-center bg-[#f8faff] overflow-hidden">
        <div className="w-full max-w-[450px] h-full bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] flex flex-col items-center justify-center relative overflow-hidden">
          {/* Subtle glow effects */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/10 blur-[100px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/10 blur-[100px] rounded-full"></div>

          <div className="flex-1 flex flex-col items-center justify-center z-10">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col items-center gap-4"
            >
              <img 
                src={APP_CONFIG.LOGO_URL} 
                alt={`${APP_CONFIG.NAME} Logo`} 
                className="w-24 h-24 object-contain brightness-0 invert"
                referrerPolicy="no-referrer"
              />
              <h1 className="text-3xl font-black text-white tracking-tighter italic">GxChat India</h1>
            </motion.div>
          </div>
          
          <div className="pb-12 flex flex-col items-center gap-0.5 animate-pulse z-10">
            <span className="text-white/60 text-[10px] font-medium uppercase tracking-widest">from</span>
            <div className="flex items-center gap-1">
              <span className="text-white font-bold tracking-[0.2em] uppercase text-[11px]">{APP_CONFIG.DEVELOPER}</span>
            </div>
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
  const needsProfileCompletion = user && !userData && isAuthReady;

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <NavProvider>
        <LayoutProvider>
          <div className="h-[100dvh] bg-[var(--bg-main)] flex justify-center overflow-hidden">
            <div className="w-full max-w-[450px] h-full bg-[var(--bg-card)] shadow-[0_0_40px_rgba(0,0,0,0.05)] relative overflow-hidden flex flex-col">
              {user && <NotificationHandler />}
              <div className="flex-1 h-full relative overflow-hidden">
                <React.Suspense fallback={
                  <div className="h-full flex items-center justify-center bg-zinc-50">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                }>
                  <Routes>
                    {/* Main Layout Routes */}
                    <Route element={<MainLayout />}>
                      <Route path="/" element={
                        !user ? <Navigate to="/login" /> : 
                        needsVerification ? <Navigate to="/verify-email" /> :
                        needsProfileCompletion ? <Navigate to="/complete-profile" /> :
                        <HomeTab />
                      } />
                      <Route path="/reels" element={user ? <ReelsTab /> : <Navigate to="/login" />} />
                      <Route path="/chats" element={user ? <ChatsTab /> : <Navigate to="/login" />} />
                      <Route path="/hub" element={user ? <HubTab /> : <Navigate to="/login" />} />
                      <Route path="/profile" element={user ? <ProfileTab /> : <Navigate to="/login" />} />
                    </Route>
    
                    {/* Other Routes */}
                    <Route path="/verify-email" element={
                      user && !user.emailVerified ? <VerifyEmailScreen /> : <Navigate to="/" />
                    } />
                    <Route path="/complete-profile" element={
                      user && !userData ? <CompleteProfileScreen /> : <Navigate to="/" />
                    } />
                    <Route path="/camera" element={user ? <CameraTab /> : <Navigate to="/login" />} />
                    <Route path="/call/:id" element={user ? <CallScreen /> : <Navigate to="/login" />} />
                    <Route path="/settings" element={user ? <SettingsScreen /> : <Navigate to="/login" />} />
                    <Route path="/create" element={user ? <CreatePostScreen /> : <Navigate to="/login" />} />
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
                </React.Suspense>
              </div>
            </div>
          </div>
        </LayoutProvider>
      </NavProvider>
    </ErrorBoundary>
  );
}
