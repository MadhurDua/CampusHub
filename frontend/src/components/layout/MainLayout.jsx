import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getCollegeName } from '../../utils/helpers';
import { ThemeToggle } from './ThemeToggle';

export function MainLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Filter navigation based on user role
  const allNavItems = [
    { path: '/home', label: 'Feed', icon: '🏠', roles: ['student', 'faculty', 'college_management', 'college_admin', 'main_admin'] },
    { path: '/events', label: 'Events', icon: '📅', roles: ['student', 'faculty', 'college_management', 'college_admin', 'main_admin'] },
    { path: '/clubs', label: 'Clubs', icon: '👥', roles: ['student', 'faculty', 'college_management', 'college_admin', 'main_admin'] },
    { path: '/resources', label: 'Resources', icon: '📚', roles: ['student', 'faculty', 'college_management', 'college_admin', 'main_admin'] },
    { path: '/opportunities', label: 'Opportunities', icon: '💼', roles: ['student', 'faculty', 'college_management', 'college_admin', 'main_admin'] },
    { path: '/marketplace', label: 'Share & Care', icon: '💝', roles: ['student', 'faculty', 'college_management', 'college_admin', 'main_admin'] },
    { path: '/lost-found', label: 'Lost & Found', icon: '🔍', roles: ['student', 'faculty', 'college_management', 'college_admin', 'main_admin'] },
    { path: '/admin', label: 'Admin Panel', icon: '⚙️', roles: ['college_management', 'college_admin', 'main_admin'] },
  ];

  const navItems = allNavItems.filter(item => 
    !item.roles || item.roles.includes(user?.role?.toLowerCase())
  );

  return (
    <div className="main-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Campus Hub</h2>
          <ThemeToggle />
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.full_name?.[0]}</div>
            <div className="user-details">
              <div className="user-name">{user?.full_name}</div>
              <div className="user-role">{user?.role}</div>
              {user?.email && getCollegeName(user.email) && (
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--primary-color, #4F46E5)', 
                  fontWeight: '600',
                  marginTop: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  🎓 {getCollegeName(user.email)}
                </div>
              )}
            </div>
          </div>
          <button onClick={logout} className="logout-btn" data-testid="logout-btn">Logout</button>
        </div>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
