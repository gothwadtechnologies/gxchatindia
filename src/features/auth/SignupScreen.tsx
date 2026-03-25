import React, { useState } from 'react';
import { APP_CONFIG } from '../../config/appConfig';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db, googleProvider } from '../../services/firebase.ts';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs, getDoc } from 'firebase/firestore';
// import { googleProvider } from '../firebase.ts'; // Removed duplicate/old import

import { User, AtSign, Lock, Eye, EyeOff } from 'lucide-react';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // 1. Check if username is unique
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username.toLowerCase().trim()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        throw new Error("Username is already taken. Please choose another one.");
      }

      // 2. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 3. Send Verification Email
      await sendEmailVerification(user);

      await updateProfile(user, { displayName: fullName });

      // 4. Save user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        fullName: fullName,
        username: username.toLowerCase().trim(),
        photoURL: user.photoURL || `https://cdn-icons-png.flaticon.com/512/149/149071.png`,
        followers: [],
        following: [],
        createdAt: new Date().toISOString()
      });

      navigate('/verify-email');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
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
        src={APP_CONFIG.LOGO_URL} 
        alt={`${APP_CONFIG.NAME} Logo`} 
        className="w-20 h-20 mb-4 object-contain"
        referrerPolicy="no-referrer"
      />
      <h1 className="text-4xl font-bold italic font-serif mb-4 text-center">{APP_CONFIG.NAME}</h1>
      
      <div className="w-full max-w-sm space-y-4">
        <form onSubmit={handleSignup} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-zinc-400"
            required
          />
          <input 
            type="text" 
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-zinc-400"
            required
          />
          <input 
            type="text" 
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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

          <p className="text-[10px] text-zinc-500 text-center px-4">
            People who use our service may have uploaded your contact information to GxChat India. <span className="text-blue-900">Learn More</span>
          </p>

          <button 
            type="submit"
            disabled={loading || googleLoading}
            className="w-full bg-blue-500 text-white font-semibold py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <div className="flex items-center gap-4 my-4">
          <div className="flex-1 h-[1px] bg-zinc-200"></div>
          <span className="text-xs font-bold text-zinc-400 uppercase">OR</span>
          <div className="flex-1 h-[1px] bg-zinc-200"></div>
        </div>

        <button 
          onClick={handleGoogleSignUp}
          disabled={loading || googleLoading}
          className="w-full flex items-center justify-center gap-3 border border-zinc-200 py-2 rounded-md hover:bg-zinc-50 transition-colors disabled:opacity-50"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" />
          <span className="text-sm font-semibold text-zinc-700">
            {googleLoading ? 'Connecting...' : 'Continue with Google'}
          </span>
        </button>
      </div>

      <div className="mt-4 border border-zinc-200 w-full max-w-sm py-4 flex justify-center text-sm">
        <span>Have an account?</span>
        <Link to="/login" className="text-blue-500 font-semibold ml-1">Log in</Link>
      </div>

      <div className="mt-auto pb-8 flex flex-col items-center gap-1">
        <span className="text-zinc-400 text-sm font-medium">from</span>
        <span className="text-zinc-800 font-bold tracking-widest uppercase text-xs">Gothwad technologies</span>
        <span className="text-zinc-400 text-[10px] uppercase tracking-tighter mt-1">made in india</span>
      </div>
    </div>
  );
}
