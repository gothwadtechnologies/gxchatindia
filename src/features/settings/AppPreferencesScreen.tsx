import React from 'react';
import { ArrowLeft, Globe, Palette, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

export default function AppPreferencesScreen() {
  const navigate = useNavigate();
  const { theme, setTheme, language, setLanguage } = useTheme();

  const themes = [
    { id: 'original', label: 'Original Theme', sub: 'The classic GxChat style' },
    { id: 'dark', label: 'Dark Theme', sub: 'Easy on the eyes at night' }
  ];

  const languages = [
    { id: 'en', label: 'English', sub: "Device's language" }
  ];

  return (
    <div className="h-full flex flex-col bg-[var(--bg-main)] overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 h-16 bg-[var(--bg-card)] z-50 border-b border-[var(--border-color)]">
        <button onClick={() => navigate(-1)} className="hover:bg-[var(--bg-main)] p-2 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-[var(--text-primary)]" />
        </button>
        <h1 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
          Preferences
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar py-6">
        {/* Language Section */}
        <h3 className="px-6 mb-2 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">APP LANGUAGE</h3>
        <div className="bg-[var(--bg-card)] border-y border-[var(--border-color)] mb-8">
          {languages.map((lang, index) => (
            <button 
              key={lang.id}
              onClick={() => setLanguage(lang.id as any)}
              className={`w-full flex items-center justify-between px-6 py-4 hover:bg-zinc-50/10 transition-colors ${
                index !== languages.length - 1 ? 'border-b border-[var(--border-color)]' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg bg-zinc-50/10 ${language === lang.id ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`}>
                  <Globe size={20} />
                </div>
                <div className="text-left">
                  <h4 className={`text-sm font-bold ${language === lang.id ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]'}`}>
                    {lang.label}
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)]">{lang.sub}</p>
                </div>
              </div>
              {language === lang.id && (
                <div className="bg-[var(--primary)] p-1 rounded-full shadow-lg">
                  <Check size={14} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Theme Section */}
        <h3 className="px-6 mb-2 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">APP THEME</h3>
        <div className="bg-[var(--bg-card)] border-y border-[var(--border-color)] mb-8">
          {themes.map((t, index) => (
            <button 
              key={t.id}
              onClick={() => setTheme(t.id as any)}
              className={`w-full flex items-center justify-between px-6 py-4 hover:bg-zinc-50/10 transition-colors ${
                index !== themes.length - 1 ? 'border-b border-[var(--border-color)]' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg bg-zinc-50/10 ${theme === t.id ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`}>
                  <Palette size={20} />
                </div>
                <div className="text-left">
                  <h4 className={`text-sm font-bold ${theme === t.id ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]'}`}>
                    {t.label}
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)]">{t.sub}</p>
                </div>
              </div>
              {theme === t.id && (
                <div className="bg-[var(--primary)] p-1 rounded-full shadow-lg">
                  <Check size={14} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Footer Info */}
        <div className="py-12 flex flex-col items-center gap-1 opacity-40">
          <span className="text-[var(--text-primary)] font-black tracking-[0.2em] uppercase text-[10px]">GxChat India V 1.0.0</span>
          <div className="flex flex-col items-center mt-2">
            <span className="text-[var(--text-secondary)] text-[10px] font-medium">from</span>
            <span className="text-[var(--text-primary)] font-bold tracking-widest uppercase text-[9px]">Gothwad technologies</span>
          </div>
        </div>
      </div>
    </div>
  );
}
