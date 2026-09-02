import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Clock, BookOpen, Users, X, Star, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SectionReveal from '../components/SectionReveal';
import SkeletonLoader from '../components/SkeletonLoader';
import { sampleCourses } from '../data/courses';
import './Academy.css';

const API_BASE = 'http://localhost:5000/api';
const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const academyCategories = ['All', 'pottery', 'painting', 'textile', 'metalwork', 'woodwork'];

// ─── Self-contained Sample Courses Section ───────────────────────────────────
function SampleCoursesSection() {
  const [activeVideo, setActiveVideo] = useState(null); // { youtubeId, title }
  const [activeCourse, setActiveCourse] = useState(sampleCourses[0]);
  const [activeLesson, setActiveLesson] = useState(sampleCourses[0].curriculum[0].lessons[0]);

  const allLessons = activeCourse.curriculum.flatMap(s => s.lessons);

  const openVideo = (lesson) => {
    setActiveLesson(lesson);
    setActiveVideo({ youtubeId: lesson.youtubeId, title: lesson.title });
  };

  return (
    <section className="section" style={{ paddingTop: 'var(--space-16)' }}>
      <div className="container">
        <SectionReveal animation="fade-up">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <div>
              <span className="tag" style={{ marginBottom: 'var(--space-2)', display: 'inline-flex' }}>
                🎬 Free Sample Lessons
              </span>
              <h2 className="font-hero" style={{ fontSize: 'var(--text-4xl)', lineHeight: 'var(--leading-tight)' }}>
                Start Learning Today
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                Watch real craft lessons — no sign-up needed
              </p>
            </div>
          </div>
        </SectionReveal>

        {/* Course tabs */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
          {sampleCourses.map(c => (
            <button
              key={c.id}
              onClick={() => {
                setActiveCourse(c);
                setActiveLesson(c.curriculum[0].lessons[0]);
              }}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-full)',
                border: activeCourse.id === c.id ? '2px solid var(--color-accent)' : '2px solid var(--color-border)',
                background: activeCourse.id === c.id ? 'var(--color-accent)' : 'var(--glass-1)',
                color: activeCourse.id === c.id ? '#fff' : 'var(--color-text-secondary)',
                fontWeight: 600,
                fontSize: 'var(--text-sm)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {c.shortTitle}
            </button>
          ))}
        </div>

        {/* Player + Lesson List layout */}
        <SectionReveal animation="scale">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 340px',
            gap: 'var(--space-4)',
            background: 'var(--glass-1)',
            border: 'var(--glass-border)',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            backdropFilter: 'blur(20px)',
          }}>
            {/* Left: Video Preview + Info */}
            <div>
              {/* Thumbnail / video preview */}
              <div
                style={{
                  position: 'relative',
                  aspectRatio: '16/9',
                  background: activeCourse.thumbnailGradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden',
                }}
                onClick={() => openVideo(activeLesson)}
              >
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.35)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-3)',
                }}>
                  <motion.div
                    whileHover={{ scale: 1.12 }}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.18)',
                      border: '2px solid rgba(255,255,255,0.5)',
                      backdropFilter: 'blur(8px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Play size={32} fill="white" color="white" />
                  </motion.div>
                  <p style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, fontSize: 'var(--text-sm)', textAlign: 'center', padding: '0 var(--space-4)' }}>
                    {activeLesson.title}
                  </p>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'var(--text-xs)' }}>
                    Click to watch · {activeLesson.duration}
                  </span>
                </div>
              </div>

              {/* Course info below video */}
              <div style={{ padding: 'var(--space-5)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
                  <span className="badge badge--accent">{activeCourse.difficulty}</span>
                  <span className="badge">
                    <BookOpen size={11} style={{ marginRight: 4 }} />
                    {activeCourse.lessons} Lessons
                  </span>
                  <span className="badge">
                    <Users size={11} style={{ marginRight: 4 }} />
                    {activeCourse.students.toLocaleString()} students
                  </span>
                  <span className="badge" style={{ color: 'var(--color-accent)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <Star size={11} fill="currentColor" />
                    {activeCourse.rating}
                  </span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-2)', lineHeight: 'var(--leading-snug)' }}>
                  {activeCourse.title}
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
                  {activeCourse.description}
                </p>
                <p style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}>
                  By <strong style={{ color: 'var(--color-text-primary)' }}>{activeCourse.instructor}</strong>
                </p>
              </div>
            </div>

            {/* Right: Lesson list sidebar */}
            <div style={{
              borderLeft: '1px solid var(--color-border-light)',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <div style={{
                padding: 'var(--space-4) var(--space-4) var(--space-3)',
                borderBottom: '1px solid var(--color-border-light)',
                background: 'var(--glass-2)',
              }}>
                <p style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                  Course Lessons
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginTop: 2 }}>
                  {allLessons.length} free lessons · {activeCourse.totalHours}h total
                </p>
              </div>
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {activeCourse.curriculum.map((section) => (
                  <div key={section.title}>
                    <div style={{
                      padding: 'var(--space-2) var(--space-4)',
                      background: 'var(--glass-2)',
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: 'var(--tracking-widest)',
                      textTransform: 'uppercase',
                      color: 'var(--color-text-muted)',
                    }}>
                      {section.title}
                    </div>
                    {section.lessons.map((lesson, idx) => (
                      <button
                        key={lesson.id}
                        onClick={() => openVideo(lesson)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-3)',
                          padding: 'var(--space-3) var(--space-4)',
                          background: activeLesson.id === lesson.id ? 'rgba(201,166,107,0.12)' : 'transparent',
                          borderLeft: activeLesson.id === lesson.id ? '3px solid var(--color-accent)' : '3px solid transparent',
                          borderTop: 'none', borderRight: 'none', borderBottom: '1px solid var(--color-border-light)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.18s ease',
                        }}
                      >
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                          background: activeLesson.id === lesson.id ? 'var(--color-accent)' : 'var(--glass-3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Play size={12} fill={activeLesson.id === lesson.id ? '#fff' : 'currentColor'} color={activeLesson.id === lesson.id ? '#fff' : 'var(--color-text-muted)'} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            fontSize: 'var(--text-xs)', fontWeight: activeLesson.id === lesson.id ? 600 : 400,
                            color: activeLesson.id === lesson.id ? 'var(--color-accent)' : 'var(--color-text-primary)',
                            lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {lesson.title}
                          </p>
                          <p style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', marginTop: 2 }}>
                            <Clock size={9} style={{ display: 'inline', marginRight: 2, verticalAlign: 'middle' }} />
                            {lesson.duration}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionReveal>
      </div>

      {/* YouTube Modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveVideo(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(0,0,0,0.88)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 'var(--space-4)',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: 900,
                background: '#0a0a0a',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                boxShadow: '0 40px 120px rgba(0,0,0,0.8)',
              }}
            >
              {/* Modal header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: 'var(--space-3) var(--space-4)',
                background: '#111',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600, fontSize: 'var(--text-sm)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, paddingRight: 'var(--space-4)' }}>
                  🎬 {activeVideo.title}
                </p>
                <button
                  onClick={() => setActiveVideo(null)}
                  style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
              {/* YouTube iframe */}
              <div style={{ position: 'relative', paddingBottom: '56.25%' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0`}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function Academy() {
  const { t } = useTranslation('academy');
  const [selectedDiff, setSelectedDiff] = useState('All');
  const [selectedCat, setSelectedCat] = useState('All');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${API_BASE}/academy/playlists`);
        const data = await res.json();
        if (data.success) {
          setCourses(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filtered = courses.filter(c => {
    if (selectedDiff !== 'All' && c.difficulty !== selectedDiff) return false;
    if (selectedCat !== 'All' && c.category !== selectedCat) return false;
    return true;
  });

  const featuredCourse = courses.length > 0 ? courses[0] : null;

  if (loading) {
    return <div className="academy-page" style={{ minHeight: '100vh', paddingTop: '120px' }}>
      <div className="container"><SkeletonLoader type="card" style={{ height: '400px' }} /></div>
    </div>;
  }

  return (
    <div className="academy-page">
      {/* Hero */}
      <section className="academy-hero">
        <div className="academy-hero__bg" />
        <div className="container academy-hero__content">
          <SectionReveal animation="fade-up">
            <span className="tag" style={{ marginBottom: 'var(--space-4)', display: 'inline-flex', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>
              <BookOpen size={12} /> {t('hero.tag')}
            </span>
            <h1 className="academy-hero__title font-hero">
              Master the Heritage<br/>Crafts of India
            </h1>
            <p className="academy-hero__subtitle">
              Learn directly from master artisans. Support their communities while acquiring authentic traditional skills.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* ── Sample Courses with Video Player ── */}
      <SampleCoursesSection />

      {/* Featured Course */}
      {featuredCourse && (
        <section className="section" style={{ marginTop: '-60px', position: 'relative', zIndex: 1 }}>
          <div className="container">
            <SectionReveal animation="scale">
              <Link to={`/academy/${featuredCourse._id}`} className="academy-featured-card">
                <div className="academy-featured-card__image" style={{ 
                  backgroundImage: featuredCourse.thumbnail?.url ? `url(${featuredCourse.thumbnail.url})` : 'none',
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  background: !featuredCourse.thumbnail?.url ? 'linear-gradient(135deg, #D4B896, #8A6A4A)' : undefined
                }}>
                  <div className="academy-featured-card__play"><Play size={32} /></div>
                  <span className="font-hero" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'var(--text-xl)', fontStyle: 'italic', position: 'absolute', bottom: 'var(--space-4)', left: 'var(--space-5)' }}>Featured Course</span>
                </div>
                <div className="academy-featured-card__content">
                  <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                    <span className="badge badge--accent">{featuredCourse.difficulty}</span>
                    <span className="badge">{Math.round((featuredCourse.totalDuration || 0) / 60)} mins</span>
                    <span className="badge">{t('course.lessons', { count: featuredCourse.totalLessons })}</span>
                  </div>
                  <h2 className="font-hero" style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-3)', lineHeight: 'var(--leading-snug)' }}>
                    {featuredCourse.title}
                  </h2>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-4)' }}>
                    {featuredCourse.description?.slice(0, 180)}...
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div className="avatar avatar--sm" style={{ background: 'linear-gradient(135deg, #C9A66B, #8A6A4A)' }}>
                      {featuredCourse.artisanId?.initials || 'A'}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{featuredCourse.artisanId?.name}</p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                        {featuredCourse.artisanId?.craft}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </SectionReveal>
          </div>
        </section>
      )}

      {/* Course Grid */}
      <section className="section">
        <div className="container">
          <SectionReveal animation="fade-up">
            <h2 className="font-hero" style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-6)' }}>
              {t('filters.allCourses')}
            </h2>
          </SectionReveal>

          <div className="academy-filters">
            <div className="academy-filter-group">
              {difficulties.map(d => (
                <button key={d} className={`marketplace-cat-pill ${selectedDiff === d ? 'active' : ''}`} onClick={() => setSelectedDiff(d)}>
                  {d}
                </button>
              ))}
            </div>
            <div className="academy-filter-group">
              {academyCategories.map(c => (
                <button key={c} className={`marketplace-cat-pill ${selectedCat === c ? 'active' : ''}`} onClick={() => setSelectedCat(c)}>
                  {c === 'All' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="academy-grid">
            {filtered.map((course, i) => (
              <SectionReveal key={course._id} animation="fade-up" delay={i * 0.06}>
                <Link to={`/academy/${course._id}`} className="course-card card">
                  <div className="course-card__image" style={{
                    backgroundImage: course.thumbnail?.url ? `url(${course.thumbnail.url})` : 'none',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    backgroundColor: !course.thumbnail?.url ? '#8A6A4A' : undefined
                  }}>
                    <div className="course-card__play"><Play size={24} /></div>
                  </div>
                  <div className="course-card__content">
                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                      <span className="badge badge--accent">{course.difficulty}</span>
                    </div>
                    <h3 className="course-card__title">{course.title}</h3>
                    <p className="course-card__instructor">By {course.artisanId?.name}</p>
                    <div className="course-card__meta">
                      <span><Clock size={13} /> {Math.round((course.totalDuration || 0) / 60)}m</span>
                      <span><BookOpen size={13} /> {t('course.lessons', { count: course.totalLessons })}</span>
                      <span><Users size={13} /> {course.enrolledStudents}</span>
                    </div>
                  </div>
                </Link>
              </SectionReveal>
            ))}
            
            {filtered.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-12) 0', color: 'var(--color-text-tertiary)' }}>
                No courses found matching your filters.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
