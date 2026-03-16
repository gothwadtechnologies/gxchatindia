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
import { auth } from '../server/firebase.ts';
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
        { icon: Key, label: 'Account', sub: 'Security notifications, change number', color: 'text-blue-500' },
        { icon: Shield, label: 'Privacy', sub: 'Block contacts, disappearing messages', color: 'text-emerald-500' },
        { icon: Smartphone, label: 'Two-step verification', sub: 'Extra security for your account', color: 'text-indigo-500' },
      ]
    },
    {
      title: 'PREFERENCES',
      items: [
        { icon: Bell, label: 'Notifications', sub: 'Message, group & call tones', color: 'text-orange-500' },
        { icon: Database, label: 'Storage and data', sub: 'Network usage, auto-download', color: 'text-zinc-500' },
        { icon: Globe, label: 'App language', sub: "English (device's language)", color: 'text-cyan-500' },
      ]
    },
    {
      title: 'SUPPORT',
      items: [
        { icon: HelpCircle, label: 'Help', sub: 'Help center, contact us, privacy policy', color: 'text-zinc-500' },
        { icon: Info, label: 'App info', sub: 'Version 1.0.0 (Beta)', color: 'text-zinc-400' },
      ]
    }
  ];

  return (
    <div className="h-full flex flex-col bg-zinc-50 overflow-hidden">
      {/* Header */}
      <div className="w-full bg-white border-b border-zinc-200 px-4 h-16 flex items-center gap-4 shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-zinc-900" />
        </button>
        <h1 className="text-xl font-bold text-zinc-900">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar py-4">
        {/* Settings Sections */}
        {menuSections.map((section) => (
          <div key={section.title} className="mb-6">
            <h3 className="px-6 mb-2 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              {section.title}
            </h3>
            <div className="bg-white border-y border-zinc-200">
              {section.items.map((item, index) => (
                <button 
                  key={item.label}
                  className={`w-full flex items-center gap-4 px-6 py-4 hover:bg-zinc-50 transition-colors ${
                    index !== section.items.length - 1 ? 'border-b border-zinc-100' : ''
                  }`}
                >
                  <div className={`p-2 rounded-lg bg-zinc-50 ${item.color}`}>
                    <item.icon size={20} />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-sm font-bold text-zinc-900">{item.label}</h4>
                    <p className="text-[11px] text-zinc-500">{item.sub}</p>
                  </div>
                  <ChevronRight size={18} className="text-zinc-300" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Logout Button */}
        <div className="mt-8 px-6">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-red-600 py-4 rounded-2xl font-bold transition-all border border-zinc-200 hover:border-red-100 shadow-sm"
          >
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
        </div>

        {/* Footer Info */}
        <div className="py-12 flex flex-col items-center gap-1 opacity-40">
          <span className="text-zinc-400 text-xs font-medium">from</span>
          <span className="text-zinc-800 font-bold tracking-widest uppercase text-[10px]">Gothwad technologies</span>
          <span className="text-zinc-400 text-[8px] uppercase tracking-tighter mt-1">made in india</span>
        </div>
      </div>
    </div>
  );
}
