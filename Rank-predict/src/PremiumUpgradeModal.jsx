import React from 'react';

export default function PremiumUpgradeModal({ onClose, currentCredits }) {
  return (
    <div className="auth-overlay" style={{ zIndex: 300 }} onClick={onClose}>
      <div 
        className="auth-shell" 
        style={{ maxWidth: '500px', width: '90%', padding: '32px' }}
        onClick={e => e.stopPropagation()}
      >
        <button className="rating-close" onClick={onClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '28px', color: 'var(--accent-1)', marginBottom: '8px' }}>
            Insufficient Credits
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: '1.5' }}>
            You have {currentCredits} credits remaining. Each prediction requires 10 credits. 
            Upgrade to Premium for unlimited predictions, or wait until your daily reset.
          </p>
        </div>

        <div 
          className="premium-plan-card" 
          style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(99, 102, 241, 0.1))',
            border: '1px solid var(--accent-1)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--accent-1)', color: '#fff', fontSize: '12px', fontWeight: 'bold', padding: '4px 16px', borderBottomLeftRadius: '12px' }}>
            BEST VALUE
          </div>
          <h3 style={{ fontSize: '22px', marginBottom: '12px', color: '#fff' }}>KCET Pro Pass</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--accent-1)', marginBottom: '16px' }}>
            ₹99 <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 'normal' }}>/ one-time</span>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', color: '#e2e8f0' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--green)' }}>✓</span> Unlimited Predictions
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--green)' }}>✓</span> Priority Access
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--green)' }}>✓</span> Faster Processing
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--green)' }}>✓</span> No Daily Limits
            </li>
          </ul>
        </div>

        <button 
          className="primary-btn" 
          style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: 'bold' }}
          onClick={() => alert("Premium Payment Gateway Coming Soon! For now, please wait for the daily credit reset.")}
        >
          Upgrade to Premium — Coming Soon
        </button>
      </div>
    </div>
  );
}
