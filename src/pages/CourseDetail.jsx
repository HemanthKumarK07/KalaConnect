import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Star, Clock, BookOpen, Users, Award, ArrowLeft, CheckCircle, FileText, HelpCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SectionReveal from '../components/SectionReveal';
import Button from '../components/Button';
import SkeletonLoader from '../components/SkeletonLoader';
import { useState, useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';
import './CourseDetail.css';

const API_BASE = 'http://localhost:5000/api';

export default function CourseDetail() {
  const { t } = useTranslation(['academy', 'common']);
  const { id } = useParams();
  const { user } = useAuthStore();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openSection, setOpenSection] = useState(0);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`${API_BASE}/academy/playlists/${id}`);
        const data = await res.json();
        if (data.success) {
          setCourse(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch course details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  if (loading) {
    return (
      <div className="course-detail-page" style={{ minHeight: '100vh', paddingTop: '120px' }}>
        <div className="container"><SkeletonLoader type="card" style={{ height: '400px' }} /></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-detail-page" style={{ paddingTop: 'calc(var(--nav-height) + var(--space-20))', textAlign: 'center' }}>
        <div className="container"><h2>{t('common:errors.notFound')}</h2><Link to="/academy"><Button variant="outline" style={{ marginTop: 'var(--space-4)' }}>{t('common:buttons.back')}</Button></Link></div>
      </div>
    );
  }

  const artisan = course.artisanId;
  const totalLessons = course.lessons?.length || 0;

  return (
    <div className="course-detail-page">
      {/* Hero */}
      <section className="cd-hero">
        <div className="cd-hero__bg" style={{ 
          backgroundImage: course.thumbnail?.url ? `url(${course.thumbnail.url})` : 'none',
          opacity: 0.15 
        }} />
        <div className="container cd-hero__content">
          <Link to="/academy" className="cd-back"><ArrowLeft size={16} /> {t('common:buttons.back')}</Link>
          <SectionReveal animation="fade-up">
            <div className="cd-hero__layout">
              <div className="cd-hero__info">
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                  <span className="badge badge--accent">{course.difficulty}</span>
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}>
                    {Math.round((course.totalDuration || 0) / 60)} mins
                  </span>
                  {course.language && <span className="badge">{course.language}</span>}
                </div>
                <h1 className="cd-hero__title font-hero">{course.title}</h1>
                <p className="cd-hero__desc">{course.description}</p>
                <div className="cd-hero__meta">
                  <span><Users size={14} /> {course.enrolledStudents} students</span>
                  <span><Clock size={14} /> {Math.round((course.totalDuration || 0) / 60)} mins total</span>
                  <span><BookOpen size={14} /> {t('academy:course.lessons', { count: totalLessons })}</span>
                </div>
                <div className="cd-hero__instructor">
                  <div className="avatar" style={{ background: 'linear-gradient(135deg, #C9A66B, #8A6A4A)' }}>{artisan?.initials}</div>
                  <div>
                    <p style={{ fontWeight: 600 }}>{artisan?.name}</p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.5)' }}>{artisan?.craft} • {artisan?.village}</p>
                  </div>
                </div>
              </div>
              <div className="cd-hero__cta-card">
                <div className="cd-hero__video-preview" style={{ 
                  background: course.thumbnail?.url ? `url(${course.thumbnail.url})` : 'linear-gradient(135deg, #D4B896, #8A6A4A)',
                  backgroundSize: 'cover', backgroundPosition: 'center'
                }}>
                  <div className="cd-hero__play"><Play size={32} /></div>
                </div>
                <div className="cd-hero__cta-content">
                  <Link to={`/academy/${course._id}/learn`}>
                    <Button variant="accent" size="lg" style={{ width: '100%' }}>{t('academy:course.enrollNow')}</Button>
                  </Link>
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Curriculum */}
      <section className="section" style={{ background: 'var(--color-surface)' }}>
        <div className="container">
          <SectionReveal animation="fade-up">
            <h2 className="font-hero" style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>Course Content</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-8)' }}>{t('academy:course.lessons', { count: totalLessons })} • {Math.round((course.totalDuration || 0) / 60)} mins total</p>
          </SectionReveal>

          <div className="cd-curriculum">
            <SectionReveal animation="fade-up">
              <div className="cd-section">
                <button className="cd-section__header" onClick={() => setOpenSection(openSection === 0 ? -1 : 0)}>
                  <div>
                    <h3 className="cd-section__title">All Lessons</h3>
                  </div>
                  <motion.div animate={{ rotate: openSection === 0 ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={18} />
                  </motion.div>
                </button>
                {openSection === 0 && (
                  <motion.div className="cd-section__lessons" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} transition={{ duration: 0.3 }}>
                    {course.lessons?.map((lesson, li) => (
                      <div key={lesson._id} className="cd-lesson">
                        <span className="cd-lesson__icon"><Play size={14} /></span>
                        <span className="cd-lesson__title">
                          <span className="font-number" style={{ marginRight: 'var(--space-2)', color: 'var(--color-text-tertiary)' }}>
                            {(li + 1).toString().padStart(2, '0')}
                          </span>
                          {lesson.title}
                        </span>
                        <span className="cd-lesson__duration font-number">{Math.round((lesson.video?.duration || 0) / 60)}m</span>
                      </div>
                    ))}
                    {(!course.lessons || course.lessons.length === 0) && (
                      <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-tertiary)' }}>No lessons available.</div>
                    )}
                  </motion.div>
                )}
              </div>
            </SectionReveal>
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
                  <p style={{ color: 'var(--color-accent)', fontWeight: 500, marginBottom: 'var(--space-3)' }}>{artisan.craft} • {artisan.district}, {artisan.state}</p>
                  <p style={{ color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>{artisan.story || "A master artisan passionate about preserving traditional Indian crafts."}</p>
                </div>
              </div>
            </SectionReveal>
          </div>
        </section>
      )}
    </div>
  );
}
