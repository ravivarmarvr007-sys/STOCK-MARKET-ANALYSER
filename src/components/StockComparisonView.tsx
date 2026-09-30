import React, { useState, useEffect } from 'react';
import { compareStocks } from '../services/api';
import { StockSummary } from '../types';
import { Layers, Plus, X, Award, CheckCircle2, TrendingUp, BarChart2 } from 'lucide-react';

interface StockComparisonViewProps {
  onSelectStock: (symbol: string) => void;
}

const POPULAR_SYMBOLS = ["TCS", "INFY", "HCLTECH", "RELIANCE", "HDFCBANK", "ICICIBANK", "TATAMOTORS", "ITC"];

export const StockComparisonView: React.FC<StockComparisonViewProps> = ({ onSelectStock }) => {
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(["TCS", "INFY", "HCLTECH"]);
  const [comparisons, setComparisons] = useState<StockSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const loadComparisons = async () => {
    setLoading(true);
    try {
      const res = await compareStocks(selectedSymbols);
      setComparisons(res.comparisons || []);
    } catch (err) {
      console.error("Comparison load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComparisons();
  }, [selectedSymbols]);

  const addSymbol = (sym: string) => {
    if (selectedSymbols.length >= 5) return;
    if (!selectedSymbols.includes(sym)) {
      setSelectedSymbols([...selectedSymbols, sym]);
    }
  };

  const removeSymbol = (sym: string) => {
    if (selectedSymbols.length <= 2) return; // Keep at least 2
    setSelectedSymbols(selectedSymbols.filter(s => s !== sym));
  };

  if (loading && comparisons.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
        Loading comparison dataset...
      </div>
    );
  }

  return (
    <div className="flex-col gap-6" style={{ paddingBottom: '3rem' }}>
      
      {/* 1. Header Banner & Stock Selectors */}
      <div className="glass-panel-elevated" style={{ padding: '1.5rem' }}>
        <div className="flex-row items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div className="flex-row items-center gap-2">
              <Layers size={22} color="#06b6d4" />
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc' }}>
                Multi-Stock Comparative Analysis
              </h1>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
              Compare valuation multiples, capital efficiency, technical posture, and composite AI conviction side-by-side.
            </p>
          </div>

          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Comparing {selectedSymbols.length} of max 5 stocks
          </span>
        </div>

        {/* Selected Stock Chips */}
        <div className="flex-row items-center gap-2" style={{ flexWrap: 'wrap', marginBottom: '1rem' }}>
          {selectedSymbols.map((sym) => (
            <div
              key={sym}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(99, 102, 241, 0.2)',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                borderRadius: '8px',
                padding: '0.35rem 0.75rem',
                color: '#c7d2fe',
                fontWeight: 700,
                fontSize: '0.82rem'
              }}
            >
              <span className="num-font">{sym}</span>
              {selectedSymbols.length > 2 && (
                <button
                  onClick={() => removeSymbol(sym)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Quick Add Available Stocks */}
        <div className="flex-row items-center gap-2" style={{ flexWrap: 'wrap', fontSize: '0.75rem' }}>
          <span style={{ color: '#64748b' }}>Quick Add:</span>
          {POPULAR_SYMBOLS.filter(s => !selectedSymbols.includes(s)).map(sym => (
            <button
              key={sym}
              onClick={() => addSymbol(sym)}
              disabled={selectedSymbols.length >= 5}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '2px 8px',
                color: '#cbd5e1',
                cursor: selectedSymbols.length >= 5 ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Plus size={12} /> {sym}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Side-by-Side Comparison Matrix */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="fin-table">
            <thead>
              <tr>
                <th style={{ minWidth: '160px' }}>Metric</th>
                {comparisons.map(c => (
                  <th key={c.symbol} style={{ textAlign: 'center', minWidth: '140px' }}>
                    <div className="num-font" style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8' }}>
                      {c.symbol}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 'normal' }}>
                      {c.name.split(' ')[0]}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* AI Signal */}
              <tr>
                <td style={{ fontWeight: 600 }}>AI Signal</td>
                {comparisons.map(c => (
                  <td key={c.symbol} style={{ textAlign: 'center' }}>
                    <span className={`badge ${c.signal.includes('BUY') ? 'badge-buy' : 'badge-hold'}`}>
                      {c.signal}
                    </span>
                  </td>
                ))}
              </tr>

              {/* AI Score */}
              <tr>
                <td style={{ fontWeight: 600 }}>AI Score (0-100)</td>
                {comparisons.map(c => (
                  <td key={c.symbol} style={{ textAlign: 'center' }} className="num-font">
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>
                      {c.ai_score}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Current Price */}
              <tr>
                <td style={{ fontWeight: 600 }}>Current Price</td>
                {comparisons.map(c => (
                  <td key={c.symbol} style={{ textAlign: 'center' }} className="num-font">
                    ₹{c.current_price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </td>
                ))}
              </tr>

              {/* Day Change */}
              <tr>
                <td style={{ fontWeight: 600 }}>Day Change</td>
                {comparisons.map(c => {
                  const isPos = c.change_pct >= 0;
                  return (
                    <td key={c.symbol} style={{ textAlign: 'center' }} className="num-font">
                      <span style={{ color: isPos ? '#10b981' : '#f43f5e', fontWeight: 600 }}>
                        {isPos ? '+' : ''}{c.change_pct}%
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* P/E Ratio */}
              <tr>
                <td style={{ fontWeight: 600 }}>P/E Valuation</td>
                {comparisons.map(c => (
                  <td key={c.symbol} style={{ textAlign: 'center' }} className="num-font">
                    {c.pe_ratio}x
                  </td>
                ))}
              </tr>

              {/* ROE */}
              <tr>
                <td style={{ fontWeight: 600 }}>Return on Equity (ROE)</td>
                {comparisons.map(c => (
                  <td key={c.symbol} style={{ textAlign: 'center' }} className="num-font">
                    <span style={{ color: c.roe >= 20 ? '#10b981' : '#f8fafc', fontWeight: 700 }}>
                      {c.roe}%
                    </span>
                  </td>
                ))}
              </tr>

              {/* Debt to Equity */}
              <tr>
                <td style={{ fontWeight: 600 }}>Debt to Equity</td>
                {comparisons.map(c => (
                  <td key={c.symbol} style={{ textAlign: 'center' }} className="num-font">
                    {c.debt_to_equity}x
                  </td>
                ))}
              </tr>

              {/* RSI (14) */}
              <tr>
                <td style={{ fontWeight: 600 }}>RSI (14 Wilder)</td>
                {comparisons.map(c => (
                  <td key={c.symbol} style={{ textAlign: 'center' }} className="num-font">
                    {c.rsi}
                  </td>
                ))}
              </tr>

              {/* Technical Posture */}
              <tr>
                <td style={{ fontWeight: 600 }}>Trend Posture</td>
                {comparisons.map(c => (
                  <td key={c.symbol} style={{ textAlign: 'center' }}>
                    <span style={{ color: c.trend === 'Bullish' ? '#10b981' : '#fbbf24', fontWeight: 600 }}>
                      {c.trend}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Model Confidence */}
              <tr>
                <td style={{ fontWeight: 600 }}>Model Confidence</td>
                {comparisons.map(c => (
                  <td key={c.symbol} style={{ textAlign: 'center' }} className="num-font">
                    {c.confidence}%
                  </td>
                ))}
              </tr>

              {/* Risk Level */}
              <tr>
                <td style={{ fontWeight: 600 }}>Risk Assessment</td>
                {comparisons.map(c => (
                  <td key={c.symbol} style={{ textAlign: 'center' }}>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: c.risk_level === 'LOW RISK' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                      color: c.risk_level === 'LOW RISK' ? '#34d399' : '#fbbf24'
                    }}>
                      {c.risk_level}
                    </span>
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Visual Bar Comparison Chart */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem' }}>
          Comparative Factor Comparison (AI Score vs ROE vs Valuation)
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* AI Score Comparison */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem' }}>
              AI COMPOSITE SCORE (0 - 100)
            </div>
            {comparisons.map(c => (
              <div key={c.symbol} style={{ marginBottom: '8px' }}>
                <div className="flex-row items-center justify-between" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 600 }}>{c.symbol}</span>
                  <span className="num-font" style={{ color: '#10b981', fontWeight: 700 }}>{c.ai_score}</span>
                </div>
                <div style={{ height: '7px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${c.ai_score}%`, height: '100%', background: '#10b981', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>

          {/* ROE Comparison */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem' }}>
              RETURN ON EQUITY (ROE %)
            </div>
            {comparisons.map(c => (
              <div key={c.symbol} style={{ marginBottom: '8px' }}>
                <div className="flex-row items-center justify-between" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 600 }}>{c.symbol}</span>
                  <span className="num-font" style={{ color: '#06b6d4', fontWeight: 700 }}>{c.roe}%</span>
                </div>
                <div style={{ height: '7px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, c.roe * 1.8)}%`, height: '100%', background: '#06b6d4', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
