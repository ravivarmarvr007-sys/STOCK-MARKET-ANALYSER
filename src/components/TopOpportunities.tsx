import React from 'react';
import { StockSummary } from '../types';
import { Sparkles, ArrowUpRight, ShieldAlert, Award } from 'lucide-react';

interface TopOpportunitiesProps {
  opportunities: StockSummary[];
  onSelectStock: (symbol: string) => void;
}

export const TopOpportunities: React.FC<TopOpportunitiesProps> = ({ opportunities, onSelectStock }) => {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div className="flex-row items-center justify-between" style={{ marginBottom: '1rem' }}>
        <div className="flex-row items-center gap-2">
          <Sparkles size={18} color="#f59e0b" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
            AI Top Opportunities
          </h2>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
            (Ranked by Composite AI Score • Multi-Factor Confluence)
          </span>
        </div>
        <span style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 600 }}>
          Top {opportunities.length} Indian Equities
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
        gap: '1rem'
      }}>
        {opportunities.map((stock, idx) => {
          const isPos = stock.change_pct >= 0;
          return (
            <div
              key={stock.symbol}
              className="glass-panel-interactive"
              onClick={() => onSelectStock(stock.symbol)}
              style={{
                padding: '1.1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Rank Accent Badge */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                background: idx === 0 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(255,255,255,0.06)',
                color: idx === 0 ? '#ffffff' : '#94a3b8',
                padding: '0.2rem 0.6rem',
                borderBottomLeftRadius: '8px',
                fontSize: '0.7rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                {idx === 0 && <Award size={11} />}
                #{idx + 1}
              </div>

              <div>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '0.25rem' }}>
                  <span className="num-font" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                    {stock.symbol}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {stock.sector.split(' ')[0]}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.75rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {stock.name}
                </div>

                {/* Price & Signal Row */}
                <div className="flex-row items-center justify-between" style={{ marginBottom: '0.85rem' }}>
                  <div>
                    <div className="num-font" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f1f5f9' }}>
                      ₹{stock.current_price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </div>
                    <div className="num-font" style={{ fontSize: '0.75rem', fontWeight: 600, color: isPos ? '#10b981' : '#f43f5e' }}>
                      {isPos ? '+' : ''}{stock.change_pct.toFixed(2)}% today
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div className="flex-row items-center gap-1 justify-center">
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>AI Score:</span>
                      <span className="num-font" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#34d399' }}>
                        {stock.ai_score}
                      </span>
                    </div>
                    <span className={`badge ${stock.signal === 'STRONG BUY' ? 'badge-strong-buy' : 'badge-buy'}`} style={{ marginTop: '3px' }}>
                      {stock.signal}
                    </span>
                  </div>
                </div>

                {/* Why it ranked highly */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '6px',
                  marginBottom: '0.75rem',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#38bdf8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Why it ranked highly:
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {stock.why_factors.slice(0, 2).map((factor, fIdx) => (
                      <li key={fIdx} style={{ fontSize: '0.73rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
                        <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span> {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Footer Meta */}
              <div className="flex-row items-center justify-between" style={{ fontSize: '0.7rem', color: '#94a3b8', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="flex-row items-center gap-1">
                  Confidence: <strong className="num-font" style={{ color: '#e2e8f0' }}>{stock.confidence}%</strong>
                </span>
                <span style={{
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: stock.risk_level === 'LOW RISK' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                  color: stock.risk_level === 'LOW RISK' ? '#34d399' : '#fbbf24',
                  fontSize: '0.65rem',
                  fontWeight: 700
                }}>
                  {stock.risk_level}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
