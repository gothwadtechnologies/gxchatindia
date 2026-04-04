import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { APP_CONFIG } from '../../config/appConfig';

export default function PrivacyPolicyScreen() {
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
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Privacy Policy</h2>
          <p className="text-zinc-500 text-xs leading-relaxed max-w-[240px] mx-auto">
            Last updated: April 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6 text-zinc-600 leading-relaxed text-sm">
          <section className="space-y-3">
            <h2 className="text-zinc-900 font-bold text-base">1. Introduction</h2>
            <p>
              Welcome to GxChat India. We are committed to protecting your personal information and your right to privacy. 
              If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, 
              please contact us.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-zinc-900 font-bold text-base">2. Information We Collect</h2>
            <p>
              We collect personal information that you voluntarily provide to us when you register on the Services, 
              express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services or otherwise when you contact us.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Personal Information Provided by You: We collect names; phone numbers; email addresses; usernames; passwords; and other similar information.</li>
              <li>Social Media Login Data: We may provide you with the option to register with us using your existing social media account details, like your Google or GitHub account.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-zinc-900 font-bold text-base">3. How We Use Your Information</h2>
            <p>
              We use personal information collected via our Services for a variety of business purposes described below. 
              We process your personal information for these purposes in reliance on our legitimate business interests, 
              in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-zinc-900 font-bold text-base">4. Data Security</h2>
            <p>
              We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. 
              However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
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
