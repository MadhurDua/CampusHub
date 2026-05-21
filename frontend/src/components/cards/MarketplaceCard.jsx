export function MarketplaceCard({ item, onClick }) {
  return (
    <div 
      className="card" 
      data-testid="marketplace-card"
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
      <div className="card-category">{item.category}</div>
      <div style={{ 
        display: 'inline-block', 
        padding: '0.25rem 0.75rem', 
        backgroundColor: '#10b981', 
        color: 'white', 
        borderRadius: '6px', 
        fontSize: '0.875rem',
        fontWeight: '600',
        marginBottom: '0.5rem'
      }}>
        FREE
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
        <div className="meta-item">Given by: {item.seller_name}</div>
        <div className="meta-item" style={{ color: '#10b981', fontWeight: '600' }}>📦 Available to pickup</div>
      </div>
      <div style={{ marginTop: '0.5rem', color: 'var(--accent-primary)', fontSize: '0.875rem', fontWeight: '600' }}>
        Click for details →
      </div>
    </div>
  );
}
