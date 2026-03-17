import { useEffect } from 'react';
import { messaging, auth, db } from '../../server/firebase.ts';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

export default function NotificationHandler() {
  useEffect(() => {
    const requestPermission = async () => {
      if (!messaging || !auth.currentUser) return;

      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Get FCM Token
          // Note: You need to provide your VAPID key here from Firebase Console
          // Project Settings -> Cloud Messaging -> Web Push certificates
          const token = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
          });

          if (token) {
            console.log('FCM Token:', token);
            // Save token to user document
            const userRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(userRef, {
              fcmTokens: arrayUnion(token)
            });
          }
        }
      } catch (error) {
        console.error('Error getting notification permission:', error);
      }
    };

    if (auth.currentUser) {
      requestPermission();
    }

    // Listen for foreground messages
    if (messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload);
        if (payload.notification) {
          new Notification(payload.notification.title || 'New Message', {
            body: payload.notification.body,
            icon: '/logo.png'
          });
        }
      });
      return () => unsubscribe();
    }
  }, []);

  return null;
}
