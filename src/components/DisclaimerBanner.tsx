import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div style={{
      background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.15) 100%)',
      borderBottom: '1px solid rgba(245, 158, 11, 0.3)',
      padding: '0.45rem 1rem',
      fontSize: '0.74rem',
      color: '#fbbf24',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.75rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
        <AlertTriangle size={15} style={{ flexShrink: 0, color: '#f59e0b' }} />
        <span>
          <strong>Educational &amp; Research Platform Notice:</strong> StockSense AI is an educational, research, and quantitative decision-support tool. AI scores, signals, and predictions are probabilistic model estimates based on available historical market data and may be wrong. They do NOT constitute guaranteed returns or personalized financial advice.
        </span>
      </div>
      <button 
        onClick={() => setDismissed(true)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#fbbf24',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          opacity: 0.8
        }}
        title="Dismiss notice"
      >
        <X size={14} />
      </button>
    </div>
  );
};
