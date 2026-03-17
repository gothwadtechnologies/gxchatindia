importScripts('https://www.gstatic.com/firebasejs/10.10.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.10.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAeY_ZPOqrdmnnzpKR1DhYQYGioiPCbvws",
  authDomain: "gxchatindia.firebaseapp.com",
  projectId: "gxchatindia",
  messagingSenderId: "709776621586",
  appId: "1:709776621586:web:39f0f3f49eb74dc37458cb"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
