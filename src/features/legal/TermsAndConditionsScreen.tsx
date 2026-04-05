import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { APP_CONFIG } from '../../config/appConfig';

export default function TermsAndConditionsScreen() {
  const navigate = useNavigate();

  return (
    <div className="h-full overflow-y-auto bg-white flex flex-col items-center relative font-sans">
      <div className="w-full max-w-md px-8 pt-16 pb-12 z-10 flex flex-col min-h-full relative">
        {/* Branding Overlay */}
        <div className="absolute top-6 left-0 right-0 flex items-center justify-center gap-2">
          <div className="bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100 flex items-center gap-2 shadow-sm">
            <img 
              src={APP_CONFIG.LOGO_URL} 
              alt="Logo" 
              className="w-4 h-4 object-contain"
              referrerPolicy="no-referrer"
            />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-800">GxChat India</span>
          </div>
        </div>

        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-8 py-1.5 flex items-center text-xs font-bold text-zinc-800 hover:text-zinc-500 transition-colors"
        >
          Back
        </button>

        <div className="text-center mb-10 mt-8">
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Terms and Conditions</h2>
          <p className="text-zinc-500 text-xs leading-relaxed max-w-[240px] mx-auto">
            Last updated: April 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6 text-zinc-600 leading-relaxed text-sm">
          <section className="space-y-3">
            <h2 className="text-zinc-900 font-bold text-base">1. Agreement to Terms</h2>
            <p>
              These Terms and Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an entity, 
              and Gothwad Technologies, concerning your access to and use of the GxChat India application.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-zinc-900 font-bold text-base">2. Intellectual Property Rights</h2>
            <p>
              Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, 
              website designs, audio, video, text, photographs, and graphics on the Site and the trademarks, service marks, 
              and logos contained therein are owned or controlled by us or licensed to us.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-zinc-900 font-bold text-base">3. User Representations</h2>
            <p>
              By using the Site, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; 
              (2) you will maintain the accuracy of such information and promptly update such registration information as necessary.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-zinc-900 font-bold text-base">4. Prohibited Activities</h2>
            <p>
              You may not access or use the Site for any purpose other than that for which we make the Site available. 
              The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-zinc-900 font-bold text-base">5. Governing Law</h2>
            <p>
              These Terms and Conditions and your use of the Site are governed by and construed in accordance with the laws of India.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-12 flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 text-[10px] font-bold">
            <Link to="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>
            <span className="text-zinc-900">&</span>
            <Link to="/terms" className="text-blue-600 hover:underline">Terms and Conditions</Link>
          </div>
          <span className="text-[9px] font-black text-zinc-900 uppercase tracking-widest">Gothwad Technologies</span>
        </div>
      </div>
    </div>
  );
}
