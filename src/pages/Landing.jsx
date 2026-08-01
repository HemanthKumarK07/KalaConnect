import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Star, Shield, Award, BookOpen, Users, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import AnimatedCounter from '../components/AnimatedCounter';
import SectionReveal from '../components/SectionReveal';
import ProductCard from '../components/ProductCard';
import { featuredArtisans } from '../data/artisans';
import { featuredProducts } from '../data/products';
import { featuredCourses } from '../data/courses';
import './Landing.css';

const categories = [
  { name: 'Pottery', emoji: '🏺', description: 'Clay, ceramic & terracotta', gradient: 'linear-gradient(135deg, #D4B896, #8A6A4A)' },
  { name: 'Wood Craft', emoji: '🪵', description: 'Carving, inlay & lacquer', gradient: 'linear-gradient(135deg, #A8C4B8, #4F6958)' },
  { name: 'Jewelry', emoji: '💎', description: 'Tribal, temple & kundan', gradient: 'linear-gradient(135deg, #C9A66B, #8A6A4A)' },
  { name: 'Textiles', emoji: '🧵', description: 'Weaving, printing & dyeing', gradient: 'linear-gradient(135deg, #B8A8C4, #6B5C7A)' },
  { name: 'Bamboo', emoji: '🎋', description: 'Weaving, furniture & décor', gradient: 'linear-gradient(135deg, #A8BCC4, #4F6958)' },
  { name: 'Leather', emoji: '🎭', description: 'Puppetry, bags & footwear', gradient: 'linear-gradient(135deg, #C4A882, #5C4A35)' },
  { name: 'Paintings', emoji: '🎨', description: 'Madhubani, Warli & Pattachitra', gradient: 'linear-gradient(135deg, #C4B8A8, #7A6B5C)' },
  { name: 'Metal Craft', emoji: '⚒️', description: 'Bronze, brass & Bidriware', gradient: 'linear-gradient(135deg, #A8A8B8, #5C5C6B)' },
];

const timeline = [
  { step: '01', title: 'Raw Materials', desc: 'Artisans source natural, local materials — clay, wood, fibers, metals.' },
  { step: '02', title: 'Handcrafting', desc: 'Every piece is made by hand using techniques passed down through generations.' },
  { step: '03', title: 'Finishing', desc: 'Natural dyes, polishes, and finishes give each piece its unique character.' },
  { step: '04', title: 'Quality Check', desc: 'AI-assisted verification ensures authenticity. Admin approval required.' },
  { step: '05', title: 'Your Doorstep', desc: 'Carefully packaged and delivered directly from the artisan\'s workshop.' },
];

const testimonials = [
  {
    name: 'Ananya Krishnan',
    role: 'Interior Designer, Mumbai',
    text: 'KalaConnect transformed how I source handcrafted pieces for my projects. The quality and the stories behind each product make every purchase meaningful.',
    rating: 5,
  },
  {
    name: 'Dr. Rajesh Iyer',
    role: 'Cultural Anthropologist',
    text: 'This platform is doing what institutions have struggled to do for decades — making traditional crafts relevant and economically sustainable for artisans.',
    rating: 5,
  },
  {
    name: 'Meghna Reddy',
    role: 'Student, Bangalore',
    text: 'I completed the Madhubani course and it changed my perspective on Indian art. Learning directly from a master artisan was an incredible experience.',
    rating: 5,
  },
];

