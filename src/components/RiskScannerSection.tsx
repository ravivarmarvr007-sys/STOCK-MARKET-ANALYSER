import React from 'react';
import { AlertOctagon, AlertTriangle, ShieldCheck, Flame, ChevronRight } from 'lucide-react';

interface RiskScannerSectionProps {
  flaggedStocks: any[];
  onSelectStock: (symbol: string) => void;
}

export const RiskScannerSection: React.FC<RiskScannerSectionProps> = ({ flaggedStocks, onSelectStock }) => {
  if (!flaggedStocks || flaggedStocks.length === 0) return null;

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '2rem', border: '1px solid rgba(244, 63, 94, 0.25)' }}>
      <div className="flex-row items-center justify-between" style={{ marginBottom: '0.85rem' }}>
        <div className="flex-row items-center gap-2">
          <AlertOctagon size={18} color="#f43f5e" />
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
            AI Risk Scanner &amp; Breakdown Alerts
          </h2>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
            (Technical &amp; Fundamental Deterioration Detection)
          </span>
        </div>
        <div className="flex-row items-center gap-2">
          <span style={{
            fontSize: '0.7rem',
            padding: '2px 8px',
            borderRadius: '4px',
            background: 'rgba(244, 63, 94, 0.15)',
            color: '#f43f5e',
            fontWeight: 700,
            border: '1px solid rgba(244, 63, 94, 0.3)'
          }}>
            {flaggedStocks.length} Flagged Securites
          </span>
        </div>
      </div>

      <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '1rem' }}>
        The risk detection engine scans for technical breakdowns below the 200 DMA, extreme RSI extensions, overleveraged balance sheets, and accelerating negative price or news momentum.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '0.75rem'
      }}>
        {flaggedStocks.map((item) => {
          const isHigh = item.risk_level === 'HIGH RISK' || item.risk_level === 'EXTREME RISK';
          return (
            <div
              key={item.symbol}
              onClick={() => onSelectStock(item.symbol)}
              style={{
                background: 'rgba(15, 23, 42, 0.65)',
                border: isHigh ? '1px solid rgba(244, 63, 94, 0.35)' : '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: '8px',
                padding: '0.75rem 0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(23, 33, 53, 0.85)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.65)'}
            >
              <div className="flex-row items-center justify-between" style={{ marginBottom: '0.4rem' }}>
                <div className="flex-row items-center gap-2">
                  <span className="num-font" style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
                    {item.symbol}
                  </span>
                  <span className="num-font" style={{ fontSize: '0.78rem', color: item.change_pct >= 0 ? '#10b981' : '#f43f5e' }}>
                    ₹{item.current_price} ({item.change_pct >= 0 ? `+${item.change_pct.toFixed(2)}` : item.change_pct.toFixed(2)}%)
                  </span>
                </div>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: isHigh ? 'rgba(244, 63, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: isHigh ? '#fb7185' : '#fbbf24',
                  border: isHigh ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)'
                }}>
                  {item.risk_level}
                </span>
              </div>

              <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
                {item.risks && item.risks[0] ? (
                  <div className="flex-row items-start gap-1">
                    <AlertTriangle size={13} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{item.risks[0]}</span>
                  </div>
                ) : (
                  <span>Volatility &amp; valuation expansion flag</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
