import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { useAuth } from '../../../providers/AuthProvider';
import { CacheService } from '../../../services/CacheService';

export const useChatRooms = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid),
      orderBy("lastMessageTime", "desc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatRooms = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const otherUserId = data.participants.find((id: string) => id !== user.uid);
        
        // Try cache first
        let otherUser: any = CacheService.getUser(otherUserId);
        if (!otherUser) {
          const userDoc = await getDoc(doc(db, "users", otherUserId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            otherUser = { ...userData, uid: otherUserId, timestamp: Date.now() };
            CacheService.saveUser(otherUserId, userData);
          } else {
            otherUser = null;
          }
        }

        return {
          id: docSnap.id,
          ...data,
          otherUserId,
          user: otherUser
        };
      }));
      
      setRooms(chatRooms);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { rooms, loading };
};
