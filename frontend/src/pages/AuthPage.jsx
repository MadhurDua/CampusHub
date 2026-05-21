import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { API } from '../utils/constants';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;
      
      const response = await axios.post(`${API}${endpoint}`, payload);
      login(response.data.token, response.data.user);
      navigate('/home');
    } catch (err) {
      console.error('Auth error:', err);
      console.log('API URL:', API);
      console.log('Full URL:', `${API}${isLogin ? '/auth/login' : '/auth/register'}`);
      console.log('Error response:', err.response);
      
      const errorDetail = err.response?.data?.detail;
      
      if (typeof errorDetail === 'string') {
        setError(errorDetail);
      } else if (Array.isArray(errorDetail)) {
        const errorMessages = errorDetail.map(e => {
          if (typeof e === 'object' && e.msg) {
            return e.msg;
          }
          return String(e);
        });
        setError(errorMessages.join('. '));
      } else if (typeof errorDetail === 'object') {
        setError(JSON.stringify(errorDetail));
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Campus Hub</h1>
          <p>{isLogin ? 'Welcome back' : 'Join your campus community'}</p>
          {!isLogin && (
            <div style={{ 
              fontSize: '0.875rem', 
              color: 'var(--text-secondary)', 
              marginTop: '0.5rem',
              padding: '0.75rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}>
              ℹ️ All new accounts are created as <strong>Student</strong>. Faculty and admin roles are assigned by college officials.
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              required
              data-testid="auth-name-input"
            />
          )}

          <input
            type="email"
            placeholder="Campus Email (.edu, .edu.in, .ac.in)"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
            data-testid="auth-email-input"
          />

          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
            data-testid="auth-password-input"
          />

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} data-testid="auth-submit-btn">
            {loading ? 'Loading...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>


        <div className="auth-toggle">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setIsLogin(!isLogin)} data-testid="auth-toggle-btn">
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
