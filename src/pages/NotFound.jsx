import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import Logo from '../components/Logo';

export default function NotFound() {
  const { t } = useTranslation('common');
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-8)',
      textAlign: 'center',
      background: 'var(--color-bg)',
      color: 'var(--color-text-primary)'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <Logo variant="stacked" size="md" />
        </div>
        <h1 style={{ 
          fontFamily: 'var(--font-hero)', 
          fontSize: '120px', 
          lineHeight: 1,
          color: 'var(--color-accent)',
          marginBottom: 'var(--space-4)'
        }}>404</h1>
        <h2 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'var(--text-3xl)',
          marginBottom: 'var(--space-4)'
        }}>{t('errors.notFound')}</h2>
        <p style={{
          color: 'var(--color-text-secondary)',
          maxWidth: '400px',
          margin: '0 auto var(--space-8)',
          lineHeight: 'var(--leading-relaxed)'
        }}>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        <Link to="/">
          <Button variant="accent" size="lg">{t('nav.home')}</Button>
        </Link>
      </motion.div>
    </div>
  );
}
