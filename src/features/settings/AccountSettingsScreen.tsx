import React from 'react';
import { ArrowLeft, Shield, Smartphone, Key, UserX, FileText, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AccountSettingsScreen() {
  const navigate = useNavigate();

  const accountItems = [
    { icon: Shield, label: 'Security notifications', sub: 'Get notified of security changes', color: 'text-blue-500' },
    { icon: Key, label: 'Passkeys', sub: 'A simple way to sign in safely', color: 'text-emerald-500' },
    { icon: Smartphone, label: 'Change number', sub: 'Migrate your account info, groups & settings', color: 'text-indigo-500' },
    { icon: FileText, label: 'Request account info', sub: 'Create a report of your account info', color: 'text-zinc-500' },
    { icon: UserX, label: 'Delete account', sub: 'Permanently remove your account', color: 'text-red-500' },
  ];

  return (
    <div className="h-full flex flex-col bg-[var(--bg-main)] overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 h-16 bg-[#00B0FF] z-50 shadow-md">
        <button onClick={() => navigate(-1)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-white" />
        </button>
        <h1 className="text-lg font-black text-white tracking-tight uppercase">
          Account
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar py-6">
        <div className="bg-[var(--bg-card)] border-y border-[var(--border-color)]">
          {accountItems.map((item, index) => (
            <button 
              key={item.label}
              className={`w-full flex items-center gap-4 px-6 py-4 hover:bg-zinc-50/10 transition-colors ${
                index !== accountItems.length - 1 ? 'border-b border-[var(--border-color)]' : ''
              }`}
            >
              <div className={`p-2 rounded-lg bg-zinc-50/10 ${item.color}`}>
                <item.icon size={20} />
              </div>
              <div className="flex-1 text-left">
                <h4 className="text-sm font-bold text-[var(--text-primary)]">{item.label}</h4>
                <p className="text-[11px] text-[var(--text-secondary)]">{item.sub}</p>
              </div>
              <ChevronRight size={18} className="text-zinc-300" />
            </button>
          ))}
        </div>

        <div className="p-6">
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed text-center">
            Your account security is our priority. GxChat India uses end-to-end encryption to protect your messages and calls.
          </p>
        </div>
      </div>
    </div>
  );
}
