import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="nav-content">
          <div className="logo">Campus Hub</div>
          <div className="nav-actions">
            <div 
              className={`theme-toggle ${theme === 'dark' ? 'active' : ''}`}
              onClick={toggleTheme}
              data-testid="theme-toggle"
            >
              <div className="theme-toggle-slider">
                {theme === 'dark' ? '🌙' : '☀️'}
              </div>
            </div>
            <button onClick={() => navigate('/auth')} className="nav-btn" data-testid="nav-login-btn">
              Login
            </button>
          </div>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Your Campus, Connected</h1>
          <p className="hero-subtitle">
            Events, clubs, resources, opportunities — everything your campus life needs in one fluid platform
          </p>
          <button onClick={() => navigate('/auth')} className="hero-cta" data-testid="hero-get-started-btn">
            Get Started
          </button>
        </div>
        <div className="hero-visual">
          <div className="visual-card card-1">
            <div className="icon">📅</div>
            <div className="label">Events</div>
          </div>
          <div className="visual-card card-2">
            <div className="icon">👥</div>
            <div className="label">Communities</div>
          </div>
          <div className="visual-card card-3">
            <div className="icon">📚</div>
            <div className="label">Resources</div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">Everything You Need</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Discover Events</h3>
            <p>Never miss campus events. Register, get reminders, and check-in with ease.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌟</div>
            <h3>Join Communities</h3>
            <p>Connect with clubs that match your interests. Engage, discuss, grow together.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📖</div>
            <h3>Share Resources</h3>
            <p>Access study materials, notes, and resources shared by your peers.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💼</div>
            <h3>Find Opportunities</h3>
            <p>Internships, placements, competitions — all in one place with timely reminders.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛍️</div>
            <h3>Campus Marketplace</h3>
            <p>Buy and sell within your campus community. Safe, simple, and convenient.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Lost & Found</h3>
            <p>Report lost items or help others find theirs. Smart matching makes recovery faster.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
