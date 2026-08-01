import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, ShoppingBag, Heart, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import useCartStore from '../store/useCartStore';
import useAuthStore from '../store/useAuthStore';
import Logo from './Logo';
import './Navbar.css';

export default function Navbar() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const lastScrollY = useRef(0);

  const { getCartCount, openCart } = useCartStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/marketplace', label: t('nav.marketplace') },
    { path: '/academy', label: t('nav.academy') },
    { path: '/community', label: t('nav.community') },
    { path: '/dashboard', label: t('nav.dashboard') },
    { path: '/ai-assistant', label: t('nav.aiAssistant') },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      // Scrolled state (show glass bg)
      setScrolled(currentY > 60);

      // Hide/show on scroll direction
      if (currentY > lastScrollY.current && currentY > 200) {
        setHidden(true); // scrolling down
      } else {
        setHidden(false); // scrolling up
      }
      lastScrollY.current = currentY;

      // Progress bar
      const h = document.documentElement;
      const scrollTop = h.scrollTop || document.body.scrollTop;
      const scrollHeight = h.scrollHeight - h.clientHeight;
      setScrollProgress(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Close profile on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    if (showProfileMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    navigate('/login');
  };

  const navClass = [
    'navbar',
    scrolled ? 'navbar--scrolled' : '',
    hidden ? 'navbar--hidden' : '',
    isHome && !scrolled ? 'navbar--transparent' : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      <motion.nav
        className={navClass}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      >
        <div className="navbar__inner">
          <Link to="/" className="navbar__logo" style={{ textDecoration: 'none' }}>
            <Logo variant="horizontal" animated={true} size="sm" />
          </Link>

          <div className="navbar__links">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`navbar__link ${location.pathname === link.path ? 'navbar__link--active' : ''}`}
              >
                {link.label}
                {location.pathname === link.path && (
                  <motion.div
                    className="navbar__link-indicator"
                    layoutId="nav-indicator"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="navbar__actions">
            <button className="navbar__action-btn" aria-label={t('accessibility.search')}>
              <Search size={17} />
            </button>
            <button className="navbar__action-btn" aria-label={t('nav.wishlist')}>
              <Heart size={17} />
            </button>
            <button className="navbar__action-btn navbar__action-btn--cart" aria-label={t('accessibility.openCart')} onClick={openCart}>
              <ShoppingBag size={17} />
              {getCartCount() > 0 && (
                <span className="navbar__cart-count font-mono">{getCartCount()}</span>
              )}
            </button>

            {isAuthenticated ? (
              <div ref={profileMenuRef} style={{ position: 'relative' }}>
                <button className="navbar__action-btn navbar__action-btn--user" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                  <User size={17} />
                </button>
                {showProfileMenu && (
                  <div className="navbar__dropdown">
                    <p style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--color-border-light)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                      {user?.name}
                    </p>
                    {user?.role === 'admin' && <Link to="/admin" className="navbar__dropdown-item" onClick={() => setShowProfileMenu(false)}>{t('nav.adminConsole')}</Link>}
                    {user?.role === 'artisan' && <Link to="/dashboard" className="navbar__dropdown-item" onClick={() => setShowProfileMenu(false)}>{t('nav.artisanDashboard')}</Link>}
                    <button className="navbar__dropdown-item" onClick={handleLogout} style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none' }}>
                      {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="navbar__action-btn navbar__action-btn--user">
                <User size={17} />
              </Link>
            )}

            <LanguageSwitcher />
            <ThemeToggle />
            <button
              className="navbar__hamburger"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={t('accessibility.menu')}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <div className="navbar__progress">
          <motion.div
            className="navbar__progress-bar"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="mobile-menu__content"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="mobile-menu__links">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.15, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      to={link.path}
                      className={`mobile-menu__link ${location.pathname === link.path ? 'mobile-menu__link--active' : ''}`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
              <div className="mobile-menu__footer">
                <LanguageSwitcher variant="mobile" />
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)', marginTop: 'var(--space-4)' }}>
                  {t('footer.preservingHeritage')}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
