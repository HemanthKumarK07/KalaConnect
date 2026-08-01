import React, { useState, useEffect } from 'react';
import { Phone, RefreshCw } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { useToast } from '../components/Toast';
import { RecaptchaVerifier } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../config/firebase';
import '../pages/Login.css';

const PhoneVerification = ({ onSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Input Phone, 2: Input OTP
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState(null);
  
  const { verifyPhone, confirmPhoneOTP } = useAuthStore();
  const toast = useToast();

  useEffect(() => {
    // Setup Recaptcha only if configured
    if (isFirebaseConfigured() && auth && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
      });
    }
  }, []);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOTP = async (e) => {
    e?.preventDefault();
    if (!isFirebaseConfigured()) {
      return toast.error('Phone authentication is not configured. Please check your Firebase settings in the .env file.');
    }
    if (!phoneNumber) return toast.error('Please enter a valid phone number');
    
    setIsLoading(true);
    try {
      const fullNumber = `${countryCode}${phoneNumber}`;
      const appVerifier = window.recaptchaVerifier;
      const result = await verifyPhone(fullNumber, appVerifier);
      setConfirmationResult(result);
      setStep(2);
      setCountdown(60);
      toast.success('OTP sent successfully!');
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return toast.error('Please enter a valid 6-digit OTP');
    
    setIsLoading(true);
    try {
      await confirmPhoneOTP(confirmationResult, otp);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error('Invalid OTP Code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card glass" style={{ maxWidth: '440px', margin: '0 auto' }}>
      <div className="auth-header" style={{ textAlign: 'center' }}>
        <Phone className="mx-auto mb-4" size={32} style={{ color: 'var(--color-accent)' }} />
        <h2 className="auth-title">Verify Phone Number</h2>
        <p className="auth-subtitle">Secure your account with phone verification</p>
      </div>

      <div id="recaptcha-container"></div>

      {step === 1 ? (
        <form className="auth-form" onSubmit={handleSendOTP}>
          <div className="form-group">
            <label>Phone Number</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <select 
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                style={{ 
                  padding: 'var(--space-3)', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1.5px solid var(--color-border)', 
                  background: 'var(--color-surface)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <option value="+91">+91 (IN)</option>
                <option value="+1">+1 (US)</option>
                <option value="+44">+44 (UK)</option>
              </select>
              <input
                type="tel"
                className="input"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="98765 43210"
                required
                style={{ flex: 1 }}
              />
            </div>
          </div>

          <button type="submit" className="btn btn--accent" style={{ width: '100%', padding: 'var(--space-3)' }} disabled={isLoading}>
            {isLoading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form className="auth-form" onSubmit={handleVerifyOTP}>
          <div className="form-group">
            <label style={{ textAlign: 'center' }}>Enter 6-digit OTP</label>
            <div className="otp-inputs">
              <input
                type="text"
                className="input otp-field"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••••"
                required
                maxLength={6}
              />
            </div>
          </div>

          <button type="submit" className="btn btn--accent" style={{ width: '100%', padding: 'var(--space-3)' }} disabled={isLoading || otp.length !== 6}>
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
            {countdown > 0 ? (
              <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)' }}>
                Resend OTP in {countdown}s
              </span>
            ) : (
              <button 
                type="button" 
                onClick={handleSendOTP}
                style={{ background: 'none', border: 'none', color: 'var(--color-accent)', fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--space-1)', margin: '0 auto' }}
              >
                <RefreshCw size={12} /> Resend OTP
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default PhoneVerification;
