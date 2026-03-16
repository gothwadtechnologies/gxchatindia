import React from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import { Plus, Camera, Edit } from 'lucide-react';
import { auth } from '../server/firebase.ts';

export default function StatusTab() {
  return (
    <div className="h-full flex flex-col bg-zinc-50 overflow-hidden">
      <TopNav />
      
      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
        {/* My Status */}
        <div className="bg-white px-4 py-4 flex items-center gap-4 mb-4 border-b border-zinc-100">
          <div className="relative">
            <img 
              src={auth.currentUser?.photoURL || `https://picsum.photos/seed/${auth.currentUser?.uid}/100/100`} 
              className="w-14 h-14 rounded-full object-cover border-2 border-zinc-100"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-0.5 border-2 border-white">
              <Plus size={14} strokeWidth={3} />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-zinc-900">My Status</h3>
            <p className="text-sm text-zinc-500">Tap to add status update</p>
          </div>
        </div>

        {/* Recent Updates */}
        <div className="px-4 mb-4">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Recent updates</h4>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-zinc-500 text-center py-10 bg-white rounded-2xl border border-zinc-100">
              No status updates yet.
            </p>
          </div>
        </div>
      </div>

      {/* Floating Actions */}
      <div className="absolute bottom-24 right-6 flex flex-col gap-3 z-40">
        <button className="p-3 bg-white text-zinc-600 rounded-full shadow-lg border border-zinc-100">
          <Edit size={20} />
        </button>
        <button className="p-4 bg-blue-600 text-white rounded-full shadow-xl">
          <Camera size={24} />
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
