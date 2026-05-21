import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts';
import { API, getCollegeName } from '../../utils';

export function MarketplaceDetailModal({ item, onClose }) {
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
            backgroundColor: '#10b981',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            display: 'inline-block',
            fontSize: '0.875rem',
            fontWeight: '600',
            marginBottom: '1rem'
          }}>
            FREE
          </div>
          <h2 style={{ margin: '0.5rem 0', color: 'var(--text-primary)' }}>{item.title}</h2>
          <div style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{item.category}</div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Description</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{item.description}</p>
        </div>

        <div style={{ 
          padding: '1.5rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '8px',
          marginBottom: '1.5rem'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>Given by</div>
            <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>👤 {item.seller_name}</div>
          </div>
          <div style={{ padding: '0.75rem', backgroundColor: '#10b98120', borderRadius: '6px', color: '#10b981', fontWeight: '600', textAlign: 'center' }}>
            📦 Available for free pickup
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={onClose}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Close
          </button>
          <a 
            href={`mailto:${item.seller_email || item.seller_id}?subject=Interest in ${item.title}&body=Hi, I'm interested in your item "${item.title}" posted on Campus Hub. Is it still available?`}
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
              textAlign: 'center',
              display: 'block'
            }}
          >
            📧 Contact Seller
          </a>
        </div>
      </div>
    </div>
  );
}
