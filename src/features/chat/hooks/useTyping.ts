import { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, serverTimestamp, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';

export const useTyping = (chatId: string, userId: string, receiverId: string) => {
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimeoutRef = useRef<any>(null);
  const lastTypingUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (!chatId || !receiverId) return;

    const typingRef = doc(db, "typing", `${chatId}_${receiverId}`);
    const unsubscribe = onSnapshot(typingRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const lastTyped = data.timestamp?.toMillis() || 0;
        const now = Date.now();
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
    if (!userId) return;
    const myTypingRef = doc(db, "typing", `${chatId}_${userId}`);
    try {
      await updateDoc(myTypingRef, {
        isTyping: typing,
        timestamp: serverTimestamp()
      });
    } catch (err: any) {
      if (err.code === 'not-found') {
        await setDoc(myTypingRef, {
          isTyping: typing,
          timestamp: serverTimestamp()
        });
      }
    }
  };

  const handleTyping = () => {
    const now = Date.now();
    if (now - lastTypingUpdateRef.current > 2000) {
      updateTypingStatus(true);
      lastTypingUpdateRef.current = now;
    }
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      updateTypingStatus(false);
      lastTypingUpdateRef.current = 0;
    }, 3000);
  };

  return { isOtherTyping, handleTyping };
};
