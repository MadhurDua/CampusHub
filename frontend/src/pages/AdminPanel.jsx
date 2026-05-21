import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts';
import { API, getCollegeName } from '../utils';

export function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const { user: currentUser, token } = useAuth();

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/admin/stats/college`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handlePromote = async (userId, targetRole) => {
    try {
      await axios.post(`${API}/admin/users/${userId}/promote`, 
        { target_role: targetRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('User promoted successfully!');
      fetchUsers();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to promote user');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    const confirmation = window.confirm(
      `⚠️ Are you sure you want to delete ${userName}?\n\nThis action cannot be undone and will:\n- Remove the user account permanently\n- Delete all their data\n- Remove them from clubs and events`
    );
    
    if (!confirmation) return;

    try {
      const response = await axios.delete(`${API}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(response.data.message || 'User deleted successfully!');
      fetchUsers();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to delete user');
    }
  };

  const getAvailablePromotions = (userRole) => {
    const promotions = {
      main_admin: ['college_admin', 'college_management', 'faculty', 'student'],
      college_admin: ['college_management', 'faculty', 'student'],
      college_management: ['faculty', 'student'],
      faculty: [],
      student: []
    };
    return promotions[currentUser.role] || [];
  };

  const canPromoteTo = (targetRole) => {
    return getAvailablePromotions(currentUser.role).includes(targetRole);
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      main_admin: '#e11d48',      // Red
      college_admin: '#7c3aed',    // Purple
      college_management: '#2563eb', // Blue
      faculty: '#059669',          // Green
      student: '#6b7280'           // Gray
    };
    return colors[role] || '#6b7280';
  };

  const getRoleLabel = (role) => {
    const labels = {
      main_admin: 'Main Admin',
      college_admin: 'College Admin',
      college_management: 'College Management',
      faculty: 'Faculty',
      student: 'Student'
    };
    return labels[role] || role;
  };

  if (loading) return <div className="page-loading">Loading admin panel...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Admin Panel</h1>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {currentUser.role === 'main_admin' ? '🔱 Main Administrator' : 
           currentUser.role === 'college_admin' ? '👑 College Administrator' :
           '🎯 College Management'}
        </div>
      </div>

      {/* Statistics - Only show what the admin can manage */}
      {stats && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{ 
            padding: '1.5rem', 
            backgroundColor: 'var(--card-bg)', 
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent-primary)' }}>
              {stats.total_users}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Manageable Users
            </div>
          </div>
          <div style={{ 
            padding: '1.5rem', 
            backgroundColor: 'var(--card-bg)', 
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#6b7280' }}>
              {stats.students}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Students</div>
          </div>
          <div style={{ 
            padding: '1.5rem', 
            backgroundColor: 'var(--card-bg)', 
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#059669' }}>
              {stats.faculty}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Faculty</div>
          </div>
          {/* Only show Management count to college_admin and main_admin */}
          {(currentUser.role === 'college_admin' || currentUser.role === 'main_admin') && (
            <div style={{ 
              padding: '1.5rem', 
              backgroundColor: 'var(--card-bg)', 
              borderRadius: '12px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#2563eb' }}>
                {stats.college_management}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Management</div>
            </div>
          )}
          {/* Only show College Admins count to main_admin */}
          {currentUser.role === 'main_admin' && stats.college_admins > 0 && (
            <div style={{ 
              padding: '1.5rem', 
              backgroundColor: 'var(--card-bg)', 
              borderRadius: '12px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#7c3aed' }}>
                {stats.college_admins}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>College Admins</div>
            </div>
          )}
        </div>
      )}

      {/* User Management */}
      <div>
        <h2 className="section-heading">User Management</h2>
        <div style={{ 
          backgroundColor: 'var(--card-bg)', 
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Name</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Email</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Role</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>College</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(user => {
                // Non-main admins should never see the main admin account
                if (currentUser.role !== 'main_admin' && user.role === 'main_admin') {
                  return false;
                }
                return true;
              }).map((user, index) => (
                <tr key={user.id} style={{ 
                  borderTop: index > 0 ? '1px solid var(--border-color)' : 'none'
                }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '500' }}>{user.full_name}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {user.email}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      backgroundColor: `${getRoleBadgeColor(user.role)}20`,
                      color: getRoleBadgeColor(user.role),
                      display: 'inline-block'
                    }}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {getCollegeName(user.email) || 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {user.id !== currentUser.id && user.role !== 'main_admin' && (
                        <>
                          <select
                            onChange={(e) => {
                              if (e.target.value && window.confirm(`Promote ${user.full_name} to ${getRoleLabel(e.target.value)}?`)) {
                                handlePromote(user.id, e.target.value);
                              }
                              e.target.value = '';
                            }}
                            style={{
                              padding: '0.5rem',
                              borderRadius: '6px',
                              border: '1px solid var(--border-color)',
                              backgroundColor: 'var(--card-bg)',
                              fontSize: '0.875rem',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="">Promote to...</option>
                            {getAvailablePromotions(currentUser.role).map(role => (
                              <option key={role} value={role}>{getRoleLabel(role)}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.full_name)}
                            style={{
                              padding: '0.5rem 0.75rem',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
                            title="Delete user"
                          >
                            🗑️ Delete
                          </button>
                        </>
                      )}
                      {user.role === 'main_admin' && (
                        <span style={{ 
                          fontSize: '0.75rem', 
                          color: 'var(--text-secondary)',
                          fontStyle: 'italic'
                        }}>
                          🔒 Protected
                        </span>
                      )}
                      {user.id === currentUser.id && (
                        <span style={{ 
                          fontSize: '0.75rem', 
                          color: 'var(--text-secondary)',
                          fontStyle: 'italic'
                        }}>
                          (You)
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
