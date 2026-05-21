import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts';
import { API, getCollegeName } from '../../utils';

export function OpportunityDetailModal({ opportunity, onClose }) {
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
            {opportunity.type}
          </div>
          <h2 style={{ margin: '0.5rem 0', color: 'var(--text-primary)' }}>{opportunity.title}</h2>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Company</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{opportunity.company}</p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Description</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{opportunity.description}</p>
        </div>

        <div style={{ 
          padding: '1.5rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '8px',
          marginBottom: '1.5rem'
        }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>Application Deadline</div>
          <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>📅 {new Date(opportunity.deadline).toLocaleDateString()}</div>
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
          {opportunity.apply_link && (
            <a 
              href={opportunity.apply_link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'var(--accent-primary)',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '1rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              Apply Now
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
