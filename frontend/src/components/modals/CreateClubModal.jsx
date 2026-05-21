import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts';
import { API, getCollegeName } from '../../utils';
import { uploadToDropbox } from '../../utils/dropboxUpload';

export function CreateClubModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'technical',
    mission: '',
    contact_email: '',
    logo_url: ''
  });
  const [uploading, setUploading] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState(null);
  const { token, user } = useAuth();

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/') && file.size <= 2 * 1024 * 1024) {
        setSelectedLogo(file);
      } else {
        alert('Please select an image file under 2MB');
        e.target.value = '';
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      let logoUrl = formData.logo_url;
      
      // Upload logo to Dropbox if selected
      if (selectedLogo) {
        logoUrl = await uploadToDropbox(selectedLogo, '/clubs');
      }
      
      await axios.post(`${API}/clubs`, {
        ...formData,
        logo_url: logoUrl,
        status: 'pending', // Set status as pending for approval
        requested_by: user.email
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('🎉 Club creation request submitted! Your club will be visible once approved by a teacher or admin.');
      onSuccess();
    } catch (error) {
      console.error('Create club error:', error);
      alert('Failed to create club. Please try again.');
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
        maxWidth: '600px',
        width: '90%',
        backgroundColor: 'var(--card-bg)',
        color: 'var(--text-primary)',
        borderRadius: '12px',
        padding: '2rem',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Create a New Club</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Your club will be reviewed and approved by a teacher or admin before it goes live.
        </p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Club Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
            style={{ marginBottom: '1rem', width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          />

          <textarea
            placeholder="Club Description (What is your club about?)"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
            rows="3"
            style={{ marginBottom: '1rem', width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          />

          <textarea
            placeholder="Mission & Goals (What does your club aim to achieve?)"
            value={formData.mission}
            onChange={(e) => setFormData({...formData, mission: e.target.value})}
            required
            rows="3"
            style={{ marginBottom: '1rem', width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          />

          <label style={{ display: 'block', marginBottom: '1rem' }}>
            <span style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Category</span>
            <select 
              value={formData.category} 
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            >
              <option value="technical">Technical</option>
              <option value="cultural">Cultural</option>
              <option value="sports">Sports</option>
              <option value="social">Social</option>
              <option value="academic">Academic</option>
            </select>
          </label>

          <input
            type="email"
            placeholder="Contact Email (for inquiries about the club)"
            value={formData.contact_email}
            onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
            required
            style={{ marginBottom: '1rem', width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          />
          
          <label style={{ display: 'block', marginBottom: '1.5rem' }}>
            <span style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Club Logo (Optional)</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                borderRadius: '8px', 
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
            />
            {selectedLogo && (
              <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#10b98120', borderRadius: '6px', color: '#10b981', fontSize: '0.875rem' }}>
                ✓ Selected: {selectedLogo.name} ({(selectedLogo.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </label>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              type="button" 
              onClick={onClose} 
              disabled={uploading}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: `1px solid var(--border-color)`, background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: uploading ? 'not-allowed' : 'pointer', fontWeight: '600', opacity: uploading ? 0.5 : 1 }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={uploading}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: 'var(--accent-primary)', color: 'white', cursor: uploading ? 'not-allowed' : 'pointer', fontWeight: '600', opacity: uploading ? 0.5 : 1 }}
            >
              {uploading ? 'Submitting...' : 'Submit for Approval'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
