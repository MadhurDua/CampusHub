import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts';
import { API, getCollegeName } from '../utils';
import { MarketplaceCard } from '../components/cards';
import { ShareItemModal, MarketplaceDetailModal } from '../components/modals';

export function MarketplacePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API}/marketplace`);
      // Filter marketplace items by college
      const userCollege = getCollegeName(user?.email);
      const filteredItems = response.data.filter(item => {
        const sellerCollege = getCollegeName(item.seller_email);
        return userCollege && sellerCollege && userCollege.toLowerCase() === sellerCollege.toLowerCase();
      });
      setItems(filteredItems);
    } catch (error) {
      console.error('Failed to fetch marketplace items:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page-loading">Loading items...</div>;

  const collegeName = getCollegeName(user?.email);

  return (
    <div className="page-container" data-testid="marketplace-page">
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h1 className="page-title" style={{ margin: 0 }}>Share & Care 💝</h1>
            <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0' }}>
              Share items you no longer need with your campus community - completely free!
            </p>
            {collegeName && (
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #666)', marginTop: '0.25rem' }}>
                🎓 Showing items from <strong>{collegeName}</strong>
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
              fontSize: '1rem',
              whiteSpace: 'nowrap',
              marginLeft: '1rem'
            }}
          >
            + Share Item
          </button>
        </div>
      </div>
      <div className="cards-grid">
        {items.map(item => (
          <MarketplaceCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
        ))}
      </div>
      {selectedItem && <MarketplaceDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
      {showShareModal && (
        <ShareItemModal 
          onClose={() => setShowShareModal(false)}
          onSuccess={() => {
            setShowShareModal(false);
            fetchItems();
          }}
        />
      )}
    </div>
  );
}
