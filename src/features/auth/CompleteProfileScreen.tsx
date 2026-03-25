import React, { useState } from 'react';
import { APP_CONFIG } from '../../config/appConfig';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../services/firebase.ts';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { updateProfile, updatePassword } from 'firebase/auth';
import { User, AtSign, Lock, Check, Eye, EyeOff } from 'lucide-react';

export default function CompleteProfileScreen() {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState(auth.currentUser?.displayName || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    if (password && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

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

      // 2. Update Profile & Password
      await updateProfile(auth.currentUser, { displayName: fullName });
      if (password) {
        await updatePassword(auth.currentUser, password);
      }

      // 3. Save to Firestore
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        fullName: fullName,
        username: username.toLowerCase().trim(),
        photoURL: auth.currentUser.photoURL || `https://cdn-icons-png.flaticon.com/512/149/149071.png`,
        followers: [],
        following: [],
        createdAt: new Date().toISOString(),
        isGoogleUser: true
      });

      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 bg-white">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <img 
            src={APP_CONFIG.LOGO_URL} 
            alt={`${APP_CONFIG.NAME} Logo`} 
            className="w-20 h-20 mx-auto mb-4 object-contain"
            referrerPolicy="no-referrer"
          />
          <h1 className="text-3xl font-bold italic font-serif text-zinc-800">{APP_CONFIG.NAME}</h1>
          <p className="text-zinc-500 text-sm">Set up your profile to continue.</p>
        </div>

        <form onSubmit={handleComplete} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="text" 
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Username</label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="text" 
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Set Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
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
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                required
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs text-center bg-red-50 py-2 rounded-lg">{error}</p>}

          <button 
            type="submit"
            disabled={loading || !username || !password}
            className="w-full bg-zinc-900 text-white font-bold py-3 rounded-xl hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Saving...' : (
              <>
                Complete Setup
                <Check size={18} />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-auto pb-8 flex flex-col items-center gap-1">
        <span className="text-zinc-400 text-sm font-medium">from</span>
        <span className="text-zinc-800 font-bold tracking-widest uppercase text-xs">Gothwad technologies</span>
        <span className="text-zinc-400 text-[10px] uppercase tracking-tighter mt-1">made in india</span>
      </div>
    </div>
  );
}
