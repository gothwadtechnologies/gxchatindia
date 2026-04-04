import React, { useEffect, useState } from 'react';
import { APP_CONFIG } from './config/appConfig';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LockService } from './services/LockService.ts';
import { CacheService } from './services/CacheService.ts';
import NotificationHandler from './components/NotificationHandler.tsx';
import DesktopSidebar from './components/layout/DesktopSidebar';
import { motion } from 'motion/react';
import { useAuth } from './providers/AuthProvider';
import { ErrorBoundary } from 'react-error-boundary';
import SplashScreen from './components/SplashScreen';

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
const ChatLayout = React.lazy(() => import('./features/chat').then(m => ({ default: m.ChatLayout })));
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

const CallsTab = React.lazy(() => import('./features/call').then(m => ({ default: m.CallsTab })));
const ChannelsTab = React.lazy(() => import('./features/channels').then(m => ({ default: m.ChannelsTab })));
const CameraTab = React.lazy(() => import('./features/camera').then(m => ({ default: m.CameraTab })));

const PrivacySettingsScreen = React.lazy(() => import('./features/settings').then(m => ({ default: m.PrivacySettingsScreen })));
const AppPreferencesScreen = React.lazy(() => import('./features/settings').then(m => ({ default: m.AppPreferencesScreen })));
const AccountSettingsScreen = React.lazy(() => import('./features/settings').then(m => ({ default: m.AccountSettingsScreen })));
const NotificationsSettingsScreen = React.lazy(() => import('./features/settings').then(m => ({ default: m.NotificationsSettingsScreen })));
const HelpScreen = React.lazy(() => import('./features/settings').then(m => ({ default: m.HelpScreen })));
const AppInfoScreen = React.lazy(() => import('./features/settings').then(m => ({ default: m.AppInfoScreen })));

const LoginScreen = React.lazy(() => import('./features/auth').then(m => ({ default: m.LoginScreen })));
const SignupScreen = React.lazy(() => import('./features/auth').then(m => ({ default: m.SignupScreen })));
const ForgotPasswordScreen = React.lazy(() => import('./features/auth/ForgotPasswordScreen'));
const VerifyEmailScreen = React.lazy(() => import('./features/auth').then(m => ({ default: m.VerifyEmailScreen })));
const CompleteProfileScreen = React.lazy(() => import('./features/auth').then(m => ({ default: m.CompleteProfileScreen })));

const PrivacyPolicyScreen = React.lazy(() => import('./features/legal/PrivacyPolicyScreen'));
const TermsAndConditionsScreen = React.lazy(() => import('./features/legal/TermsAndConditionsScreen'));

const AppLockScreen = React.lazy(() => import('./features/lock').then(m => ({ default: m.AppLockScreen })));
const SetupLockScreen = React.lazy(() => import('./features/lock').then(m => ({ default: m.SetupLockScreen })));
const VerifyLockScreen = React.lazy(() => import('./features/lock').then(m => ({ default: m.VerifyLockScreen })));
const GlobalLockScreen = React.lazy(() => import('./features/lock').then(m => ({ default: m.GlobalLockScreen })));

const CallScreen = React.lazy(() => import('./features/call').then(m => ({ default: m.CallScreen })));

import { storage } from './services/StorageService.ts';
import MainLayout from './components/layout/MainLayout.tsx';
import { LayoutProvider } from './contexts/LayoutContext.tsx';
import { NavProvider } from './contexts/NavContext.tsx';

export default function App() {
  const { user, userData, loading: authLoading, isAuthReady } = useAuth();
  const [splashLoading, setSplashLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(!LockService.getLockData().isEnabled);

  useEffect(() => {
    const loadCount = parseInt(storage.getItem('loadCount') || '0');
    storage.setItem('loadCount', (loadCount + 1).toString());
    console.log(`App Load Count: ${loadCount + 1}`);
    console.log(`Current Auth State: ${user ? 'Logged In' : 'Logged Out'}`);
    console.log(`Auth Ready: ${isAuthReady}`);
    
    CacheService.clearOldCache();
    
    // Splash screen now waits for user interaction
  }, [user]);

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
      <SplashScreen 
        developerName={APP_CONFIG.DEVELOPER} 
        onGetStarted={() => setSplashLoading(false)} 
      />
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
          <div className="app-container">
            <div className="flex-1 flex flex-col h-full relative overflow-hidden">
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
                        <ChatsTab />
                      } />
                      <Route path="/stories" element={user ? <HomeTab /> : <Navigate to="/login" />} />
                      <Route path="/hub" element={user ? <ChannelsTab /> : <Navigate to="/login" />} />
                      <Route element={<ChatLayout />}>
                        <Route path="/chats" element={<Navigate to="/" replace />} />
                        <Route path="/chat/:id" element={user ? <ChatScreen /> : <Navigate to="/login" />} />
                      </Route>
                      <Route path="/calls" element={user ? <CallsTab /> : <Navigate to="/login" />} />
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
                    <Route path="/forgot-password" element={!user ? <ForgotPasswordScreen /> : <Navigate to="/" />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicyScreen />} />
                    <Route path="/terms" element={<TermsAndConditionsScreen />} />
                    <Route path="/messages" element={user ? <MessagesListScreen /> : <Navigate to="/login" />} />
                    <Route path="/user/:id" element={user ? <UserProfileScreen /> : <Navigate to="/login" />} />
                    <Route path="/user/:id/:type" element={user ? <FollowListScreen /> : <Navigate to="/login" />} />
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
