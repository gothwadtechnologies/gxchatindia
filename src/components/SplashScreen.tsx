import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { APP_CONFIG } from '../config/appConfig';

interface SplashScreenProps {
  developerName: string;
  onGetStarted: () => void;
}

export default function SplashScreen({ developerName, onGetStarted }: SplashScreenProps) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTheme(theme === 'dark' ? 'original' : 'dark');
  };

  return (
    <div className="fixed inset-0 bg-[var(--bg-main)] flex flex-col items-center justify-between px-8 py-10 z-[9999] font-sans overflow-hidden transition-colors duration-300">
      {/* Top Branding */}
      <div className="w-full max-w-sm flex items-center justify-between">
        <span className="text-[var(--brand-color)] text-3xl font-black tracking-tighter italic truncate">GxChat India</span>
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-[var(--brand-color)]/10 text-[var(--brand-color)] hover:bg-[var(--brand-color)]/20 transition-all active:scale-90"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center w-full max-w-sm">
        <h1 className="text-[var(--brand-color)] text-[42px] leading-[1.1] font-bold tracking-tight mb-8">
          Connect, Chat, and Share your world with GxChat India.
        </h1>
      </div>

      {/* Bottom Area */}
      <div className="w-full max-w-sm flex flex-col items-center gap-12">
        <button
          onClick={onGetStarted}
          className="w-full bg-[#375a7f] text-white py-4 rounded-full font-bold text-sm shadow-lg shadow-[#375a7f]/20 active:scale-[0.98] transition-all"
        >
          Get Started
        </button>

        <div className="text-[var(--brand-color)] opacity-60 text-[10px] font-black uppercase tracking-[0.4em] pb-2">
          {developerName}
        </div>
      </div>

      {/* Subtle Background Elements */}
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#375a7f] rounded-full blur-3xl pointer-events-none opacity-[0.05]" />
    </div>
  );
}
