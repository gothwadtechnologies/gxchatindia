import React, { useState } from 'react';
import { APP_CONFIG } from '../../config/appConfig';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db, googleProvider } from '../../services/firebase.ts';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState(''); // Can be email or username
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    let loginEmail = identifier;

    try {
      if (!identifier.includes('@')) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", identifier.toLowerCase().trim()));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          throw new Error("Username not found");
        }
        
        loginEmail = querySnapshot.docs[0].data().email;
      }

      await signInWithEmailAndPassword(auth, loginEmail, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        navigate('/complete-profile');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-[#f8faff] flex flex-col items-center relative">
      {/* Dynamic Multi-color Gradient Background - Fixed to stay while scrolling */}
      <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] opacity-95"></div>
      
      {/* Optional: Add a secondary glow at the bottom for more depth */}
      <div className="fixed bottom-0 left-0 w-full h-[50%] bg-gradient-to-t from-[#f43f5e]/20 to-transparent pointer-events-none"></div>
      
      <div className="w-full max-w-[450px] px-6 pt-12 pb-12 z-10 flex flex-col items-center min-h-full">
        {/* Branding Area */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center mb-10 text-white"
        >
          <img 
            src={APP_CONFIG.LOGO_URL} 
            alt={`${APP_CONFIG.NAME} Logo`} 
            className="w-16 h-16 mb-4 object-contain brightness-0 invert"
            referrerPolicy="no-referrer"
          />
          <h1 className="text-2xl font-black tracking-tighter italic">GxChat India</h1>
        </motion.div>

        {/* Main Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full bg-white rounded-[40px] shadow-2xl shadow-indigo-100/50 px-8 py-10 flex flex-col"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">Sign In To Your Account.</h2>
            <p className="text-zinc-500 text-sm font-medium">Unleash your social world today.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 ml-1">Username or Email</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="text" 
                  placeholder="Enter your email or username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-zinc-400"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-zinc-700">Password</label>
                <button type="button" className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700">Forgot Password?</button>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-zinc-400"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 px-1">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500" />
              <label htmlFor="remember" className="text-xs font-bold text-zinc-600 cursor-pointer">Remember For 30 Days</label>
            </div>
            
            <button 
              type="submit"
              disabled={loading || googleLoading || !identifier || password.length < 6}
              className="w-full bg-indigo-600 text-white text-sm font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 active:scale-[0.98]"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              {!loading && <ArrowRight size={18} />}
            </button>

            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-xs font-bold text-center bg-red-50 py-2 rounded-lg"
              >
                {error}
              </motion.p>
            )}

            <div className="text-center">
              <span className="text-xs font-bold text-zinc-500">Don't have an account? </span>
              <Link to="/signup" className="text-xs font-bold text-indigo-600 hover:underline">Sign Up</Link>
            </div>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-zinc-100"></div>
              <span className="flex-shrink mx-4 text-[10px] font-black text-zinc-300 uppercase tracking-widest">OR</span>
              <div className="flex-grow border-t border-zinc-100"></div>
            </div>

            <button 
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-zinc-200 py-3.5 rounded-2xl text-sm font-bold text-zinc-700 hover:bg-zinc-50 transition-all active:scale-[0.98]"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" />
              <span>{googleLoading ? 'Connecting...' : 'Sign In With Google'}</span>
            </button>
          </form>
        </motion.div>

        {/* Footer */}
        <div className="mt-auto pt-10 pb-6 flex flex-col items-center gap-1">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">© 2026 GxChat India</span>
          <span className="text-[9px] font-medium text-zinc-300 uppercase tracking-[0.2em]">from Gothwad technologies</span>
        </div>
      </div>
    </div>
  );
}
