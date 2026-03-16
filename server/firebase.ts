import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAeY_ZPOqrdmnnzpKR1DhYQYGioiPCbvws",
  authDomain: "gxchatindia.firebaseapp.com",
  databaseURL: "https://gxchatindia-default-rtdb.firebaseio.com",
  projectId: "gxchatindia",
  storageBucket: "gxchatindia.firebasestorage.app",
  messagingSenderId: "709776621586",
  appId: "1:709776621586:web:39f0f3f49eb74dc37458cb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

export default app;
