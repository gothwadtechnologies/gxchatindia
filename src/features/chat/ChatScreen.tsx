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
  MoreVertical,
  Trash,
  X
} from 'lucide-react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ChatHeader, 
  ChatMessageMenu, 
  ChatReplyPreview, 
  ChatEditPreview, 
  ChatPlusMenu,
  ChatMessageReactions,
  EmojiPickerMenu
} from '../../components/ChatUIComponents';
import { auth, db, rtdb, storage as firebaseStorage } from '../../services/firebase.ts';
import { ref as rtdbRef, onValue, update } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject, uploadBytesResumable } from 'firebase/storage';
import { toDate, formatLastSeen } from '../../utils/dateUtils.ts';
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
  limit,
  getDoc,
  setDoc,
  Timestamp
} from 'firebase/firestore';

import { motion, AnimatePresence } from 'motion/react';
import { CacheService } from '../../services/CacheService.ts';
import { GoogleGenAI } from "@google/genai";

const apiKey = typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

import { storage } from '../../services/StorageService';

export default function ChatScreen() {
  const { id: receiverId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
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
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [editingMessage, setEditingMessage] = useState<any | null>(null);
  const [activeMessageMenu, setActiveMessageMenu] = useState<any | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState<any | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [visibleButtonsId, setVisibleButtonsId] = useState<string | null>(null);
  const [lastTap, setLastTap] = useState<{id: string, time: number}>({id: '', time: 0});
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [receiverStatus, setReceiverStatus] = useState<'online' | 'offline'>('offline');
  const [isSending, setIsSending] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [menuPosition, setMenuPosition] = useState<'top' | 'bottom'>('top');
  const [receiverActiveChatId, setReceiverActiveChatId] = useState<string | null>(null);
  const [receiverLastSeen, setReceiverLastSeen] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const chatId = [auth.currentUser?.uid, receiverId].sort().join('_');

  // Handle captured image from camera
  useEffect(() => {
    if (location.state?.capturedImage) {
      const dataUrl = location.state.capturedImage;
      setImagePreviewUrl(dataUrl);
      
      // Convert dataUrl to File
      fetch(dataUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "camera_photo.jpg", { type: "image/jpeg" });
          setSelectedImageFile(file);
        });
      
      // Clear location state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // Scroll to bottom helper
  const scrollToBottom = React.useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior
      });
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

  useEffect(() => {
    if (isOtherTyping) {
      scrollToBottom('smooth');
    }
  }, [isOtherTyping, scrollToBottom]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
      if (plusMenuRef.current && !plusMenuRef.current.contains(event.target as Node)) {
        setShowPlusMenu(false);
      }
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!receiverId || !auth.currentUser) return;

    const localKey = `msgs_${chatId}`;
    // Load from local storage first
    let savedMsgs = [];
    const data = storage.getItem(localKey);
    if (data) {
      try {
        savedMsgs = JSON.parse(data);
      } catch (e) {
        console.warn('Error parsing cached messages');
      }
    }
    setMessages(savedMsgs);
    setLoading(false);

    if (receiverId === 'gx-ai') {
      setReceiver({
        fullName: 'Gx Chat AI',
        username: 'gxai',
        photoURL: 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png',
        isOnline: true,
        isAI: true
      });
      setReceiverStatus('online');
      setLoading(false);
    } else {
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

      // Listen for receiver RTDB status
      const statusRef = rtdbRef(rtdb, `/status/${receiverId}`);
      const statusUnsubscribe = onValue(statusRef, (snapshot) => {
        const val = snapshot.val();
        if (val) {
          setReceiverStatus(val.state);
          setReceiverActiveChatId(val.activeChatId || null);
          setReceiverLastSeen(val.last_changed || null);
        } else {
          setReceiverStatus('offline');
          setReceiverActiveChatId(null);
          setReceiverLastSeen(null);
        }
      });

      // Set my active chat ID in RTDB
      if (auth.currentUser) {
        const myStatusRef = rtdbRef(rtdb, `/status/${auth.currentUser.uid}`);
        update(myStatusRef, { activeChatId: receiverId }).catch(err => console.error("Error updating activeChatId:", err));
      }

      return () => {
        receiverUnsubscribe();
        statusUnsubscribe();
        // Clear my active chat ID
        if (auth.currentUser) {
          const myStatusRef = rtdbRef(rtdb, `/status/${auth.currentUser.uid}`);
          update(myStatusRef, { activeChatId: null }).catch(err => console.error("Error clearing activeChatId:", err));
        }
      };
    }
  }, [receiverId, chatId, scrollToBottom, messageLimit]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    // If we scroll to top and we have more messages in our local state than what we are showing
    if (target.scrollTop === 0 && messages.length > messageLimit && !loadingMore && !loading) {
      setLoadingMore(true);
      // Store current height to maintain scroll position after loading
      const currentHeight = target.scrollHeight;
      
      // Load 15 more from local state
      setTimeout(() => {
        setMessageLimit(prev => Math.min(prev + 15, messages.length));
        setLoadingMore(false);

        // After messages update, adjust scroll
        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight - currentHeight;
          }
        }, 100);
      }, 800); // Animation delay
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

  // Scroll to bottom when other user starts typing
  useEffect(() => {
    if (isOtherTyping) {
      // Small delay to let the animation start and layout adjust
      const timeout = setTimeout(() => {
        scrollToBottom('smooth');
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [isOtherTyping, scrollToBottom]);

  const handleReact = React.useCallback(async (msgId: string, emoji: string) => {
    if (!auth.currentUser) return;
    try {
      const msgRef = doc(db, "messages", msgId);
      const msgDoc = await getDoc(msgRef);
      if (msgDoc.exists()) {
        const data = msgDoc.data();
        const reactions = data.reactions || {};
        // If user already reacted with same emoji, remove it
        if (reactions[auth.currentUser.uid] === emoji) {
          delete reactions[auth.currentUser.uid];
        } else {
          reactions[auth.currentUser.uid] = emoji;
        }
        await updateDoc(msgRef, { reactions });
      }
    } catch (error) {
      console.error("Error reacting to message:", error);
    }
  }, []);

  const handleMessageTap = React.useCallback((e: React.MouseEvent | React.TouchEvent, msg: any) => {
    // Prevent default only if it's a touch event to avoid double-tap zoom
    if (e.type === 'touchstart' && e.cancelable) e.preventDefault();
    e.stopPropagation();
    
    const now = Date.now();
    if (lastTap.id === msg.id && now - lastTap.time < 300) {
      // Double tap: Quick Reply
      setReplyingTo(msg);
      setVisibleButtonsId(null);
      setShowReactionPicker(null);
      setLastTap({id: '', time: 0});
      if (window.navigator.vibrate) window.navigator.vibrate(10);
    } else {
      // Single tap: Show quick actions & reaction bar
      setLastTap({id: msg.id, time: now});
      setVisibleButtonsId(visibleButtonsId === msg.id ? null : msg.id);
      setShowReactionPicker(showReactionPicker?.id === msg.id ? null : msg);
    }
  }, [lastTap, visibleButtonsId, showReactionPicker]);

  useEffect(() => {
    if (!receiverId || !auth.currentUser) return;

    // Listen for messages - We query by chatId and sort in memory to avoid needing a composite index
    // We fetch all messages for this chat (since we keep it at 50 max in Firebase)
    const q = query(
      collection(db, "messages"),
      where("chatId", "==", chatId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLoading(false);
      setLoadingMore(false);
      
      const firestoreMsgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data({ serverTimestamps: 'estimate' })
      })) as any[];
      
      // Handle removals explicitly
      const removedIds = snapshot.docChanges()
        .filter(change => change.type === 'removed')
        .map(change => change.doc.id);

      // Merge with local messages efficiently
      setMessages(prev => {
        const msgMap = new Map();
        // Add existing messages to map (from local storage)
        prev.forEach(m => msgMap.set(m.id, m));
        
        // Remove messages that were explicitly removed in this snapshot
        removedIds.forEach(id => msgMap.delete(id));
        
        // Update/Add firestore messages
        firestoreMsgs.forEach(fMsg => msgMap.set(fMsg.id, fMsg));

        const merged = Array.from(msgMap.values());

        // Sort by timestamp ascending for display
        merged.sort((a, b) => {
          const timeA = toDate(a.timestamp)?.getTime() || Date.now();
          const timeB = toDate(b.timestamp)?.getTime() || Date.now();
          return timeA - timeB;
        });

        // Save back to local storage (up to 5000 messages)
        const limitedLocal = merged.slice(-5000);
        const localKey = `msgs_${chatId}`;
        storage.setItem(localKey, JSON.stringify(limitedLocal));
        
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
        batch.commit().catch(err => handleFirestoreError(err, OperationType.WRITE, 'messages'));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'messages');
    });

    return () => unsubscribe();
  }, [chatId, messageLimit, scrollToBottom]);

  useEffect(() => {
    if (!chatId) return;
    
    // Cleanup expired messages (24h after seen)
    const cleanupInterval = setInterval(async () => {
      try {
        const now = Timestamp.now();
        const q = query(
          collection(db, "messages"),
          where("expiresAt", "<=", now)
        );
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        
        for (const msgDoc of snapshot.docs) {
          const data = msgDoc.data();
          // Delete from storage if it has an image
          if (data.imageUrl && data.storagePath) {
            try {
              const sRef = storageRef(firebaseStorage, data.storagePath);
              await deleteObject(sRef);
            } catch (e) {
              console.error("Error deleting image from storage:", e);
            }
          }
          batch.delete(msgDoc.ref);
        }
        
        if (!snapshot.empty) {
          await batch.commit();
          console.log(`Cleaned up ${snapshot.size} expired messages`);
        }
      } catch (err) {
        console.error("Cleanup error:", err);
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(cleanupInterval);
  }, [chatId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviewUrl(reader.result as string);
      setSelectedImageFile(file);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Mark images for deletion when they are seen
  useEffect(() => {
    if (!auth.currentUser) return;
    
    const unreadImages = messages.filter(m => 
      m.receiverId === auth.currentUser?.uid && 
      m.type === 'image' && 
      m.isRead && 
      !m.expiresAt
    );
    
    if (unreadImages.length > 0) {
      const batch = writeBatch(db);
      const tomorrow = new Date();
      tomorrow.setHours(tomorrow.getHours() + 24);
      
      unreadImages.forEach(msg => {
        batch.update(doc(db, "messages", msg.id), {
          expiresAt: Timestamp.fromDate(tomorrow)
        });
      });
      
      batch.commit().catch(err => console.error("Error setting expiration:", err));
    }
  }, [messages]);

  const handleSendMessage = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedImageFile) || !auth.currentUser || isSending || isUploading) return;

    const textToSend = newMessage;
    const replyContext = replyingTo ? { id: replyingTo.id, text: replyingTo.text, senderId: replyingTo.senderId } : null;
    const editMsg = editingMessage;

    setNewMessage('');
    setReplyingTo(null);
    setEditingMessage(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    setIsSending(true);
    try {
      if (editMsg) {
        const msgRef = doc(db, "messages", editMsg.id);
        await updateDoc(msgRef, {
          text: textToSend,
          isEdited: true
        }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `messages/${editMsg.id}`));
        setIsSending(false);
      } else if (selectedImageFile) {
        setIsUploading(true);
        const timestamp = Date.now();
        const path = `chats/${chatId}/${timestamp}_${selectedImageFile.name}`;
        const sRef = storageRef(firebaseStorage, path);
        
        const uploadTask = uploadBytesResumable(sRef, selectedImageFile);

        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(Math.round(progress));
          }, 
          (error) => {
            console.error("Upload error:", error);
            setIsUploading(false);
            setIsSending(false);
            alert("Failed to upload image.");
          }, 
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            await addDoc(collection(db, "messages"), {
              chatId,
              senderId: auth.currentUser?.uid,
              receiverId,
              text: textToSend,
              imageUrl: url,
              storagePath: path,
              timestamp: serverTimestamp(),
              isRead: false,
              type: 'image'
            });
            setIsUploading(false);
            setIsSending(false);
            setSelectedImageFile(null);
            setImagePreviewUrl(null);
            setUploadProgress(0);
          }
        );
      } else {
        await addDoc(collection(db, "messages"), {
          chatId,
          senderId: auth.currentUser.uid,
          receiverId,
          text: textToSend,
          timestamp: serverTimestamp(),
          isRead: false,
          replyTo: replyContext
        }).catch(err => handleFirestoreError(err, OperationType.CREATE, 'messages'));

        // AI Logic
        if (receiverId === 'gx-ai') {
          setIsOtherTyping(true);
          try {
            const result = await ai.models.generateContent({
              model: "gemini-3-flash-preview",
              contents: [{ role: 'user', parts: [{ text: textToSend }] }],
              config: {
                systemInstruction: "You are Gx Chat AI, a helpful and friendly assistant in the GxChat India app. Keep your responses concise and helpful."
              }
            });
            
            const aiResponse = result.text;
            
            await addDoc(collection(db, "messages"), {
              chatId,
              senderId: 'gx-ai',
              receiverId: auth.currentUser.uid,
              text: aiResponse,
              timestamp: serverTimestamp(),
              isRead: true,
              replyTo: { id: 'user-msg', text: textToSend, senderId: auth.currentUser.uid }
            });
          } catch (aiErr) {
            console.error("AI Error:", aiErr);
          } finally {
            setIsOtherTyping(false);
          }
        }

        // Cleanup: Keep only 50 messages in Firebase for this chat (Run in background)
        setTimeout(async () => {
          try {
            const q = query(
              collection(db, "messages"),
              where("chatId", "==", chatId)
            );
            const snapshot = await getDocs(q);
            if (snapshot.size > 50) {
              const allMsgs = snapshot.docs.map(d => ({ ref: d.ref, ...d.data() })) as any[];
              // Sort by timestamp descending (newest first)
              allMsgs.sort((a, b) => {
                const timeA = toDate(a.timestamp)?.getTime() || Date.now();
                const timeB = toDate(b.timestamp)?.getTime() || Date.now();
                return timeB - timeA;
              });

              const batch = writeBatch(db);
              // Keep the newest 50 messages, delete the rest
              const docsToDelete = allMsgs.slice(50);
              docsToDelete.forEach(d => batch.delete(d.ref));
              await batch.commit().catch(err => handleFirestoreError(err, OperationType.DELETE, 'messages_cleanup'));
            }
          } catch (err) {
            console.error("Cleanup error:", err);
          }
        }, 1000);
      }

      // Send Notification
      if (receiver?.fcmTokens && receiver.fcmTokens.length > 0 && receiverId !== 'gx-ai') {
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
    } finally {
      setIsSending(false);
    }
  }, [newMessage, editingMessage, replyingTo, chatId, receiverId, receiver, selectedImageFile, isSending, isUploading]);

  const deleteMessage = React.useCallback(async (msgId: string) => {
    try {
      console.log("Attempting to delete message:", msgId);
      await deleteDoc(doc(db, "messages", msgId)).catch(err => handleFirestoreError(err, OperationType.DELETE, `messages/${msgId}`));
      console.log("Message deleted successfully from Firestore");
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
    <div className="flex flex-col h-full w-full bg-[var(--bg-main)] overflow-hidden relative">
      {/* Header */}
      <ChatHeader 
        receiver={receiver}
        receiverId={receiverId}
        formatLastSeen={() => formatLastSeen(receiverLastSeen || receiver?.lastSeen)}
        showOptions={showOptions}
        setShowOptions={setShowOptions}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        deleteChat={deleteChat}
        optionsRef={optionsRef}
        isTyping={isOtherTyping}
        receiverStatus={receiverStatus}
        receiverActiveChatId={receiverActiveChatId}
        currentUserId={auth.currentUser?.uid}
      />

      {/* Messages */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-2 bg-[var(--bg-main)] relative no-scrollbar touch-pan-y" 
        onClick={() => { setActiveMessageMenu(null); setVisibleButtonsId(null); }}
      >
        {/* WhatsApp-style pattern overlay */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: '400px' }}></div>
        
        <div className="relative z-10 flex flex-col gap-1">
          {loadingMore && (
            <div className="flex flex-col items-center justify-center py-4 gap-2">
              <Loader2 size={20} className="text-[var(--primary)] animate-spin" />
              <p className="text-[9px] font-bold text-[var(--primary)] uppercase tracking-widest">Loading older messages...</p>
            </div>
          )}

          {loading && messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin" />
              <p className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.2em] animate-pulse">Loading Messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-10">
              <div className="w-16 h-16 bg-white/50 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <MessageCircle size={32} className="text-[var(--primary)]/40" />
              </div>
              <p className="text-sm font-bold text-zinc-500">No messages yet</p>
              <p className="text-[11px] text-zinc-400 mt-1">Say hi to start the conversation!</p>
            </div>
          ) : (() => {
            const currentMessages = messages.slice(-messageLimit);
            return currentMessages.map((msg, index) => {
              const isMe = msg.senderId === auth.currentUser?.uid;
              const prevMsg = index > 0 ? currentMessages[index - 1] : null;
              const isSameSender = prevMsg?.senderId === msg.senderId;
              
              return (
                <div 
                  key={msg.id} 
                  className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} ${!isSameSender ? 'mt-2' : 'mt-0.5'}`}
                >
                  <div className="relative group max-w-[70%]">
                    {/* Tail for the first message in a sequence */}
                    {!isSameSender && (
                      <div className={`absolute top-0 w-3 h-3 ${isMe ? '-right-2 bg-[var(--bubble-own)]' : '-left-2 bg-[var(--bubble-other)]'}`} 
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
                        // Received Message (Left side)
                        if (!isMe) {
                          // Left to Right (L->R) -> Reply
                          if (info.offset.x > 70 && replyingTo?.id !== msg.id) {
                            setReplyingTo(msg);
                            if (window.navigator.vibrate) window.navigator.vibrate(10);
                          }
                          // Right to Left (R->L) -> Options
                          if (info.offset.x < -70 && activeMessageMenu?.id !== msg.id) {
                            setActiveMessageMenu(msg);
                            if (window.navigator.vibrate) window.navigator.vibrate(10);
                          }
                        } 
                        // Sent Message (Right side)
                        else {
                          // Right to Left (R->L) -> Reply
                          if (info.offset.x < -70 && replyingTo?.id !== msg.id) {
                            setReplyingTo(msg);
                            if (window.navigator.vibrate) window.navigator.vibrate(10);
                          }
                          // Left to Right (L->R) -> Options
                          if (info.offset.x > 70 && activeMessageMenu?.id !== msg.id) {
                            setActiveMessageMenu(msg);
                            if (window.navigator.vibrate) window.navigator.vibrate(10);
                          }
                        }
                      }}
                      onClick={(e) => handleMessageTap(e, msg)}
                      className={`px-2.5 py-1.5 rounded-lg shadow-sm relative cursor-pointer active:scale-[0.98] transition-transform select-none ${
                        activeMessageMenu?.id === msg.id ? 'z-50' : 'z-10'
                      } ${
                        isMe 
                          ? 'bg-[var(--bubble-own)] text-[var(--bubble-text-own)]' 
                          : 'bg-[var(--bubble-other)] text-[var(--bubble-text-other)]'
                      }`}
                    >
                      {/* Reaction Picker on Click */}
                      {showReactionPicker?.id === msg.id && (
                        <ChatMessageReactions 
                          onReact={(emoji) => handleReact(msg.id, emoji)}
                          onClose={() => setShowReactionPicker(null)}
                          position={isMe ? 'right' : 'left'}
                        />
                      )}

                      {/* Reply Context */}
                      {msg.replyTo && (
                        <div className="mb-1 p-1.5 rounded bg-black/5 border-l-4 border-[var(--primary)] text-[12px]">
                          <p className="font-bold text-[var(--primary)] text-[10px]">
                            {msg.replyTo.senderId === auth.currentUser?.uid ? 'You' : receiver?.fullName}
                          </p>
                          <p className="truncate text-zinc-600 italic">{msg.replyTo.text}</p>
                        </div>
                      )}

                      <div className="flex flex-col min-w-[60px]">
                        {msg.imageUrl && (
                          <div className="mb-1 rounded-lg overflow-hidden border border-black/5">
                            <img 
                              src={msg.imageUrl} 
                              alt="Sent image" 
                              className="max-w-full h-auto max-h-64 object-cover"
                              referrerPolicy="no-referrer"
                            />
                            {msg.expiresAt && (
                              <div className="bg-black/40 text-white text-[9px] px-2 py-1 flex items-center gap-1">
                                <Clock size={10} /> Expires in 24h
                              </div>
                            )}
                          </div>
                        )}
                        {msg.text && <p className="text-[14.5px] leading-snug break-words whitespace-pre-wrap">{msg.text}</p>}
                        <div className="flex items-center justify-end gap-1 mt-0.5 -mr-1">
                          <span className="text-[10px] text-zinc-500 font-medium">
                            {toDate(msg.timestamp)?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) || ''}
                            {msg.isEdited && ' • edited'}
                          </span>
                          {isMe && (
                            <div className="flex ml-0.5">
                              {msg.isRead ? (
                                <CheckCheck size={14} className="text-blue-500" />
                              ) : receiverStatus === 'online' ? (
                                <CheckCheck size={14} className="text-zinc-400" />
                              ) : (
                                <Check size={14} className="text-zinc-400" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Display Reactions */}
                      {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                        <div className={`absolute -bottom-3 ${isMe ? 'right-2' : 'left-2'} flex items-center gap-0.5 bg-[var(--bg-main)] rounded-full px-1.5 py-0.5 shadow-sm border border-[var(--border-color)] z-20`}>
                          {Object.entries(msg.reactions).slice(0, 3).map(([uid, emoji]) => (
                            <span key={uid} className="text-[13px]">{emoji as string}</span>
                          ))}
                          {Object.keys(msg.reactions).length > 1 && (
                            <span className="text-[9px] font-bold text-[var(--primary)] ml-0.5">{Object.keys(msg.reactions).length}</span>
                          )}
                        </div>
                      )}
                    </motion.div>

                    {/* Message Actions (Reply & Three Dots) - Visible on hover or when menu is active */}
                    <div className={`absolute top-1/2 -translate-y-1/2 transition-all duration-200 flex items-center gap-1 whitespace-nowrap z-20 ${isMe ? 'right-full mr-2' : 'left-full ml-2'} ${activeMessageMenu?.id === msg.id || visibleButtonsId === msg.id ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto'}`}>
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setReplyingTo(msg);
                          setVisibleButtonsId(null);
                        }} 
                        className="p-1.5 bg-white hover:bg-zinc-50 rounded-full text-[var(--primary)] shadow-md border border-zinc-100 transition-all active:scale-90"
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
                        className="p-1.5 bg-white hover:bg-zinc-50 rounded-full text-[var(--primary)] shadow-md border border-zinc-100 transition-all active:scale-90"
                        title="More options"
                      >
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            });
          })()}
          
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
                      className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full" 
                    />
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }} 
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                      className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full" 
                    />
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }} 
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                      className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full" 
                    />
                  </div>
                  <span className="text-[11px] font-bold text-[var(--primary)] uppercase tracking-wider">Typing...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 bg-[var(--bg-main)] p-1.5 pb-3 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] relative border-t border-[var(--border-color)]">
        <ChatMessageMenu 
          activeMessageMenu={activeMessageMenu}
          setActiveMessageMenu={setActiveMessageMenu}
          setReplyingTo={setReplyingTo}
          startEdit={startEdit}
          deleteMessage={deleteMessage}
          currentUserUid={auth.currentUser?.uid}
          setShowReactionPicker={setShowReactionPicker}
        />

        <ChatEditPreview 
          editingMessage={editingMessage}
          setEditingMessage={setEditingMessage}
          setNewMessage={setNewMessage}
        />

        <ChatReplyPreview 
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
          receiver={receiver}
          currentUserUid={auth.currentUser?.uid}
        />

        <form onSubmit={handleSendMessage} className="flex items-center gap-2 px-1">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange}
          />
          <ChatPlusMenu 
            showPlusMenu={showPlusMenu}
            setShowPlusMenu={setShowPlusMenu}
            plusMenuRef={plusMenuRef}
            onMediaClick={() => fileInputRef.current?.click()}
            chatId={chatId}
          />

          <div className="flex-1 bg-[var(--bg-chat)] rounded-[20px] px-4 py-1.5 flex flex-col shadow-inner min-w-0 transition-all border border-[var(--border-color)]">
            {imagePreviewUrl && (
              <div className="mb-2 relative w-fit group">
                <div className="relative rounded-xl overflow-hidden border border-[var(--border-color)] shadow-lg max-w-[120px]">
                  <img src={imagePreviewUrl} alt="Preview" className="w-full h-auto" />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                      <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin mb-1" />
                      <span className="text-white text-[10px] font-bold">{uploadProgress}%</span>
                    </div>
                  )}
                  {!isUploading && (
                    <button 
                      type="button"
                      onClick={() => { setSelectedImageFile(null); setImagePreviewUrl(null); }}
                      className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            )}
            <div className="flex items-end w-full">
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
              className="flex-1 bg-transparent text-[16px] focus:outline-none text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 py-1.5 resize-none max-h-[120px] leading-tight"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e as any);
                }
              }}
            />
            <EmojiPickerMenu 
              showEmojiPicker={showEmojiPicker}
              setShowEmojiPicker={setShowEmojiPicker}
              emojiPickerRef={emojiPickerRef}
              onEmojiSelect={(emoji) => {
                setNewMessage(prev => prev + emoji);
                setShowEmojiPicker(false);
                textareaRef.current?.focus();
              }}
            />
            </div>
          </div>

          <button 
            type="submit"
            disabled={(!newMessage.trim() && !selectedImageFile) || isSending || isUploading}
            className="bg-[var(--primary)] w-11 h-11 flex items-center justify-center rounded-full text-white disabled:opacity-50 transition-all shadow-lg active:scale-95 shrink-0"
          >
            {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-0.5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
