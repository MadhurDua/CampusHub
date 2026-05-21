import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts';
import { API, getCollegeName } from '../utils';
import { ReportLostFoundModal, LostFoundDetailModal } from '../components/modals';

export function LostFoundPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API}/lost-found`);
      // Filter lost & found items by college
      const userCollege = getCollegeName(user?.email);
      const filteredItems = response.data.filter(item => {
        const posterCollege = getCollegeName(item.posted_by_email);
        return userCollege && posterCollege && userCollege.toLowerCase() === posterCollege.toLowerCase();
      });
      setItems(filteredItems);
    } catch (error) {
      console.error('Failed to fetch lost & found items:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page-loading">Loading lost & found...</div>;

  const collegeName = getCollegeName(user?.email);

  return (
    <div className="page-container" data-testid="lost-found-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Lost & Found</h1>
          {collegeName && (
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #666)', marginTop: '0.25rem' }}>
              🎓 Showing items from <strong>{collegeName}</strong>
            </div>
          )}
        </div>
        <button 
          onClick={() => setShowReportModal(true)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'var(--accent-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1rem'
          }}
        >
          + Report Item
        </button>
      </div>
      <div className="cards-grid">
        {items.map(item => (
          <div 
            key={item.id} 
            className="card" 
            data-testid="lost-found-card"
            onClick={() => setSelectedItem(item)}
            style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <div className={`card-status ${item.category}`} style={{
              backgroundColor: item.category === 'lost' ? '#ef4444' : '#10b981',
              color: 'white',
              padding: '0.25rem 0.75rem',
              borderRadius: '6px',
              display: 'inline-block',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              {item.category.toUpperCase()}
            </div>
            <h3 className="card-title">{item.title}</h3>
            <p className="card-description" style={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>{item.description}</p>
            <div className="card-meta">
              <div className="meta-item">📍 {item.location}</div>
              <div className="meta-item">📅 {new Date(item.date).toLocaleDateString()}</div>
            </div>
            <div style={{ marginTop: '0.5rem', color: 'var(--primary-color, #4F46E5)', fontSize: '0.875rem', fontWeight: '600' }}>
              Click for details →
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <LostFoundDetailModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
        />
      )}
      
      {showReportModal && (
        <ReportLostFoundModal 
          onClose={() => setShowReportModal(false)}
          onSuccess={() => {
            setShowReportModal(false);
            fetchItems();
          }}
        />
      )}
    </div>
  );
}
