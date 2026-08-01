import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBgqLbhxE_gGrGEHcoKahzYPUi6RTXMvTw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "kalaconnect-012b.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "kalaconnect-012b",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "kalaconnect-012b.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "26627308944",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:26627308944:web:6253ffad5c74bbc94d8715",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-9WE49RFHEX"
};

// Initialize Firebase safely
const hasPlaceholders = 
  !firebaseConfig.apiKey || 
  firebaseConfig.apiKey.includes('placeholder') || 
  firebaseConfig.apiKey.includes('your_') ||
  !firebaseConfig.authDomain ||
  firebaseConfig.authDomain.includes('placeholder');

let app;
let auth;
let googleProvider;

if (!hasPlaceholders) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.error('Firebase initialization failed:', error);
  }
} else {
  console.warn('⚠️ Firebase is running with placeholder credentials. Authentication will be disabled until configured.');
}

export { auth, googleProvider };
export const isFirebaseConfigured = () => !hasPlaceholders;
export default app;
