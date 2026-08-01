import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useToast } from '../components/Toast';
import Logo from '../components/Logo';
import './Login.css';

const ResetPassword = () => {
  const { t } = useTranslation('auth');
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error(t('validation.passwordMismatch'));
    }
    
    setIsLoading(true);
    try {
      const res = await axios.put(`http://localhost:5000/api/auth/resetpassword/${token}`, { password });
      toast.success(res.data.message);
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-gradient"></div>
      <div className="auth-bg-overlay"></div>

      <div className="auth-card glass">
        <div className="auth-branding">
          <div className="auth-logo" style={{ display: 'flex', justifyContent: 'center' }}>
            <Logo variant="stacked" size="md" />
          </div>
          <p className="auth-tagline">
            {t('login.tagline')}
          </p>
        </div>

        <h2 className="auth-title">{t('resetPassword.title')}</h2>
        <p className="auth-subtitle">{t('resetPassword.subtitle')}</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('resetPassword.newPassword')}</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>{t('resetPassword.confirmPassword')}</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          <button type="submit" className="btn btn--accent" style={{ width: '100%', padding: 'var(--space-3)' }} disabled={isLoading || !password || password !== confirmPassword}>
            {isLoading ? t('resetPassword.resetting') : t('resetPassword.resetPassword')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
