import admin from 'firebase-admin';

// In a real app, you would use a service account key
// For now, we use the project ID if running in a Google environment
// or you can provide the service account JSON in an env var
if (!admin.apps.length) {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : null;

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      console.warn('FIREBASE_SERVICE_ACCOUNT not found. Notifications will not work.');
    }
    console.log('Firebase Admin initialized');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

export default admin;
