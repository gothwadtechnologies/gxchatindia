import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  MoreVertical, 
  Phone, 
  Video, 
  Mic, 
  Image as ImageIcon, 
  Send, 
  Plus,
  Camera,
  Volume2,
  VolumeX,
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
  X,
  User,
  Check,
  CheckCheck,
  FileText,
  Link as LinkIcon
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../server/firebase.ts';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
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
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [editingMessage, setEditingMessage] = useState<any>(null);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [activeMessageMenu, setActiveMessageMenu] = useState<any | null>(null);
  const [menuPosition, setMenuPosition] = useState<'top' | 'bottom'>('top');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);

  const chatId = [auth.currentUser?.uid, receiverId].sort().join('_');

  const formatLastSeen = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
      return `last seen at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    } else if (isYesterday) {
      return 'last seen at Yesterday';
    } else {
      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
      if (date.getFullYear() !== now.getFullYear()) {
        options.year = 'numeric';
      }
      return `last seen at ${date.toLocaleDateString('en-GB', options)}`;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
      if (plusMenuRef.current && !plusMenuRef.current.contains(event.target as Node)) {
        setShowPlusMenu(false);
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

      // Send Notification
      if (receiver?.fcmTokens && receiver.fcmTokens.length > 0) {
        fetch('/api/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tokens: receiver.fcmTokens,
            title: `New message from ${auth.currentUser?.displayName || 'GxChat User'}`,
            body: newMessage,
            data: { chatId, senderId: auth.currentUser?.uid }
          })
        }).catch(err => console.error('Notification error:', err));
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const deleteMessage = async (msgId: string) => {
    try {
      await deleteDoc(doc(db, "messages", msgId));
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

  const deleteChat = async () => {
    if (!window.confirm("Delete this chat? This action cannot be undone.")) return;
    await clearChat();
    navigate('/');
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#efe7dd] overflow-hidden relative">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 h-16 bg-[#00B0FF] z-50 shadow-md">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="hover:bg-white/10 p-1.5 rounded-full transition-colors">
            <ArrowLeft size={22} className="text-white" />
          </button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(`/user/${receiverId}`)}>
            <div className="relative">
              <img 
                src={receiver?.photoURL || `https://cdn-icons-png.flaticon.com/512/149/149071.png`} 
                className="w-9 h-9 rounded-full object-cover border border-white/20 shadow-sm"
                referrerPolicy="no-referrer"
              />
              {receiver?.isOnline && (
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#00B0FF] rounded-full"></div>
              )}
            </div>
            <div className="flex flex-col">
              <h2 className="text-[14px] font-bold text-white leading-tight">{receiver?.fullName || 'GxChat User'}</h2>
              <span className="text-[10px] text-white/80 font-medium">
                {receiver?.isOnline ? 'online' : formatLastSeen(receiver?.lastSeen)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => navigate(`/call/${receiverId}?type=video`)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Video size={20} className="text-white" />
          </button>
          <button 
            onClick={() => navigate(`/call/${receiverId}?type=voice`)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Phone size={18} className="text-white" />
          </button>
          <div className="relative" ref={optionsRef}>
            <button 
              onClick={() => setShowOptions(!showOptions)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
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
                  className="absolute right-0 mt-2 w-44 bg-[#00B0FF] rounded-xl shadow-2xl border border-white/10 py-1 z-[100] overflow-hidden"
                >
                  <button onClick={() => navigate(`/user/${receiverId}`)} className="w-full px-4 py-3 text-left text-[14px] font-bold text-white hover:bg-white/10 flex items-center gap-3 transition-colors">
                    <User size={18} className="text-white/80" /> View Profile
                  </button>
                  <button className="w-full px-4 py-3 text-left text-[14px] font-bold text-white hover:bg-white/10 flex items-center gap-3 transition-colors">
                    <EyeOff size={18} className="text-white/80" /> Hide Chat
                  </button>
                  <button onClick={() => setIsMuted(!isMuted)} className="w-full px-4 py-3 text-left text-[14px] font-bold text-white hover:bg-white/10 flex items-center gap-3 transition-colors">
                    {isMuted ? <Volume2 size={18} className="text-white/80" /> : <VolumeX size={18} className="text-white/80" />}
                    {isMuted ? 'Unmute' : 'Mute'}
                  </button>
                  <button onClick={deleteChat} className="w-full px-4 py-3 text-left text-[14px] font-bold text-white hover:bg-white/10 flex items-center gap-3 transition-colors">
                    <Trash size={18} className="text-white/80" /> Delete Chat
                  </button>
                  <button className="w-full px-4 py-3 text-left text-[14px] font-bold text-white hover:bg-white/10 flex items-center gap-3 border-t border-white/10 transition-colors">
                    <UserX size={18} className="text-white/80" /> Block User
                  </button>
                  <button className="w-full px-4 py-3 text-left text-[14px] font-bold text-white hover:bg-white/10 flex items-center gap-3 transition-colors">
                    <AlertTriangle size={18} className="text-white/80" /> Report
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#efe7dd] relative no-scrollbar" onClick={() => setActiveMessageMenu(null)}>
        {/* WhatsApp-style pattern overlay */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: '400px' }}></div>
        
        <div className="relative z-10 flex flex-col gap-1">
          {messages.map((msg, index) => {
            const isMe = msg.senderId === auth.currentUser?.uid;
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const isSameSender = prevMsg?.senderId === msg.senderId;
            
            return (
              <div 
                key={msg.id} 
                className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} ${!isSameSender ? 'mt-2' : 'mt-0.5'}`}
              >
                <div className="relative group max-w-[85%]">
                  {/* Tail for the first message in a sequence */}
                  {!isSameSender && (
                    <div className={`absolute top-0 w-3 h-3 ${isMe ? '-right-2 bg-white' : '-left-2 bg-white'}`} 
                         style={{ clipPath: isMe ? 'polygon(0 0, 0 100%, 100% 0)' : 'polygon(100% 0, 100% 100%, 0 0)' }}>
                    </div>
                  )}

                  <div 
                    className={`px-2.5 py-1.5 rounded-lg shadow-sm relative ${
                      activeMessageMenu === msg.id ? 'z-50' : 'z-10'
                    } ${
                      isMe 
                        ? 'bg-white text-[#303030]' 
                        : 'bg-white text-[#303030]'
                    }`}
                  >
                    {/* Reply Context */}
                    {msg.replyTo && (
                      <div className="mb-1 p-1.5 rounded bg-black/5 border-l-4 border-emerald-500 text-[12px]">
                        <p className="font-bold text-emerald-700 text-[10px]">
                          {msg.replyTo.senderId === auth.currentUser?.uid ? 'You' : receiver?.fullName}
                        </p>
                        <p className="truncate text-zinc-600 italic">{msg.replyTo.text}</p>
                      </div>
                    )}

                    <div className="flex flex-col min-w-[60px]">
                      <p className="text-[14.5px] leading-snug break-words whitespace-pre-wrap">{msg.text}</p>
                      <div className="flex items-center justify-end gap-1 mt-0.5 -mr-1">
                        <span className="text-[10px] text-zinc-500 font-medium">
                          {msg.timestamp?.toDate() ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}
                          {msg.isEdited && ' • edited'}
                        </span>
                        {isMe && (
                          <div className="flex ml-0.5">
                            {msg.isRead ? (
                              <CheckCheck size={14} className="text-blue-500" />
                            ) : (
                              <Check size={14} className="text-zinc-400" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Message Actions (Hover) */}
                    <div className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-0 ${isMe ? 'right-full mr-2' : 'left-full ml-2'}`}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setReplyingTo(msg); }}
                        className="p-1.5 hover:bg-black/5 rounded-full text-zinc-400 transition-colors"
                        title="Reply"
                      >
                        <Reply size={16} />
                      </button>
                      <div className="relative">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setActiveMessageMenu(activeMessageMenu?.id === msg.id ? null : msg); 
                          }} 
                          className="p-1.5 hover:bg-black/5 rounded-full text-zinc-400 transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 bg-[#00B0FF] p-1.5 pb-3 z-50 shadow-[0_-4px_20px_rgba(0,176,255,0.15)] relative">
        {/* Fixed Message Action Menu (Opens above send button) */}
        <AnimatePresence>
          {activeMessageMenu && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute bottom-full right-4 mb-3 w-40 bg-[#00B0FF] rounded-xl shadow-2xl border border-white/10 py-1 z-[100] overflow-hidden"
            >
              <div className="px-3 py-1.5 border-b border-white/10 mb-1">
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Message Options</p>
              </div>
              <>
                {activeMessageMenu.senderId === auth.currentUser?.uid && (
                  <button 
                    onClick={() => { startEdit(activeMessageMenu); setActiveMessageMenu(null); }} 
                    className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-white hover:bg-white/10 flex items-center gap-3 transition-colors"
                  >
                    <Edit2 size={16} className="text-white/80" /> Edit
                  </button>
                )}
                <button 
                  onClick={() => { setReplyingTo(activeMessageMenu); setActiveMessageMenu(null); }}
                  className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-white hover:bg-white/10 flex items-center gap-3 transition-colors"
                >
                  <Reply size={16} className="text-white/80" /> Reply
                </button>
                <button 
                  onClick={() => setActiveMessageMenu(null)}
                  className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-white hover:bg-white/10 flex items-center gap-3 transition-colors"
                >
                  <Forward size={16} className="text-white/80" /> Forward
                </button>
                {activeMessageMenu.senderId === auth.currentUser?.uid && (
                  <button 
                    onClick={() => { deleteMessage(activeMessageMenu.id); setActiveMessageMenu(null); }} 
                    className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-white hover:bg-white/10 flex items-center gap-3 transition-colors"
                  >
                    <Trash size={16} className="text-white/80" /> Delete
                  </button>
                )}
              </>
              <button 
                onClick={() => setActiveMessageMenu(null)}
                className="w-full px-4 py-2 text-center text-[11px] font-bold text-white/50 hover:text-white transition-colors mt-1"
              >
                Cancel
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reply Preview */}
        {replyingTo && (
          <div className="mb-1.5 mx-1.5 p-1.5 bg-white/10 backdrop-blur-md rounded-lg border-l-4 border-white flex items-center justify-between shadow-sm">
            <div className="flex-1 min-w-0 px-2">
              <p className="text-[10px] font-bold text-white">Replying to {replyingTo.senderId === auth.currentUser?.uid ? 'yourself' : receiver?.fullName}</p>
              <p className="text-[12px] text-white/80 truncate">{replyingTo.text}</p>
            </div>
            <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <X size={14} className="text-white" />
            </button>
          </div>
        )}

        {/* Edit Preview */}
        {editingMessage && (
          <div className="mb-1.5 mx-1.5 p-1.5 bg-white/10 backdrop-blur-md rounded-lg border-l-4 border-white flex items-center justify-between shadow-sm">
            <div className="flex-1 min-w-0 px-2">
              <p className="text-[10px] font-bold text-white">Editing message</p>
              <p className="text-[12px] text-white/80 truncate">{editingMessage.text}</p>
            </div>
            <button onClick={() => { setEditingMessage(null); setNewMessage(''); }} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <X size={14} className="text-white" />
            </button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center gap-2 px-1">
          <div className="relative" ref={plusMenuRef}>
            <button 
              type="button" 
              onClick={() => setShowPlusMenu(!showPlusMenu)}
              className="p-2 text-white hover:bg-white/10 rounded-full transition-colors shrink-0"
            >
              <Plus size={24} />
            </button>

            {/* Plus Menu (Attachment Menu) */}
            <AnimatePresence>
              {showPlusMenu && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute bottom-full left-0 mb-3 w-40 bg-[#00B0FF] rounded-xl shadow-2xl border border-white/10 py-1 z-[100] overflow-hidden"
                >
                  <button className="w-full px-3 py-2.5 text-left text-[13px] font-bold text-white hover:bg-white/10 flex items-center gap-3 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white">
                      <Mic size={16} />
                    </div>
                    Microphone
                  </button>
                  <button className="w-full px-3 py-2.5 text-left text-[13px] font-bold text-white hover:bg-white/10 flex items-center gap-3 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white">
                      <ImageIcon size={16} />
                    </div>
                    Media
                  </button>
                  <button className="w-full px-3 py-2.5 text-left text-[13px] font-bold text-white hover:bg-white/10 flex items-center gap-3 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white">
                      <FileText size={16} />
                    </div>
                    Files
                  </button>
                  <button className="w-full px-3 py-2.5 text-left text-[13px] font-bold text-white hover:bg-white/10 flex items-center gap-3 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white">
                      <LinkIcon size={16} />
                    </div>
                    Links
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-1 bg-white rounded-full px-4 py-1.5 flex items-center shadow-inner min-w-0">
            <input 
              type="text" 
              placeholder="Type a message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 bg-transparent text-[16px] focus:outline-none text-zinc-800 py-1"
            />
          </div>

          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-white w-11 h-11 flex items-center justify-center rounded-full text-[#00B0FF] disabled:opacity-50 transition-all shadow-lg active:scale-95 shrink-0"
          >
            <Send size={20} className="ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
