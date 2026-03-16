import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  MoreVertical, 
  Phone, 
  Video, 
  Mic, 
  Image as ImageIcon, 
  Heart, 
  Send, 
  Trash2, 
  UserX, 
  AlertTriangle, 
  EyeOff, 
  Lock, 
  Info,
  Reply,
  Forward,
  Edit2,
  Trash,
  X
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../server/firebase.ts';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';

import { motion, AnimatePresence } from 'motion/react';

export default function ChatScreen() {
  const { id: receiverId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [receiver, setReceiver] = useState<any>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [editingMessage, setEditingMessage] = useState<any>(null);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [activeMessageMenu, setActiveMessageMenu] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  const chatId = [auth.currentUser?.uid, receiverId].sort().join('_');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!receiverId) return;

    // Listen for receiver info
    const receiverUnsubscribe = onSnapshot(doc(db, "users", receiverId), (docSnap) => {
      if (docSnap.exists()) {
        setReceiver(docSnap.data());
      }
    });

    // Listen for messages
    const q = query(
      collection(db, "messages"),
      where("chatId", "==", chatId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      
      // Sort in-memory to avoid composite index requirement
      msgs.sort((a, b) => {
        const timeA = a.timestamp?.seconds || 0;
        const timeB = b.timestamp?.seconds || 0;
        return timeA - timeB;
      });

      setMessages(msgs);

      // Mark as read if we are looking at the chat
      const unreadMsgs = snapshot.docs.filter(doc => {
        const data = doc.data();
        return data.receiverId === auth.currentUser?.uid && !data.isRead;
      });

      if (unreadMsgs.length > 0) {
        const batch = writeBatch(db);
        unreadMsgs.forEach(msgDoc => {
          batch.update(msgDoc.ref, { isRead: true });
        });
        batch.commit();
      }
    });

    return () => {
      receiverUnsubscribe();
      unsubscribe();
    };
  }, [receiverId, chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !auth.currentUser) return;

    try {
      if (editingMessage) {
        await updateDoc(doc(db, "messages", editingMessage.id), {
          text: newMessage,
          isEdited: true
        });
        setEditingMessage(null);
      } else {
        await addDoc(collection(db, "messages"), {
          chatId,
          senderId: auth.currentUser.uid,
          receiverId,
          text: newMessage,
          timestamp: serverTimestamp(),
          isRead: false,
          replyTo: replyingTo ? { id: replyingTo.id, text: replyingTo.text, senderId: replyingTo.senderId } : null
        });
      }
      setNewMessage('');
      setReplyingTo(null);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const deleteMessage = async (msgId: string) => {
    try {
      await updateDoc(doc(db, "messages", msgId), {
        text: "🚫 This message was deleted",
        isDeleted: true
      });
      setActiveMessageMenu(null);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const startEdit = (msg: any) => {
    setEditingMessage(msg);
    setNewMessage(msg.text);
    setActiveMessageMenu(null);
  };

  const clearChat = async () => {
    if (!window.confirm("Are you sure you want to clear this chat? This will delete all messages for you.")) return;
    try {
      const q = query(collection(db, "messages"), where("chatId", "==", chatId));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      setShowOptions(false);
    } catch (error) {
      console.error("Error clearing chat:", error);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden relative">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 h-16 bg-sky-500 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="hover:bg-sky-600 p-2 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-white" />
          </button>
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/user/${receiverId}`)}>
            <div className="relative">
              <img 
                src={receiver?.photoURL || `https://cdn-icons-png.flaticon.com/512/149/149071.png`} 
                className="w-10 h-10 rounded-full object-cover border border-sky-300 shadow-sm"
                referrerPolicy="no-referrer"
              />
              {receiver?.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-sky-500 rounded-full"></div>
              )}
            </div>
            <div className="flex flex-col">
              <h2 className="text-sm font-black text-white tracking-tight uppercase">{receiver?.fullName || 'GxChat User'}</h2>
              <span className="text-[8px] text-sky-200 font-bold uppercase tracking-widest">
                {receiver?.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => navigate(`/call/${receiverId}?type=video`)}
            className="p-2 hover:bg-sky-600 rounded-full transition-colors"
          >
            <Video size={20} className="text-white" />
          </button>
          <button 
            onClick={() => navigate(`/call/${receiverId}?type=voice`)}
            className="p-2 hover:bg-sky-600 rounded-full transition-colors"
          >
            <Phone size={18} className="text-white" />
          </button>
          <div className="relative" ref={optionsRef}>
            <button 
              onClick={() => setShowOptions(!showOptions)}
              className="p-2 hover:bg-sky-600 rounded-full transition-colors"
            >
              <MoreVertical size={22} className="text-white" />
            </button>

            {/* WhatsApp Style Dropdown */}
            <AnimatePresence>
              {showOptions && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-zinc-100 py-2 z-[100] overflow-hidden"
                >
                  <button onClick={() => navigate(`/user/${receiverId}`)} className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-zinc-700 hover:bg-zinc-50 flex items-center gap-3">
                    <Info size={16} className="text-zinc-400" /> View Profile
                  </button>
                  <button onClick={clearChat} className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-zinc-700 hover:bg-zinc-50 flex items-center gap-3">
                    <Trash2 size={16} className="text-zinc-400" /> Clear Chat
                  </button>
                  <button className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-zinc-700 hover:bg-zinc-50 flex items-center gap-3">
                    <EyeOff size={16} className="text-zinc-400" /> Hide Chat
                  </button>
                  <button className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-zinc-700 hover:bg-zinc-50 flex items-center gap-3">
                    <Lock size={16} className="text-zinc-400" /> Lock Chat
                  </button>
                  <div className="h-[1px] bg-zinc-100 my-1"></div>
                  <button className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-red-600 hover:bg-red-50 flex items-center gap-3">
                    <UserX size={16} /> Block User
                  </button>
                  <button className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-red-600 hover:bg-red-50 flex items-center gap-3">
                    <AlertTriangle size={16} /> Report
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#efe7de] relative no-scrollbar" onClick={() => setActiveMessageMenu(null)}>
        {/* Subtle WhatsApp-style pattern overlay */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'url("https://i.pinimg.com/originals/ab/ab/60/abab60fec0a3699933390f77239082f0.png")', backgroundSize: '400px' }}></div>
        
        <div className="relative z-10 space-y-6">
          {messages.map((msg) => {
            const isMe = msg.senderId === auth.currentUser?.uid;
            return (
              <div 
                key={msg.id} 
                className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Message Bubble Container */}
                <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                  {/* Reply Context */}
                  {msg.replyTo && (
                    <div className={`text-[11px] px-3 py-1 rounded-t-xl bg-black/5 border-l-4 border-sky-500 mb-[-8px] z-0 opacity-70 ${isMe ? 'mr-2' : 'ml-2'}`}>
                      <p className="truncate max-w-[150px] italic">
                        {msg.replyTo.senderId === auth.currentUser?.uid ? 'You' : receiver?.fullName}: {msg.replyTo.text}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 group relative">
                    {/* Sent Message Actions (Left Side) */}
                    {isMe && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); setReplyingTo(msg); }} className="p-1.5 hover:bg-black/5 rounded-full text-zinc-400">
                          <Reply size={14} />
                        </button>
                        <div className="relative">
                          <button onClick={(e) => { e.stopPropagation(); setActiveMessageMenu(activeMessageMenu === msg.id ? null : msg.id); }} className="p-1.5 hover:bg-black/5 rounded-full text-zinc-400">
                            <MoreVertical size={14} />
                          </button>
                          {activeMessageMenu === msg.id && (
                            <div className="absolute bottom-full right-0 mb-2 w-32 bg-white rounded-xl shadow-xl border border-zinc-100 py-1 z-[100]">
                              {!msg.isDeleted && (
                                <>
                                  <button onClick={() => startEdit(msg)} className="w-full px-3 py-1.5 text-left text-[12px] font-bold text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
                                    <Edit2 size={12} /> Edit
                                  </button>
                                  <button className="w-full px-3 py-1.5 text-left text-[12px] font-bold text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
                                    <Forward size={12} /> Forward
                                  </button>
                                  <button onClick={() => deleteMessage(msg.id)} className="w-full px-3 py-1.5 text-left text-[12px] font-bold text-red-600 hover:bg-red-50 flex items-center gap-2">
                                    <Trash size={12} /> Delete
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div 
                      className={`px-4 py-2 rounded-2xl text-[15px] shadow-sm relative z-10 ${
                        isMe 
                          ? 'bg-sky-500 text-white rounded-tr-none' 
                          : 'bg-white text-zinc-800 rounded-tl-none border border-zinc-200/50'
                      } ${msg.isDeleted ? 'italic opacity-60' : ''}`}
                    >
                      <p className="leading-relaxed break-words">{msg.text}</p>
                      <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <span className={`text-[9px] ${isMe ? 'text-sky-100' : 'text-zinc-400'}`}>
                          {msg.timestamp?.toDate() ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          {msg.isEdited && ' (edited)'}
                        </span>
                        {isMe && (
                          <div className="flex">
                            <div className={`w-3 h-3 ${msg.isRead ? 'text-white' : 'text-sky-200'}`}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Received Message Actions (Right Side) */}
                    {!isMe && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="relative">
                          <button onClick={(e) => { e.stopPropagation(); setActiveMessageMenu(activeMessageMenu === msg.id ? null : msg.id); }} className="p-1.5 hover:bg-black/5 rounded-full text-zinc-400">
                            <MoreVertical size={14} />
                          </button>
                          {activeMessageMenu === msg.id && (
                            <div className="absolute bottom-full left-0 mb-2 w-32 bg-white rounded-xl shadow-xl border border-zinc-100 py-1 z-[100]">
                              <button className="w-full px-3 py-1.5 text-left text-[12px] font-bold text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
                                <Forward size={12} /> Forward
                              </button>
                              <button className="w-full px-3 py-1.5 text-left text-[12px] font-bold text-red-600 hover:bg-red-50 flex items-center gap-2">
                                <AlertTriangle size={12} /> Report
                              </button>
                            </div>
                          )}
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setReplyingTo(msg); }} className="p-1.5 hover:bg-black/5 rounded-full text-zinc-400">
                          <Reply size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 p-4 border-t border-zinc-100 bg-white z-50">
        {/* Reply Preview */}
        {replyingTo && (
          <div className="mb-3 p-2 bg-zinc-50 rounded-xl border-l-4 border-sky-500 flex items-center justify-between animate-in slide-in-from-bottom-2">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-sky-600 uppercase">Replying to {replyingTo.senderId === auth.currentUser?.uid ? 'yourself' : receiver?.fullName}</p>
              <p className="text-xs text-zinc-500 truncate">{replyingTo.text}</p>
            </div>
            <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-zinc-200 rounded-full">
              <X size={16} className="text-zinc-400" />
            </button>
          </div>
        )}

        {/* Edit Preview */}
        {editingMessage && (
          <div className="mb-3 p-2 bg-sky-50 rounded-xl border-l-4 border-sky-500 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-sky-600 uppercase">Editing message</p>
              <p className="text-xs text-zinc-500 truncate">{editingMessage.text}</p>
            </div>
            <button onClick={() => { setEditingMessage(null); setNewMessage(''); }} className="p-1 hover:bg-sky-200 rounded-full">
              <X size={16} className="text-zinc-400" />
            </button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-zinc-100 rounded-full px-4 py-2 flex-1">
            <input 
              type="text" 
              placeholder={editingMessage ? "Edit message..." : "Message..."}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 bg-transparent text-sm focus:outline-none"
            />
            <div className="flex items-center gap-3 text-zinc-500">
              <ImageIcon size={20} className="cursor-pointer hover:text-zinc-800" />
              <Mic size={20} className="cursor-pointer hover:text-zinc-800" />
            </div>
          </div>
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-sky-500 p-2.5 rounded-full text-white disabled:opacity-50 transition-opacity shadow-lg shadow-sky-500/20"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
