import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Camera, 
  User, 
  AtSign, 
  Mail, 
  Check,
  Pencil,
  AlertCircle,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../server/firebase.ts';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { verifyBeforeUpdateEmail } from 'firebase/auth';

export default function EditProfileScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Form States
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');

  const DEFAULT_LOGO = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const inputRefs = {
    fullName: useRef<HTMLInputElement>(null),
    username: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    bio: useRef<HTMLTextAreaElement>(null),
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const docRef = doc(db, "users", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          setFullName(data.fullName || '');
          setUsername(data.username || '');
          setBio(data.bio || 'Available');
          setEmail(auth.currentUser.email || '');
        }
      }
    };
    fetchUserData();
  }, []);

  const toggleEdit = (field: string) => {
    if (editingField === field) {
      setEditingField(null);
    } else {
      setEditingField(field);
      setTimeout(() => {
        const ref = (inputRefs as any)[field];
        if (ref?.current) {
          ref.current.focus();
        }
      }, 0);
    }
  };

  const handleSave = async () => {
    if (!auth.currentUser || !userData) return;
    setLoading(true);
    setError(null);

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    try {
      if (trimmedUsername !== userData.username) {
        const q = query(collection(db, "users"), where("username", "==", trimmedUsername));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const isTakenByOther = querySnapshot.docs.some(doc => doc.id !== auth.currentUser?.uid);
          if (isTakenByOther) {
            throw new Error("This username is already taken. Please try another one.");
          }
        }
      }

      if (trimmedEmail !== auth.currentUser.email) {
        try {
          await verifyBeforeUpdateEmail(auth.currentUser, trimmedEmail);
          alert("A verification email has been sent to your new email address. Please verify it to complete the change.");
        } catch (err: any) {
          console.error("Email update error:", err);
          if (err.code === 'auth/email-already-in-use') throw new Error("This email is already in use.");
          if (err.code === 'auth/requires-recent-login') throw new Error("Please log out and log back in to change your email.");
          throw new Error("Failed to update email: " + err.message);
        }
      }

      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        fullName: fullName.trim(),
        username: trimmedUsername,
        bio: bio.trim() || 'Available'
      });

      const cachedData = localStorage.getItem(`user_data_${auth.currentUser.uid}`);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        const updatedData = { ...parsed, fullName: fullName.trim(), username: trimmedUsername, bio: bio.trim() };
        localStorage.setItem(`user_data_${auth.currentUser.uid}`, JSON.stringify(updatedData));
      }

      navigate('/profile');
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: string, label: string, value: string, setter: (v: string) => void, icon: any, type: string = 'text') => {
    const isEditing = editingField === field;
    const isTextArea = field === 'bio';

    return (
      <div className="group">
        <div className="flex items-center justify-between px-1 mb-1.5">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</label>
          <button 
            onClick={() => toggleEdit(field)}
            className={`p-1.5 rounded-lg transition-all ${isEditing ? 'bg-[#00B0FF]/10 text-[#00B0FF]' : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600'}`}
          >
            <Pencil size={14} />
          </button>
        </div>
        <div className="relative">
          <div className="absolute left-4 top-4 text-zinc-400">
            {React.createElement(icon, { size: 18 })}
          </div>
          {isTextArea ? (
            <textarea
              ref={(inputRefs as any)[field]}
              value={value}
              onChange={(e) => setter(e.target.value)}
              disabled={!isEditing}
              rows={3}
              className={`w-full bg-[var(--bg-card)] border rounded-2xl py-3.5 pl-12 pr-4 text-sm transition-all resize-none ${
                isEditing ? 'border-[#00B0FF] ring-4 ring-[#00B0FF]/5 focus:outline-none' : 'border-[var(--border-color)] opacity-70'
              }`}
              placeholder={`Your ${label.toLowerCase()}`}
            />
          ) : (
            <input 
              ref={(inputRefs as any)[field]}
              type={type}
              value={value}
              onChange={(e) => setter(e.target.value)}
              disabled={!isEditing}
              className={`w-full bg-[var(--bg-card)] border rounded-2xl py-3.5 pl-12 pr-4 text-sm transition-all ${
                isEditing ? 'border-[#00B0FF] ring-4 ring-[#00B0FF]/5 focus:outline-none' : 'border-[var(--border-color)] opacity-70'
              }`}
              placeholder={`Your ${label.toLowerCase()}`}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[var(--bg-main)] overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 h-16 bg-[#00B0FF] z-50 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-white" />
          </button>
          <h1 className="text-lg font-black text-white tracking-tight uppercase">
            Edit Profile
          </h1>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-white text-[#00B0FF] px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Profile Picture Section */}
        <div className="relative py-10 flex flex-col items-center bg-gradient-to-b from-[#00B0FF]/5 to-transparent">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl relative">
              <img 
                src={userData?.photoURL || DEFAULT_LOGO} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                alt="Profile"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center cursor-pointer">
                <Camera size={32} className="text-white opacity-80 group-hover:opacity-100 transition-all" />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[#00B0FF] text-white p-2.5 rounded-2xl shadow-xl border-4 border-white">
              <Camera size={18} />
            </div>
          </div>
          <p className="mt-4 text-[10px] font-black text-[#00B0FF] uppercase tracking-[0.3em]">Change Profile Photo</p>
        </div>

        <div className="px-6 pb-12 space-y-8">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p className="text-xs font-bold leading-relaxed">{error}</p>
            </div>
          )}

          {/* Personal Info */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <User size={14} className="text-[#00B0FF]" />
              <h3 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Personal Info</h3>
            </div>
            
            <div className="space-y-5">
              {renderField('fullName', 'Full Name', fullName, setFullName, User)}
              {renderField('username', 'Username', username, setUsername, AtSign)}
              {renderField('bio', 'About / Bio', bio, setBio, Pencil)}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <Mail size={14} className="text-[#00B0FF]" />
              <h3 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Contact Details</h3>
            </div>
            
            <div className="space-y-5">
              {renderField('email', 'Email Address', email, setEmail, Mail, 'email')}
              
              <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl flex items-center justify-between opacity-60">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                    <Smartphone size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">Phone Number</h4>
                    <p className="text-[10px] text-[var(--text-secondary)]">Verified via GxChat</p>
                  </div>
                </div>
                <ShieldCheck size={18} className="text-emerald-500" />
              </div>
            </div>
          </div>

          {/* Footer Branding */}
          <div className="pt-8 flex flex-col items-center gap-1 opacity-30">
            <span className="text-[var(--text-secondary)] text-[10px] font-medium uppercase tracking-widest">Powered by</span>
            <span className="text-[var(--text-primary)] font-black tracking-[0.3em] uppercase text-[9px]">Gothwad technologies</span>
          </div>
        </div>
      </div>
    </div>
  );
}
