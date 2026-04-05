import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SettingHeaderProps {
  title: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
  onBack?: () => void;
}

export default function SettingHeader({ title, showBack = true, rightElement, onBack }: SettingHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-[var(--header-bg)] px-4 h-14 flex justify-between items-center z-50 shrink-0 relative border-b border-white/10 shadow-lg rounded-b-2xl">
      <div className="flex items-center gap-3">
        {showBack && (
          <button 
            onClick={onBack || (() => navigate(-1))}
            className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <ChevronLeft size={24} className="text-white" />
          </button>
        )}
        <h1 className="text-lg font-black text-white tracking-tight uppercase">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-1">
        {rightElement}
      </div>
    </div>
  );
}
