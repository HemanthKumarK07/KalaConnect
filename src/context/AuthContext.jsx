import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { auth, googleProvider } from '../config/firebase';
import { signInWithPopup, signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { useToast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  // Load user from backend on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const res = await axios.get('http://localhost:5000/api/auth/me');
          setUser(res.data.user);
        } catch (error) {
          console.error('Failed to load user', error);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      setUser(res.data.user);
      
      toast.success('Welcome back to KalaConnect!');
      routeByRole(res.data.user.role);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to log in');
    }
  };

  const signup = async (userData) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', userData);
      toast.success(res.data.message);
      navigate('/login');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to sign up');
    }
  };

  const loginWithGoogle = async (role = 'customer') => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      const res = await axios.post('http://localhost:5000/api/auth/google', { idToken, role });
      
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      setUser(res.data.user);
      
      toast.success('Successfully logged in with Google!');
      routeByRole(res.data.user.role);
    } catch (error) {
      console.error(error);
      throw new Error(error.response?.data?.message || 'Google Sign-In failed');
    }
  };

  const verifyPhone = async (phoneNumber, appVerifier) => {
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      return confirmationResult;
    } catch (error) {
      throw new Error('Failed to send OTP code');
    }
  };

  const confirmPhoneOTP = async (confirmationResult, code) => {
    try {
      const result = await confirmationResult.confirm(code);
      const idToken = await result.user.getIdToken();
      
      const res = await axios.post('http://localhost:5000/api/auth/verifyphone', { idToken, phone: result.user.phoneNumber });
      
      // Update local user state
      setUser(prev => ({ ...prev, phone: result.user.phoneNumber, isPhoneVerified: true }));
      toast.success('Phone verified successfully!');
      return res.data;
    } catch (error) {
      throw new Error('Invalid OTP Code');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const routeByRole = (role) => {
    if (role === 'artisan') navigate('/dashboard');
    else if (role === 'admin') navigate('/admin');
    else navigate('/');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      signup,
      loginWithGoogle,
      verifyPhone,
      confirmPhoneOTP,
      logout
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
