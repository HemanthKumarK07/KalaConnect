import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, UploadCloud, X, CheckCircle, AlertCircle, Video } from 'lucide-react';
import Button from '../Button';
import { useToast } from '../Toast';
import axios from 'axios';
import './LessonEditor.css';

const API_BASE = 'http://localhost:5000/api';

const DEFAULT_FORM = {
  title: '', description: ''
};

export default function LessonEditor({ token, playlistId, lesson, onClose }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [videoData, setVideoData] = useState(null);
  const [thumbnailData, setThumbnailData] = useState(null);
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (lesson && lesson._id) {
      setForm({
        title: lesson.title || '',
        description: lesson.description || ''
      });
      if (lesson.video) setVideoData(lesson.video);
      if (lesson.thumbnail) setThumbnailData(lesson.thumbnail);
    }
  }, [lesson]);

  const handleVideoSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      showToast('Please select a valid video file.', 'error');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // 1. Get Signature from our backend
      const sigRes = await fetch(`${API_BASE}/upload/signature`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const sigData = await sigRes.json();
      
      if (!sigData.success) {
        throw new Error(sigData.message || 'Failed to get upload signature');
      }

      const { signature, timestamp, folder, apiKey, cloudName } = sigData.data;

      // 2. Upload directly to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', folder);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      );

      // 3. Save resulting data
      setVideoData({
        url: response.data.secure_url,
        publicId: response.data.public_id,
        duration: response.data.duration,
        width: response.data.width,
        height: response.data.height,
        format: response.data.format,
        status: 'READY'
      });
      
      showToast('Video uploaded successfully!', 'success');

    } catch (err) {
      console.error('Upload error:', err);
      showToast('Video upload failed.', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!form.title) {
      showToast('Lesson title is required.', 'error');
      return;
    }

    try {
      setSaving(true);
      const isNew = !lesson?._id;
      const method = isNew ? 'POST' : 'PUT';
      const url = isNew 
        ? `${API_BASE}/academy/playlists/${playlistId}/lessons`
        : `${API_BASE}/academy/lessons/${lesson._id}`;

      const payload = {
        ...form,
        video: videoData,
        thumbnail: thumbnailData
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        showToast('Lesson saved', 'success');
        onClose(); // Go back to playlist editor
      } else {
        showToast(data.message || 'Failed to save lesson', 'error');
      }
    } catch (err) {
      showToast('Network error while saving', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lesson-editor">
      <div className="lesson-editor__header">
        <button onClick={onClose} className="back-btn"><ArrowLeft size={16} /> Back to Curriculum</button>
        <Button variant="accent" onClick={handleSave} disabled={saving || uploading}>
          {saving ? 'Saving...' : 'Save Lesson'}
        </Button>
      </div>

      <div className="lesson-editor__layout">
        <div className="lesson-editor__form card">
          <h3 style={{ marginBottom: 'var(--space-4)', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>Lesson Information</h3>
          
          <div className="form-group">
            <label>Lesson Title</label>
            <input className="input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Introduction to Clay" />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea className="input" rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Briefly describe what this lesson covers..." />
          </div>
        </div>

        <div className="lesson-editor__video card">
          <h3 style={{ marginBottom: 'var(--space-4)', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>Video Content</h3>

          {!videoData && !uploading && (
            <div 
              className="video-upload-area" 
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud size={32} style={{ color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-2)' }} />
              <p style={{ fontWeight: 500 }}>Click to upload video</p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>MP4, WEBM, MOV (Up to 1440p)</p>
            </div>
          )}

          {uploading && (
            <div className="video-upload-progress">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: 'var(--text-sm)' }}>
                <span>Uploading directly to secure storage...</span>
                <span className="font-number">{uploadProgress}%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          {videoData && !uploading && (
            <div className="video-preview-card">
              <div className="video-preview-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Video size={16} />
                  <span style={{ fontWeight: 500 }}>Video Uploaded</span>
                  <CheckCircle size={14} style={{ color: 'var(--color-success)' }} />
                </div>
                <button className="icon-btn" onClick={() => setVideoData(null)} title="Remove Video"><X size={16}/></button>
              </div>
              <video src={videoData.url} controls className="video-player-preview" />
              <div className="video-meta">
                <span>Duration: {Math.round(videoData.duration / 60)}m {Math.round(videoData.duration % 60)}s</span>
                <span>Resolution: {videoData.width}x{videoData.height}</span>
              </div>
            </div>
          )}

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleVideoSelect} 
            accept="video/*" 
            style={{ display: 'none' }} 
          />
        </div>
      </div>
    </motion.div>
  );
}
