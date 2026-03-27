import { useEffect } from 'react';
import { messagingPromise, auth, db } from '../services/firebase.ts';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

export default function NotificationHandler() {
  useEffect(() => {
    const initMessaging = async () => {
      const messaging = await messagingPromise;
      if (!messaging || !auth.currentUser || typeof Notification === 'undefined') return;

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
        console.warn('Error getting notification permission:', error);
      }

      // Listen for foreground messages
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload);
        if (payload.notification) {
          try {
            new Notification(payload.notification.title || 'New Message', {
              body: payload.notification.body,
              icon: '/logo.png'
            });
          } catch (e) {
            console.warn('Failed to show notification:', e);
          }
        }
      });
      return unsubscribe;
    };

    let unsubscribeFn: (() => void) | undefined;
    if (auth.currentUser) {
      initMessaging().then(unsub => {
        unsubscribeFn = unsub;
      });
    }

    return () => {
      if (unsubscribeFn) unsubscribeFn();
    };
  }, []);

  return null;
}
