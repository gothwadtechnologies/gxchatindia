import React, { useState, useEffect } from 'react';
import { APP_CONFIG } from '../../config/appConfig';
import { auth } from '../../services/firebase.ts';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Mail, RefreshCw, LogOut } from 'lucide-react';

export default function VerifyEmailScreen() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkVerification = setInterval(async () => {
      await auth.currentUser?.reload();
      if (auth.currentUser?.emailVerified) {
        clearInterval(checkVerification);
        navigate('/');
      }
    }, 3000);

    return () => clearInterval(checkVerification);
  }, [navigate]);

  const handleResend = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await sendEmailVerification(auth.currentUser);
      setMessage('Verification email sent! Please check your inbox.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="h-full overflow-y-auto bg-[#f8faff] flex flex-col items-center relative">
      {/* Dynamic Multi-color Gradient Background */}
      <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] opacity-95"></div>
      
      <div className="w-full max-w-[450px] px-6 pt-12 pb-12 z-10 flex flex-col items-center min-h-full">
        {/* Branding Area */}
        <div className="flex flex-col items-center mb-10 text-white">
          <img 
            src={APP_CONFIG.LOGO_URL} 
            alt={`${APP_CONFIG.NAME} Logo`} 
            className="w-16 h-16 mb-4 object-contain brightness-0 invert"
            referrerPolicy="no-referrer"
          />
          <h1 className="text-2xl font-black tracking-tighter italic">GxChat India</h1>
        </div>

        {/* Main Card */}
        <div className="w-full bg-white rounded-[40px] shadow-2xl shadow-indigo-100/50 px-8 py-10 flex flex-col">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">Verify your email.</h2>
            <p className="text-zinc-500 text-sm font-medium">
              We've sent a verification link to <span className="font-bold text-indigo-600">{auth.currentUser?.email}</span>. 
              Please click the link in your email to continue.
            </p>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
              <p className="text-xs text-amber-700 font-bold text-center leading-relaxed">
                Don't forget to check your <span className="uppercase underline">Spam folder</span> if you don't see it!
              </p>
            </div>

            {message && (
              <p className="text-emerald-600 text-xs font-bold text-center bg-emerald-50 py-2 rounded-lg">
                {message}
              </p>
            )}
            
            {error && (
              <p className="text-red-500 text-xs font-bold text-center bg-red-50 py-2 rounded-lg">
                {error}
              </p>
            )}

            <div className="space-y-3">
              <button 
                onClick={handleResend}
                disabled={loading}
                className="w-full bg-indigo-600 text-white text-sm font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 active:scale-[0.98]"
              >
                {loading ? <RefreshCw className="animate-spin" size={18} /> : (
                  <>
                    <span>Resend Email</span>
                    <Mail size={18} />
                  </>
                )}
              </button>
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 text-zinc-400 font-bold py-2 hover:text-zinc-600 transition-colors text-xs uppercase tracking-widest"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-10 pb-6 flex flex-col items-center gap-1">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">© 2026 GxChat India</span>
          <span className="text-[9px] font-medium text-zinc-300 uppercase tracking-[0.2em]">from Gothwad technologies</span>
        </div>
      </div>
    </div>
  );
}
