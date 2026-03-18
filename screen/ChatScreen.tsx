import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Smile, 
  Check, 
  CheckCheck, 
  Clock, 
  Loader2,
  MessageSquareOff,
  MessageCircle,
  Reply,
  MoreVertical
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChatHeader, 
  ChatMessageMenu, 
  ChatReplyPreview, 
  ChatEditPreview, 
  ChatPlusMenu 
} from '../src/components/ChatUIComponents';
import { auth, db } from '../server/firebase.ts';
import { toDate } from '../src/utils/dateUtils.ts';
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
  writeBatch,
  orderBy,
  limit
} from 'firebase/firestore';

import { motion, AnimatePresence } from 'motion/react';
import { CacheService } from '../src/services/CacheService.ts';

export default function ChatScreen() {
  const { id: receiverId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageLimit, setMessageLimit] = useState(15);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [receiver, setReceiver] = useState<any>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [editingMessage, setEditingMessage] = useState<any>(null);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [activeMessageMenu, setActiveMessageMenu] = useState<any | null>(null);
  const [visibleButtonsId, setVisibleButtonsId] = useState<string | null>(null);
  const [lastTap, setLastTap] = useState<{id: string, time: number}>({id: '', time: 0});
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [menuPosition, setMenuPosition] = useState<'top' | 'bottom'>('top');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const chatId = [auth.currentUser?.uid, receiverId].sort().join('_');

  // Scroll to bottom helper
  const scrollToBottom = React.useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  }, []);

  // Typing status logic
  useEffect(() => {
    if (!chatId || !receiverId) return;

    const typingRef = doc(db, "typing", `${chatId}_${receiverId}`);
    const unsubscribe = onSnapshot(typingRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const lastTyped = data.timestamp?.toMillis() || 0;
        const now = Date.now();
        // If last typed was within 3 seconds, show typing
        if (data.isTyping && now - lastTyped < 3000) {
          setIsOtherTyping(true);
        } else {
          setIsOtherTyping(false);
        }
      } else {
        setIsOtherTyping(false);
      }
    });

    return () => unsubscribe();
  }, [chatId, receiverId]);

  const updateTypingStatus = async (typing: boolean) => {
    if (!auth.currentUser) return;
    const myTypingRef = doc(db, "typing", `${chatId}_${auth.currentUser.uid}`);
    await updateDoc(myTypingRef, {
      isTyping: typing,
      timestamp: serverTimestamp()
    }).catch(async (err) => {
      // If doc doesn't exist, create it
      if (err.code === 'not-found') {
        const { setDoc } = await import('firebase/firestore');
        await setDoc(myTypingRef, {
          isTyping: typing,
          timestamp: serverTimestamp()
        });
      }
    });
  };

  const typingTimeoutRef = useRef<any>(null);
  const lastTypingUpdateRef = useRef<number>(0);
  
  const handleTyping = () => {
    const now = Date.now();
    // Only update Firestore if it's been more than 2 seconds since the last "typing" update
    if (now - lastTypingUpdateRef.current > 2000) {
      updateTypingStatus(true);
      lastTypingUpdateRef.current = now;
    }
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      updateTypingStatus(false);
      lastTypingUpdateRef.current = 0; // Reset so next keystroke triggers update
    }, 3000);
  };

  const formatLastSeen = (timestamp: any) => {
    const date = toDate(timestamp);
    if (!date) return '';
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

    // Load from local storage first
    const localKey = `msgs_${chatId}`;
    const savedMsgs = JSON.parse(localStorage.getItem(localKey) || '[]');
    setMessages(savedMsgs);

    // Use Cache for receiver info
    const cachedReceiver = CacheService.getUser(receiverId);
    if (cachedReceiver) {
      setReceiver(cachedReceiver);
    }

    // Listen for receiver info
    const receiverUnsubscribe = onSnapshot(doc(db, "users", receiverId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setReceiver(data);
        CacheService.saveUser(receiverId, data);
      }
    });

    // Listen for messages - We query by chatId and sort in memory to avoid needing a composite index
    // Actually, to support pagination effectively, we should use orderBy and limit.
    // We'll use a dynamic limit to handle "load more"
    const q = query(
      collection(db, "messages"),
      where("chatId", "==", chatId),
      orderBy("timestamp", "desc"),
      limit(messageLimit)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLoading(false);
      setLoadingMore(false);
      
      if (snapshot.metadata.fromCache && snapshot.docs.length === 0) return;

      const firestoreMsgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      
      // If we got fewer messages than the limit, we've reached the end
      if (firestoreMsgs.length < messageLimit) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      // Merge with local messages efficiently
      setMessages(prev => {
        const msgMap = new Map();
        // Add existing messages to map
        prev.forEach(m => msgMap.set(m.id, m));
        // Update/Add firestore messages
        firestoreMsgs.forEach(fMsg => msgMap.set(fMsg.id, fMsg));

        const merged = Array.from(msgMap.values());

        // Sort by timestamp ascending for display
        merged.sort((a, b) => {
          const timeA = toDate(a.timestamp)?.getTime() || 0;
          const timeB = toDate(b.timestamp)?.getTime() || 0;
          return timeA - timeB;
        });

        // Save back to local storage
        const limitedLocal = merged.slice(-500);
        if (JSON.stringify(limitedLocal) !== localStorage.getItem(localKey)) {
          localStorage.setItem(localKey, JSON.stringify(limitedLocal));
        }
        
        return limitedLocal;
      });

      // Scroll to bottom on initial load only if we are not loading more
      if (messageLimit === 15) {
        requestAnimationFrame(() => {
          scrollToBottom('auto');
        });
      }

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
    }, (error) => {
      console.error("Firestore query error:", error);
    });

    return () => {
      receiverUnsubscribe();
      unsubscribe();
    };
  }, [receiverId, chatId, scrollToBottom, messageLimit]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollTop === 0 && hasMore && !loadingMore && !loading) {
      setLoadingMore(true);
      // Store current height to maintain scroll position after loading
      const currentHeight = target.scrollHeight;
      
      setMessageLimit(prev => prev + 15);

      // After messages update, adjust scroll
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight - currentHeight;
        }
      }, 500);
    }
  };

  // Optimize scroll to bottom: Only scroll if we are already near the bottom or it's a new message from us
  const lastMessageCount = useRef(0);
  useEffect(() => {
    if (messages.length > lastMessageCount.current) {
      const lastMsg = messages[messages.length - 1];
      const isFromMe = lastMsg?.senderId === auth.currentUser?.uid;
      
      if (isFromMe) {
        scrollToBottom('smooth');
      } else {
        // Only scroll for others if we are already at the bottom
        scrollToBottom('auto');
      }
      lastMessageCount.current = messages.length;
    }
  }, [messages, scrollToBottom]);

  const handleMessageTap = React.useCallback((e: React.MouseEvent | React.TouchEvent, msg: any) => {
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
    const now = Date.now();
    if (lastTap.id === msg.id && now - lastTap.time < 300) {
      // Double tap: Open the full options menu
      setActiveMessageMenu(activeMessageMenu?.id === msg.id ? null : msg);
      setVisibleButtonsId(null);
      setLastTap({id: '', time: 0});
    } else {
      // Single tap: Show the quick action buttons (Reply/More)
      setLastTap({id: msg.id, time: now});
      setVisibleButtonsId(visibleButtonsId === msg.id ? null : msg.id);
    }
  }, [lastTap, activeMessageMenu, visibleButtonsId]);

  const handleSendMessage = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !auth.currentUser) return;

    const textToSend = newMessage;
    const replyContext = replyingTo ? { id: replyingTo.id, text: replyingTo.text, senderId: replyingTo.senderId } : null;
    const editMsg = editingMessage;

    setNewMessage('');
    setReplyingTo(null);
    setEditingMessage(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      if (editMsg) {
        await updateDoc(doc(db, "messages", editMsg.id), {
          text: textToSend,
          isEdited: true
        });
      } else {
        await addDoc(collection(db, "messages"), {
          chatId,
          senderId: auth.currentUser.uid,
          receiverId,
          text: textToSend,
          timestamp: serverTimestamp(),
          isRead: false,
          replyTo: replyContext
        });

        // Cleanup: Keep only 500 messages in Firebase for this chat
        // We query by chatId and sort in memory to avoid needing a composite index
        const q = query(
          collection(db, "messages"),
          where("chatId", "==", chatId)
        );
        const snapshot = await getDocs(q);
        if (snapshot.size > 500) {
          const allMsgs = snapshot.docs.map(d => ({ ref: d.ref, ...d.data() })) as any[];
          // Sort by timestamp descending
          allMsgs.sort((a, b) => {
            const timeA = toDate(a.timestamp)?.getTime() || 0;
            const timeB = toDate(b.timestamp)?.getTime() || 0;
            return timeB - timeA;
          });

          const batch = writeBatch(db);
          const docsToDelete = allMsgs.slice(500);
          docsToDelete.forEach(d => batch.delete(d.ref));
          await batch.commit();
        }
      }

      // Send Notification
      if (receiver?.fcmTokens && receiver.fcmTokens.length > 0) {
        fetch('/api/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tokens: receiver.fcmTokens,
            title: `New message from ${auth.currentUser?.displayName || 'GxChat User'}`,
            body: textToSend,
            data: { chatId, senderId: auth.currentUser?.uid }
          })
        }).catch(err => console.error('Notification error:', err));
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }, [newMessage, editingMessage, replyingTo, chatId, receiverId, receiver]);

  const deleteMessage = React.useCallback(async (msgId: string) => {
    try {
      await deleteDoc(doc(db, "messages", msgId));
      setActiveMessageMenu(null);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  }, []);

  const startEdit = React.useCallback((msg: any) => {
    setEditingMessage(msg);
    setNewMessage(msg.text);
    setActiveMessageMenu(null);
    // Focus and expand textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
      }
    }, 100);
  }, []);

  const clearChat = React.useCallback(async () => {
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
  }, [chatId]);

  const deleteChat = React.useCallback(async () => {
    if (!window.confirm("Delete this chat? This action cannot be undone.")) return;
    await clearChat();
    navigate('/');
  }, [clearChat, navigate]);

  return (
    <div className="flex flex-col h-full w-full bg-[#efe7dd] overflow-hidden relative">
      {/* Header */}
      <ChatHeader 
        receiver={receiver}
        receiverId={receiverId}
        formatLastSeen={formatLastSeen}
        showOptions={showOptions}
        setShowOptions={setShowOptions}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        deleteChat={deleteChat}
        optionsRef={optionsRef}
        isTyping={isOtherTyping}
      />

      {/* Messages */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#efe7dd] relative no-scrollbar" 
        onClick={() => { setActiveMessageMenu(null); setVisibleButtonsId(null); }}
      >
        {/* WhatsApp-style pattern overlay */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: '400px' }}></div>
        
        <div className="relative z-10 flex flex-col gap-1">
          {loadingMore && (
            <div className="flex flex-col items-center justify-center py-4 gap-2">
              <Loader2 size={20} className="text-[#00B0FF] animate-spin" />
              <p className="text-[9px] font-bold text-[#00B0FF] uppercase tracking-widest">Loading older messages...</p>
            </div>
          )}

          {loading && messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-[#00B0FF]/20 border-t-[#00B0FF] rounded-full animate-spin" />
              <p className="text-[10px] font-black text-[#00B0FF] uppercase tracking-[0.2em] animate-pulse">Loading Messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-10">
              <div className="w-16 h-16 bg-white/50 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <MessageCircle size={32} className="text-[#00B0FF]/40" />
              </div>
              <p className="text-sm font-bold text-zinc-500">No messages yet</p>
              <p className="text-[11px] text-zinc-400 mt-1">Say hi to start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
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

                    <motion.div 
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.5}
                      dragSnapToOrigin
                      dragTransition={{ bounceStiffness: 1500, bounceDamping: 60 }}
                      onDragStart={(e) => e.stopPropagation()}
                      onDrag={(_, info) => {
                        // Trigger reply on right swipe (positive x)
                        if (info.offset.x > 60 && replyingTo?.id !== msg.id) {
                          setReplyingTo(msg);
                        }
                        // Trigger options menu on left swipe (negative x)
                        if (info.offset.x < -60 && activeMessageMenu?.id !== msg.id) {
                          setActiveMessageMenu(msg);
                          setVisibleButtonsId(null);
                        }
                      }}
                      onClick={(e) => handleMessageTap(e, msg)}
                      className={`px-2.5 py-1.5 rounded-lg shadow-sm relative cursor-pointer active:scale-[0.98] transition-transform select-none ${
                        activeMessageMenu?.id === msg.id ? 'z-50' : 'z-10'
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
                            {toDate(msg.timestamp)?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) || ''}
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
                    </motion.div>

                    {/* Message Actions (Reply & Three Dots) - Visible on hover or when menu is active */}
                    <div className={`absolute top-1/2 -translate-y-1/2 transition-opacity flex items-center gap-1.5 z-20 ${isMe ? 'right-full mr-2' : 'left-full ml-2'} ${activeMessageMenu?.id === msg.id || visibleButtonsId === msg.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setReplyingTo(msg);
                          setVisibleButtonsId(null);
                        }} 
                        className="p-1.5 bg-white/80 hover:bg-white rounded-full text-[#00B0FF] shadow-sm border border-zinc-100 transition-all active:scale-90"
                        title="Reply"
                      >
                        <Reply size={14} />
                      </button>
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setActiveMessageMenu(activeMessageMenu?.id === msg.id ? null : msg); 
                          setVisibleButtonsId(null);
                        }} 
                        className="p-1.5 bg-white/80 hover:bg-white rounded-full text-[#00B0FF] shadow-sm border border-zinc-100 transition-all active:scale-90"
                        title="More options"
                      >
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          
          {/* Typing Indicator */}
          <AnimatePresence>
            {isOtherTyping && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex justify-start mt-2 mb-4"
              >
                <div className="bg-white px-3 py-2 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2 border border-zinc-100">
                  <div className="flex gap-1">
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }} 
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                      className="w-1.5 h-1.5 bg-[#00B0FF] rounded-full" 
                    />
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }} 
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                      className="w-1.5 h-1.5 bg-[#00B0FF] rounded-full" 
                    />
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }} 
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                      className="w-1.5 h-1.5 bg-[#00B0FF] rounded-full" 
                    />
                  </div>
                  <span className="text-[11px] font-bold text-[#00B0FF] uppercase tracking-wider">Typing...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 bg-[#00B0FF] p-1.5 pb-3 z-50 shadow-[0_-4px_20px_rgba(0,176,255,0.15)] relative">
        <ChatMessageMenu 
          activeMessageMenu={activeMessageMenu}
          setActiveMessageMenu={setActiveMessageMenu}
          startEdit={startEdit}
          setReplyingTo={setReplyingTo}
          deleteMessage={deleteMessage}
          currentUserUid={auth.currentUser?.uid}
        />

        <ChatReplyPreview 
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
          receiver={receiver}
          currentUserUid={auth.currentUser?.uid}
        />

        <ChatEditPreview 
          editingMessage={editingMessage}
          setEditingMessage={setEditingMessage}
          setNewMessage={setNewMessage}
        />

        <form onSubmit={handleSendMessage} className="flex items-center gap-2 px-1">
          <ChatPlusMenu 
            showPlusMenu={showPlusMenu}
            setShowPlusMenu={setShowPlusMenu}
            plusMenuRef={plusMenuRef}
          />

          <div className="flex-1 bg-white rounded-[20px] px-4 py-1.5 flex items-end shadow-inner min-w-0 transition-all">
            <textarea 
              ref={textareaRef}
              placeholder="Type a message"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
                // Auto-expand
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              rows={1}
              className="flex-1 bg-transparent text-[16px] focus:outline-none text-zinc-800 py-1.5 resize-none max-h-[120px] leading-tight"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e as any);
                }
              }}
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
