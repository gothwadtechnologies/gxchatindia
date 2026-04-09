import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  writeBatch, 
  doc, 
  Timestamp,
  getDocs
} from 'firebase/firestore';
import { db, auth } from '../../../services/firebase.ts';
import { storage } from '../../../services/StorageService';
import { toDate } from '../../../utils/dateUtils.ts';

export const useChatMessages = (chatId: string, initialLimit: number = 15) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageLimit, setMessageLimit] = useState(initialLimit);
  const [loadingMore, setLoadingMore] = useState(false);
  const lastMessageCount = useRef(0);

  useEffect(() => {
    if (!chatId || !auth.currentUser) return;

    const localKey = `msgs_${chatId}`;
    const data = storage.getItem(localKey);
    if (data) {
      try {
        setMessages(JSON.parse(data));
      } catch (e) {
        console.warn('Error parsing cached messages');
      }
    }
    setLoading(false);

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
      
      const removedIds = snapshot.docChanges()
        .filter(change => change.type === 'removed')
        .map(change => change.doc.id);

      setMessages(prev => {
        const msgMap = new Map();
        prev.forEach(m => msgMap.set(m.id, m));
        removedIds.forEach(id => msgMap.delete(id));
        firestoreMsgs.forEach(fMsg => msgMap.set(fMsg.id, fMsg));

        const merged = Array.from(msgMap.values());
        merged.sort((a, b) => {
          const timeA = toDate(a.timestamp)?.getTime() || Date.now();
          const timeB = toDate(b.timestamp)?.getTime() || Date.now();
          return timeA - timeB;
        });

        const limitedLocal = merged.slice(-5000);
        storage.setItem(localKey, JSON.stringify(limitedLocal));
        return limitedLocal;
      });

      // Mark as read
      const unreadMsgs = snapshot.docs.filter(doc => {
        const data = doc.data();
        return data.receiverId === auth.currentUser?.uid && !data.isRead;
      });

      if (unreadMsgs.length > 0) {
        const batch = writeBatch(db);
        unreadMsgs.forEach(msgDoc => {
          batch.update(msgDoc.ref, { isRead: true });
        });
        batch.commit().catch(err => console.error("Error marking as read:", err));
      }
    });

    return () => unsubscribe();
  }, [chatId]);

  // Cleanup expired messages
  useEffect(() => {
    if (!chatId) return;
    const cleanupInterval = setInterval(async () => {
      try {
        const now = Timestamp.now();
        const q = query(
          collection(db, "messages"),
          where("expiresAt", "<=", now)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const batch = writeBatch(db);
          snapshot.docs.forEach(msgDoc => batch.delete(msgDoc.ref));
          await batch.commit();
        }
      } catch (err) {
        console.error("Cleanup error:", err);
      }
    }, 60000);
    return () => clearInterval(cleanupInterval);
  }, [chatId]);

  const loadMore = useCallback((currentHeight: number, scrollContainer: HTMLDivElement | null) => {
    if (messages.length > messageLimit && !loadingMore && !loading) {
      setLoadingMore(true);
      setTimeout(() => {
        setMessageLimit(prev => Math.min(prev + 15, messages.length));
        setLoadingMore(false);
        setTimeout(() => {
          if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight - currentHeight;
          }
        }, 100);
      }, 800);
    }
  }, [messages.length, messageLimit, loadingMore, loading]);

  return { 
    messages, 
    loading, 
    messageLimit, 
    loadingMore, 
    loadMore,
    lastMessageCount 
  };
};
