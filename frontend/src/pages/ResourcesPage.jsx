import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts';
import { API, getCollegeName } from '../utils';
import { ShareResourceModal } from '../components/modals';

export function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const { token, user } = useAuth();

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await axios.get(`${API}/resources`);
      console.log('📚 All resources from backend:', response.data);
      
      const userCollege = getCollegeName(user?.email);
      console.log('👤 Your college:', userCollege);
      console.log('📧 Your email:', user?.email);
      
      const filteredResources = response.data.filter(resource => {
        const resourceCollege = getCollegeName(resource.uploader_email);
        console.log(`📄 Resource: "${resource.title}" - Uploader: ${resource.uploader_email}, College: ${resourceCollege}`);
        // If user has a college, filter by matching college
        // If user doesn't have a college (non-campus email), show all resources
        if (userCollege) {
          return resourceCollege && userCollege.toLowerCase() === resourceCollege.toLowerCase();
        }
        return true; // Show all resources if user doesn't have a college
      });
      
      console.log('✅ Filtered resources:', filteredResources);
      setResources(filteredResources);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (resource) => {
    if (resource.file_url) {
      try {
        await axios.post(`${API}/resources/${resource.id}/download`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        window.open(resource.file_url, '_blank');
        fetchResources();
      } catch (error) {
        console.error('Download failed:', error);
        alert('Failed to download resource');
      }
    } else {
      alert('Download link not available');
    }
  };

  if (loading) return <div className="page-loading">Loading resources...</div>;

  const collegeName = getCollegeName(user?.email);

  return (
    <div className="page-container" data-testid="resources-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Study Resources</h1>
          {collegeName && (
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #666)', marginTop: '0.25rem' }}>
              🎓 Showing content from <strong>{collegeName}</strong>
            </div>
          )}
        </div>
        <button 
          onClick={() => setShowShareModal(true)}
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
          + Share Resource
        </button>
      </div>
      
      <div className="cards-grid">
        {resources.length === 0 ? (
          <p style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '2rem', color: 'var(--text-secondary)' }}>
            No resources available yet. Be the first to share!
          </p>
        ) : (
          resources.map(resource => (
            <div key={resource.id} className="card" data-testid="resource-item">
              <div className="card-category">{resource.subject}</div>
              <h3 className="card-title">{resource.title}</h3>
              <p className="card-description" style={{ 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {resource.course} - {resource.semester}
              </p>
              <div className="card-meta">
                <div className="meta-item">⭐ {resource.rating?.toFixed(1) || '0.0'}</div>
                <div className="meta-item">⬇️ {resource.downloads || 0} downloads</div>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                By {resource.uploader_name}
              </div>
              <button 
                className="card-action"
                onClick={() => handleDownload(resource)}
                disabled={!resource.file_url}
                style={{
                  marginTop: '1rem',
                  opacity: resource.file_url ? 1 : 0.5,
                  cursor: resource.file_url ? 'pointer' : 'not-allowed',
                  backgroundColor: resource.file_url ? 'var(--accent-primary)' : 'var(--bg-tertiary)'
                }}
              >
                {resource.file_url ? '📥 Download PDF' : 'No File Available'}
              </button>
            </div>
          ))
        )}
      </div>

      {showShareModal && (
        <ShareResourceModal 
          onClose={() => setShowShareModal(false)} 
          onSuccess={() => {
            setShowShareModal(false);
            fetchResources();
          }} 
        />
      )}
    </div>
  );
}
