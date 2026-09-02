import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, BookOpen, Clock, Users, Play, Edit3, Trash2 } from 'lucide-react';
import Button from '../Button';
import SkeletonLoader from '../SkeletonLoader';
import PlaylistEditor from './PlaylistEditor';
import { useToast } from '../Toast';
import './ArtisanAcademyDashboard.css';

const API_BASE = 'http://localhost:5000/api';

export default function ArtisanAcademyDashboard({ token }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlaylist, setEditingPlaylist] = useState(null); // null = list view, {} = new, {id} = edit
  const { showToast } = useToast();

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/academy/artisan/playlists`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPlaylists(data.data);
      }
    } catch (err) {
      showToast('Failed to load your academy courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course? This cannot be undone.')) return;
    
    try {
      const res = await fetch(`${API_BASE}/academy/playlists/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Course deleted', 'success');
        fetchPlaylists();
      }
    } catch (err) {
      showToast('Failed to delete course', 'error');
    }
  };

  if (editingPlaylist !== null) {
    return (
      <PlaylistEditor 
        token={token} 
        playlistId={editingPlaylist._id} 
        onClose={() => { setEditingPlaylist(null); fetchPlaylists(); }} 
      />
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="artisan-academy">
      <div className="artisan-academy__header">
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'var(--text-xl)' }}>
            My Courses & Playlists
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
            Manage your video content and share your craft with the world.
          </p>
        </div>
        <Button variant="accent" size="sm" icon={<Plus size={16} />} onClick={() => setEditingPlaylist({})}>
          Create Course
        </Button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
          {[1,2,3].map(i => <SkeletonLoader key={i} type="card" style={{ height: '280px' }} />)}
        </div>
      ) : playlists.length === 0 ? (
        <div className="artisan-academy__empty">
          <BookOpen size={48} strokeWidth={1} style={{ color: 'var(--color-text-tertiary)' }} />
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', marginTop: 'var(--space-4)' }}>No courses yet</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
            Create your first course to start teaching your craft.
          </p>
          <Button variant="outline" onClick={() => setEditingPlaylist({})}>Create your first course</Button>
        </div>
      ) : (
        <div className="artisan-academy__grid">
          {playlists.map(course => (
            <div key={course._id} className="course-card card">
              <div className="course-card__image" style={{ 
                backgroundImage: course.thumbnail?.url ? `url(${course.thumbnail.url})` : 'none',
                background: !course.thumbnail?.url ? 'linear-gradient(135deg, #D4B896, #8A6A4A)' : undefined,
                backgroundSize: 'cover', backgroundPosition: 'center'
              }}>
                {!course.isPublished && (
                  <span className="badge" style={{ position: 'absolute', top: 'var(--space-3)', right: 'var(--space-3)', background: 'rgba(0,0,0,0.6)', color: 'white' }}>
                    DRAFT
                  </span>
                )}
              </div>
              <div className="course-card__content">
                <h3 className="course-card__title" style={{ marginBottom: 'var(--space-2)' }}>{course.title || 'Untitled Course'}</h3>
                
                <div className="course-card__meta" style={{ marginBottom: 'var(--space-4)' }}>
                  <span><Play size={13} /> {course.lessons?.length || 0} lessons</span>
                  <span><Clock size={13} /> {Math.round((course.totalDuration || 0) / 60)} mins</span>
                  <span><Users size={13} /> {course.enrolledStudents || 0} students</span>
                </div>
                
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'auto' }}>
                  <Button variant="outline" size="sm" style={{ flex: 1 }} onClick={() => setEditingPlaylist(course)}>
                    <Edit3 size={14} style={{ marginRight: '4px' }}/> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(course._id)} style={{ padding: '0 12px', color: 'var(--color-error)' }}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
