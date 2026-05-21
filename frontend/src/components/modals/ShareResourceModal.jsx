import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts';
import { API, getCollegeName } from '../../utils';
import { uploadToDropbox } from '../../utils/dropboxUpload';

export function ShareResourceModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    course: '',
    semester: '',
    file_url: ''
  });
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const { token } = useAuth();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf' || file.size <= 10 * 1024 * 1024) {
        setSelectedFile(file);
      } else {
        alert('Please select a PDF file under 10MB');
        e.target.value = '';
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      let fileUrl = formData.file_url;
      
      // Upload file to Dropbox if a file is selected
      if (selectedFile) {
        fileUrl = await uploadToDropbox(selectedFile, '/resources');
      }
      
      await axios.post(`${API}/resources`, {
        ...formData,
        file_url: fileUrl
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onSuccess();
    } catch (error) {
      console.error('Upload error:', error);
      
      // Show detailed error message
      let errorMessage = 'Failed to share resource. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ 
        maxWidth: '500px',
        width: '90%',
        backgroundColor: 'var(--card-bg)',
        color: 'var(--text-primary)',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Share a Resource</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
            style={{ marginBottom: '1rem', width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          />
          <input
            type="text"
            placeholder="Subject"
            value={formData.subject}
            onChange={(e) => setFormData({...formData, subject: e.target.value})}
            required
            style={{ marginBottom: '1rem', width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          />
          <input
            type="text"
            placeholder="Course"
            value={formData.course}
            onChange={(e) => setFormData({...formData, course: e.target.value})}
            required
            style={{ marginBottom: '1rem', width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          />
          <input
            type="text"
            placeholder="Semester (e.g., Fall 2024)"
            value={formData.semester}
            onChange={(e) => setFormData({...formData, semester: e.target.value})}
            required
            style={{ marginBottom: '1rem', width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          />
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.875rem' }}>
              Upload PDF File or Provide URL
            </label>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              style={{ 
                marginBottom: '0.5rem', 
                width: '100%', 
                padding: '0.75rem', 
                borderRadius: '8px', 
                border: '1px solid var(--border-color)', 
                backgroundColor: 'var(--bg-secondary)', 
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
            />
            <div style={{ textAlign: 'center', margin: '0.5rem 0', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
              OR
            </div>
            <input
              type="url"
              placeholder="File URL (Google Drive, Dropbox, etc.)"
              value={formData.file_url}
              onChange={(e) => setFormData({...formData, file_url: e.target.value})}
              disabled={selectedFile !== null}
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                borderRadius: '8px', 
                border: '1px solid var(--border-color)', 
                backgroundColor: selectedFile ? 'var(--bg-tertiary)' : 'var(--bg-secondary)', 
                color: 'var(--text-primary)',
                opacity: selectedFile ? 0.5 : 1
              }}
            />
            {selectedFile && (
              <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#10b98120', borderRadius: '6px', color: '#10b981', fontSize: '0.875rem' }}>
                ✓ Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="button" onClick={onClose} disabled={uploading} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: `1px solid var(--border-color)`, background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: uploading ? 'not-allowed' : 'pointer', fontWeight: '600', opacity: uploading ? 0.5 : 1 }}>
              Cancel
            </button>
            <button type="submit" disabled={uploading || (!selectedFile && !formData.file_url)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: 'var(--accent-primary)', color: 'white', cursor: (uploading || (!selectedFile && !formData.file_url)) ? 'not-allowed' : 'pointer', fontWeight: '600', opacity: (uploading || (!selectedFile && !formData.file_url)) ? 0.5 : 1 }}>
              {uploading ? 'Uploading...' : 'Share Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
