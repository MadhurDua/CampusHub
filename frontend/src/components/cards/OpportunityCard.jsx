export function OpportunityCard({ opportunity, onClick }) {
  return (
    <div 
      className="card" 
      data-testid="opportunity-card"
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
      <div className="card-category">{opportunity.type}</div>
      <h3 className="card-title">{opportunity.title}</h3>
      <p className="card-company">{opportunity.company}</p>
      <p className="card-description" style={{ 
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical'
      }}>{opportunity.description}</p>
      <div className="card-meta">
        <div className="meta-item">📅 Deadline: {new Date(opportunity.deadline).toLocaleDateString()}</div>
      </div>
      <div style={{ marginTop: '0.5rem', color: 'var(--accent-primary)', fontSize: '0.875rem', fontWeight: '600' }}>
        Click for details →
      </div>
    </div>
  );
}
