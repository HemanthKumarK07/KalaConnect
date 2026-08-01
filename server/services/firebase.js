import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';
dotenv.config();

if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  try {
    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Handle escaped newlines in the private key string from .env
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      console.log('Firebase Admin Initialized successfully.');
    }
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error.message);
  }
} else {
  console.warn('⚠️ Firebase Admin credentials missing. Google Auth and Phone Verification will fail.');
}

export const verifyIdToken = async (idToken) => {
  if (!getApps().length) throw new Error('Firebase not initialized');
  return await getAuth().verifyIdToken(idToken);
};