export default function Landing() {
  const { t } = useTranslation('landing');
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.97]);

  return (
    <div className="landing">
      {/* ======== HERO ======== */}
      <section ref={heroRef} className="hero">
        {/* Floating Particles */}
        <div className="hero__particles">
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className="hero__particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 15}s`,
                animationDuration: `${14 + Math.random() * 10}s`,
                width: `${1.5 + Math.random() * 3}px`,
                height: `${1.5 + Math.random() * 3}px`,
                opacity: 0.15 + Math.random() * 0.2,
              }}
            />
          ))}
        </div>

        <motion.div className="hero__content container" style={{ opacity: heroOpacity, y: heroY, scale: heroScale }}>
          <motion.div
            className="hero__label"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Shield size={13} />
            <span>{t('hero.badge')}</span>
          </motion.div>

          <motion.h1
            className="hero__title font-display"
            initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {t('hero.title').split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
          </motion.h1>

          <motion.p
            className="hero__subtitle"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {t('hero.subtitle').split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br className="hero__br-desktop" />}</span>)}
          </motion.p>

          <motion.div
            className="hero__actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <Link to="/marketplace">
              <Button variant="accent" size="lg" magnetic iconRight={<ArrowRight size={18} />}>
                {t('hero.exploreMarketplace')}
              </Button>
            </Link>
            <Link to="/academy">
              <Button variant="outline" size="lg" style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>
                <Play size={15} /> {t('hero.startLearning')}
              </Button>
            </Link>
          </motion.div>

          <motion.div
            className="hero__trust"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.3 }}
          >
            <div className="hero__trust-avatars">
              {['LD', 'MK', 'AK', 'RS', 'FB'].map((initials, i) => (
                <div key={i} className="hero__trust-avatar avatar avatar--sm" style={{ marginLeft: i > 0 ? '-8px' : 0 }}>
                  {initials}
                </div>
              ))}
            </div>
            <span className="hero__trust-text">
              {t('hero.trustedBy', { count: '10,000+' }).split('<strong>').map((part, i) => {
                if (i === 0) return part;
                const [bold, rest] = part.split('</strong>');
                return <span key={i}><strong>{bold}</strong>{rest}</span>;
              })}
            </span>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="hero__scroll"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          <div className="hero__scroll-line" />
        </motion.div>
      </section>

      {/* ======== STATISTICS ======== */}
      <section className="stats section--sm">
        <div className="container">
          <SectionReveal animation="fade-up" staggerChildren staggerDelay={0.1}>
            <div className="stats__grid">
              <div className="stats__item">
                <AnimatedCounter end={10000} suffix="+" className="stats__number" />
                <p className="stats__label">{t('stats.verifiedArtisans')}</p>
              </div>
              <div className="stats__item">
                <AnimatedCounter end={50} suffix="+" className="stats__number" />
                <p className="stats__label">{t('stats.traditionalCrafts')}</p>
              </div>
              <div className="stats__item">
                <AnimatedCounter end={200000} suffix="+" className="stats__number" />
                <p className="stats__label">{t('stats.handmadeProducts')}</p>
              </div>
              <div className="stats__item">
                <AnimatedCounter end={100000} suffix="+" className="stats__number" />
                <p className="stats__label">{t('stats.activeLearners')}</p>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ======== CATEGORIES ======== */}
      <section className="categories section">
        <div className="container">
          <SectionReveal animation="fade-up">
            <div className="categories__header">
              <span className="section-label">{t('categories.sectionLabel')}</span>
              <h2 className="categories__title font-display">
                {t('categories.title').split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
              </h2>
            </div>
          </SectionReveal>

          <div className="categories__scroll">
            {categories.map((cat, i) => (
              <SectionReveal key={cat.name} animation="scale" delay={i * 0.05}>
                <Link to={`/marketplace?cat=${cat.name.toLowerCase()}`} className="category-card">
                  <div className="category-card__icon" style={{ background: cat.gradient }}>
                    <span>{cat.emoji}</span>
                  </div>
                  <h3 className="category-card__name">{cat.name}</h3>
                  <p className="category-card__desc">{cat.description}</p>
                </Link>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ======== FEATURED PRODUCTS ======== */}
      <section className="featured section">
        <div className="container">
          <SectionReveal animation="fade-up">
            <div className="featured__header">
              <div>
                <span className="section-label">{t('featured.sectionLabel')}</span>
                <h2 className="featured__title font-display">{t('featured.title')}</h2>
              </div>
              <Link to="/marketplace" className="featured__view-all">
                {t('featured.viewAll')} <ArrowRight size={16} />
              </Link>
            </div>
          </SectionReveal>

          <div className="featured__grid">
            {featuredProducts.slice(0, 8).map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ======== MEET THE ARTISANS ======== */}
      <section className="artisans section" style={{ background: 'var(--color-bg-alt)' }}>
        <div className="container">
          <SectionReveal animation="fade-up">
            <div className="artisans__header">
              <span className="section-label">{t('artisans.sectionLabel')}</span>
              <h2 className="artisans__title font-display">
                {t('artisans.title').split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
              </h2>
              <p className="artisans__subtitle">
                {t('artisans.subtitle')}
              </p>
            </div>
          </SectionReveal>

          <div className="artisans__grid">
            {featuredArtisans.slice(0, 4).map((artisan, i) => (
              <SectionReveal key={artisan.id} animation="fade-up" delay={i * 0.1}>
                <div className="artisan-card">
                  <div className="artisan-card__avatar-wrap">
                    <div className="artisan-card__avatar avatar avatar--xl" style={{
                      background: [
                        'linear-gradient(135deg, #C9A66B, #8A6A4A)',
                        'linear-gradient(135deg, #4F6958, #3A5042)',
                        'linear-gradient(135deg, #8A6A4A, #5C4A35)',
                        'linear-gradient(135deg, #6B5C7A, #4A3F5C)',
                      ][i % 4]
                    }}>
                      {artisan.initials}
                    </div>
                    <div className="artisan-card__verified">
                      <Shield size={12} />
                    </div>
                  </div>
                  <h3 className="artisan-card__name">{artisan.name}</h3>
                  <p className="artisan-card__craft">{artisan.craft}</p>
                  <p className="artisan-card__village">{artisan.village}</p>
                  <p className="artisan-card__bio">{artisan.bio}</p>
                  <div className="artisan-card__stats">
                    <div>
                      <span className="font-mono">{artisan.experience}</span>
                      <span>{t('artisans.years')}</span>
                    </div>
                    <div>
                      <span className="font-mono">{artisan.products}</span>
                      <span>{t('artisans.products')}</span>
                    </div>
                    <div>
                      <span className="font-mono">{artisan.rating}</span>
                      <span>{t('artisans.rating')}</span>
                    </div>
                  </div>
                  {artisan.awards.length > 0 && (
                    <div className="artisan-card__award">
                      <Award size={13} />
                      <span>{artisan.awards[0]}</span>
                    </div>
                  )}
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ======== HOW IT'S MADE TIMELINE ======== */}
      <section className="timeline section">
        <div className="container">
          <SectionReveal animation="fade-up">
            <div className="timeline__header">
              <span className="section-label">{t('timeline.sectionLabel')}</span>
              <h2 className="timeline__title font-display">{t('timeline.title')}</h2>
            </div>
          </SectionReveal>

          <div className="timeline__track">
            {timeline.map((item, i) => (
              <SectionReveal key={i} animation="fade-up" delay={i * 0.1}>
                <div className="timeline__item">
                  <div className="timeline__step font-mono">{item.step}</div>
                  <div>
                    <h3 className="timeline__item-title">{item.title}</h3>
                    <p className="timeline__item-desc">{item.desc}</p>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ======== CRAFT ACADEMY PREVIEW ======== */}
      <section className="academy-preview section" style={{ background: 'var(--color-bg-alt)' }}>
        <div className="container">
          <SectionReveal animation="fade-up">
            <div className="academy-preview__header">
              <span className="section-label">
                <BookOpen size={12} /> {t('academy.sectionLabel')}
              </span>
              <h2 className="font-display" style={{ fontSize: 'var(--text-5xl)', marginBottom: 'var(--space-4)', letterSpacing: 'var(--tracking-tight)' }}>
                {t('academy.title')}
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', maxWidth: '560px', margin: '0 auto var(--space-10)' }}>
                {t('academy.subtitle')}
              </p>
            </div>
          </SectionReveal>

          <div className="academy-preview__grid">
            {featuredCourses.slice(0, 4).map((course, i) => (
              <SectionReveal key={course.id} animation="fade-up" delay={i * 0.08}>
                <Link to={`/academy/${course.id}`} className="course-preview-card card--glass" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', display: 'block', textDecoration: 'none', color: 'inherit' }} data-cursor="learn">
                  <div className="course-preview-card__image" style={{
                    background: [
                      'linear-gradient(135deg, #D4B896, #8A6A4A)',
                      'linear-gradient(135deg, #A8C4B8, #4F6958)',
                      'linear-gradient(135deg, #B8A8C4, #6B5C7A)',
                      'linear-gradient(135deg, #C4A882, #5C4A35)',
                    ][i % 4],
                  }}>
                    <span className="font-display" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--text-lg)', fontStyle: 'italic' }}>
                      {course.category}
                    </span>
                    <div className="course-preview-card__overlay">
                      <Play size={32} />
                    </div>
                  </div>
                  <div className="course-preview-card__content">
                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                      <span className="badge badge--accent">{course.difficulty}</span>
                      <span className="badge">{course.duration}</span>
                    </div>
                    <h3 className="course-preview-card__title">{course.shortTitle}</h3>
                    <p className="course-preview-card__instructor">by {course.instructor}</p>
                    <div className="course-preview-card__footer">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Star size={13} fill="#C9A66B" stroke="#C9A66B" />
                        <span className="font-mono" style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{course.rating}</span>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>({course.reviews})</span>
                      </div>
                      <span className="font-mono" style={{ fontWeight: 600, fontSize: 'var(--text-lg)' }}>
                        ₹{course.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </Link>
              </SectionReveal>
            ))}
          </div>

          <SectionReveal animation="fade-up" delay={0.3}>
            <div style={{ textAlign: 'center', marginTop: 'var(--space-10)' }}>
              <Link to="/academy">
                <Button variant="outline" size="lg" iconRight={<ArrowRight size={16} />}>
                  {t('academy.browseAll')}
                </Button>
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ======== TESTIMONIALS ======== */}
      <section className="testimonials section">
        <div className="container">
          <SectionReveal animation="fade-up">
            <div className="testimonials__header">
              <span className="section-label">{t('testimonials.sectionLabel')}</span>
              <h2 className="font-display" style={{ fontSize: 'var(--text-5xl)', letterSpacing: 'var(--tracking-tight)' }}>
                {t('testimonials.title')}
              </h2>
            </div>
          </SectionReveal>

          <div className="testimonials__grid">
            {testimonials.map((t, i) => (
              <SectionReveal key={i} animation="fade-up" delay={i * 0.1}>
                <div className="testimonial-card">
                  <div className="testimonial-card__stars">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} size={15} fill="#C9A66B" stroke="#C9A66B" />
                    ))}
                  </div>
                  <p className="testimonial-card__text">"{t.text}"</p>
                  <div className="testimonial-card__author">
                    <div className="avatar avatar--sm" style={{
                      background: ['linear-gradient(135deg, #C9A66B, #8A6A4A)', 'linear-gradient(135deg, #4F6958, #3A5042)', 'linear-gradient(135deg, #6B5C7A, #4A3F5C)'][i]
                    }}>
                      {t.name.split(' ').map(w => w[0]).join('')}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{t.name}</p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{t.role}</p>
                    </div>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ======== CTA ======== */}
      <section className="cta section--lg">
        <div className="container">
          <SectionReveal animation="scale">
            <div className="cta__card">
              <h2 className="cta__title font-display">
                {t('cta.title').split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
              </h2>
              <p className="cta__subtitle">
                {t('cta.subtitle')}
              </p>
              <div className="cta__actions">
                <Link to="/marketplace">
                  <Button variant="accent" size="lg" magnetic iconRight={<ArrowRight size={18} />}>
                    {t('cta.startExploring')}
                  </Button>
                </Link>
                <a href="#">
                  <Button variant="outline" size="lg" style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>
                    {t('cta.becomeArtisan')}
                  </Button>
                </a>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}
