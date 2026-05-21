import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api`;

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page-loading">Loading dashboard...</div>;

  return (
    <div className="page-container" data-testid="dashboard-page">
      <h1 className="page-title">Campus Dashboard</h1>
      
      {stats && (
        <>
          {/* Overview Stats */}
          <section className="dashboard-section">
            <h2 className="section-heading">Platform Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <div className="stat-number">{stats.overview.totalUsers}</div>
                  <div className="stat-label">Total Users</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-content">
                  <div className="stat-number">{stats.overview.upcomingEvents}</div>
                  <div className="stat-label">Upcoming Events</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🏛️</div>
                <div className="stat-content">
                  <div className="stat-number">{stats.overview.totalClubs}</div>
                  <div className="stat-label">Active Clubs</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📚</div>
                <div className="stat-content">
                  <div className="stat-number">{stats.overview.totalResources}</div>
                  <div className="stat-label">Study Resources</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">💼</div>
                <div className="stat-content">
                  <div className="stat-number">{stats.overview.openOpportunities}</div>
                  <div className="stat-label">Open Opportunities</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🛍️</div>
                <div className="stat-content">
                  <div className="stat-number">{stats.overview.availableItems}</div>
                  <div className="stat-label">Marketplace Items</div>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Activity */}
          <section className="dashboard-section">
            <h2 className="section-heading">Recent Activity</h2>
            
            <div className="activity-grid">
              {/* Recent Events */}
              <div className="activity-card">
                <h3 className="activity-title">📅 Upcoming Events</h3>
                <div className="activity-list">
                  {stats.recent.events.map((event, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-content">
                        <div className="activity-name">{event.title}</div>
                        <div className="activity-meta">
                          {new Date(event.date).toLocaleDateString()} • {event.location}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Clubs */}
              <div className="activity-card">
                <h3 className="activity-title">🏛️ Popular Clubs</h3>
                <div className="activity-list">
                  {stats.recent.clubs.map((club, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-content">
                        <div className="activity-name">{club.name}</div>
                        <div className="activity-meta">
                          {club.member_count} members • {club.category}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Resources */}
              <div className="activity-card">
                <h3 className="activity-title">📚 Popular Resources</h3>
                <div className="activity-list">
                  {stats.recent.resources.map((resource, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-content">
                        <div className="activity-name">{resource.title}</div>
                        <div className="activity-meta">
                          ⭐ {resource.rating} • ⬇️ {resource.downloads} downloads
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default Dashboard;
