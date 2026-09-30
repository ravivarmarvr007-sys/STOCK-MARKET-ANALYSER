import React, { useState, useEffect } from 'react';
import { 
  fetchStockDetail, 
  fetchStockHistory, 
  toggleWatchlist, 
  fetchWatchlist 
} from '../services/api';
import { HistoricalBar } from '../types';
import { InteractiveChart } from './InteractiveChart';
import { 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Award, 
  Bookmark, 
  Share2, 
  Newspaper, 
  DollarSign, 
  Activity, 
  BarChart, 
  Scale, 
  HelpCircle 
} from 'lucide-react';

interface StockAnalysisViewProps {
  symbol: string;
  onSelectStock: (symbol: string) => void;
}

export const StockAnalysisView: React.FC<StockAnalysisViewProps> = ({ symbol, onSelectStock }) => {
  const [data, setData] = useState<any>(null);
  const [bars, setBars] = useState<HistoricalBar[]>([]);
  const [timeframe, setTimeframe] = useState('1Y');
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      fetchStockDetail(symbol),
      fetchStockHistory(symbol, timeframe),
      fetchWatchlist()
    ]).then(([detailRes, historyRes, watchlistRes]) => {
      if (isMounted) {
        setData(detailRes);
        setBars(historyRes.bars || []);
        setIsSaved(watchlistRes.symbols?.includes(symbol.toUpperCase()) || false);
        setLoading(false);
      }
    }).catch(err => {
      console.error("Failed to load stock data:", err);
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, [symbol, timeframe]);

  const handleToggleWatchlist = async () => {
    const res = await toggleWatchlist(symbol);
    setIsSaved(res.in_watchlist);
  };

  if (loading || !data) {
    return (
      <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
        <div className="live-pulse-dot" style={{ width: '16px', height: '16px', marginBottom: '1rem' }} />
        <p>Crunching quantitative technicals, fundamentals, and AI signals for <strong>{symbol}</strong>...</p>
      </div>
    );
  }

  const { quote, signal, technical, fundamentals, news, sentiment, predictions } = data;
  const isPos = quote.change_pct >= 0;

  // 52-week position calculation
  const w52High = quote.week_52_high || (quote.current_price * 1.25);
  const w52Low = quote.week_52_low || (quote.current_price * 0.75);
  const w52PosPct = Math.max(0, Math.min(100, ((quote.current_price - w52Low) / (w52High - w52Low || 1)) * 100));

  const getSignalBadgeClass = (sig: string) => {
    if (sig === 'STRONG BUY') return 'badge-strong-buy';
    if (sig === 'BUY') return 'badge-buy';
    if (sig === 'HOLD') return 'badge-hold';
    if (sig === 'SELL') return 'badge-sell';
    return 'badge-strong-sell';
  };

  return (
    <div className="flex-col gap-6" style={{ paddingBottom: '3rem' }}>
      
      {/* 1. Header Card with Live Ticker, 52W Range & Actions */}
      <div className="glass-panel-elevated" style={{ padding: '1.5rem' }}>
        <div className="flex-row items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          
          {/* Stock Name & Sector */}
          <div>
            <div className="flex-row items-center gap-3">
              <h1 className="num-font" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                {quote.symbol}
              </h1>
              <span className={`badge ${getSignalBadgeClass(signal.signal)}`} style={{ fontSize: '0.82rem', padding: '0.35rem 0.85rem' }}>
                {signal.signal}
              </span>
              <span style={{
                fontSize: '0.72rem',
                color: '#34d399',
                background: 'rgba(16,185,129,0.1)',
                padding: '3px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(16,185,129,0.25)',
                fontWeight: 600
              }}>
                {quote.data_mode || 'DEMO DATA'}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
              {quote.name} • {quote.sector} ({quote.market_cap_category})
            </p>
          </div>

          {/* Live Price & Day Change */}
          <div style={{ textAlign: 'right' }}>
            <div className="num-font" style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc' }}>
              ₹{quote.current_price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
            <div className="flex-row items-center justify-end gap-2">
              <span 
                className="num-font flex-row items-center gap-1"
                style={{ 
                  fontSize: '0.9rem', 
                  fontWeight: 700, 
                  color: isPos ? '#10b981' : '#f43f5e' 
                }}
              >
                {isPos ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {isPos ? '+' : ''}{quote.change_amount.toFixed(2)} ({isPos ? '+' : ''}{quote.change_pct.toFixed(2)}%)
              </span>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Today</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex-row items-center gap-2">
            <button 
              onClick={handleToggleWatchlist}
              className="btn-secondary"
              style={{
                background: isSaved ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                borderColor: isSaved ? '#10b981' : 'var(--border-color)',
                color: isSaved ? '#34d399' : '#e2e8f0'
              }}
            >
              <Bookmark size={15} fill={isSaved ? '#10b981' : 'none'} />
              <span>{isSaved ? 'In Watchlist' : 'Add to Watchlist'}</span>
            </button>
          </div>

        </div>

        {/* 52-Week Range Bar */}
        <div style={{ background: 'rgba(10, 16, 28, 0.6)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div className="flex-row items-center justify-between" style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
            <span>52W Low: <strong className="num-font" style={{ color: '#f87171' }}>₹{w52Low}</strong></span>
            <span>Current Position in 52-Week Range ({w52PosPct.toFixed(0)}%)</span>
            <span>52W High: <strong className="num-font" style={{ color: '#34d399' }}>₹{w52High}</strong></span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${w52PosPct}%`,
              background: 'linear-gradient(90deg, #f43f5e 0%, #fbbf24 50%, #10b981 100%)',
              borderRadius: '3px'
            }} />
          </div>
        </div>

      </div>

      {/* 2. AI Decision Support Hero Card (Signal, Score, Confidence, Why & Risks) */}
      <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
        
        {/* Top bar of signal card */}
        <div className="flex-row items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div className="flex-row items-center gap-3">
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: signal.signal.includes('BUY') 
                ? 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(5,150,105,0.4))'
                : 'linear-gradient(135deg, rgba(244,63,94,0.3), rgba(225,29,72,0.4))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <Award size={26} color={signal.signal.includes('BUY') ? '#10b981' : '#f43f5e'} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                AI Recommendation Signal
              </div>
              <div className="flex-row items-center gap-2">
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: signal.signal.includes('BUY') ? '#34d399' : '#fb7185' }}>
                  {signal.signal}
                </span>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  background: signal.risk_level === 'LOW RISK' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                  color: signal.risk_level === 'LOW RISK' ? '#34d399' : '#fbbf24',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  {signal.risk_level}
                </span>
              </div>
            </div>
          </div>

          {/* Scores Pill cluster */}
          <div className="flex-row items-center gap-4">
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.6rem 1.1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>AI Composite Score</div>
              <div className="num-font" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>
                {signal.ai_score}<span style={{ fontSize: '0.85rem', color: '#64748b' }}>/100</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.6rem 1.1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Model Confidence</div>
              <div className="num-font" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#a78bfa' }}>
                {signal.confidence}%
              </div>
              <div style={{ fontSize: '0.62rem', color: '#64748b', marginTop: '-2px' }}>sub-indicator consensus</div>
            </div>
          </div>
        </div>

        {/* Explainability factors: Why? and Risks */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1rem',
          background: 'rgba(10, 16, 28, 0.7)',
          padding: '1.25rem',
          borderRadius: '10px',
          border: '1px solid var(--border-color)'
        }}>
          
          {/* Why positive */}
          <div>
            <div className="flex-row items-center gap-2" style={{ marginBottom: '0.6rem' }}>
              <CheckCircle2 size={16} color="#10b981" />
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399' }}>
                Why this Signal? (Supporting Quantitative Factors)
              </h4>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {signal.why_factors.map((factor: string, i: number) => (
                <li key={i} style={{ fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '0.4rem', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Risks */}
          <div>
            <div className="flex-row items-center gap-2" style={{ marginBottom: '0.6rem' }}>
              <AlertTriangle size={16} color="#f59e0b" />
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24' }}>
                Model Risk &amp; Invalidation Factors
              </h4>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {signal.risks.map((risk: string, i: number) => (
                <li key={i} style={{ fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '0.4rem', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ color: '#f59e0b', fontWeight: 700 }}>⚠</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>

      {/* 3. Interactive Financial Chart */}
      <InteractiveChart
        bars={bars}
        symbol={quote.symbol}
        timeframe={timeframe}
        onTimeframeChange={(tf) => setTimeframe(tf)}
      />

      {/* 4. Multi-Horizon Predictions Card */}
      {predictions && (
        <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div className="flex-row items-center justify-between" style={{ marginBottom: '0.75rem' }}>
            <div className="flex-row items-center gap-2">
              <Activity size={18} color="#06b6d4" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                Quantitative Multi-Horizon Forecast
              </h3>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              Model: <strong style={{ color: '#38bdf8' }}>{data.model_version}</strong>
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '0.75rem'
          }}>
            {[predictions.day_1, predictions.day_5, predictions.day_20].map((pred, i) => {
              const isUp = pred.direction === 'UP';
              const isDown = pred.direction === 'DOWN';
              return (
                <div 
                  key={i}
                  style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div className="flex-row items-center justify-between" style={{ marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>
                      {pred.horizon}
                    </span>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: isUp ? 'rgba(16,185,129,0.2)' : (isDown ? 'rgba(244,63,94,0.2)' : 'rgba(245,158,11,0.2)'),
                      color: isUp ? '#34d399' : (isDown ? '#fb7185' : '#fbbf24')
                    }}>
                      {pred.direction}
                    </span>
                  </div>

                  <div className="flex-row items-baseline gap-2" style={{ marginBottom: '0.35rem' }}>
                    <span className="num-font" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                      {pred.estimated_range}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>est. range</span>
                  </div>

                  <div className="flex-row items-center justify-between" style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    <span>Confidence: <strong className="num-font" style={{ color: '#a78bfa' }}>{pred.confidence}%</strong></span>
                    <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{pred.rationale}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Technical Indicators Section */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div className="flex-row items-center justify-between" style={{ marginBottom: '1rem' }}>
          <div className="flex-row items-center gap-2">
            <BarChart size={18} color="#10b981" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
              Technical Indicator Suite
            </h3>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Calculated from daily OHLCV</span>
        </div>

        {/* Indicator Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1rem'
        }}>
          
          {/* RSI */}
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>RSI (14 Wilder)</div>
            <div className="num-font" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
              {technical.rsi}
            </div>
            <div style={{ fontSize: '0.7rem', color: technical.rsi_status === 'Overbought' ? '#fbbf24' : (technical.rsi_status === 'Oversold' ? '#34d399' : '#94a3b8') }}>
              Status: <strong>{technical.rsi_status}</strong>
            </div>
          </div>

          {/* MACD */}
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>MACD (12, 26, 9)</div>
            <div className="num-font" style={{ fontSize: '1.25rem', fontWeight: 700, color: technical.macd_hist >= 0 ? '#10b981' : '#f43f5e', marginTop: '2px' }}>
              {technical.macd}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>
              {technical.macd_posture}
            </div>
          </div>

          {/* ADX */}
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>ADX Trend Strength</div>
            <div className="num-font" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
              {technical.adx}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#38bdf8' }}>
              Strength: <strong>{technical.adx_strength}</strong>
            </div>
          </div>

          {/* Moving Average Trend */}
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>DMA Posture</div>
            <div className="num-font" style={{ fontSize: '1.25rem', fontWeight: 700, color: technical.trend === 'Bullish' ? '#10b981' : '#f43f5e', marginTop: '2px' }}>
              {technical.trend}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
              50 DMA: ₹{technical.sma_50}
            </div>
          </div>

          {/* Support & Resistance */}
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Support / Resistance</div>
            <div className="num-font" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>
              S1: ₹{technical.support}
            </div>
            <div className="num-font" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f43f5e' }}>
              R1: ₹{technical.resistance}
            </div>
          </div>

          {/* Volume vs 20D Avg */}
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Volume vs 20D Avg</div>
            <div className="num-font" style={{ fontSize: '1.25rem', fontWeight: 700, color: technical.volume_change_pct >= 0 ? '#10b981' : '#94a3b8', marginTop: '2px' }}>
              {technical.volume_change_pct >= 0 ? `+${technical.volume_change_pct.toFixed(1)}%` : `${technical.volume_change_pct.toFixed(1)}%`}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
              Avg: {(technical.volume_20d_avg / 1000).toFixed(0)}k shares
            </div>
          </div>

        </div>

        {/* Explainable AI Technical Commentary */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.06)',
          borderLeft: '4px solid #10b981',
          padding: '0.85rem 1rem',
          borderRadius: '4px',
          fontSize: '0.8rem',
          color: '#e2e8f0',
          lineHeight: 1.5
        }}>
          <strong style={{ color: '#34d399' }}>AI Technical Synthesis: </strong>
          {technical.ai_explanation}
        </div>
      </div>

      {/* 6. Fundamental Analysis Section */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div className="flex-row items-center justify-between" style={{ marginBottom: '1rem' }}>
          <div className="flex-row items-center gap-2">
            <DollarSign size={18} color="#fbbf24" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
              Fundamental Health &amp; Valuation
            </h3>
          </div>

          {/* AI Classifications Badges */}
          <div className="flex-row items-center gap-2">
            <span style={{
              fontSize: '0.7rem',
              padding: '2px 8px',
              borderRadius: '4px',
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)'
            }}>
              Valuation: {fundamentals.valuation_class}
            </span>
            <span style={{
              fontSize: '0.7rem',
              padding: '2px 8px',
              borderRadius: '4px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              Health: {fundamentals.financial_health}
            </span>
            <span style={{
              fontSize: '0.7rem',
              padding: '2px 8px',
              borderRadius: '4px',
              background: 'rgba(168, 85, 247, 0.15)',
              color: '#c084fc',
              border: '1px solid rgba(168, 85, 247, 0.3)'
            }}>
              Growth: {fundamentals.growth_class}
            </span>
          </div>
        </div>

        {/* Fundamental Metrics Table Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Market Cap</div>
            <div className="num-font" style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
              ₹{(fundamentals.market_cap_cr / 1000).toFixed(1)}k Cr
            </div>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>P/E Ratio</div>
            <div className="num-font" style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
              {fundamentals.pe_ratio}x
            </div>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>ROE / ROCE</div>
            <div className="num-font" style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981' }}>
              {fundamentals.roe}% / {fundamentals.roce}%
            </div>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Debt / Equity</div>
            <div className="num-font" style={{ fontSize: '1rem', fontWeight: 700, color: fundamentals.debt_to_equity > 1.0 ? '#f43f5e' : '#34d399' }}>
              {fundamentals.debt_to_equity}x
            </div>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Revenue Growth</div>
            <div className="num-font" style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
              +{fundamentals.revenue_growth_pct}%
            </div>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Operating Margin</div>
            <div className="num-font" style={{ fontSize: '1rem', fontWeight: 700, color: '#38bdf8' }}>
              {fundamentals.operating_margin_pct}%
            </div>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Dividend Yield</div>
            <div className="num-font" style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
              {fundamentals.dividend_yield_pct}%
            </div>
          </div>
        </div>

        {/* 4-Year Trajectory Table */}
        {fundamentals.financial_trajectory && (
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              Multi-Year Financial Trajectory
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="fin-table">
                <thead>
                  <tr>
                    <th>Fiscal Year</th>
                    <th>Revenue (₹ Cr)</th>
                    <th>Net Profit (₹ Cr)</th>
                    <th>Operating Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {fundamentals.financial_trajectory.map((row: any, idx: number) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{row.year}</td>
                      <td className="num-font">₹{row.revenue_cr.toLocaleString('en-IN')}</td>
                      <td className="num-font" style={{ color: '#10b981' }}>₹{row.net_profit_cr.toLocaleString('en-IN')}</td>
                      <td className="num-font">{row.op_margin_pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 7. News & Sentiment Section */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div className="flex-row items-center justify-between" style={{ marginBottom: '1rem' }}>
          <div className="flex-row items-center gap-2">
            <Newspaper size={18} color="#38bdf8" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
              News &amp; Corporate Announcements
            </h3>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            Sentiment Score: <strong className="num-font" style={{ color: '#38bdf8' }}>{sentiment.sentiment_score >= 0 ? `+${sentiment.sentiment_score.toFixed(1)}` : sentiment.sentiment_score.toFixed(1)}</strong>/100 ({sentiment.sentiment_label})
          </span>
        </div>

        <div className="flex-col gap-3">
          {news && news.map((item: any, i: number) => (
            <div 
              key={i}
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}
            >
              <div className="flex-row items-center justify-between" style={{ marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  {item.source} • {item.timestamp}
                </span>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: item.sentiment === 'Positive' ? 'rgba(16,185,129,0.15)' : (item.sentiment === 'Negative' ? 'rgba(244,63,94,0.15)' : 'rgba(245,158,11,0.15)'),
                  color: item.sentiment === 'Positive' ? '#34d399' : (item.sentiment === 'Negative' ? '#fb7185' : '#fbbf24')
                }}>
                  {item.sentiment}
                </span>
              </div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.3rem' }}>
                {item.headline}
              </h4>
              <p style={{ fontSize: '0.76rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                {item.summary}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
