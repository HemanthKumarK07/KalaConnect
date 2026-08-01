import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Star, Clock, BookOpen, Users, Award, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SectionReveal from '../components/SectionReveal';
import Button from '../components/Button';
import { courses, featuredCourses } from '../data/courses';
import { getArtisanById } from '../data/artisans';
import './Academy.css';

const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const academyCategories = ['All', 'pottery', 'painting', 'textile', 'metalwork', 'woodwork'];

export default function Academy() {
  const { t } = useTranslation('academy');
  const [selectedDiff, setSelectedDiff] = useState('All');
  const [selectedCat, setSelectedCat] = useState('All');

  const filtered = courses.filter(c => {
    if (selectedDiff !== 'All' && c.difficulty !== selectedDiff) return false;
    if (selectedCat !== 'All' && c.category !== selectedCat) return false;
    return true;
  });

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
              {t('hero.title').split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
            </h1>
            <p className="academy-hero__subtitle">
              {t('hero.subtitle')}
            </p>
            <div className="academy-hero__stats">
              <div><span className="font-number">8+</span><span>Courses</span></div>
              <div><span className="font-number">120+</span><span>Lessons</span></div>
              <div><span className="font-number">10,000+</span><span>Learners</span></div>
              <div><span className="font-number">4.8</span><span>Avg Rating</span></div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Featured Course */}
      <section className="section" style={{ marginTop: '-60px', position: 'relative', zIndex: 1 }}>
        <div className="container">
          <SectionReveal animation="scale">
            <Link to={`/academy/${featuredCourses[0].id}`} className="academy-featured-card">
              <div className="academy-featured-card__image" style={{ background: 'linear-gradient(135deg, #D4B896, #8A6A4A)' }}>
                <div className="academy-featured-card__play"><Play size={32} /></div>
                <span className="font-hero" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'var(--text-xl)', fontStyle: 'italic', position: 'absolute', bottom: 'var(--space-4)', left: 'var(--space-5)' }}>Featured Course</span>
              </div>
              <div className="academy-featured-card__content">
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                  <span className="badge badge--accent">{featuredCourses[0].difficulty}</span>
                  <span className="badge">{featuredCourses[0].duration}</span>
                  <span className="badge">{t('course.lessons', { count: featuredCourses[0].lessons })}</span>
                </div>
                <h2 className="font-hero" style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-3)', lineHeight: 'var(--leading-snug)' }}>
                  {featuredCourses[0].title}
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-4)' }}>
                  {featuredCourses[0].description.slice(0, 180)}...
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div className="avatar avatar--sm" style={{ background: 'linear-gradient(135deg, #C9A66B, #8A6A4A)' }}>
                    {getArtisanById(featuredCourses[0].instructorId)?.initials}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{featuredCourses[0].instructor}</p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                      {getArtisanById(featuredCourses[0].instructorId)?.craft}
                    </p>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={14} fill="#C9A66B" stroke="#C9A66B" />
                    <span className="font-number" style={{ fontWeight: 600 }}>{featuredCourses[0].rating}</span>
                  </div>
                </div>
              </div>
            </Link>
          </SectionReveal>
        </div>
      </section>

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
              <SectionReveal key={course.id} animation="fade-up" delay={i * 0.06}>
                <Link to={`/academy/${course.id}`} className="course-card card">
                  <div className="course-card__image" style={{
                    background: [
                      'linear-gradient(135deg, #D4B896, #8A6A4A)',
                      'linear-gradient(135deg, #A8C4B8, #4F6958)',
                      'linear-gradient(135deg, #B8A8C4, #6B5C7A)',
                      'linear-gradient(135deg, #C4A882, #5C4A35)',
                      'linear-gradient(135deg, #A8BCC4, #5C6B7A)',
                      'linear-gradient(135deg, #C4B8A8, #7A6B5C)',
                    ][i % 6],
                  }}>
                    <div className="course-card__play"><Play size={24} /></div>
                  </div>
                  <div className="course-card__content">
                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                      <span className="badge badge--accent">{course.difficulty}</span>
                      <span className="badge">{course.duration}</span>
                    </div>
                    <h3 className="course-card__title">{course.shortTitle}</h3>
                    <p className="course-card__instructor">{t('course.by', { instructor: course.instructor })}</p>
                    <div className="course-card__meta">
                      <span><Clock size={13} /> {course.totalHours}h</span>
                      <span><BookOpen size={13} /> {t('course.lessons', { count: course.lessons })}</span>
                      <span><Users size={13} /> {t('course.students', { count: course.students })}</span>
                    </div>
                    <div className="course-card__footer">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Star size={13} fill="#C9A66B" stroke="#C9A66B" />
                        <span className="font-number" style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{course.rating}</span>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>({course.reviews})</span>
                      </div>
                      <div>
                        <span className="font-number" style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>₹{course.price.toLocaleString()}</span>
                        <span className="font-number" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', textDecoration: 'line-through', marginLeft: 'var(--space-2)' }}>₹{course.originalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
