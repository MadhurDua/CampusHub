import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts';
import { API, getCollegeName } from '../../utils';

export function ClubApplicationsModal({ onClose, onRefresh }) {
  const [pendingClubs, setPendingClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();

  useEffect(() => {
    fetchPendingClubs();
  }, []);

  const fetchPendingClubs = async () => {
    try {
      const response = await axios.get(`${API}/clubs?status=pending`);
      // Filter by college
      const userCollege = getCollegeName(user?.email);
      const filteredClubs = response.data.filter(club => {
        const requestedEmail = club.requested_by;
        const clubCollege = getCollegeName(requestedEmail);
        return userCollege && clubCollege && userCollege.toLowerCase() === clubCollege.toLowerCase();
      });
      setPendingClubs(filteredClubs);
    } catch (error) {
      console.error('Failed to fetch pending clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (clubId) => {
    try {
      await axios.patch(`${API}/clubs/${clubId}/approve`, {
        status: 'approved',
        approved_by: user.email,
        approved_at: new Date().toISOString()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Club approved successfully!');
      fetchPendingClubs();
      onRefresh();
    } catch (error) {
      console.error('Failed to approve club:', error);
      alert('Failed to approve club');
    }
  };

  const handleReject = async (clubId) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    try {
      await axios.patch(`${API}/clubs/${clubId}/approve`, {
        status: 'rejected',
        approved_by: user.email,
        rejection_reason: reason || 'Does not meet requirements'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('❌ Club application rejected');
      fetchPendingClubs();
      onRefresh();
    } catch (error) {
      console.error('Failed to reject club:', error);
      alert('Failed to reject club');
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
        maxWidth: '800px',
        width: '90%',
        backgroundColor: 'var(--card-bg)',
        color: 'var(--text-primary)',
        borderRadius: '12px',
        padding: '2rem',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>📋 Club Applications</h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading applications...</div>
        ) : pendingClubs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            <p>✅ No pending applications</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>All club requests have been processed.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingClubs.map(club => (
              <div key={club.id} style={{
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '1.5rem',
                backgroundColor: 'var(--bg-secondary)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>{club.name}</h3>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>
                      Category: <span style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>{club.category}</span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                      Requested by: <strong>{club.requested_by}</strong>
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: '#f59e0b20',
                    color: '#f59e0b',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    PENDING
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Description:</div>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{club.description}</p>
                </div>

                {club.mission && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Mission & Goals:</div>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{club.mission}</p>
                  </div>
                )}

                {club.contact_email && (
                  <div style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
                    <span style={{ fontWeight: '600' }}>Contact:</span> {club.contact_email}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button 
                    onClick={() => handleReject(club.id)}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    ❌ Reject
                  </button>
                  <button 
                    onClick={() => handleApprove(club.id)}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#10b981',
                      color: 'white',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    ✅ Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button 
          onClick={onClose}
          style={{
            marginTop: '1.5rem',
            width: '100%',
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
