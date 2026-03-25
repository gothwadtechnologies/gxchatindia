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
    <div className="min-h-screen flex flex-col items-center justify-center px-8 bg-white">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="flex flex-col items-center">
          <img 
            src={APP_CONFIG.LOGO_URL} 
            alt={`${APP_CONFIG.NAME} Logo`} 
            className="w-20 h-20 mb-4 object-contain"
            referrerPolicy="no-referrer"
          />
          <h1 className="text-3xl font-bold italic font-serif text-zinc-800">{APP_CONFIG.NAME}</h1>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-zinc-900">Verify your email</h2>
          <p className="text-zinc-500 text-sm">
            We've sent a verification link to <span className="font-semibold text-zinc-900">{auth.currentUser?.email}</span>. 
            Please click the link in your email to continue.
          </p>
          <p className="text-xs text-amber-600 font-medium bg-amber-50 py-2 rounded-lg">
            Don't forget to check your <span className="font-bold uppercase">Spam folder</span> if you don't see it!
          </p>
        </div>

        {message && <p className="text-emerald-600 text-sm font-medium">{message}</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="space-y-3 pt-4">
          <button 
            onClick={handleResend}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white font-semibold py-3 rounded-xl hover:bg-blue-600 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
          >
            {loading ? <RefreshCw className="animate-spin" size={20} /> : 'Resend Email'}
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-zinc-500 font-medium py-2 hover:text-zinc-800 transition-colors"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </div>

      <div className="mt-auto pb-8 flex flex-col items-center gap-1">
        <span className="text-zinc-400 text-sm font-medium">from</span>
        <span className="text-zinc-800 font-bold tracking-widest uppercase text-xs">Gothwad technologies</span>
        <span className="text-zinc-400 text-[10px] uppercase tracking-tighter mt-1">made in india</span>
      </div>
    </div>
  );
}
