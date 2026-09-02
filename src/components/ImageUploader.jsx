import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, X, Star, AlertCircle, RefreshCw, GripVertical } from 'lucide-react';
import { useToast } from './Toast';
import './ImageUploader.css';

const API_BASE = 'http://localhost:5000/api';

export default function ImageUploader({ images, setImages, token }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingIds, setUploadingIds] = useState(new Set());
  const [errorIds, setErrorIds] = useState(new Map());
  const fileInputRef = useRef(null);
  const { showToast } = useToast();
  
  const MAX_IMAGES = 5;
  const MAX_SIZE_MB = 5;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      showToast(`Unsupported format: ${file.name}. Only JPG, PNG, WEBP allowed.`, 'error');
      return false;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      showToast(`File too large: ${file.name}. Maximum size is ${MAX_SIZE_MB}MB.`, 'error');
      return false;
    }
    return true;
  };

  const uploadImage = async (file, tempId) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadingIds((prev) => new Set(prev).add(tempId));
      setErrorIds((prev) => {
        const next = new Map(prev);
        next.delete(tempId);
        return next;
      });

      const response = await fetch(`${API_BASE}/upload/image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to upload image');
      }

      setImages((prev) => 
        prev.map(img => img.id === tempId ? {
          ...img,
          url: data.data.url,
          publicId: data.data.publicId,
          isUploaded: true,
          isUploading: false
        } : img)
      );
      
    } catch (error) {
      setErrorIds((prev) => new Map(prev).set(tempId, error.message));
      showToast(`Upload failed: ${file.name}`, 'error');
      setImages((prev) => prev.filter(img => img.id !== tempId));
    } finally {
      setUploadingIds((prev) => {
        const next = new Set(prev);
        next.delete(tempId);
        return next;
      });
    }
  };

  const handleFiles = (files) => {
    const newFiles = Array.from(files).filter(validateFile);
    
    if (images.length + newFiles.length > MAX_IMAGES) {
      showToast(`You can upload a maximum of ${MAX_IMAGES} images per product.`, 'error');
      return;
    }

    newFiles.forEach((file) => {
      const tempId = Math.random().toString(36).substring(7);
      const previewUrl = URL.createObjectURL(file);
      const isPrimary = images.length === 0 && !images.some(img => img.isPrimary);
      
      setImages((prev) => [
        ...prev, 
        { 
          id: tempId, 
          file, 
          previewUrl, 
          isPrimary, 
          isUploaded: false,
          isUploading: true,
          order: prev.length
        }
      ]);
      
      uploadImage(file, tempId);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      // Reset input so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  const removeImage = (idToRemove) => {
    setImages((prev) => {
      const filtered = prev.filter(img => img.id !== idToRemove);
      
      // If we removed the primary image, make the first remaining image primary
      if (filtered.length > 0 && !filtered.some(img => img.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      
      // Update order
      return filtered.map((img, i) => ({ ...img, order: i }));
    });
  };

  const setPrimary = (idToMakePrimary) => {
    setImages((prev) => prev.map(img => ({
      ...img,
      isPrimary: img.id === idToMakePrimary
    })));
  };

  const retryUpload = (idToRetry) => {
    const img = images.find(i => i.id === idToRetry);
    if (img && img.file) {
      uploadImage(img.file, idToRetry);
    }
  };
  
  // Basic drag and drop reordering
  const [draggedItemIdx, setDraggedItemIdx] = useState(null);

  const onDragStart = (e, index) => {
    setDraggedItemIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    // Firefox requires setting data
    e.dataTransfer.setData('text/plain', index);
  };

  const onDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedItemIdx === null || draggedItemIdx === dropIndex) return;

    setImages(prev => {
      const newItems = [...prev];
      const draggedItem = newItems[draggedItemIdx];
      
      newItems.splice(draggedItemIdx, 1);
      newItems.splice(dropIndex, 0, draggedItem);
      
      // Update orders
      const updatedOrder = newItems.map((item, i) => ({ ...item, order: i }));
      
      // Ensure first image is primary if no primary explicitly set (or if primary was reordered, keep it primary)
      // Actually we just keep the primary flag on the object it was on.
      
      return updatedOrder;
    });
    setDraggedItemIdx(null);
  };

  return (
    <div className="image-uploader">
      <div className="image-uploader__header">
        <h4>Product Images</h4>
        <span className="image-uploader__counter">
          {images.length}/{MAX_IMAGES}
        </span>
      </div>
      
      <p className="image-uploader__help">
        The first image will be your primary product image. Drag to reorder.
      </p>

      <div className="image-uploader__gallery">
        <AnimatePresence>
          {images.map((img, index) => {
            const isUploading = uploadingIds.has(img.id);
            const error = errorIds.get(img.id);
            
            return (
              <motion.div 
                key={img.id}
                className={`image-uploader__item ${img.isPrimary ? 'is-primary' : ''} ${error ? 'has-error' : ''}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                layout
                draggable={!isUploading && !error}
                onDragStart={(e) => onDragStart(e, index)}
                onDragOver={(e) => onDragOver(e, index)}
                onDrop={(e) => onDrop(e, index)}
              >
                <div className="image-uploader__thumb" style={{ backgroundImage: `url("${img.url || img.previewUrl}")` }}>
                  {isUploading && (
                    <div className="image-uploader__overlay image-uploader__overlay--loading">
                      <RefreshCw size={24} className="spin" />
                      <span>Uploading...</span>
                    </div>
                  )}
                  {error && (
                    <div className="image-uploader__overlay image-uploader__overlay--error">
                      <AlertCircle size={24} />
                      <button type="button" onClick={() => retryUpload(img.id)} className="btn-retry">Retry</button>
                    </div>
                  )}
                  {!isUploading && !error && (
                    <div className="image-uploader__actions">
                      <button 
                        type="button" 
                        onClick={() => removeImage(img.id)} 
                        className="action-btn remove-btn" 
                        title="Remove image"
                      >
                        <X size={14} />
                      </button>
                      {!img.isPrimary && (
                        <button 
                          type="button" 
                          onClick={() => setPrimary(img.id)} 
                          className="action-btn primary-btn" 
                          title="Set as primary"
                        >
                          <Star size={14} />
                        </button>
                      )}
                      <div className="drag-handle" title="Drag to reorder"><GripVertical size={16} /></div>
                    </div>
                  )}
                </div>
                {img.isPrimary && <div className="primary-badge"><Star size={10} fill="currentColor" /> Primary</div>}
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {images.length < MAX_IMAGES && (
          <div 
            className={`image-uploader__dropzone ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud size={24} />
            <span>Add Image</span>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/jpeg, image/png, image/webp, image/jpg" 
              multiple 
              onChange={handleFileInput}
            />
          </div>
        )}
      </div>
    </div>
  );
}
