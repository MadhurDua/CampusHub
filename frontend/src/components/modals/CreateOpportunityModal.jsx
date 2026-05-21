import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts';
import { API } from '../../utils';

export function CreateOpportunityModal({ isOpen, onClose, onSuccess }) {
  const { token, user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    type: 'internship',
    description: '',
    eligibility: '',
    deadline: '',
    apply_url: '',
    stipend: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post(`${API}/opportunities`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Opportunity posted successfully!');
      onClose();
      if (onSuccess) onSuccess();
      
      // Reset form
      setFormData({
        title: '',
        company: '',
        type: 'internship',
        description: '',
        eligibility: '',
        deadline: '',
        apply_url: '',
        stipend: ''
      });
    } catch (error) {
      console.error('Failed to post opportunity:', error);
      alert(error.response?.data?.detail || 'Failed to post opportunity');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
        <h2>📢 Post New Opportunity</h2>
        <form onSubmit={handleSubmit} className="form">
          <label style={{ display: 'block', marginBottom: '1rem' }}>
            <span style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Opportunity Type *</span>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
            >
              <option value="internship">💼 Internship</option>
              <option value="placement">🎯 Placement</option>
              <option value="competition">🏆 Competition</option>
              <option value="scholarship">📚 Scholarship</option>
            </select>
          </label>

          <input
            type="text"
            placeholder="Title (e.g., Software Engineering Intern)"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
            minLength={3}
          />

          <input
            type="text"
            placeholder="Company/Organization (e.g., Google, Microsoft)"
            value={formData.company}
            onChange={(e) => setFormData({...formData, company: e.target.value})}
            required
            minLength={2}
          />

          <textarea
            placeholder="Description - Describe the opportunity, responsibilities, requirements..."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={4}
            required
            minLength={10}
          />

          <textarea
            placeholder="Eligibility Criteria (e.g., B.Tech/M.Tech in CS, CGPA > 8.0, Final year students)"
            value={formData.eligibility}
            onChange={(e) => setFormData({...formData, eligibility: e.target.value})}
            rows={3}
            required
            minLength={5}
          />

          <label style={{ display: 'block', marginBottom: '1rem' }}>
            <span style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Application Deadline *</span>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              required
              min={new Date().toISOString().split('T')[0]}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
            />
          </label>

          <input
            type="url"
            placeholder="Application URL (optional) - https://company.com/apply"
            value={formData.apply_url}
            onChange={(e) => setFormData({...formData, apply_url: e.target.value})}
          />

          <input
            type="text"
            placeholder="Stipend/Salary (optional) - e.g., ₹50,000/month, Unpaid, Competitive"
            value={formData.stipend}
            onChange={(e) => setFormData({...formData, stipend: e.target.value})}
          />

          <div style={{ 
            padding: '1rem', 
            backgroundColor: 'var(--bg-secondary)', 
            borderRadius: '8px',
            marginTop: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              📋 <strong>Note:</strong> This opportunity will be visible to students from your college only.
              <br />
              Posted by: <strong>{user?.full_name}</strong> ({user?.email})
            </div>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Posting...' : '📢 Post Opportunity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
