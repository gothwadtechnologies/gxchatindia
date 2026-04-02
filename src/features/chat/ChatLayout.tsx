import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import ChatsTab from './ChatsTab';
import { motion } from 'motion/react';
import { APP_CONFIG } from '../../config/appConfig';

export default function ChatLayout() {
  const { id } = useParams();
  const isChatActive = !!id;

  return (
    <div className="h-full flex overflow-hidden bg-[var(--bg-main)]">
      {/* Sidebar - Chat List */}
      <div className={`
        ${isChatActive ? 'hidden lg:flex' : 'flex'} 
        w-full lg:w-[350px] xl:w-[400px] h-full flex-col border-r border-[var(--border-color)] bg-[var(--bg-card)] shrink-0
      `}>
        <ChatsTab />
      </div>

      {/* Main Content - Active Chat or Placeholder */}
      <div className={`
        ${isChatActive ? 'flex' : 'hidden lg:flex'} 
        flex-1 h-full flex-col bg-[var(--bg-chat)] relative
      `}>
        {isChatActive ? (
          <Outlet />
        ) : (
          <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 text-center bg-[var(--bg-chat)]">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center max-w-md"
            >
              <div className="w-24 h-24 bg-[var(--bg-card)] rounded-[2.5rem] flex items-center justify-center shadow-xl mb-8 border border-[var(--border-color)]">
                <img 
                  src={APP_CONFIG.LOGO_URL} 
                  alt="Logo" 
                  className="w-14 h-14 object-contain opacity-80" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <h2 className="text-2xl font-black text-[var(--text-primary)] mb-3 tracking-tight italic">
                GxChat India for Web
              </h2>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-8">
                Send and receive messages without keeping your phone online.<br/>
                Use GxChat India on up to 4 linked devices and 1 phone at the same time.
              </p>
              <div className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-auto">
                <span className="w-8 h-[1px] bg-current"></span>
                End-to-end encrypted
                <span className="w-8 h-[1px] bg-current"></span>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
