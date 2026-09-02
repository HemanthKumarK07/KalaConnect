import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Pause, Maximize, CheckCircle, Circle, ArrowLeft, ChevronLeft, ChevronRight, FileText, HelpCircle, StickyNote, BookOpen, MessageSquare, Save, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import useAuthStore from '../store/useAuthStore';
import SkeletonLoader from '../components/SkeletonLoader';
import { useToast } from '../components/Toast';
import './CoursePlayer.css';

const API_BASE = 'http://localhost:5000/api';

export default function CoursePlayer() {
  const { t } = useTranslation(['academy', 'common']);
  const { id } = useParams();
  const { token, user } = useAuthStore();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({ completedLessons: [] });
  const [activeLesson, setActiveLesson] = useState(null);
  const [sidebarTab, setSidebarTab] = useState('lessons');
  
  const videoRef = useRef(null);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch playlist details
        const res = await fetch(`${API_BASE}/academy/playlists/${id}`);
        const data = await res.json();
        
        if (data.success) {
          setCourse(data.data);
          if (data.data.lessons && data.data.lessons.length > 0) {
            setActiveLesson(data.data.lessons[0]);
          }
        }

        // Fetch progress if logged in
        if (token) {
          const progRes = await fetch(`${API_BASE}/academy/progress/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const progData = await progRes.json();
          if (progData.success) {
            setProgress(progData.data);
            if (progData.data.lastWatchedLessonId && data.data?.lessons) {
              const lastLesson = data.data.lessons.find(l => l._id === progData.data.lastWatchedLessonId);
              if (lastLesson) setActiveLesson(lastLesson);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load course details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, token]);

  const handleVideoEnded = () => {
    if (activeLesson) {
      handleComplete(activeLesson._id);
    }
  };

  const handleComplete = async (lessonId) => {
    if (!token) {
      showToast('Please log in to track your progress.', 'info');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/academy/progress/${lessonId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ playlistId: id })
      });
      const data = await res.json();
      
      if (data.success) {
        setProgress(data.data);
        showToast('Progress saved');
      }
    } catch (err) {
      console.error('Failed to save progress:', err);
    }
  };

  if (loading) {
    return <div className="course-player-page" style={{ paddingTop: '120px' }}>
      <div className="container"><SkeletonLoader type="card" style={{ height: '600px' }} /></div>
    </div>;
  }

  if (!course) {
    return <div className="course-player-page" style={{ paddingTop: '120px', textAlign: 'center' }}><h2>{t('common:errors.notFound')}</h2></div>;
  }

  const allLessons = course.lessons || [];
  const currentLessonIdx = allLessons.findIndex(l => l._id === activeLesson?._id);
  const completedCount = progress.completedLessons?.length || 0;
  const progressPercent = allLessons.length > 0 ? (completedCount / allLessons.length) * 100 : 0;
  const isCurrentCompleted = activeLesson && progress.completedLessons?.includes(activeLesson._id);

  return (
    <div className="course-player-page">
      <div className="cp-layout">
        <div className="cp-main">
          <div className="cp-video">
            {activeLesson?.video?.url ? (
              <video 
                ref={videoRef}
                src={activeLesson.video.url}
                className="cp-video__player"
                controls
                controlsList="nodownload"
                onEnded={handleVideoEnded}
                poster={activeLesson.thumbnail?.url}
                style={{ width: '100%', maxHeight: '65vh', background: '#000' }}
              />
            ) : (
              <div className="cp-video__placeholder" style={{ background: 'linear-gradient(135deg, #2A1F17, #3F3126)' }}>
                <div className="cp-video__play-btn"><Play size={40} /></div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-3)' }}>
                  {activeLesson?.title || 'No lesson selected'}
                </p>
                {!activeLesson?.video?.url && <p style={{ color: 'var(--color-error)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-1)' }}>Video processing or missing</p>}
              </div>
            )}
            
            <div className="cp-progress">
              <div className="cp-progress__bar" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="cp-lesson-info">
            <div className="cp-lesson-info__header">
              <div>
                <span className="tag" style={{ marginBottom: 'var(--space-2)', display: 'inline-flex' }}>Lesson {currentLessonIdx + 1}</span>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 600 }}>{activeLesson?.title}</h2>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
                  {course.title} • {Math.round((activeLesson?.video?.duration || 0) / 60)} mins
                </p>
              </div>
              <div className="cp-lesson-nav">
                <button className="btn btn--ghost btn--sm" disabled={currentLessonIdx <= 0} onClick={() => setActiveLesson(allLessons[currentLessonIdx - 1])}>
                  <ChevronLeft size={16} /> {t('academy:player.previousLesson')}
                </button>
                <button className="btn btn--primary btn--sm" onClick={() => { 
                  if (activeLesson) handleComplete(activeLesson._id); 
                  if (currentLessonIdx < allLessons.length - 1) setActiveLesson(allLessons[currentLessonIdx + 1]); 
                }}>
                  {isCurrentCompleted ? 'Next Lesson' : t('academy:player.markComplete')} <ChevronRight size={16} />
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
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{course.title}</h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
              <span className="font-number">{completedCount}</span> / {allLessons.length} {t('academy:player.completed').toLowerCase()}
            </p>
            <div className="cp-sidebar__progress">
              <div className="cp-sidebar__progress-bar" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="cp-sidebar__tabs">
            {[{ id: 'lessons', icon: <BookOpen size={14} />, label: t('common:labels.lessons') }].map(tab => (
              <button key={tab.id} className={`cp-sidebar__tab ${sidebarTab === tab.id ? 'active' : ''}`} onClick={() => setSidebarTab(tab.id)}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="cp-sidebar__content">
            {sidebarTab === 'lessons' && (
              <div className="cp-lessons-list">
                <div className="cp-curriculum-section">
                  <h4 className="cp-curriculum-section__title">All Lessons</h4>
                  {allLessons.map((lesson, idx) => {
                    const isCompleted = progress.completedLessons?.includes(lesson._id);
                    return (
                      <button key={lesson._id} className={`cp-lesson-item ${activeLesson?._id === lesson._id ? 'active' : ''} ${isCompleted ? 'completed' : ''}`} onClick={() => setActiveLesson(lesson)}>
                        <span className="cp-lesson-item__icon">
                          {isCompleted ? <CheckCircle size={14} /> : <span className="font-number" style={{fontSize: '10px'}}>{idx + 1}</span>}
                        </span>
                        <span className="cp-lesson-item__title">{lesson.title}</span>
                        <span className="cp-lesson-item__duration font-number">{Math.round((lesson.video?.duration || 0) / 60)}m</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
