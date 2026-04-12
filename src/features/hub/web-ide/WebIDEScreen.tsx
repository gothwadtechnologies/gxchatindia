import React from 'react';
import { ArrowLeft, Code2, Terminal, Save, Play, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export default function WebIDEScreen() {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-300 font-mono overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 h-14 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="hover:bg-zinc-800 p-1.5 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Code2 size={18} className="text-emerald-500" />
            <span className="text-sm font-bold text-zinc-100">Web IDE</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-emerald-500 transition-all">
            <Save size={18} />
          </button>
          <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-emerald-500 transition-all">
            <Play size={18} />
          </button>
          <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-emerald-500 transition-all">
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Editor Area (Placeholder) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-12 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-4 gap-6">
          <div className="text-emerald-500"><Code2 size={20} /></div>
          <div className="text-zinc-600 hover:text-zinc-400 cursor-pointer"><Terminal size={20} /></div>
        </div>

        {/* Code Editor Placeholder */}
        <div className="flex-1 flex flex-col">
          <div className="flex bg-zinc-900 border-b border-zinc-800">
            <div className="px-4 py-2 bg-zinc-950 border-t-2 border-emerald-500 text-xs text-zinc-100">index.tsx</div>
            <div className="px-4 py-2 text-xs text-zinc-500 hover:bg-zinc-800 cursor-pointer">styles.css</div>
          </div>
          <div className="flex-1 p-6 overflow-y-auto no-scrollbar">
            <pre className="text-sm leading-relaxed">
              <code className="block">
                <span className="text-purple-400">import</span> React <span className="text-purple-400">from</span> <span className="text-emerald-400">'react'</span>;<br/>
                <br/>
                <span className="text-purple-400">export default function</span> <span className="text-blue-400">App</span>() &#123;<br/>
                &nbsp;&nbsp;<span className="text-purple-400">return</span> (<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&lt;<span className="text-rose-400">div</span> <span className="text-orange-400">className</span>=<span className="text-emerald-400">"p-4"</span>&gt;<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span className="text-rose-400">h1</span>&gt;Hello Web IDE&lt;/<span className="text-rose-400">h1</span>&gt;<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&lt;/<span className="text-rose-400">div</span>&gt;<br/>
                &nbsp;&nbsp;);<br/>
                &#125;
              </code>
            </pre>
          </div>
        </div>
      </div>

      {/* Footer / Terminal Placeholder */}
      <div className="h-32 bg-zinc-900 border-t border-zinc-800 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Terminal size={14} className="text-emerald-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Terminal</span>
        </div>
        <div className="text-xs text-emerald-500/80 font-mono">
          $ npm run dev<br/>
          <span className="text-zinc-500">Ready in 1.2s. Listening on http://localhost:3000</span>
        </div>
      </div>
    </div>
  );
}
