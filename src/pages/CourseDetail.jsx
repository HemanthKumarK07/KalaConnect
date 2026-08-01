import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Star, Clock, BookOpen, Users, Award, ArrowLeft, CheckCircle, FileText, HelpCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SectionReveal from '../components/SectionReveal';
import Button from '../components/Button';
import { getCourseById } from '../data/courses';
import { getArtisanById } from '../data/artisans';
import { useState } from 'react';
import './CourseDetail.css';

export default function CourseDetail() {
  const { t } = useTranslation(['academy', 'common']);
  const { id } = useParams();
  const course = getCourseById(id);
  const [openSection, setOpenSection] = useState(0);

  if (!course) {
    return (
      <div className="course-detail-page" style={{ paddingTop: 'calc(var(--nav-height) + var(--space-20))', textAlign: 'center' }}>
        <div className="container"><h2>{t('common:errors.notFound')}</h2><Link to="/academy"><Button variant="outline" style={{ marginTop: 'var(--space-4)' }}>{t('common:buttons.back')}</Button></Link></div>
      </div>
    );
  }

  const artisan = getArtisanById(course.instructorId);
  const totalLessons = course.curriculum.reduce((sum, s) => sum + s.lessons.length, 0);

  const typeIcon = (type) => {
    switch(type) {
      case 'video': return <Play size={14} />;
      case 'assignment': return <FileText size={14} />;
      case 'quiz': return <HelpCircle size={14} />;
      default: return <Play size={14} />;
    }
  };

  return (
    <div className="course-detail-page">
      {/* Hero */}
      <section className="cd-hero">
        <div className="cd-hero__bg" />
        <div className="container cd-hero__content">
          <Link to="/academy" className="cd-back"><ArrowLeft size={16} /> {t('common:buttons.back')}</Link>
          <SectionReveal animation="fade-up">
            <div className="cd-hero__layout">
              <div className="cd-hero__info">
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                  <span className="badge badge--accent">{course.difficulty}</span>
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}>{course.duration}</span>
                </div>
                <h1 className="cd-hero__title font-hero">{course.title}</h1>
                <p className="cd-hero__desc">{course.description}</p>
                <div className="cd-hero__meta">
                  <span><Star size={14} fill="#C9A66B" stroke="#C9A66B" /> <strong className="font-number">{course.rating}</strong> ({course.reviews} {t('academy:course.reviews').toLowerCase()})</span>
                  <span><Users size={14} /> {t('academy:course.students', { count: course.students })}</span>
                  <span><Clock size={14} /> {course.totalHours}h total</span>
                  <span><BookOpen size={14} /> {t('academy:course.lessons', { count: totalLessons })}</span>
                </div>
                <div className="cd-hero__instructor">
                  <div className="avatar" style={{ background: 'linear-gradient(135deg, #C9A66B, #8A6A4A)' }}>{artisan?.initials}</div>
                  <div>
                    <p style={{ fontWeight: 600 }}>{course.instructor}</p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.5)' }}>{artisan?.craft} • {artisan?.village}</p>
                  </div>
                </div>
              </div>
              <div className="cd-hero__cta-card">
                <div className="cd-hero__video-preview" style={{ background: 'linear-gradient(135deg, #D4B896, #8A6A4A)' }}>
                  <div className="cd-hero__play"><Play size={32} /></div>
                </div>
                <div className="cd-hero__cta-content">
                  <div className="cd-hero__price">
                    <span className="font-number" style={{ fontSize: 'var(--text-3xl)', fontWeight: 700 }}>₹{course.price.toLocaleString()}</span>
                    <span className="font-number" style={{ fontSize: 'var(--text-base)', textDecoration: 'line-through', color: 'var(--color-text-tertiary)' }}>₹{course.originalPrice.toLocaleString()}</span>
                  </div>
                  <Link to={`/academy/${course.id}/learn`}>
                    <Button variant="accent" size="lg" style={{ width: '100%' }}>{t('academy:course.enrollNow')}</Button>
                  </Link>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', textAlign: 'center', marginTop: 'var(--space-2)' }}>30-day money-back guarantee</p>
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* What You Learn */}
      <section className="section">
        <div className="container">
          <SectionReveal animation="fade-up">
            <h2 className="font-hero" style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-6)' }}>{t('academy:course.whatYouLearn')}</h2>
            <div className="cd-learn-grid">
              {course.whatYouLearn.map((item, i) => (
                <motion.div key={i} className="cd-learn-item" initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                  <CheckCircle size={18} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                  <span>{item}</span>
                </motion.div>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Curriculum */}
      <section className="section" style={{ background: 'var(--color-surface)' }}>
        <div className="container">
          <SectionReveal animation="fade-up">
            <h2 className="font-hero" style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>{t('academy:course.curriculum')}</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-8)' }}>{course.curriculum.length} sections • {t('academy:course.lessons', { count: totalLessons })} • {course.totalHours} hours total</p>
          </SectionReveal>

          <div className="cd-curriculum">
            {course.curriculum.map((section, si) => (
              <SectionReveal key={si} animation="fade-up" delay={si * 0.06}>
                <div className="cd-section">
                  <button className="cd-section__header" onClick={() => setOpenSection(openSection === si ? -1 : si)}>
                    <div>
                      <h3 className="cd-section__title">{section.title}</h3>
                      <span className="cd-section__meta">{t('academy:course.lessons', { count: section.lessons.length })}</span>
                    </div>
                    <motion.div animate={{ rotate: openSection === si ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown size={18} />
                    </motion.div>
                  </button>
                  {openSection === si && (
                    <motion.div className="cd-section__lessons" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} transition={{ duration: 0.3 }}>
                      {section.lessons.map((lesson, li) => (
                        <div key={lesson.id} className="cd-lesson">
                          <span className="cd-lesson__icon">{typeIcon(lesson.type)}</span>
                          <span className="cd-lesson__title">{lesson.title}</span>
                          <span className="cd-lesson__type tag">{lesson.type}</span>
                          <span className="cd-lesson__duration font-number">{lesson.duration}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Instructor */}
      {artisan && (
        <section className="section">
          <div className="container">
            <SectionReveal animation="fade-up">
              <h2 className="font-hero" style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-8)' }}>{t('academy:course.instructor')}</h2>
              <div className="cd-instructor">
                <div className="cd-instructor__avatar avatar avatar--xl" style={{ background: 'linear-gradient(135deg, #C9A66B, #8A6A4A)' }}>{artisan.initials}</div>
                <div className="cd-instructor__info">
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 600 }}>{artisan.name}</h3>
                  <p style={{ color: 'var(--color-accent)', fontWeight: 500, marginBottom: 'var(--space-3)' }}>{artisan.craft} • {artisan.experience} years experience</p>
                  <p style={{ color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>{artisan.story}</p>
                  {artisan.awards.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-4)', color: 'var(--color-accent)', fontSize: 'var(--text-sm)' }}>
                      <Award size={16} /> {artisan.awards[0]}
                    </div>
                  )}
                </div>
              </div>
            </SectionReveal>
          </div>
        </section>
      )}
    </div>
  );
}
