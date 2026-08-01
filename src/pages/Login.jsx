import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/useAuthStore';
import { FcGoogle } from 'react-icons/fc';
import { useToast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import './Login.css';

const Login = () => {
  const { t } = useTranslation('auth');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithGoogle } = useAuthStore();
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const routeByRole = (role) => {
    if (role === 'artisan') navigate('/dashboard');
    else if (role === 'admin') navigate('/admin');
    else navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await login(formData.email, formData.password);
      toast.success(t('login.welcomeBack'));
      routeByRole(data.user.role);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (isGoogleLoading) return;
    setIsGoogleLoading(true);
    try {
      const data = await loginWithGoogle();
      toast.success(t('login.googleSuccess'));
      routeByRole(data.user.role);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsGoogleLoading(false);
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

        <h2 className="auth-title">{t('login.title')}</h2>
        <p className="auth-subtitle">{t('login.subtitle')}</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('login.email')}</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                name="email"
                className="input"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('login.emailPlaceholder')}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>{t('login.password')}</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="input"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('login.passwordPlaceholder')}
                required
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="auth-options">
            <label className="auth-checkbox-label">
              <input type="checkbox" />
              <span>{t('login.rememberMe')}</span>
            </label>
            <Link to="/forgot-password" className="forgot-password-link">{t('login.forgotPassword')}</Link>
          </div>

          <button type="submit" className="btn btn--accent" style={{ width: '100%', padding: 'var(--space-3)' }} disabled={isLoading}>
            {isLoading ? t('login.signingIn') : t('login.signIn')}
          </button>
        </form>

        <div className="divider" style={{ margin: 'var(--space-6) 0' }}></div>

        <button type="button" className="btn btn--outline google-auth-btn" onClick={handleGoogleLogin} disabled={isGoogleLoading}>
          <FcGoogle size={20} />
          <span>{isGoogleLoading ? t('login.connectingGoogle') : t('login.continueWithGoogle')}</span>
        </button>

        <div className="auth-redirect">
          <span>{t('login.newToKalaConnect')}</span>
          <Link to="/register">{t('login.createAccount')}</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
