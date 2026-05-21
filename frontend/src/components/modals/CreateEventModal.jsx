import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts';
import { API, getCollegeName } from '../../utils';
import { uploadToDropbox } from '../../utils/dropboxUpload';

export function CreateEventModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'technical',
    date: '',
    time: '',
    location: '',
    max_attendees: '',
    club_id: '',
    image_url: ''
  });
  const [myClubs, setMyClubs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedPoster, setSelectedPoster] = useState(null);
  const { token, user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchMyClubs();
    }
  }, [user?.id]);

  const fetchMyClubs = async () => {
    if (!user?.id) return;
    
    try {
      const response = await axios.get(`${API}/clubs`);
      const userClubs = response.data.filter(club => 
        club.leader_ids?.includes(user.id)
      );
      setMyClubs(userClubs);
      if (userClubs.length > 0) {
        setFormData(prev => ({ ...prev, club_id: userClubs[0].id }));
      }
    } catch (error) {
      console.error('Failed to fetch clubs:', error);
    }
  };

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
        setSelectedPoster(file);
      } else {
        alert('Please select an image file under 5MB');
        e.target.value = '';
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user can create events
    const canCreateEvents = myClubs.length > 0 || 
                          user?.role === 'college_management' || 
                          user?.role === 'college_admin' ||
                          user?.role === 'main_admin';
    
    if (!canCreateEvents) {
      alert('You must be a club leader or college official to create events');
      return;
    }

    setUploading(true);
    
    try {
      let imageUrl = formData.image_url;
      
      // Upload poster to Dropbox if selected
      if (selectedPoster) {
        imageUrl = await uploadToDropbox(selectedPoster, '/events');
      }
      
      // Prepare event data
      const eventData = {
        ...formData,
        image_url: imageUrl
      };
      
      // If no club is selected (general event), remove club_id
      if (!eventData.club_id) {
        delete eventData.club_id;
      }
      
      await axios.post(`${API}/events`, eventData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onClose();
      onSuccess();
    } catch (error) {
      console.error('Create event error:', error);
      console.log('Error response:', error.response?.data);
      
      // Show detailed validation errors
      const errorDetail = error.response?.data?.detail;
      if (Array.isArray(errorDetail)) {
        const errorMessages = errorDetail.map(e => e.msg || JSON.stringify(e)).join('\n');
        alert(`Validation errors:\n${errorMessages}`);
      } else if (typeof errorDetail === 'string') {
        alert(errorDetail);
      } else {
        alert('Failed to create event. Make sure you are a club leader and all fields are filled correctly.');
      }
    } finally {
      setUploading(false);
    }
  };

  const canCreateEvents = myClubs.length > 0 || 
                          user?.role === 'college_management' || 
                          user?.role === 'college_admin' ||
                          user?.role === 'main_admin';
  
  const isOfficial = user?.role === 'college_management' || 
                     user?.role === 'college_admin' ||
                     user?.role === 'main_admin';

  if (!canCreateEvents) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>⚠️ Cannot Create Events</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>
            You must be a club leader or college official to create events.
          </p>
          <button onClick={onClose} className="btn-primary">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
        <h2>{isOfficial ? 'Create Event' : 'Create Event for Your Club'}</h2>
        <form onSubmit={handleSubmit} className="form">
          {myClubs.length > 0 && (
            <label style={{ display: 'block', marginBottom: '1rem' }}>
              <span style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                {isOfficial ? 'Select Club (Optional)' : 'Select Club'}
              </span>
              <select 
                value={formData.club_id} 
                onChange={(e) => setFormData({...formData, club_id: e.target.value})}
                required={!isOfficial}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
              >
                {isOfficial && <option value="">General Event (Not tied to a club)</option>}
                {myClubs.map(club => (
                  <option key={club.id} value={club.id}>{club.name}</option>
                ))}
              </select>
              {isOfficial && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  💡 Leave as "General Event" for announcements or institutional events
                </div>
              )}
            </label>
          )}

          <input
            type="text"
            placeholder="Event Title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
            rows="4"
          />
          
          <label style={{ display: 'block', marginBottom: '1rem' }}>
            <span style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Event Poster (Optional)</span>
            <input
              type="file"
              accept="image/*"
              onChange={handlePosterChange}
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                borderRadius: '8px', 
                border: '1px solid var(--border-color)',
                cursor: 'pointer'
              }}
            />
            {selectedPoster && (
              <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#10b98120', borderRadius: '6px', color: '#10b981', fontSize: '0.875rem' }}>
                ✓ Selected: {selectedPoster.name} ({(selectedPoster.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </label>

          <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
            <option value="technical">Technical</option>
            <option value="cultural">Cultural</option>
            <option value="sports">Sports</option>
            <option value="academic">Academic</option>
          </select>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            required
          />
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({...formData, time: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="Location"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            required
          />
          <input
            type="number"
            placeholder="Max Attendees (optional)"
            value={formData.max_attendees}
            onChange={(e) => setFormData({...formData, max_attendees: e.target.value})}
            min="1"
          />
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={uploading}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={uploading}>
              {uploading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
