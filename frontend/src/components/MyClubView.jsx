import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts';
import { API } from '../utils';

export function MyClubView({ club, onRefresh }) {
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const { token, user } = useAuth();

  useEffect(() => {
    fetchClubEvents();
    if (activeTab === 'members') {
      fetchMembers();
    }
  }, [club.id, activeTab]);

  const fetchClubEvents = async () => {
    try {
      setLoadingEvents(true);
      const response = await axios.get(`${API}/events`);
      
      // Filter events organized by this club and that are upcoming
      const now = new Date();
      const clubEvents = response.data
        .filter(event => event.organizer_id === club.id && event.organizer_type === 'club')
        .filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= now;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      setEvents(clubEvents);
    } catch (error) {
      console.error('Failed to fetch club events:', error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchMembers = async () => {
    try {
      setLoadingMembers(true);
      const response = await axios.get(`${API}/clubs/${club.id}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(response.data);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      alert('Failed to fetch members');
    } finally {
      setLoadingMembers(false);
    }
  };

  const removeMember = async (memberId) => {
    if (!confirm('Are you sure you want to remove this member from the club?')) {
      return;
    }

    try {
      await axios.delete(`${API}/clubs/${club.id}/members/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Member removed successfully');
      fetchMembers();
      onRefresh();
    } catch (error) {
      console.error('Failed to remove member:', error);
      const errorMsg = error.response?.data?.detail;
      alert(typeof errorMsg === 'string' ? errorMsg : 'Failed to remove member');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="page-container">
      <div style={{ 
        backgroundColor: 'var(--card-bg)', 
        borderRadius: '12px', 
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              display: 'inline-block',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '1rem'
            }}>
              {club.category}
            </div>
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              margin: '0.5rem 0 0.5rem 0',
              color: 'var(--text-primary)' 
            }}>
              {club.name}
            </h1>
            <div style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ 
                backgroundColor: '#10b98120', 
                color: '#10b981',
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontWeight: '600'
              }}>
                ✓ You're a leader
              </span>
              <span>•</span>
              <span>👥 {club.member_count} members</span>
            </div>
          </div>
          {club.logo_url && (
            <img 
              src={club.logo_url} 
              alt={`${club.name} logo`}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '12px',
                objectFit: 'cover',
                border: '2px solid var(--border-color)'
              }}
            />
          )}
        </div>

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          borderBottom: '2px solid var(--border-color)',
          marginBottom: '1.5rem'
        }}>
          <button
            onClick={() => setActiveTab('info')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              color: activeTab === 'info' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'info' ? '3px solid var(--accent-primary)' : 'none',
              marginBottom: '-2px',
              transition: 'color 0.2s'
            }}
          >
            Club Information
          </button>
          <button
            onClick={() => setActiveTab('events')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              color: activeTab === 'events' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'events' ? '3px solid var(--accent-primary)' : 'none',
              marginBottom: '-2px',
              transition: 'color 0.2s'
            }}
          >
            Upcoming Events {events.length > 0 && `(${events.length})`}
          </button>
          <button
            onClick={() => setActiveTab('members')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              color: activeTab === 'members' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'members' ? '3px solid var(--accent-primary)' : 'none',
              marginBottom: '-2px',
              transition: 'color 0.2s'
            }}
          >
            Members ({club.member_count})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'info' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                marginBottom: '0.75rem',
                color: 'var(--text-primary)' 
              }}>
                About
              </h3>
              <p style={{ 
                color: 'var(--text-secondary)', 
                lineHeight: '1.6',
                fontSize: '1rem'
              }}>
                {club.description}
              </p>
            </div>

            {club.mission && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: '600', 
                  marginBottom: '0.75rem',
                  color: 'var(--text-primary)' 
                }}>
                  Mission & Goals
                </h3>
                <p style={{ 
                  color: 'var(--text-secondary)', 
                  lineHeight: '1.6',
                  fontSize: '1rem'
                }}>
                  {club.mission}
                </p>
              </div>
            )}

            {club.contact_email && (
              <div style={{
                backgroundColor: 'var(--bg-secondary)',
                padding: '1rem',
                borderRadius: '8px',
                marginTop: '1rem'
              }}>
                <div style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--text-tertiary)',
                  marginBottom: '0.25rem'
                }}>
                  Contact Email
                </div>
                <a 
                  href={`mailto:${club.contact_email}`}
                  style={{ 
                    color: 'var(--accent-primary)',
                    textDecoration: 'none',
                    fontWeight: '600'
                  }}
                >
                  {club.contact_email}
                </a>
              </div>
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div>
            {loadingEvents ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                Loading events...
              </div>
            ) : events.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '3rem 2rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  marginBottom: '0.5rem',
                  color: 'var(--text-primary)' 
                }}>
                  No Upcoming Events
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Your club doesn't have any upcoming events scheduled yet.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {events.map(event => (
                  <div 
                    key={event.id}
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      padding: '1.5rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ 
                          fontSize: '1.125rem', 
                          fontWeight: '600', 
                          marginBottom: '0.5rem',
                          color: 'var(--text-primary)' 
                        }}>
                          {event.title}
                        </h4>
                        <p style={{ 
                          color: 'var(--text-secondary)', 
                          marginBottom: '1rem',
                          lineHeight: '1.5'
                        }}>
                          {event.description}
                        </p>
                        <div style={{ 
                          display: 'flex', 
                          flexWrap: 'wrap',
                          gap: '1rem',
                          fontSize: '0.875rem',
                          color: 'var(--text-secondary)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>📅</span>
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>🕐</span>
                            <span>{event.time}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>📍</span>
                            <span>{event.location}</span>
                          </div>
                          {event.attendees_count > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span>👥</span>
                              <span>{event.attendees_count} registered</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {event.image_url && (
                        <img 
                          src={event.image_url} 
                          alt={event.title}
                          style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '8px',
                            objectFit: 'cover',
                            marginLeft: '1rem'
                          }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div>
            {loadingMembers ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                Loading members...
              </div>
            ) : members.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '3rem 2rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  marginBottom: '0.5rem',
                  color: 'var(--text-primary)' 
                }}>
                  No Members Yet
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Your club doesn't have any members yet.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {members.map(member => {
                  const isLeader = club.leader_ids?.includes(member.id);
                  const isCurrentUser = member.id === user?.id;
                  
                  return (
                    <div 
                      key={member.id}
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ 
                          fontSize: '1.125rem', 
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          marginBottom: '0.25rem'
                        }}>
                          {member.full_name}
                          {isLeader && (
                            <span style={{
                              marginLeft: '0.5rem',
                              fontSize: '0.75rem',
                              backgroundColor: '#f59e0b',
                              color: 'white',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontWeight: '600'
                            }}>
                              LEADER
                            </span>
                          )}
                          {isCurrentUser && (
                            <span style={{
                              marginLeft: '0.5rem',
                              fontSize: '0.75rem',
                              backgroundColor: 'var(--accent-primary)',
                              color: 'white',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontWeight: '600'
                            }}>
                              YOU
                            </span>
                          )}
                        </div>
                        <div style={{ 
                          fontSize: '0.875rem',
                          color: 'var(--text-secondary)'
                        }}>
                          {member.email}
                        </div>
                      </div>
                      {!isLeader && (
                        <button
                          onClick={() => removeMember(member.id)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
