import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts';
import { API, getCollegeName } from '../../utils';

export function EventDetailModal({ event, onClose, onRegister, onUnregister, onRefresh }) {
  const { user } = useAuth();
  const isRegistered = event.registered_users?.includes(user?.id);

  const handleRegister = async () => {
    await onRegister(event.id);
    onRefresh();
  };

  const handleUnregister = async () => {
    await onUnregister(event.id);
    onRefresh();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ 
        maxWidth: '600px',
        width: '90%',
        backgroundColor: 'var(--card-bg)',
        color: 'var(--text-primary)',
        borderRadius: '12px',
        padding: '2rem',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
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
            {event.category}
          </div>
          <h2 style={{ margin: '0.5rem 0', color: 'var(--text-primary)' }}>{event.title}</h2>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Description</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{event.description}</p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '1rem',
          padding: '1.5rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '8px',
          marginBottom: '1.5rem'
        }}>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>Date</div>
            <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>📅 {new Date(event.date).toLocaleDateString()}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>Time</div>
            <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>🕐 {event.time}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>Location</div>
            <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>📍 {event.location}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>Organizer</div>
            <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>👤 {event.organizer_name}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>Attendees</div>
            <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>👥 {event.attendees_count} registered</div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>Your Status</div>
            <div style={{ fontWeight: '600', color: isRegistered ? '#10b981' : 'var(--text-tertiary)' }}>
              {isRegistered ? '✅ Registered' : '⭕ Not registered'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={onClose}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '8px',
              border: `1px solid var(--border-color)`,
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem'
            }}
          >
            Close
          </button>
          <button 
            onClick={isRegistered ? handleUnregister : handleRegister}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: isRegistered ? '#ef4444' : 'var(--accent-primary)',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            {isRegistered ? 'Unregister' : 'Register for Event'}
          </button>
        </div>
      </div>
    </div>
  );
}
