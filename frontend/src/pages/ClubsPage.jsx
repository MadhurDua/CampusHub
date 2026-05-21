import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts';
import { API, getCollegeName } from '../utils';
import { ClubDetailModal, CreateClubModal, ClubApplicationsModal } from '../components/modals';
import { MyClubView } from '../components/MyClubView';

export function ClubsPage() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedClub, setSelectedClub] = useState(null);
  const [showCreateClubModal, setShowCreateClubModal] = useState(false);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [myClub, setMyClub] = useState(null);
  const { token, user } = useAuth();

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const response = await axios.get(`${API}/clubs`);
      // Filter clubs by college
      const userCollege = getCollegeName(user?.email);
      console.log('👤 Your email:', user?.email);
      console.log('🎓 Your college:', userCollege);
      console.log('📊 Total clubs from API:', response.data.length);
      
      const filteredClubs = response.data.filter(club => {
        const clubCollege = getCollegeName(club.creator_email || club.college_email);
        console.log(`🏫 Club: "${club.name}" - Email: ${club.creator_email}, College: ${clubCollege}`);
        const matches = userCollege && clubCollege && userCollege.toLowerCase() === clubCollege.toLowerCase();
        console.log(`   ✓ Match: ${matches}`);
        return matches;
      });
      console.log('✅ Filtered clubs:', filteredClubs.length);
      setClubs(filteredClubs);
      
      // Check if user is a leader of any club
      const userClub = filteredClubs.find(club => club.leader_ids?.includes(user?.id));
      setMyClub(userClub || null);
    } catch (error) {
      console.error('Failed to fetch clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (clubId) => {
    try {
      console.log('Attempting to join club:', clubId);
      await axios.post(`${API}/clubs/${clubId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Successfully joined the club!');
      fetchClubs();
    } catch (error) {
      console.error('Join club error:', error);
      console.log('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.detail;
      alert(typeof errorMsg === 'string' ? errorMsg : 'Failed to join club');
    }
  };

  const handleLeave = async (clubId) => {
    try {
      await axios.post(`${API}/clubs/${clubId}/leave`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchClubs();
    } catch (error) {
      const errorMsg = error.response?.data?.detail;
      alert(typeof errorMsg === 'string' ? errorMsg : 'Failed to leave club');
    }
  };

  if (loading) return <div className="page-loading">Loading clubs...</div>;

  // If user has their own club (is a leader), show MyClubView
  if (myClub) {
    return <MyClubView club={myClub} onRefresh={fetchClubs} />;
  }

  const myClubs = clubs.filter(club => club.members?.includes(user?.id));
  const displayClubs = activeTab === 'all' ? clubs : myClubs;

  const collegeName = getCollegeName(user?.email);

  return (
    <div className="page-container" data-testid="clubs-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Clubs & Communities</h1>
          {collegeName && (
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #666)', marginTop: '0.25rem' }}>
              🎓 Showing clubs from <strong>{collegeName}</strong>
            </div>
          )}
        </div>
        {user?.role?.toLowerCase() === 'faculty' ? (
          <button 
            onClick={() => setShowApplicationsModal(true)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem'
            }}
          >
            📋 View Applications
          </button>
        ) : (
          <button 
            onClick={() => setShowCreateClubModal(true)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--accent-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem'
            }}
          >
            + Create Club
          </button>
        )}
      </div>
      
      <div className="tabs" style={{ marginBottom: '2rem' }}>
        <button 
          className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
          style={{
            padding: '0.75rem 1.5rem',
            marginRight: '1rem',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            backgroundColor: activeTab === 'all' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
            color: activeTab === 'all' ? 'white' : 'var(--text-primary)'
          }}
        >
          All Clubs
        </button>
        {myClubs.length > 0 && (
          <button 
            className={`tab-button ${activeTab === 'my' ? 'active' : ''}`}
            onClick={() => setActiveTab('my')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              backgroundColor: activeTab === 'my' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
              color: activeTab === 'my' ? 'white' : 'var(--text-primary)'
            }}
          >
            My Clubs ({myClubs.length})
          </button>
        )}
      </div>

      <div className="cards-grid">
        {displayClubs.length === 0 ? (
          <p style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '2rem' }}>
            {activeTab === 'my' ? 'You haven\'t joined any clubs yet.' : 'No clubs available.'}
          </p>
        ) : (
          displayClubs.map(club => (
            <div 
              key={club.id} 
              className="card" 
              data-testid="club-card"
              onClick={() => setSelectedClub(club)}
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
              <div className="card-category">{club.category}</div>
              <h3 className="card-title">{club.name}</h3>
              <p className="card-description" style={{ 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>{club.description}</p>
              <div className="card-meta">
                <div className="meta-item">👥 {club.member_count} members</div>
                <div className="meta-item" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  🏫 {getCollegeName(club.creator_email) || 'Unknown'}
                </div>
              </div>
              <div style={{ marginTop: '0.5rem', color: 'var(--accent-primary)', fontSize: '0.875rem', fontWeight: '600' }}>
                Click for details →
              </div>
            </div>
          ))
        )}
      </div>

      {selectedClub && (
        <ClubDetailModal 
          club={selectedClub} 
          onClose={() => setSelectedClub(null)}
          onJoin={handleJoin}
          onLeave={handleLeave}
          isMember={selectedClub.members?.includes(user?.id)}
          onRefresh={fetchClubs}
        />
      )}
      
      {showCreateClubModal && (
        <CreateClubModal 
          onClose={() => setShowCreateClubModal(false)}
          onSuccess={() => {
            setShowCreateClubModal(false);
            fetchClubs();
          }}
        />
      )}
      
      {showApplicationsModal && (
        <ClubApplicationsModal 
          onClose={() => setShowApplicationsModal(false)}
          onRefresh={fetchClubs}
        />
      )}
    </div>
  );
}
