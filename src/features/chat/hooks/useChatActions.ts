import { useCallback } from 'react';
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  serverTimestamp,
  writeBatch,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db, auth } from '../../../services/firebase.ts';
import { ImageService } from '../../../services/ImageService.ts';
import { GofileService } from '../services/GofileService.ts';
import { toDate } from '../../../utils/dateUtils.ts';

export const useChatActions = (chatId: string, receiverId: string, receiver: any) => {
  
  const sendMessage = useCallback(async ({
    text,
    file,
    replyTo,
    onProgress
  }: {
    text: string;
    file?: File | null;
    replyTo?: any;
    onProgress?: (progress: number) => void;
  }) => {
    if (!auth.currentUser) return;

    try {
      let fileUrl = '';
      let fileType: 'text' | 'image' | 'file' = 'text';
      let fileName = '';

      if (file) {
        fileName = file.name;
        if (file.type.startsWith('image/')) {
          fileUrl = await ImageService.uploadImage(file, onProgress);
          fileType = 'image';
        } else {
          // Use Gofile for other file types
          fileUrl = await GofileService.uploadFile(file);
          fileType = 'file';
        }
      }

      await addDoc(collection(db, "messages"), {
        chatId,
        senderId: auth.currentUser.uid,
        receiverId,
        text: text || (fileType === 'file' ? `Sent a file: ${fileName}` : ''),
        imageUrl: fileType === 'image' ? (fileUrl || null) : null,
        fileUrl: fileType === 'file' ? (fileUrl || null) : null,
        fileName: fileType === 'file' ? (fileName || null) : null,
        timestamp: serverTimestamp(),
        isRead: false,
        type: fileType,
        replyTo: replyTo ? { id: replyTo.id, text: replyTo.text, senderId: replyTo.senderId } : null
      });

      // Cleanup: Keep only 50 messages in Firebase for this chat
      setTimeout(async () => {
        const q = query(collection(db, "messages"), where("chatId", "==", chatId));
        const snapshot = await getDocs(q);
        if (snapshot.size > 50) {
          const allMsgs = snapshot.docs.map(d => ({ ref: d.ref, ...d.data() })) as any[];
          allMsgs.sort((a, b) => {
            const timeA = toDate(a.timestamp)?.getTime() || Date.now();
            const timeB = toDate(b.timestamp)?.getTime() || Date.now();
            return timeB - timeA;
          });
          const batch = writeBatch(db);
          allMsgs.slice(50).forEach(d => batch.delete(d.ref));
          await batch.commit();
        }
      }, 1000);

      // Send Notification
      if (receiver?.fcmTokens?.length > 0 && receiverId !== 'gx-ai') {
        fetch('/api/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tokens: receiver.fcmTokens,
            title: `New message from ${auth.currentUser?.displayName || 'GxChat User'}`,
            body: text || 'Sent an image',
            data: { chatId, senderId: auth.currentUser?.uid }
          })
        }).catch(err => console.error('Notification error:', err));
      }
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }, [chatId, receiverId, receiver]);

  const editMessage = useCallback(async (msgId: string, newText: string) => {
    await updateDoc(doc(db, "messages", msgId), {
      text: newText,
      isEdited: true
    });
  }, []);

  const deleteMessage = useCallback(async (msgId: string) => {
    await deleteDoc(doc(db, "messages", msgId));
  }, []);

  const reactToMessage = useCallback(async (msgId: string, emoji: string) => {
    if (!auth.currentUser) return;
    const msgRef = doc(db, "messages", msgId);
    const msgDoc = await getDoc(msgRef);
    if (msgDoc.exists()) {
      const reactions = msgDoc.data().reactions || {};
      if (reactions[auth.currentUser.uid] === emoji) {
        delete reactions[auth.currentUser.uid];
      } else {
        reactions[auth.currentUser.uid] = emoji;
      }
      await updateDoc(msgRef, { reactions });
    }
  }, []);

  const clearChat = useCallback(async () => {
    const q = query(collection(db, "messages"), where("chatId", "==", chatId));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }, [chatId]);

  return { sendMessage, editMessage, deleteMessage, reactToMessage, clearChat };
};
