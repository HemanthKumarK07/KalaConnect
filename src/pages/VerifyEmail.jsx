import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, XCircle, Loader2, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Logo from '../components/Logo';
import './Login.css';

const VerifyEmail = () => {
  const { t } = useTranslation('auth');
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/auth/verifyemail/${token}`);
        setStatus('success');
        setMessage(res.data.message);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed');
      }
    };
    verify();
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-bg-gradient"></div>
      <div className="auth-bg-overlay"></div>

      <div className="auth-card glass" style={{ textAlign: 'center' }}>
        <div className="auth-branding">
          <div className="auth-logo" style={{ display: 'flex', justifyContent: 'center' }}>
            <Logo variant="stacked" size="md" />
          </div>
          <p className="auth-tagline">
            {t('login.tagline')}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-6)' }}>
          <div style={{ background: 'rgba(201, 166, 107, 0.1)', padding: 'var(--space-4)', borderRadius: '50%' }}>
            {status === 'loading' && <Loader2 size={40} className="animate-spin" style={{ color: 'var(--color-accent)' }} />}
            {status === 'success' && <CheckCircle2 size={40} style={{ color: 'var(--color-success)' }} />}
            {status === 'error' && <XCircle size={40} style={{ color: 'var(--color-error)' }} />}
          </div>
        </div>

        <h2 className="auth-title">
          {status === 'loading' && t('verifyEmail.title')}
          {status === 'success' && t('verifyEmail.title')}
          {status === 'error' && 'Verification Failed'}
        </h2>

        <p className="auth-subtitle" style={{ marginBottom: 'var(--space-8)' }}>
          {status === 'loading' ? t('verifyEmail.verifying') : message}
        </p>

        {status !== 'loading' && (
          <Link to="/login" className="btn btn--accent" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center' }}>
            {t('verifyEmail.goToLogin')}
          </Link>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
