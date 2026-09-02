import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Plus, GripVertical, Play, Edit3, Trash2, CheckCircle } from 'lucide-react';
import Button from '../Button';
import { useToast } from '../Toast';
import LessonEditor from './LessonEditor';
import './PlaylistEditor.css';

const API_BASE = 'http://localhost:5000/api';

const DEFAULT_FORM = {
  title: '', description: '', category: '', craftType: '', difficulty: 'All', language: '',
  isPublished: false
};

export default function PlaylistEditor({ token, playlistId, onClose }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (playlistId) {
      loadPlaylist();
    }
  }, [playlistId]);

  const loadPlaylist = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/academy/playlists/${playlistId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setForm(data.data);
        setLessons(data.data.lessons || []);
      }
    } catch (err) {
      showToast('Failed to load course details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (publish = false) => {
    if (publish && (!form.title || !form.description || lessons.length === 0)) {
      showToast('Title, description, and at least 1 lesson are required to publish.', 'error');
      return;
    }

    try {
      setSaving(true);
      const method = playlistId ? 'PUT' : 'POST';
      const url = playlistId ? `${API_BASE}/academy/playlists/${playlistId}` : `${API_BASE}/academy/playlists`;
      
      const payload = { ...form, isPublished: publish };
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        showToast(`Course ${publish ? 'published' : 'saved'} successfully`, 'success');
        if (!playlistId) {
          // If it was a new course, close so the parent reloads with ID
          onClose();
        } else {
          setForm(data.data);
        }
      } else {
        showToast(data.message || 'Failed to save', 'error');
      }
    } catch (err) {
      showToast('Network error while saving', 'error');
    } finally {
      setSaving(false);
    }
  };

  // --- Drag and Drop Reordering ---
  const [draggedIdx, setDraggedIdx] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to prevent the dragged item from disappearing immediately in the list
    setTimeout(() => e.target.classList.add('dragging'), 0);
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
    setDraggedIdx(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;
    
    // Reorder array locally
    const newLessons = [...lessons];
    const draggedItem = newLessons[draggedIdx];
    newLessons.splice(draggedIdx, 1);
    newLessons.splice(index, 0, draggedItem);
    
    setDraggedIdx(index);
    setLessons(newLessons);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    // Save new order to backend
    if (!playlistId) return;
    try {
      const orderedIds = lessons.map(l => l._id);
      await fetch(`${API_BASE}/academy/lessons/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ playlistId, orderedIds })
      });
      showToast('Order saved', 'success');
    } catch (err) {
      showToast('Failed to save order', 'error');
    }
  };

  const handleDeleteLesson = async (id) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      const res = await fetch(`${API_BASE}/academy/lessons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setLessons(lessons.filter(l => l._id !== id));
        showToast('Lesson deleted', 'success');
      }
    } catch (err) {
      showToast('Failed to delete lesson', 'error');
    }
  };

  if (editingLesson !== null) {
    return (
      <LessonEditor 
        token={token} 
        playlistId={playlistId || form._id}
        lesson={editingLesson}
        onClose={() => { setEditingLesson(null); loadPlaylist(); }}
      />
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="playlist-editor">
      <div className="playlist-editor__header">
        <button onClick={onClose} className="back-btn"><ArrowLeft size={16} /> Back to Courses</button>
        <div className="playlist-editor__actions">
          <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button variant="accent" onClick={() => handleSave(true)} disabled={saving || !playlistId}>
            {form.isPublished ? 'Update Published' : 'Publish Course'}
          </Button>
        </div>
      </div>

      <div className="playlist-editor__layout">
        {/* Left: Metadata Form */}
        <div className="playlist-editor__form card">
          <h3 style={{ marginBottom: 'var(--space-4)', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>Course Details</h3>
          
          <div className="form-group">
            <label>Course Title</label>
            <input className="input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Traditional Pottery Masterclass" />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea className="input" rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="What will students learn?" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label>Difficulty</label>
              <select className="input" value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}>
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div className="form-group">
              <label>Language</label>
              <input className="input" value={form.language} onChange={e => setForm({...form, language: e.target.value})} placeholder="e.g. English, Hindi" />
            </div>
          </div>
        </div>

        {/* Right: Lessons Manager */}
        <div className="playlist-editor__lessons card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>Curriculum ({lessons.length})</h3>
            <Button variant="outline" size="sm" icon={<Plus size={14}/>} onClick={() => {
              if (!playlistId) {
                showToast('Please save the course draft first before adding lessons.', 'error');
                return;
              }
              setEditingLesson({});
            }}>
              Add Lesson
            </Button>
          </div>

          {!playlistId ? (
            <div className="empty-state">Save the course details to start adding lessons.</div>
          ) : lessons.length === 0 ? (
            <div className="empty-state">No lessons added yet.</div>
          ) : (
            <div className="lessons-list">
              {lessons.map((lesson, index) => (
                <div 
                  key={lesson._id}
                  className="lesson-item"
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={handleDrop}
                >
                  <div className="lesson-item__drag" title="Drag to reorder">
                    <GripVertical size={16} />
                  </div>
                  <div className="lesson-item__info">
                    <span className="font-number" style={{ marginRight: '8px', color: 'var(--color-text-tertiary)' }}>{(index + 1).toString().padStart(2, '0')}</span>
                    <span style={{ fontWeight: 500 }}>{lesson.title}</span>
                    {lesson.video?.status === 'READY' && <CheckCircle size={14} style={{ color: 'var(--color-success)', marginLeft: '8px' }} />}
                  </div>
                  <div className="lesson-item__actions">
                    <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginRight: '8px' }}>
                      {Math.round((lesson.video?.duration || 0) / 60)}m
                    </span>
                    <button className="icon-btn" onClick={() => setEditingLesson(lesson)}><Edit3 size={16} /></button>
                    <button className="icon-btn" onClick={() => handleDeleteLesson(lesson._id)} style={{ color: 'var(--color-error)' }}><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
