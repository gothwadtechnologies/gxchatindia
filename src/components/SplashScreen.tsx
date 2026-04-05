import React from 'react';
import { motion } from 'motion/react';
import { APP_CONFIG } from '../config/appConfig';

interface SplashScreenProps {
  developerName: string;
}

export default function SplashScreen({ developerName }: SplashScreenProps) {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[9999] font-sans overflow-hidden">
      {/* Center Logo */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-20 h-20 flex items-center justify-center"
        >
          <img 
            src={APP_CONFIG.LOGO_URL} 
            alt={APP_CONFIG.NAME} 
            className="w-full h-full object-contain"
          />
        </motion.div>
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl font-bold tracking-tight text-zinc-900"
        >
          GxChat India
        </motion.span>
      </div>

      {/* Bottom Branding */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="pb-12 flex flex-col items-center gap-1"
      >
        <span className="text-zinc-400 text-[10px] font-medium tracking-wide">from</span>
        <span className="text-zinc-900 text-[12px] font-bold tracking-[0.2em] uppercase">
          {developerName}
        </span>
      </motion.div>
    </div>
  );
}
