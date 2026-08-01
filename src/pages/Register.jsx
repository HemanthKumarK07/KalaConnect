import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sparkles, User, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/useAuthStore';
import { FcGoogle } from 'react-icons/fc';
import { useToast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import './Login.css';

const Register = () => {
  const { t } = useTranslation('auth');
  const [formData, setFormData] = useState({ 
    name: '', email: '', phone: '', password: '', role: 'customer' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signup, loginWithGoogle } = useAuthStore();
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateStrength = (password) => {
    let score = 0;
    if (password.length > 6) score += 1;
    if (password.length > 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return Math.min(4, score);
  };

  const strength = calculateStrength(formData.password);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#16a34a'];

  const routeByRole = (role) => {
    if (role === 'artisan') navigate('/dashboard');
    else if (role === 'admin') navigate('/admin');
    else navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await signup(formData);
      toast.success(data.message);
      navigate('/login');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const data = await loginWithGoogle(formData.role);
      toast.success(t('login.googleSuccess'));
      routeByRole(data.user.role);
    } catch (error) {
      toast.error(error.message);
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

        <h2 className="auth-title">{t('register.title')}</h2>
        <p className="auth-subtitle">{t('register.subtitle')}</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('register.role')}</label>
            <div className="role-selector">
              <div 
                className={`role-card ${formData.role === 'customer' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'customer' })}
              >
                <div className="role-card__circle">
                  {formData.role === 'customer' && <div className="role-card__dot" />}
                </div>
                <span className="role-card__label">Customer</span>
              </div>
              <div 
                className={`role-card ${formData.role === 'artisan' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'artisan' })}
              >
                <div className="role-card__circle">
                  {formData.role === 'artisan' && <div className="role-card__dot" />}
                </div>
                <span className="role-card__label">Artisan</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>{t('register.name')}</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input 
                type="text" 
                name="name" 
                className="input"
                value={formData.name} 
                onChange={handleChange} 
                placeholder={t('register.namePlaceholder')} 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>{t('register.email')}</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input 
                type="email" 
                name="email" 
                className="input"
                value={formData.email} 
                onChange={handleChange} 
                placeholder={t('register.emailPlaceholder')} 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>{t('register.phone')}</label>
            <div className="input-wrapper">
              <Phone className="input-icon" size={18} />
              <input 
                type="tel" 
                name="phone" 
                className="input"
                value={formData.phone} 
                onChange={handleChange} 
                placeholder={t('register.phonePlaceholder')} 
              />
            </div>
          </div>

          <div className="form-group">
            <label>{t('register.password')}</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                name="password" 
                className="input"
                value={formData.password} 
                onChange={handleChange} 
                placeholder="••••••••" 
                required 
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {formData.password && (
              <div className="password-strength">
                <div className="strength-bars">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="strength-bar" style={{ background: index < strength ? strengthColors[strength] : 'var(--color-border-light)' }}></div>
                  ))}
                </div>
                <div className="strength-text" style={{ color: strengthColors[strength] }}>
                  {strengthLabels[strength]}
                </div>
              </div>
            )}
          </div>

          <button type="submit" className="btn btn--accent" style={{ width: '100%', padding: 'var(--space-3)' }} disabled={isLoading || strength < 1}>
            {isLoading ? t('register.creatingAccount') : t('register.signUp')}
          </button>
        </form>

        <div className="divider" style={{ margin: 'var(--space-6) 0' }}></div>

        <button type="button" className="btn btn--outline google-auth-btn" onClick={handleGoogleSignup}>
          <FcGoogle size={20} />
          <span>{t('register.continueWithGoogle')}</span>
        </button>

        <div className="auth-redirect">
          <span>{t('register.alreadyHaveAccount')}</span>
          <Link to="/login">{t('register.signIn')}</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
