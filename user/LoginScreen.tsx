import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db, googleProvider } from '../server/firebase.ts';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

import { Eye, EyeOff } from 'lucide-react';

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
      // Check if identifier is a username (doesn't contain @)
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
      
      // Check if user exists in Firestore
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
    <div className="min-h-screen flex flex-col items-center justify-center px-8 bg-white">
      <img 
        src="https://i.ibb.co/4RFKFmPR/file-00000000bf907207abbf3e9db6cfe8a1.png" 
        alt="GxChat India Logo" 
        className="w-20 h-20 mb-4 object-contain"
        referrerPolicy="no-referrer"
      />
      <h1 className="text-4xl font-bold italic font-serif mb-12 text-center">GxChat India</h1>
      
      <div className="w-full max-w-sm space-y-4">
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="text" 
            placeholder="Username or email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-zinc-400"
            required
          />
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-zinc-400"
              required
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

          <button 
            type="submit"
            disabled={loading || googleLoading}
            className="w-full bg-blue-500 text-white font-semibold py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-[1px] bg-zinc-200"></div>
          <span className="text-xs font-bold text-zinc-400 uppercase">OR</span>
          <div className="flex-1 h-[1px] bg-zinc-200"></div>
        </div>

        <button 
          onClick={handleGoogleSignIn}
          disabled={loading || googleLoading}
          className="w-full flex items-center justify-center gap-3 border border-zinc-200 py-2 rounded-md hover:bg-zinc-50 transition-colors disabled:opacity-50"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" />
          <span className="text-sm font-semibold text-zinc-700">
            {googleLoading ? 'Connecting...' : 'Continue with Google'}
          </span>
        </button>
      </div>

      <div className="mt-20 border border-zinc-200 w-full max-w-sm py-6 flex justify-center text-sm">
        <span>Don't have an account?</span>
        <Link to="/signup" className="text-blue-500 font-semibold ml-1">Sign up</Link>
      </div>

      <div className="mt-auto pb-8 flex flex-col items-center gap-1">
        <span className="text-zinc-400 text-sm font-medium">from</span>
        <span className="text-zinc-800 font-bold tracking-widest uppercase text-xs">Gothwad technologies</span>
        <span className="text-zinc-400 text-[10px] uppercase tracking-tighter mt-1">made in india</span>
      </div>
    </div>
  );
}
