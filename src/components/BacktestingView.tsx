import React, { useState, useEffect } from 'react';
import { runBacktest } from '../services/api';
import { BacktestResult } from '../types';
import { 
  History, 
  Play, 
  TrendingUp, 
  DollarSign, 
  Percent, 
  ShieldAlert, 
  BarChart2, 
  CheckCircle2, 
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export const BacktestingView: React.FC = () => {
  const [symbol, setSymbol] = useState('TCS');
  const [strategy, setStrategy] = useState('AI BUY/SELL');
  const [capital, setCapital] = useState(100000);
  const [costPct, setCostPct] = useState(0.15);
  const [slippagePct, setSlippagePct] = useState(0.05);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const executeBacktest = async () => {
    setLoading(true);
    try {
      const res = await runBacktest({
        symbol,
        strategy,
        initial_capital: capital,
        transaction_cost_pct: costPct,
        slippage_pct: slippagePct
      });
      setResult(res);
    } catch (err) {
      console.error("Backtest failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeBacktest();
  }, []);

  // Helper for Equity Curve SVG
  const renderEquityCurve = () => {
    if (!result || !result.equity_curve || result.equity_curve.length === 0) return null;
    const curve = result.equity_curve;
    const width = 800;
    const height = 260;
    const margin = { top: 20, right: 60, bottom: 30, left: 20 };
    const chartW = width - margin.left - margin.right;
    const chartH = height - margin.top - margin.bottom;

    const allValues = curve.flatMap(c => [c.ai_strategy, c.buy_and_hold, c.nifty_50]);
    const minVal = Math.min(...allValues) * 0.95;
    const maxVal = Math.max(...allValues) * 1.05;
    const range = maxVal - minVal || 1;

    const getX = (i: number) => margin.left + (i / (curve.length - 1)) * chartW;
    const getY = (val: number) => margin.top + chartH - ((val - minVal) / range) * chartH;

    const generatePath = (key: 'ai_strategy' | 'buy_and_hold' | 'nifty_50') => {
      return curve.map((c, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(c[key])}`).join(' ');
    };

    const aiPath = generatePath('ai_strategy');
    const bhPath = generatePath('buy_and_hold');
    const niftyPath = generatePath('nifty_50');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((pct, i) => {
          const y = margin.top + chartH * pct;
          const label = Math.round(maxVal - pct * range);
          return (
            <g key={i}>
              <line x1={margin.left} y1={y} x2={margin.left + chartW} y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              <text x={margin.left + chartW + 6} y={y + 4} fill="#64748b" fontSize="10" fontFamily="'JetBrains Mono', monospace">
                ₹{(label / 1000).toFixed(0)}k
              </text>
            </g>
          );
        })}

        {/* Lines */}
        <path d={niftyPath} fill="none" stroke="#8b5cf6" strokeWidth="1.8" strokeDasharray="4 4" />
        <path d={bhPath} fill="none" stroke="#06b6d4" strokeWidth="1.8" />
        <path d={aiPath} fill="none" stroke="#10b981" strokeWidth="2.8" />

        {/* X Axis Labels */}
        {[0, 0.5, 1].map((pct, i) => {
          const idx = Math.floor(pct * (curve.length - 1));
          return (
            <text key={i} x={getX(idx)} y={height - 8} fill="#64748b" fontSize="10" fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
              {curve[idx].date}
            </text>
          );
        })}
      </svg>
    );
  };

  // Helper for Drawdown Curve SVG
  const renderDrawdownCurve = () => {
    if (!result || !result.drawdown_curve || result.drawdown_curve.length === 0) return null;
    const curve = result.drawdown_curve;
    const width = 800;
    const height = 120;
    const margin = { top: 10, right: 60, bottom: 20, left: 20 };
    const chartW = width - margin.left - margin.right;
    const chartH = height - margin.top - margin.bottom;

    const minDD = Math.min(...curve.map(c => c.drawdown_pct), -10);
    const range = Math.abs(minDD) || 1;

    const getX = (i: number) => margin.left + (i / (curve.length - 1)) * chartW;
    const getY = (val: number) => margin.top + (Math.abs(val) / range) * chartH;

    const points = curve.map((c, i) => `${getX(i)},${getY(c.drawdown_pct)}`).join(' ');
    const areaPath = `M ${margin.left} ${margin.top} L ${points} L ${getX(curve.length - 1)} ${margin.top} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        <path d={areaPath} fill="rgba(244, 63, 94, 0.25)" />
        <polyline fill="none" stroke="#f43f5e" strokeWidth="1.5" points={points} />
        <text x={margin.left + chartW + 6} y={margin.top + chartH} fill="#f43f5e" fontSize="10" fontFamily="'JetBrains Mono', monospace">
          {minDD.toFixed(1)}% Max
        </text>
      </svg>
    );
  };

  return (
    <div className="flex-col gap-6" style={{ paddingBottom: '3rem' }}>
      
      {/* 1. Header Banner & Config Panel */}
      <div className="glass-panel-elevated" style={{ padding: '1.5rem' }}>
        <div className="flex-row items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div className="flex-row items-center gap-2">
              <History size={22} color="#10b981" />
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc' }}>
                Algorithmic Strategy Backtesting
              </h1>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
              Simulates historical event-driven strategy execution against benchmark buy-and-hold and NIFTY 50 index with real transaction frictions and slippage.
            </p>
          </div>

          <button
            onClick={executeBacktest}
            className="btn-primary"
            disabled={loading}
          >
            <Play size={16} />
            <span>{loading ? 'RUNNING SIMULATION...' : 'RUN BACKTEST'}</span>
          </button>
        </div>

        {/* Input Parameters Form */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          background: 'rgba(10, 16, 28, 0.65)',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid var(--border-color)'
        }}>
          {/* Stock */}
          <div>
            <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Stock Universe</label>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.9)',
                color: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '0.45rem',
                fontSize: '0.8rem'
              }}
            >
              <option value="TCS">TCS (Tata Consultancy)</option>
              <option value="INFY">INFY (Infosys)</option>
              <option value="RELIANCE">RELIANCE (Reliance Ind.)</option>
              <option value="HDFCBANK">HDFCBANK (HDFC Bank)</option>
              <option value="TATAMOTORS">TATAMOTORS (Tata Motors)</option>
              <option value="ITC">ITC Ltd.</option>
              <option value="ZOMATO">ZOMATO</option>
            </select>
          </div>

          {/* Strategy */}
          <div>
            <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Strategy</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.9)',
                color: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '0.45rem',
                fontSize: '0.8rem'
              }}
            >
              <option value="AI BUY/SELL">StockSense AI Multi-Factor Signal</option>
              <option value="50 DMA Trend Following">50-DMA Trend Momentum</option>
              <option value="RSI Mean Reversion">RSI Extreme Mean Reversion</option>
            </select>
          </div>

          {/* Initial Capital */}
          <div>
            <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Initial Capital (₹)</label>
            <input
              type="number"
              value={capital}
              onChange={(e) => setCapital(Number(e.target.value))}
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.9)',
                color: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '0.45rem',
                fontSize: '0.8rem'
              }}
            />
          </div>

          {/* Transaction Cost % */}
          <div>
            <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Brokerage &amp; STT Cost (%)</label>
            <input
              type="number"
              step="0.05"
              value={costPct}
              onChange={(e) => setCostPct(Number(e.target.value))}
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.9)',
                color: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '0.45rem',
                fontSize: '0.8rem'
              }}
            />
          </div>

          {/* Slippage % */}
          <div>
            <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Execution Slippage (%)</label>
            <input
              type="number"
              step="0.01"
              value={slippagePct}
              onChange={(e) => setSlippagePct(Number(e.target.value))}
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.9)',
                color: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '0.45rem',
                fontSize: '0.8rem'
              }}
            />
          </div>
        </div>
      </div>

      {result && (
        <>
          {/* 2. Key Performance Indicators (KPIs) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '0.75rem'
          }}>
            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Ending Capital</div>
              <div className="num-font" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
                ₹{result.final_capital.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>
                +{result.total_return_pct}% Total Return
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>CAGR</div>
              <div className="num-font" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
                {result.cagr_pct}%
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                vs {result.benchmark_bh_cagr_pct}% Buy &amp; Hold
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Max Drawdown</div>
              <div className="num-font" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f43f5e', marginTop: '2px' }}>
                -{result.max_drawdown_pct}%
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Controlled capital risk
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Sharpe Ratio</div>
              <div className="num-font" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fbbf24', marginTop: '2px' }}>
                {result.sharpe_ratio}x
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Risk-adjusted return
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Win Rate</div>
              <div className="num-font" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
                {result.win_rate_pct}%
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                {result.winning_trades_count} wins / {result.total_trades} trades
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Best / Worst Trade</div>
              <div className="num-font" style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981', marginTop: '4px' }}>
                +{result.best_trade_pct}%
              </div>
              <div className="num-font" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f43f5e' }}>
                {result.worst_trade_pct}%
              </div>
            </div>
          </div>

          {/* 3. Equity Curve Chart */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div className="flex-row items-center justify-between" style={{ marginBottom: '1rem' }}>
              <div className="flex-row items-center gap-2">
                <BarChart2 size={18} color="#10b981" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                  Equity Growth Curve: AI Strategy vs Benchmarks
                </h3>
              </div>
              
              {/* Legend */}
              <div className="flex-row items-center gap-4" style={{ fontSize: '0.75rem' }}>
                <div className="flex-row items-center gap-1">
                  <div style={{ width: '12px', height: '3px', background: '#10b981' }} />
                  <span style={{ color: '#34d399', fontWeight: 600 }}>StockSense AI Strategy</span>
                </div>
                <div className="flex-row items-center gap-1">
                  <div style={{ width: '12px', height: '2px', background: '#06b6d4' }} />
                  <span style={{ color: '#38bdf8' }}>Buy &amp; Hold ({result.symbol})</span>
                </div>
                <div className="flex-row items-center gap-1">
                  <div style={{ width: '12px', height: '2px', background: '#8b5cf6', borderTop: '1px dashed #8b5cf6' }} />
                  <span style={{ color: '#c084fc' }}>NIFTY 50 Benchmark</span>
                </div>
              </div>
            </div>

            {renderEquityCurve()}
          </div>

          {/* 4. Drawdown Chart */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div className="flex-row items-center justify-between" style={{ marginBottom: '0.75rem' }}>
              <div className="flex-row items-center gap-2">
                <ShieldAlert size={18} color="#f43f5e" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                  Historical Drawdown Profile
                </h3>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Peak-to-trough equity reduction over time
              </span>
            </div>
            {renderDrawdownCurve()}
          </div>

          {/* 5. Executed Trades Audit Log */}
          <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                Recent Executed Trades Log (Net of Costs &amp; Slippage)
              </h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="fin-table">
                <thead>
                  <tr>
                    <th>Entry Date</th>
                    <th>Exit Date</th>
                    <th>Type</th>
                    <th>Entry Price</th>
                    <th>Exit Price</th>
                    <th>Return %</th>
                    <th>Exit Trigger</th>
                  </tr>
                </thead>
                <tbody>
                  {result.trades_sample.map((t, idx) => {
                    const isWin = t.return_pct > 0;
                    return (
                      <tr key={idx}>
                        <td className="num-font">{t.entry_date}</td>
                        <td className="num-font">{t.exit_date}</td>
                        <td>
                          <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#34d399', fontWeight: 700 }}>
                            {t.type}
                          </span>
                        </td>
                        <td className="num-font">₹{t.entry_price}</td>
                        <td className="num-font">₹{t.exit_price}</td>
                        <td className="num-font" style={{ fontWeight: 700, color: isWin ? '#10b981' : '#f43f5e' }}>
                          {isWin ? '+' : ''}{t.return_pct}%
                        </td>
                        <td style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{t.reason}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
};
