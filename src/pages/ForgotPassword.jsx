import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Sparkles, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useToast } from '../components/Toast';
import Logo from '../components/Logo';
import './Login.css';

const ForgotPassword = () => {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgotpassword', { email });
      toast.success(res.data.message);
      setEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
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
          <div className="auth-logo">
            <Logo variant="horizontal" size="md" />
          </div>
          <p className="auth-tagline">
            {t('login.tagline')}
          </p>
        </div>

        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-secondary)', textDecoration: 'none', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
          <ArrowLeft size={16} /> {t('forgotPassword.backToLogin')}
        </Link>

        <h2 className="auth-title">{t('forgotPassword.title')}</h2>
        <p className="auth-subtitle">{t('forgotPassword.subtitle')}</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('forgotPassword.email')}</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('forgotPassword.emailPlaceholder')}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn--accent" style={{ width: '100%', padding: 'var(--space-3)' }} disabled={isLoading || !email}>
            {isLoading ? t('forgotPassword.sending') : t('forgotPassword.sendResetLink')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
