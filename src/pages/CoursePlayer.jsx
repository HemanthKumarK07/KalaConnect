import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Pause, Maximize, CheckCircle, Circle, ArrowLeft, ChevronLeft, ChevronRight, FileText, HelpCircle, StickyNote, BookOpen, MessageSquare, Save, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import { getCourseById } from '../data/courses';
import useAcademyStore from '../store/useAcademyStore';
import { useToast } from '../components/Toast';
import './CoursePlayer.css';

export default function CoursePlayer() {
  const { t } = useTranslation(['academy', 'common']);
  const { id } = useParams();
  const course = getCourseById(id);
  
  const { progress, notes, markLessonComplete, saveNotes } = useAcademyStore();
  const { showToast } = useToast();

  const [activeLesson, setActiveLesson] = useState(course?.lessons[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [noteText, setNoteText] = useState(notes[id] || '');
  const [sidebarTab, setSidebarTab] = useState('lessons');
  const videoRef = useRef(null);

  if (!course) {
    return <div className="course-player-page" style={{ paddingTop: 'calc(var(--nav-height) + var(--space-20))', textAlign: 'center' }}><div className="container"><h2>{t('common:errors.notFound')}</h2></div></div>;
  }

  const allLessons = course.curriculum.flatMap(s => s.lessons);
  const currentLessonIdx = allLessons.findIndex(l => l.id === activeLesson?.id);
  const progressPercent = (Object.keys(progress[id] || {}).length / allLessons.length) * 100;

  const handleComplete = (lessonId) => {
    markLessonComplete(id, lessonId);
    showToast('Lesson progress updated');
  };

  const handleSaveNotes = () => {
    saveNotes(id, noteText);
    showToast('Notes saved successfully');
  };

  return (
    <div className="course-player-page">
      <div className="cp-layout">
        <div className="cp-main">
          <div className="cp-video">
            <div className="cp-video__placeholder" style={{ background: 'linear-gradient(135deg, #2A1F17, #3F3126)' }}>
              <div className="cp-video__play-btn"><Play size={40} /></div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-3)' }}>
                {activeLesson?.title}
              </p>
            </div>
            <div className="cp-progress">
              <div className="cp-progress__bar" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="cp-lesson-info">
            <div className="cp-lesson-info__header">
              <div>
                <span className="tag" style={{ marginBottom: 'var(--space-2)', display: 'inline-flex' }}>{activeLesson?.type}</span>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 600 }}>{activeLesson?.title}</h2>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
                  {course.shortTitle} • {activeLesson?.duration}
                </p>
              </div>
              <div className="cp-lesson-nav">
                <button className="btn btn--ghost btn--sm" disabled={currentLessonIdx === 0} onClick={() => setActiveLesson(allLessons[currentLessonIdx - 1])}>
                  <ChevronLeft size={16} /> {t('academy:player.previousLesson')}
                </button>
                <button className="btn btn--primary btn--sm" onClick={() => { handleComplete(activeLesson.id); if (currentLessonIdx < allLessons.length - 1) setActiveLesson(allLessons[currentLessonIdx + 1]); }}>
                  {progress[id]?.[activeLesson.id] ? t('academy:player.completed') : t('academy:player.markComplete')}
                </button>
              </div>
            </div>

            <div className="cp-ai-assist">
              <MessageSquare size={16} style={{ color: 'var(--color-accent)' }} />
              <div>
                <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{t('common:nav.aiAssistant')}</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>Ask questions about this lesson, get summaries, or take a quiz.</p>
              </div>
              <Link to="/ai-assistant">
                <Button variant="outline" size="sm">{t('common:buttons.startLearning')}</Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="cp-sidebar">
          <div className="cp-sidebar__header">
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{course.shortTitle}</h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
              <span className="font-number">{Object.keys(progress[id] || {}).length}</span> / {allLessons.length} {t('academy:player.completed').toLowerCase()}
            </p>
            <div className="cp-sidebar__progress">
              <div className="cp-sidebar__progress-bar" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="cp-sidebar__tabs">
            {[{ id: 'lessons', icon: <BookOpen size={14} />, label: t('common:labels.lessons') }, { id: 'notes', icon: <StickyNote size={14} />, label: t('academy:player.notes') }].map(tab => (
              <button key={tab.id} className={`cp-sidebar__tab ${sidebarTab === tab.id ? 'active' : ''}`} onClick={() => setSidebarTab(tab.id)}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="cp-sidebar__content">
            {sidebarTab === 'lessons' && (
              <div className="cp-lessons-list">
                {course.curriculum.map((section, si) => (
                  <div key={si} className="cp-curriculum-section">
                    <h4 className="cp-curriculum-section__title">{section.title}</h4>
                    {section.lessons.map((lesson) => {
                      const isCompleted = progress[id]?.[lesson.id] || false;
                      return (
                        <button key={lesson.id} className={`cp-lesson-item ${activeLesson.id === lesson.id ? 'active' : ''} ${isCompleted ? 'completed' : ''}`} onClick={() => setActiveLesson(lesson)}>
                          <span className="cp-lesson-item__icon" onClick={(e) => { e.stopPropagation(); handleComplete(lesson.id); }}>
                            {isCompleted ? <CheckCircle size={14} /> : <Circle size={14} />}
                          </span>
                          <span className="cp-lesson-item__title">{lesson.title}</span>
                          <span className="cp-lesson-item__duration font-number">{lesson.duration}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            {sidebarTab === 'notes' && (
              <div className="cp-notes">
                <div className="cp-notes__header">
                  <h3 style={{ fontFamily: 'var(--font-heading)' }}>{t('academy:player.notes')}</h3>
                  <button className="btn-icon" onClick={handleSaveNotes}><Save size={18} /></button>
                </div>
                <textarea 
                  className="cp-notes__input"
                  placeholder="Take notes while watching..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onBlur={handleSaveNotes}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
