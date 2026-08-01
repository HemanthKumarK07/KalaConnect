import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth, googleProvider, isFirebaseConfigured } from '../config/firebase';
import { signInWithPopup, signInWithPhoneNumber } from 'firebase/auth';
import { logAuthError, getFriendlyErrorMessage } from '../utils/authErrors';

const API_BASE = 'http://localhost:5000/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isInitializing: true,

      login: async (email, password) => {
        try {
          const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const data = await res.json();
          if (!data.success) {
            throw new Error(data.message);
          }
          
          localStorage.setItem('token', data.token);
          set({ user: data.user, token: data.token, isAuthenticated: true });
          return data;
        } catch (error) {
          logAuthError({
            provider: 'Email/Password',
            funcName: 'login',
            error,
            details: { email }
          });
          throw error;
        }
      },

      signup: async (userData) => {
        try {
          const res = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
          });
          const data = await res.json();
          if (!data.success) {
            throw new Error(data.message);
          }
          return data;
        } catch (error) {
          logAuthError({
            provider: 'Email/Password',
            funcName: 'signup',
            error,
            details: { email: userData.email, role: userData.role }
          });
          throw error;
        }
      },

      loginWithGoogle: async (role = 'customer') => {
        if (!isFirebaseConfigured()) {
          const err = new Error('Firebase Google Authentication is not configured. Please paste your Firebase credentials into the .env file to enable it.');
          logAuthError({
            provider: 'Google',
            funcName: 'loginWithGoogle',
            error: err,
            details: { role }
          });
          throw err;
        }

        try {
          const result = await signInWithPopup(auth, googleProvider);
          const idToken = await result.user.getIdToken();
          
          const res = await fetch(`${API_BASE}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken, role })
          });
          
          const data = await res.json();
          if (!data.success) {
            throw new Error(data.message);
          }
          
          localStorage.setItem('token', data.token);
          set({ user: data.user, token: data.token, isAuthenticated: true });
          return data;
        } catch (error) {
          const friendlyMsg = getFriendlyErrorMessage(error);
          logAuthError({
            provider: 'Google',
            funcName: 'loginWithGoogle',
            error,
            details: { role }
          });
          throw new Error(friendlyMsg);
        }
      },

      verifyPhone: async (phoneNumber, appVerifier) => {
        if (!isFirebaseConfigured()) {
          const err = new Error('Firebase Phone Authentication is not configured. Please paste your Firebase credentials into the .env file to enable it.');
          logAuthError({
            provider: 'Phone',
            funcName: 'verifyPhone',
            error: err,
            details: { phoneNumber }
          });
          throw err;
        }

        try {
          const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
          return confirmationResult;
        } catch (error) {
          const friendlyMsg = getFriendlyErrorMessage(error);
          logAuthError({
            provider: 'Phone',
            funcName: 'verifyPhone',
            error,
            details: { phoneNumber }
          });
          throw new Error(friendlyMsg);
        }
      },

      confirmPhoneOTP: async (confirmationResult, code) => {
        if (!confirmationResult) {
          const err = new Error('No OTP transaction active. Send OTP first.');
          logAuthError({
            provider: 'Phone',
            funcName: 'confirmPhoneOTP',
            error: err
          });
          throw err;
        }

        try {
          const result = await confirmationResult.confirm(code);
          const idToken = await result.user.getIdToken();
          
          const res = await fetch(`${API_BASE}/auth/verifyphone`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${get().token}`
            },
            body: JSON.stringify({ idToken, phone: result.user.phoneNumber })
          });
          
          const data = await res.json();
          if (!data.success) {
            throw new Error(data.message);
          }

          set((state) => ({
            user: state.user ? { ...state.user, phone: result.user.phoneNumber, isPhoneVerified: true } : null
          }));
          return data;
        } catch (error) {
          const friendlyMsg = getFriendlyErrorMessage(error);
          logAuthError({
            provider: 'Phone',
            funcName: 'confirmPhoneOTP',
            error,
            details: { code }
          });
          throw new Error(friendlyMsg);
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateProfile: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),

      initializeAuth: async () => {
        const token = get().token || localStorage.getItem('token');
        if (!token) {
          set({ isInitializing: false, isAuthenticated: false, user: null, token: null });
          return;
        }

        try {
          const res = await fetch(`${API_BASE}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });

          if (!res.ok) throw new Error('Token invalid');

          const data = await res.json();
          if (data.success && data.user) {
            set({ user: data.user, token, isAuthenticated: true, isInitializing: false });
          } else {
            throw new Error('Invalid response');
          }
        } catch {
          localStorage.removeItem('token');
          set({ user: null, token: null, isAuthenticated: false, isInitializing: false });
        }
      },
    }),
    {
      name: 'kalaconnect-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
