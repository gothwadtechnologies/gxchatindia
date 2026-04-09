import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { auth, db } from '../../../services/firebase.ts';
import { toDate } from '../../../utils/dateUtils.ts';
import { CacheService } from '../../../services/CacheService.ts';

export const useConversations = (activeFilter: string) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    if (activeFilter === 'Calls') return;

    const qSender = query(
      collection(db, "messages"),
      where("senderId", "==", auth.currentUser.uid)
    );

    const qReceiver = query(
      collection(db, "messages"),
      where("receiverId", "==", auth.currentUser.uid)
    );

    const processMessages = async (snapshot1: any, snapshot2: any) => {
      const allMsgs = [
        ...snapshot1.docs.map((d: any) => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) })),
        ...snapshot2.docs.map((d: any) => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }))
      ];

      const chatGroups: { [key: string]: any } = {};
      allMsgs.forEach(msg => {
        const msgTime = toDate(msg.timestamp)?.getTime() || Date.now();
        const existingTime = toDate(chatGroups[msg.chatId]?.timestamp)?.getTime() || 0;
        if (!chatGroups[msg.chatId] || msgTime > existingTime) {
          chatGroups[msg.chatId] = msg;
        }
      });

      const sortedChats = Object.values(chatGroups).sort((a, b) => {
        const timeA = toDate(a.timestamp)?.getTime() || Date.now();
        const timeB = toDate(b.timestamp)?.getTime() || Date.now();
        return timeB - timeA;
      }).slice(0, 100);

      const otherUserIds = Array.from(new Set(sortedChats.map(chat => 
        chat.senderId === auth.currentUser?.uid ? chat.receiverId : chat.senderId
      )));

      const uncachedIds = otherUserIds.filter(id => !CacheService.getUser(id));
      const userMap = new Map();
      otherUserIds.forEach(id => {
        const cached = CacheService.getUser(id);
        if (cached) userMap.set(id, cached);
      });

      if (uncachedIds.length > 0) {
        for (let i = 0; i < uncachedIds.length; i += 30) {
          const chunk = uncachedIds.slice(i, i + 30);
          const userSnap = await getDocs(query(collection(db, "users"), where("uid", "in", chunk)));
          userSnap.docs.forEach(d => {
            const data = d.data();
            userMap.set(d.id, data);
            CacheService.saveUser(d.id, data);
          });
        }
      }

      const chatList = sortedChats.map((chat) => {
        const otherUserId = chat.senderId === auth.currentUser?.uid ? chat.receiverId : chat.senderId;
        if (otherUserId === 'gx-ai') return null;

        const userData = userMap.get(otherUserId);
        const unreadCount = allMsgs.filter(m => 
          m.chatId === chat.chatId && 
          m.receiverId === auth.currentUser?.uid && 
          !m.isRead
        ).length;

        return {
          id: chat.chatId,
          otherUserId,
          user: userData?.fullName || userData?.username || 'Unknown User',
          username: userData?.username || '',
          fullName: userData?.fullName || '',
          lastMsg: chat.text,
          time: toDate(chat.timestamp) ? formatTime(toDate(chat.timestamp)) : 'Recently',
          avatar: userData?.photoURL || `https://cdn-icons-png.flaticon.com/512/149/149071.png`,
          unread: unreadCount > 0,
          unreadCount,
          isOnline: userData?.isOnline || false
        };
      }).filter(Boolean);

      setConversations(chatList);
      setLoading(false);
    };

    const formatTime = (date: Date) => {
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      if (days === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (days === 1) return 'Yesterday';
      return date.toLocaleDateString();
    };

    let snap1: any = { docs: [] };
    let snap2: any = { docs: [] };
    let timeout: any;

    const debouncedProcess = (s1: any, s2: any) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => processMessages(s1, s2), 100);
    };

    const unsub1 = onSnapshot(qSender, (s) => {
      snap1 = s;
      debouncedProcess(snap1, snap2);
    });

    const unsub2 = onSnapshot(qReceiver, (s) => {
      snap2 = s;
      debouncedProcess(snap1, snap2);
    });

    return () => {
      if (timeout) clearTimeout(timeout);
      unsub1();
      unsub2();
    };
  }, [activeFilter]);

  return { conversations, loading };
};
