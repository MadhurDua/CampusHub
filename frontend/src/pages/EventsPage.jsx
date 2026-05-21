import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts';
import { EventCard } from '../components/cards';
import { EventDetailModal, CreateEventModal } from '../components/modals';
import { API, getCollegeName } from '../utils';

export function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { token, user } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API}/events`);
      // Filter events by college
      const userCollege = getCollegeName(user?.email);
      const filteredEvents = response.data.filter(event => {
        const eventCollege = getCollegeName(event.organizer_email || event.creator_email);
        return userCollege && eventCollege && userCollege.toLowerCase() === eventCollege.toLowerCase();
      });
      setEvents(filteredEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      await axios.post(`${API}/events/${eventId}/register`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Successfully registered for the event!');
      fetchEvents();
    } catch (error) {
      const errorMsg = error.response?.data?.detail;
      alert(typeof errorMsg === 'string' ? errorMsg : 'Failed to register');
    }
  };

  const handleUnregister = async (eventId) => {
    try {
      await axios.delete(`${API}/events/${eventId}/register`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Successfully unregistered from the event');
      fetchEvents();
    } catch (error) {
      const errorMsg = error.response?.data?.detail;
      alert(typeof errorMsg === 'string' ? errorMsg : 'Failed to unregister');
    }
  };

  if (loading) return <div className="page-loading">Loading events...</div>;

  const collegeName = getCollegeName(user?.email);

  return (
    <div className="page-container" data-testid="events-page">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Events</h1>
          {collegeName && (
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #666)', marginTop: '0.25rem' }}>
              🎓 Showing events from <strong>{collegeName}</strong>
            </div>
          )}
        </div>
        <button onClick={() => setShowCreateModal(true)} className="create-btn" data-testid="create-event-btn">
          + Create Event
        </button>
      </div>

      <div className="cards-grid">
        {events.map(event => (
          <EventCard key={event.id} event={event} onClick={() => setSelectedEvent(event)} />
        ))}
      </div>

      {showCreateModal && <CreateEventModal onClose={() => setShowCreateModal(false)} onSuccess={fetchEvents} />}
      {selectedEvent && (
        <EventDetailModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)}
          onRegister={handleRegister}
          onUnregister={handleUnregister}
          onRefresh={fetchEvents}
        />
      )}
    </div>
  );
}
