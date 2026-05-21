import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts';
import { EventCard, OpportunityCard, MarketplaceCard, PostCard } from '../components/cards';
import { EventDetailModal, OpportunityDetailModal, MarketplaceDetailModal } from '../components/modals';
import { API, getCollegeName } from '../utils';

export function FeedPage() {
  const [feed, setFeed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [selectedMarketplaceItem, setSelectedMarketplaceItem] = useState(null);
  const { token, user } = useAuth();

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const response = await axios.get(`${API}/feed`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter feed items by college
      const userCollege = getCollegeName(user?.email);
      if (response.data && userCollege) {
        const filteredFeed = {
          ...response.data,
          posts: response.data.posts?.filter(post => {
            const postCollege = getCollegeName(post.author_email);
            return postCollege && userCollege.toLowerCase() === postCollege.toLowerCase();
          }) || [],
          events: response.data.events?.filter(event => {
            const eventCollege = getCollegeName(event.organizer_email || event.creator_email);
            return eventCollege && userCollege.toLowerCase() === eventCollege.toLowerCase();
          }) || [],
          announcements: response.data.announcements?.filter(ann => {
            const annCollege = getCollegeName(ann.posted_by_email);
            return annCollege && userCollege.toLowerCase() === annCollege.toLowerCase();
          }) || [],
          opportunities: response.data.opportunities?.filter(opp => {
            if (opp.posted_by_role === 'main_admin') {
              return true;
            }
            const oppCollege = getCollegeName(opp.posted_by_email || opp.college_email);
            return oppCollege && userCollege.toLowerCase() === oppCollege.toLowerCase();
          }) || [],
          marketplace: response.data.marketplace?.filter(item => {
            const sellerCollege = getCollegeName(item.seller_email);
            return sellerCollege && userCollege.toLowerCase() === sellerCollege.toLowerCase();
          }) || []
        };
        setFeed(filteredFeed);
      } else {
        setFeed(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch feed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page-loading">Loading feed...</div>;

  const collegeName = getCollegeName(user?.email);

  return (
    <div className="page-container" data-testid="feed-page">
      <div style={{ marginBottom: '1rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Your Feed</h1>
        {collegeName && (
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #666)', marginTop: '0.25rem' }}>
            🎓 Showing feed from <strong>{collegeName}</strong>
          </div>
        )}
      </div>

      {feed?.events?.length > 0 && (
        <section className="feed-section">
          <h2 className="section-heading">Upcoming Events</h2>
          <div className="cards-grid">
            {feed.events.map(event => (
              <EventCard key={event.id} event={event} onClick={() => setSelectedEvent(event)} />
            ))}
          </div>
        </section>
      )}

      {feed?.opportunities?.length > 0 && (
        <section className="feed-section">
          <h2 className="section-heading">Latest Opportunities</h2>
          <div className="cards-grid">
            {feed.opportunities.map(opp => (
              <OpportunityCard key={opp.id} opportunity={opp} onClick={() => setSelectedOpportunity(opp)} />
            ))}
          </div>
        </section>
      )}

      {feed?.posts?.length > 0 && (
        <section className="feed-section">
          <h2 className="section-heading">Club Updates</h2>
          <div className="posts-list">
            {feed.posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {feed?.marketplace?.length > 0 && (
        <section className="feed-section">
          <h2 className="section-heading">Marketplace</h2>
          <div className="cards-grid">
            {feed.marketplace.map(item => (
              <MarketplaceCard key={item.id} item={item} onClick={() => setSelectedMarketplaceItem(item)} />
            ))}
          </div>
        </section>
      )}

      {selectedEvent && (
        <EventDetailModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
        />
      )}

      {selectedOpportunity && (
        <OpportunityDetailModal 
          opportunity={selectedOpportunity} 
          onClose={() => setSelectedOpportunity(null)} 
        />
      )}

      {selectedMarketplaceItem && (
        <MarketplaceDetailModal 
          item={selectedMarketplaceItem} 
          onClose={() => setSelectedMarketplaceItem(null)} 
        />
      )}
    </div>
  );
}
