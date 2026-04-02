import React from 'react';
import { 
  Settings, 
  LogOut, 
  Shield, 
  Bell, 
  HelpCircle, 
  ChevronRight, 
  Info,
  Key,
  Globe,
  Database,
  Smartphone,
  ArrowLeft
} from 'lucide-react';
import { auth } from '../../services/firebase.ts';
import { useNavigate } from 'react-router-dom';

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
          sub: "Language, Theme", 
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
    <div className="h-full flex flex-col bg-[var(--bg-main)] overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 h-16 bg-[var(--header-bg)] z-50 border-b border-[var(--border-color)] shadow-sm">
        <button onClick={() => navigate(-1)} className="hover:bg-[var(--bg-chat)] p-2 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-[var(--text-primary)]" />
        </button>
        <h1 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
          Settings
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar py-4">
        {/* Settings Sections */}
        {menuSections.map((section) => (
          <div key={section.title} className="mb-6">
            <h3 className="px-6 mb-2 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              {section.title}
            </h3>
            <div className="bg-[var(--bg-card)] border-y border-[var(--border-color)]">
              {section.items.map((item, index) => (
                <button 
                  key={item.label}
                  onClick={item.onClick}
                  className={`w-full flex items-center gap-4 px-6 py-4 hover:bg-[var(--bg-chat)] transition-colors ${
                    index !== section.items.length - 1 ? 'border-b border-[var(--border-color)]' : ''
                  }`}
                >
                  <div className={`p-2 rounded-lg bg-[var(--bg-chat)] ${item.color}`}>
                    <item.icon size={20} />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">{item.label}</h4>
                    <p className="text-[11px] text-[var(--text-secondary)]">{item.sub}</p>
                  </div>
                  <ChevronRight size={18} className="text-[var(--text-secondary)] opacity-30" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Logout Button */}
        <div className="mt-8 px-6">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-[var(--bg-card)] hover:bg-red-500/10 text-red-500 py-4 rounded-2xl font-bold transition-all border border-[var(--border-color)] hover:border-red-500/30 shadow-sm"
          >
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
        </div>

        {/* Footer Info */}
        <div className="py-12 flex flex-col items-center gap-1 opacity-40">
          <span className="text-[var(--text-secondary)] text-xs font-medium">from</span>
          <span className="text-[var(--text-primary)] font-bold tracking-widest uppercase text-[10px]">Gothwad technologies</span>
          <span className="text-[var(--text-secondary)] text-[8px] uppercase tracking-tighter mt-1">made in india</span>
        </div>
      </div>
    </div>
  );
}
