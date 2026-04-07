import React from 'react';
import { 
  LogOut, 
  Shield, 
  Bell, 
  HelpCircle, 
  ChevronRight, 
  Info,
  Key,
  Globe,
  Database,
  Smartphone
} from 'lucide-react';
import { auth } from '../../services/firebase.ts';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

import SettingHeader from '../../components/layout/SettingHeader.tsx';

export default function SettingsScreen() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const menuSections = [
    {
      title: 'ACCOUNT SETTINGS',
      items: [
        { 
          icon: Key, 
          label: 'Account', 
          sub: 'Security notifications, change number', 
          color: 'text-primary',
          onClick: () => navigate('/account-settings')
        },
        {
          icon: Shield,
          label: 'Privacy',
          sub: 'Block contacts, disappearing messages',
          color: 'text-emerald-500',
          onClick: () => navigate('/privacy-settings')
        },
        { 
          icon: Smartphone, 
          label: 'App lock', 
          sub: 'Extra security for your app', 
          color: 'text-indigo-500',
          onClick: () => navigate('/app-lock')
        },
      ]
    },
    {
      title: 'PREFERENCES',
      items: [
        { 
          icon: Bell, 
          label: 'Notifications', 
          sub: 'Message, group & call tones', 
          color: 'text-orange-500',
          onClick: () => navigate('/notifications-settings')
        },
        { icon: Database, label: 'Storage and data', sub: 'Network usage, auto-download', color: 'text-zinc-500' },
        { 
          icon: Globe, 
          label: 'App Preferences', 
          sub: "Theme", 
          color: 'text-cyan-500',
          onClick: () => navigate('/app-preferences')
        },
      ]
    },
    {
      title: 'SUPPORT',
      items: [
        { 
          icon: HelpCircle, 
          label: 'Help', 
          sub: 'Help center, contact us, privacy policy', 
          color: 'text-zinc-500',
          onClick: () => navigate('/help')
        },
        { 
          icon: Info, 
          label: 'App info', 
          sub: 'Version 1.0.0 (Beta)', 
          color: 'text-zinc-400',
          onClick: () => navigate('/app-info')
        },
      ]
    }
  ];

  return (
    <div className="flex flex-col bg-[var(--bg-card)] font-sans h-full overflow-y-auto no-scrollbar">
      <SettingHeader title="Settings" />

      <div className="flex-1 pb-24">
        {/* Settings List */}
        <div className="mt-2">
          {menuSections.map((section) => (
            <div key={section.title} className="mb-4">
              <h3 className="px-6 mb-2 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">
                {section.title}
              </h3>
              <div className="bg-[var(--bg-card)]">
                {section.items.map((item, index) => (
                  <button 
                    key={item.label}
                    onClick={item.onClick}
                    className={`w-full flex items-center gap-4 px-6 py-3.5 hover:bg-[var(--bg-main)] transition-colors group ${
                      index !== section.items.length - 1 ? 'border-b border-[var(--border-color)]/50' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-xl bg-[var(--bg-main)] ${item.color} group-active:scale-90 transition-transform`}>
                      <item.icon size={18} />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="text-[14px] font-bold text-[var(--text-primary)]">{item.label}</h4>
                      <p className="text-[11px] text-[var(--text-secondary)]">{item.sub}</p>
                    </div>
                    <ChevronRight size={16} className="text-[var(--text-secondary)] opacity-40" />
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Logout Button */}
          <div className="mt-6 px-6">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 bg-red-500/5 hover:bg-red-500/10 text-red-500 py-4 rounded-2xl font-black text-sm transition-all border border-red-500/10 active:scale-[0.98]"
            >
              <LogOut size={18} />
              <span className="uppercase tracking-widest">Log Out</span>
            </button>
          </div>
        </div>

        {/* Branding Footer */}
        <div className="py-12 flex flex-col items-center gap-1 opacity-40">
          <span className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest">from</span>
          <span className="text-[var(--text-primary)] text-[11px] font-black tracking-[0.4em] uppercase">Gothwad technologies</span>
          <span className="text-[var(--text-secondary)] text-[8px] uppercase tracking-tighter mt-1">made in india</span>
        </div>
      </div>
    </div>
  );
}
