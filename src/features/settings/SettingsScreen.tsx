import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Bell, 
  Shield, 
  Palette, 
  Lock, 
  MessageCircle, 
  Settings as SettingsIcon, 
  User, 
  Info, 
  HelpCircle, 
  LogOut,
  QrCode,
  ChevronRight,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../services/firebase.ts';
import { doc, onSnapshot } from 'firebase/firestore';
import { motion } from 'motion/react';

export default function SettingsScreen() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;
    const unsubscribe = onSnapshot(doc(db, "users", auth.currentUser.uid), (docSnap) => {
      if (docSnap.exists()) setUserData(docSnap.data());
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const SettingItem = ({ icon: Icon, label, sub, color, onClick, toggle, toggleValue, onToggle }: any) => (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-zinc-50 transition-colors group"
    >
      <div className={`p-2.5 rounded-2xl bg-[#F0F7F4] ${color}`}>
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <div className="flex-1 text-left">
        <h4 className="text-[15px] font-bold text-zinc-800">{label}</h4>
        {sub && <p className="text-[11px] font-medium text-zinc-400 mt-0.5">{sub}</p>}
      </div>
      {toggle ? (
        <div 
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className={`w-12 h-6 rounded-full transition-all duration-300 relative ${toggleValue ? 'bg-[#006D44]' : 'bg-zinc-200'}`}
        >
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${toggleValue ? 'left-7' : 'left-1'}`} />
        </div>
      ) : (
        <ChevronRight size={18} className="text-zinc-300" />
      )}
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-[#F9F9FB] font-sans overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="px-4 h-14 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[#006D44]">
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
        <h1 className="text-lg font-black text-[#006D44] tracking-tight">Settings</h1>
        <div className="w-10" />
      </div>

      <div className="px-5 py-6 space-y-7 pb-12">
        {/* Profile Card */}
        <div className="bg-white rounded-[32px] p-6 flex items-center gap-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100/50">
          <div className="relative">
            <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-[#006D44] to-[#00A86B]">
              <div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
                <img 
                  src={userData?.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                  className="w-full h-full object-cover"
                  alt="Profile"
                />
              </div>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-[#00A86B] rounded-full border-2 border-white flex items-center justify-center">
              <Check size={10} className="text-white" strokeWidth={4} />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-[17px] font-black text-zinc-900 leading-tight">{userData?.fullName || 'User Name'}</h2>
            <p className="text-[13px] font-medium text-zinc-400">@{userData?.username || 'username'}</p>
            <div className="mt-2 inline-flex items-center px-3 py-1 bg-[#D1FAE5] rounded-full">
              <span className="text-[9px] font-black text-[#065F46] uppercase tracking-wider">Premium Member</span>
            </div>
          </div>
          <button className="p-2 text-zinc-900">
            <QrCode size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* Preferences Section */}
        <div className="space-y-3">
          <h3 className="px-2 text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">Preferences</h3>
          <div className="bg-white rounded-[28px] overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-zinc-100/50">
            <SettingItem 
              icon={Bell} 
              label="Notifications" 
              color="text-[#006D44]" 
              toggle 
              toggleValue={notificationsEnabled}
              onToggle={() => setNotificationsEnabled(!notificationsEnabled)}
            />
            <SettingItem 
              icon={Shield} 
              label="Privacy" 
              color="text-[#006D44]" 
              onClick={() => navigate('/privacy-settings')}
            />
            <SettingItem 
              icon={Palette} 
              label="Appearance" 
              sub={`Dark Mode ${darkMode ? 'On' : 'Off'}`}
              color="text-[#006D44]" 
              toggle 
              toggleValue={darkMode}
              onToggle={() => setDarkMode(!darkMode)}
            />
          </div>
        </div>

        {/* Security & Data Section */}
        <div className="space-y-3">
          <h3 className="px-2 text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">Security & Data</h3>
          <div className="bg-white rounded-[28px] overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-zinc-100/50">
            <SettingItem 
              icon={Lock} 
              label="App Lock" 
              color="text-[#006D44]" 
              onClick={() => navigate('/app-lock')}
            />
            <SettingItem 
              icon={MessageCircle} 
              label="Chats" 
              color="text-[#006D44]" 
              onClick={() => navigate('/app-preferences')}
            />
            <SettingItem 
              icon={SettingsIcon} 
              label="App Preferences" 
              color="text-[#006D44]" 
              onClick={() => navigate('/app-preferences')}
            />
          </div>
        </div>

        {/* General Section */}
        <div className="space-y-3">
          <h3 className="px-2 text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">General</h3>
          <div className="bg-white rounded-[28px] overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-zinc-100/50">
            <SettingItem 
              icon={User} 
              label="Account" 
              color="text-[#006D44]" 
              onClick={() => navigate('/account-settings')}
            />
            <SettingItem 
              icon={Info} 
              label="App Info" 
              color="text-[#006D44]" 
              onClick={() => navigate('/app-info')}
            />
            <SettingItem 
              icon={HelpCircle} 
              label="Help" 
              color="text-[#006D44]" 
              onClick={() => navigate('/help')}
            />
          </div>
        </div>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="w-full bg-[#FFF1F1] rounded-[28px] py-4.5 flex items-center justify-center gap-3 text-[#E11D48] font-black text-[15px] active:scale-[0.98] transition-all shadow-[0_4px_20px_rgb(225,29,72,0.05)]"
        >
          <LogOut size={20} strokeWidth={2.5} />
          <span className="uppercase tracking-widest text-[13px]">Log Out</span>
        </button>

        {/* Footer */}
        <div className="text-center pt-4 pb-8">
          <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em]">
            GXCHAT V4.2.0 (INDIA EDITION)
          </p>
        </div>
      </div>
    </div>
  );
}
