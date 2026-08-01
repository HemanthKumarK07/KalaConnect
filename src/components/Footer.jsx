import { Link } from 'react-router-dom';
import { ArrowUpRight, Globe, MessageCircle, Video, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SectionReveal from './SectionReveal';
import Logo from './Logo';
import './Footer.css';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="container">
        <SectionReveal animation="fade-up">
          <div className="footer__top">
            <div className="footer__brand">
              <Link to="/" className="footer__logo-link" style={{ textDecoration: 'none' }}>
                <Logo variant="horizontal" size="sm" />
              </Link>
              <p className="footer__tagline" style={{ whiteSpace: 'pre-line' }}>
                {t('footer.tagline')}
              </p>
              <div className="footer__socials">
                <a href="#" className="footer__social" aria-label="Social"><Globe size={18} /></a>
                <a href="#" className="footer__social" aria-label="Messages"><MessageCircle size={18} /></a>
                <a href="#" className="footer__social" aria-label="Video"><Video size={18} /></a>
                <a href="#" className="footer__social" aria-label="Email"><Mail size={18} /></a>
              </div>
            </div>

            <div className="footer__columns">
              <div className="footer__column">
                <h4 className="footer__column-title">{t('footer.explore')}</h4>
                <Link to="/marketplace" className="footer__link">{t('nav.marketplace')}</Link>
                <Link to="/academy" className="footer__link">{t('nav.academy')}</Link>
                <Link to="/community" className="footer__link">{t('nav.community')}</Link>
                <Link to="/ai-assistant" className="footer__link">{t('nav.aiAssistant')}</Link>
              </div>

              <div className="footer__column">
                <h4 className="footer__column-title">{t('footer.crafts')}</h4>
                <Link to="/marketplace?cat=pottery" className="footer__link">{t('footer.pottery')}</Link>
                <Link to="/marketplace?cat=textiles" className="footer__link">{t('footer.textiles')}</Link>
                <Link to="/marketplace?cat=woodcraft" className="footer__link">{t('footer.woodCraft')}</Link>
                <Link to="/marketplace?cat=paintings" className="footer__link">{t('footer.paintings')}</Link>
                <Link to="/marketplace?cat=metalcraft" className="footer__link">{t('footer.metalCraft')}</Link>
              </div>

              <div className="footer__column">
                <h4 className="footer__column-title">{t('footer.forArtisans')}</h4>
                <Link to="/dashboard" className="footer__link">{t('nav.dashboard')}</Link>
                <a href="#" className="footer__link">{t('footer.becomeArtisan')} <ArrowUpRight size={12} /></a>
                <a href="#" className="footer__link">{t('footer.sellOnKalaConnect')}</a>
                <a href="#" className="footer__link">{t('footer.teachCourse')}</a>
              </div>

              <div className="footer__column">
                <h4 className="footer__column-title">{t('footer.company')}</h4>
                <a href="#" className="footer__link">{t('footer.aboutUs')}</a>
                <a href="#" className="footer__link">{t('footer.ourMission')}</a>
                <a href="#" className="footer__link">{t('footer.impactReport')}</a>
                <a href="#" className="footer__link">{t('footer.contact')}</a>
              </div>
            </div>
          </div>
        </SectionReveal>

        <SectionReveal animation="fade-up" delay={0.15}>
          <div className="footer__newsletter">
            <div className="footer__newsletter-text">
              <h4 style={{ fontFamily: 'var(--font-hero)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
                {t('footer.newsletter.title')}
              </h4>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                {t('footer.newsletter.subtitle')}
              </p>
            </div>
            <div className="footer__newsletter-form">
              <input
                type="email"
                placeholder={t('footer.newsletter.placeholder')}
                className="input footer__newsletter-input"
              />
              <button className="btn btn--accent">{t('footer.newsletter.subscribe')}</button>
            </div>
          </div>
        </SectionReveal>

        <div className="footer__bottom">
          <p className="footer__copyright">
            {t('footer.copyright')}
          </p>
          <div className="footer__bottom-links">
            <a href="#">{t('footer.privacy')}</a>
            <a href="#">{t('footer.terms')}</a>
            <a href="#">{t('footer.accessibility')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
