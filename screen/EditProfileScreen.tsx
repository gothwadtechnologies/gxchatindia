import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Camera, 
  User, 
  AtSign, 
  Mail, 
  Check,
  Pencil,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../server/firebase.ts';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { updateEmail, verifyBeforeUpdateEmail } from 'firebase/auth';

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

  const DEFAULT_LOGO = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const inputRefs = {
    fullName: useRef<HTMLInputElement>(null),
    username: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
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
      // Focus the input after state update
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
      // 1. Check if Username is already in use
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

      // 2. Update Email in Auth (if changed)
      if (trimmedEmail !== auth.currentUser.email) {
        try {
          // Use verifyBeforeUpdateEmail for modern Firebase security requirements
          await verifyBeforeUpdateEmail(auth.currentUser, trimmedEmail);
          alert("A verification email has been sent to your new email address. Please verify it to complete the change.");
        } catch (err: any) {
          console.error("Email update error:", err);
          if (err.code === 'auth/email-already-in-use') {
            throw new Error("This email is already in use by another account.");
          }
          if (err.code === 'auth/requires-recent-login') {
            throw new Error("For security reasons, please log out and log back in to change your email.");
          }
          if (err.code === 'auth/operation-not-allowed') {
            throw new Error("Email updates are currently restricted. Please contact support or check your Firebase settings.");
          }
          throw new Error("Failed to update email: " + err.message);
        }
      }

      // 3. Update Firestore
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        fullName: fullName.trim(),
        username: trimmedUsername,
      });

      // Update local storage
      const cachedData = localStorage.getItem(`user_data_${auth.currentUser.uid}`);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        const updatedData = { ...parsed, fullName: fullName.trim(), username: trimmedUsername };
        localStorage.setItem(`user_data_${auth.currentUser.uid}`, JSON.stringify(updatedData));
      }

      alert("Profile updated successfully!");
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

    return (
      <div className="space-y-1.5 group">
        <div className="flex items-center justify-between px-1">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</label>
          <button 
            onClick={() => toggleEdit(field)}
            className={`p-1.5 rounded-lg transition-all ${isEditing ? 'bg-blue-50 text-blue-600' : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600'}`}
          >
            <Pencil size={14} />
          </button>
        </div>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
            {React.createElement(icon, { size: 18 })}
          </div>
          <input 
            ref={(inputRefs as any)[field]}
            type={type}
            value={value}
            onChange={(e) => setter(e.target.value)}
            disabled={!isEditing}
            className={`w-full bg-white border rounded-2xl py-4 pl-12 pr-4 text-base transition-all ${
              isEditing ? 'border-blue-500 ring-4 ring-blue-500/10 focus:outline-none' : 'border-zinc-200 opacity-70'
            }`}
            placeholder={`Your ${label.toLowerCase()}`}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white pb-12">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-zinc-100 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-zinc-900" />
          </button>
          <h1 className="text-xl font-bold text-zinc-900">Edit Profile</h1>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
          ) : (
            <Check size={24} />
          )}
        </button>
      </div>

      <div className="w-full px-6 py-4">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p className="text-xs font-medium leading-relaxed">{error}</p>
          </div>
        )}

        {/* Form Sections */}
        <div className="space-y-4">
          <div className="bg-zinc-50/50 p-5 rounded-2xl border border-zinc-100 space-y-4">
            <h3 className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-1">Personal Information</h3>
            
            {renderField('fullName', 'Full Name', fullName, setFullName, User)}
            {renderField('username', 'Username', username, setUsername, AtSign)}
            {renderField('email', 'Email Address', email, setEmail, Mail, 'email')}
          </div>
        </div>
      </div>
    </div>
  );
}
