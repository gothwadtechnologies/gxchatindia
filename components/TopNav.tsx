import React from 'react';
import { Camera, Bell, MoreVertical, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TopNav() {
  return (
    <div className="w-full bg-sky-500 px-4 h-16 flex justify-between items-center z-50 shrink-0 shadow-md">
      <div className="flex items-center gap-3">
        <div className="p-2 hover:bg-sky-600 rounded-full transition-colors cursor-pointer">
          <Camera size={24} className="text-white" />
        </div>
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="https://i.ibb.co/4RFKFmPR/file-00000000bf907207abbf3e9db6cfe8a1.png" 
            alt="GxChat India Logo" 
            className="w-9 h-9 object-cover rounded-full border border-white/20"
            referrerPolicy="no-referrer"
          />
          <h1 className="text-xl font-bold tracking-tight italic font-serif text-white">GxChat India</h1>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <Link to="/notifications" className="p-2 hover:bg-sky-600 rounded-full transition-colors cursor-pointer">
          <Bell size={22} className="text-white" />
        </Link>
        <Link to="/settings" className="p-2 hover:bg-sky-600 rounded-full transition-colors cursor-pointer">
          <Settings size={22} className="text-white" />
        </Link>
        <div className="p-2 hover:bg-sky-600 rounded-full transition-colors cursor-pointer">
          <MoreVertical size={22} className="text-white" />
        </div>
      </div>
    </div>
  );
}
