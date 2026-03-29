import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, PlayCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { APP_CONFIG } from '../config/appConfig';

interface OnboardingSplashProps {
  onComplete: () => void;
}

const steps = [
  {
    title: "Connect with India",
    description: "Join the fastest growing social network in India. Connect with friends and family in real-time.",
    icon: MessageCircle,
    color: "from-[#4f46e5] to-[#9333ea]"
  },
  {
    title: "Share Your Moments",
    description: "Post updates, share reels, and express yourself with GxChat's unique creative features.",
    icon: PlayCircle,
    color: "from-[#9333ea] to-[#ec4899]"
  },
  {
    title: "Safe & Secure",
    description: "Your privacy is our priority. Enjoy a secure messaging experience with end-to-end encryption.",
    icon: ShieldCheck,
    color: "from-[#ec4899] to-[#f43f5e]"
  }
];

export default function OnboardingSplash({ onComplete }: OnboardingSplashProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="h-[100dvh] flex justify-center bg-[#f8faff] overflow-hidden font-sans">
      <div className="w-full max-w-[450px] h-full bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] flex flex-col relative overflow-hidden">
        {/* Subtle glow effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-white/10 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-white/10 blur-[100px] rounded-full"></div>

        <div className="flex-1 flex flex-col items-center justify-center px-8 z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full flex flex-col items-center text-center"
            >
              <div className="w-64 h-80 bg-white/10 backdrop-blur-md rounded-[40px] border border-white/20 flex flex-col items-center justify-center p-8 mb-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-8 shadow-xl"
                >
                  {React.createElement(steps[currentStep].icon, {
                    size: 48,
                    className: "text-[#9333ea]"
                  })}
                </motion.div>

                <h2 className="text-2xl font-black text-white mb-4 tracking-tight leading-tight">
                  {steps[currentStep].title}
                </h2>
                <p className="text-white/80 text-sm font-medium leading-relaxed">
                  {steps[currentStep].description}
                </p>

                {/* Dots inside the card */}
                <div className="flex gap-2 mt-8">
                  {steps.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentStep ? 'w-6 bg-white' : 'w-1.5 bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="px-8 pb-12 z-10 flex flex-col items-center gap-6">
          <button
            onClick={handleNext}
            className="w-full bg-white text-[#9333ea] py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-black/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>{currentStep === steps.length - 1 ? "Get Started" : "Next"}</span>
            <ArrowRight size={18} />
          </button>

          <div className="flex flex-col items-center gap-0.5">
            <span className="text-white/60 text-[10px] font-medium uppercase tracking-widest">from</span>
            <span className="text-white font-bold tracking-[0.2em] uppercase text-[11px]">{APP_CONFIG.DEVELOPER}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
