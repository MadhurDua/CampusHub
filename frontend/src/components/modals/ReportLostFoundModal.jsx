import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts';
import { API, getCollegeName } from '../../utils';
import { uploadToDropbox } from '../../utils/dropboxUpload';

export function ReportLostFoundModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'lost',
    item_type: 'others',
    location: '',
    date: new Date().toISOString().split('T')[0],
    image_url: ''
  });
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const { token } = useAuth();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
        setSelectedImage(file);
      } else {
        alert('Please select an image file under 5MB');
        e.target.value = '';
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      let imageUrl = formData.image_url;
      
      // Upload image to Dropbox if selected
      if (selectedImage) {
        imageUrl = await uploadToDropbox(selectedImage, '/lost-found');
      }
      
      await axios.post(`${API}/lost-found`, {
        ...formData,
        image_url: imageUrl
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onSuccess();
    } catch (error) {
      console.error('Report item error:', error);
      alert('Failed to report item. Please try again.');
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
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Report Lost or Found Item</h2>
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: '1rem' }}>
            <span style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Item Status</span>
            <select 
              value={formData.category} 
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            >
              <option value="lost">Lost - I lost this item</option>
              <option value="found">Found - I found this item</option>
            </select>
          </label>

          <label style={{ display: 'block', marginBottom: '1rem' }}>
            <span style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Item Type</span>
            <select 
              value={formData.item_type} 
              onChange={(e) => setFormData({...formData, item_type: e.target.value})}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            >
              <option value="phone">Phone</option>
              <option value="wallet">Wallet</option>
              <option value="id_card">ID Card</option>
              <option value="books">Books</option>
              <option value="others">Others</option>
            </select>
          </label>

          <input
            type="text"
            placeholder="Item Title (e.g., Blue Backpack)"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
            style={{ marginBottom: '1rem', width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          />
          <textarea
            placeholder="Description (What does it look like? Any unique features?)"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
            rows="4"
            style={{ marginBottom: '1rem', width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          />
          
          <label style={{ display: 'block', marginBottom: '1rem' }}>
            <span style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Item Picture (Optional)</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
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
            {selectedImage && (
              <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#10b98120', borderRadius: '6px', color: '#10b981', fontSize: '0.875rem' }}>
                ✓ Selected: {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </label>

          <input
            type="text"
            placeholder="Location (Where was it lost/found?)"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            required
            style={{ marginBottom: '1rem', width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          />

          <label style={{ display: 'block', marginBottom: '1.5rem' }}>
            <span style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Date</span>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            />
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
              {uploading ? 'Reporting...' : 'Report Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
