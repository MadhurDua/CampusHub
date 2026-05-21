export function EventCard({ event, onClick }) {
  return (
    <div 
      className="card" 
      data-testid="event-card"
      onClick={onClick}
      style={{ 
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <div className="card-category">{event.category}</div>
        {event.organizer_type === 'club' ? (
          <div style={{ 
            fontSize: '0.75rem', 
            backgroundColor: '#8b5cf6',
            color: 'white',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontWeight: '600'
          }}>
            🎯 CLUB EVENT
          </div>
        ) : ['college_management', 'college_admin', 'main_admin'].includes(event.organizer_type) ? (
          <div style={{ 
            fontSize: '0.75rem', 
            backgroundColor: '#f59e0b',
            color: 'white',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontWeight: '600'
          }}>
            🏛️ OFFICIAL EVENT
          </div>
        ) : null}
      </div>
      <h3 className="card-title">{event.title}</h3>
      <p className="card-description" style={{ 
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical'
      }}>{event.description}</p>
      <div className="card-meta">
        <div className="meta-item">📅 {new Date(event.date).toLocaleDateString()}</div>
        <div className="meta-item">📍 {event.location}</div>
        <div className="meta-item">👥 {event.attendees_count} attending</div>
      </div>
      <div style={{ marginTop: '0.5rem', color: 'var(--accent-primary)', fontSize: '0.875rem', fontWeight: '600' }}>
        Click for details →
      </div>
    </div>
  );
}
