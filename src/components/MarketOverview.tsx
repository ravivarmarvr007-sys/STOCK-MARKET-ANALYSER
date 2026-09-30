import React from 'react';
import { MarketIndex, MarketBreadth, MarketRegime } from '../types';
import { TrendingUp, TrendingDown, Minus, Activity, Compass, CheckCircle2 } from 'lucide-react';

interface MarketOverviewProps {
  indices: MarketIndex[];
  breadth: MarketBreadth;
  regime: MarketRegime;
}

export const MarketOverview: React.FC<MarketOverviewProps> = ({ indices, breadth, regime }) => {
  // Render mini SVG sparkline
  const renderSparkline = (data: number[], isPositive: boolean) => {
    if (!data || data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 80;
    const height = 28;
    
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    }).join(' ');

    const strokeColor = isPositive ? '#10b981' : '#f43f5e';
    const fillColor = isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)';

    return (
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        <polygon 
          points={`0,${height} ${points} ${width},${height}`} 
          fill={fillColor} 
        />
        <polyline 
          fill="none" 
          stroke={strokeColor} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          points={points} 
        />
      </svg>
    );
  };

  const sentimentLevels = ['VERY BEARISH', 'BEARISH', 'NEUTRAL', 'BULLISH', 'VERY BULLISH'];
  const curSentimentIdx = sentimentLevels.indexOf(breadth.sentiment_category);

  return (
    <div className="flex-col gap-6" style={{ marginBottom: '2rem' }}>
      
      {/* 1. Market Indices Row */}
      <div>
        <div className="flex-row items-center justify-between" style={{ marginBottom: '0.85rem' }}>
          <div className="flex-row items-center gap-2">
            <Activity size={18} color="#10b981" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
              Indian Market Indices
            </h2>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              (Live/Latest Available • NSE/BSE)
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Data as of: <strong style={{ color: '#e2e8f0' }}>{breadth.timestamp}</strong>
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem'
        }}>
          {indices.map((idx) => {
            const isPos = idx.change_pct >= 0;
            // VIX is inverted: negative VIX is bullish
            const isVix = idx.symbol === 'INDIA VIX';
            const favorable = isVix ? !isPos : isPos;

            return (
              <div 
                key={idx.symbol}
                className="glass-panel-interactive"
                style={{ padding: '0.85rem 1rem' }}
              >
                <div className="flex-row items-center justify-between" style={{ marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8' }}>
                    {idx.symbol}
                  </span>
                  {idx.trend === 'Bullish' && <TrendingUp size={14} color="#10b981" />}
                  {idx.trend === 'Bearish' && <TrendingDown size={14} color="#f43f5e" />}
                  {idx.trend === 'Neutral' && <Minus size={14} color="#f59e0b" />}
                </div>

                <div className="flex-row items-baseline justify-between">
                  <span className="num-font" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
                    {idx.current_value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                  {renderSparkline(idx.sparkline, favorable)}
                </div>

                <div className="flex-row items-center justify-between" style={{ marginTop: '0.35rem' }}>
                  <span 
                    className="num-font"
                    style={{ 
                      fontSize: '0.78rem', 
                      fontWeight: 600,
                      color: isPos ? '#10b981' : '#f43f5e' 
                    }}
                  >
                    {isPos ? '+' : ''}{idx.change_amount.toFixed(2)} ({isPos ? '+' : ''}{idx.change_pct.toFixed(2)}%)
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                    {idx.name.split(' ')[0]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Market Breadth & Market Regime Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '1rem'
      }}>
        
        {/* Market Breadth & Sentiment Dial */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div className="flex-row items-center justify-between" style={{ marginBottom: '1rem' }}>
            <div className="flex-row items-center gap-2">
              <Compass size={18} color="#06b6d4" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9' }}>
                Market Breadth &amp; Sentiment
              </h3>
            </div>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px',
              background: curSentimentIdx >= 3 ? 'rgba(16,185,129,0.2)' : (curSentimentIdx <= 1 ? 'rgba(244,63,94,0.2)' : 'rgba(245,158,11,0.2)'),
              color: curSentimentIdx >= 3 ? '#34d399' : (curSentimentIdx <= 1 ? '#fb7185' : '#fbbf24'),
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              {breadth.sentiment_category}
            </span>
          </div>

          {/* Breadth Numbers */}
          <div className="grid grid-cols-4 gap-2" style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '0.6rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Advancing</div>
              <div className="num-font" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10b981' }}>
                {breadth.advancing}
              </div>
            </div>
            <div style={{ background: 'rgba(244, 63, 94, 0.08)', padding: '0.6rem', borderRadius: '8px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Declining</div>
              <div className="num-font" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f43f5e' }}>
                {breadth.declining}
              </div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Unchanged</div>
              <div className="num-font" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#94a3b8' }}>
                {breadth.unchanged}
              </div>
            </div>
            <div style={{ background: 'rgba(99, 102, 241, 0.08)', padding: '0.6rem', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>A/D Ratio</div>
              <div className="num-font" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#818cf8' }}>
                {breadth.ad_ratio}x
              </div>
            </div>
          </div>

          {/* Sentiment Segmented Gauge */}
          <div>
            <div className="flex-row items-center justify-between" style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.4rem' }}>
              <span>Sentiment Spectrum:</span>
              <span className="num-font" style={{ color: '#38bdf8' }}>Score: {breadth.sentiment_score}/100</span>
            </div>
            <div style={{ display: 'flex', gap: '4px', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
              {sentimentLevels.map((lvl, idx) => {
                const isActive = lvl === breadth.sentiment_category;
                const colors = ['#e11d48', '#f43f5e', '#f59e0b', '#10b981', '#059669'];
                return (
                  <div 
                    key={lvl}
                    style={{
                      flex: 1,
                      backgroundColor: colors[idx],
                      opacity: isActive ? 1 : 0.25,
                      boxShadow: isActive ? `0 0 10px ${colors[idx]}` : 'none',
                      transition: 'all 0.3s ease'
                    }}
                    title={lvl}
                  />
                );
              })}
            </div>
            <div className="flex-row justify-between" style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.35rem' }}>
              <span>VERY BEARISH</span>
              <span>NEUTRAL</span>
              <span>VERY BULLISH</span>
            </div>
          </div>
        </div>

        {/* AI Market Regime Card */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div className="flex-row items-center justify-between" style={{ marginBottom: '0.85rem' }}>
            <div className="flex-row items-center gap-2">
              <Compass size={18} color="#8b5cf6" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9' }}>
                AI Market Regime Classification
              </h3>
            </div>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.25))',
              color: '#34d399',
              border: '1px solid rgba(16,185,129,0.4)',
              boxShadow: '0 0 12px rgba(16,185,129,0.2)'
            }}>
              {regime.regime.toUpperCase()} ({regime.regime_score}/100)
            </span>
          </div>

          <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.75rem', lineHeight: 1.4 }}>
            Quantitative macro evaluation synthesizing Nifty trend slopes, volatility surfaces, sector rotation, and domestic liquidity:
          </p>

          <div className="flex-col gap-2">
            {regime.reasons.map((reason, i) => (
              <div key={i} className="flex-row items-start gap-2" style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                <CheckCircle2 size={15} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
