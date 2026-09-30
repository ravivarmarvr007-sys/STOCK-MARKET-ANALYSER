import React, { useState, useEffect } from 'react';
import { fetchWatchlist, toggleWatchlist, fetchAlerts, createAlert } from '../services/api';
import { StockSummary } from '../types';
import { 
  Bookmark, 
  Bell, 
  Trash2, 
  Plus, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2 
} from 'lucide-react';

interface WatchlistViewProps {
  onSelectStock: (symbol: string) => void;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({ onSelectStock }) => {
  const [watchlist, setWatchlist] = useState<StockSummary[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New alert form
  const [alertSym, setAlertSym] = useState('TCS');
  const [alertType, setAlertType] = useState('AI Score > 80');
  const [alertThreshold, setAlertThreshold] = useState(80);

  const loadData = async () => {
    setLoading(true);
    try {
      const [wRes, aRes] = await Promise.all([
        fetchWatchlist(),
        fetchAlerts()
      ]);
      setWatchlist(wRes.watchlist || []);
      setAlerts(aRes.alerts || []);
    } catch (err) {
      console.error("Watchlist load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRemove = async (sym: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleWatchlist(sym);
    setWatchlist(watchlist.filter(s => s.symbol !== sym));
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAlert({
      symbol: alertSym,
      type: alertType,
      threshold: Number(alertThreshold)
    });
    const aRes = await fetchAlerts();
    setAlerts(aRes.alerts || []);
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
        Loading active watchlist and condition triggers...
      </div>
    );
  }

  return (
    <div className="flex-col gap-6" style={{ paddingBottom: '3rem' }}>
      
      {/* 1. Header Banner */}
      <div className="glass-panel-elevated" style={{ padding: '1.5rem' }}>
        <div className="flex-row items-center gap-2">
          <Bookmark size={22} color="#10b981" />
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc' }}>
            Watchlist &amp; Smart Signal Alerts
          </h1>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
          Track high-conviction Indian securities and receive programmatic notifications when technical thresholds, AI score breakouts, or volume anomalies occur.
        </p>
      </div>

      {/* 2. Watchlist Table & Smart Alert Creator Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '1rem'
      }}>
        
        {/* Watchlist Table */}
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
              Monitored Securities ({watchlist.length})
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#10b981' }}>Live Updates</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Stock</th>
                  <th>Price</th>
                  <th>Change</th>
                  <th>AI Score</th>
                  <th>Signal</th>
                  <th>Risk</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {watchlist.map((stock) => {
                  const isPos = stock.change_pct >= 0;
                  return (
                    <tr 
                      key={stock.symbol}
                      onClick={() => onSelectStock(stock.symbol)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <div className="num-font" style={{ fontWeight: 800, color: '#f8fafc' }}>
                          {stock.symbol}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                          {stock.sector.split(' ')[0]}
                        </div>
                      </td>
                      <td className="num-font" style={{ fontWeight: 700 }}>
                        ₹{stock.current_price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                      <td className="num-font" style={{ fontWeight: 600, color: isPos ? '#10b981' : '#f43f5e' }}>
                        {isPos ? '+' : ''}{stock.change_pct}%
                      </td>
                      <td className="num-font" style={{ fontWeight: 800, color: '#10b981' }}>
                        {stock.ai_score}
                      </td>
                      <td>
                        <span className={`badge ${stock.signal.includes('BUY') ? 'badge-buy' : 'badge-hold'}`}>
                          {stock.signal}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: stock.risk_level === 'LOW RISK' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                          color: stock.risk_level === 'LOW RISK' ? '#34d399' : '#fbbf24'
                        }}>
                          {stock.risk_level}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={(e) => handleRemove(stock.symbol, e)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#64748b',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                          title="Remove from watchlist"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Smart Alert Creator & Active Alerts */}
        <div className="flex-col gap-4">
          
          {/* Create Alert Form */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div className="flex-row items-center gap-2" style={{ marginBottom: '1rem' }}>
              <Bell size={18} color="#f59e0b" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                Set Quantitative Trigger Alert
              </h3>
            </div>

            <form onSubmit={handleCreateAlert} className="flex-col gap-3">
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Target Stock</label>
                <select
                  value={alertSym}
                  onChange={(e) => setAlertSym(e.target.value)}
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
                  <option value="TCS">TCS</option>
                  <option value="INFY">INFY</option>
                  <option value="RELIANCE">RELIANCE</option>
                  <option value="HDFCBANK">HDFCBANK</option>
                  <option value="TATAMOTORS">TATAMOTORS</option>
                  <option value="ZOMATO">ZOMATO</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Trigger Condition</label>
                <select
                  value={alertType}
                  onChange={(e) => {
                    setAlertType(e.target.value);
                    if (e.target.value.includes('RSI below')) setAlertThreshold(30);
                    else if (e.target.value.includes('RSI above')) setAlertThreshold(70);
                    else setAlertThreshold(80);
                  }}
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
                  <option value="AI Score > 80">AI Score crosses above 80 (Strong Buy Setup)</option>
                  <option value="RSI below 30">RSI below 30 (Oversold Accumulation)</option>
                  <option value="RSI above 70">RSI above 70 (Overbought Warning)</option>
                  <option value="MACD Bullish Crossover">MACD Bullish Crossover</option>
                  <option value="Volume Spike 2x">Volume exceeds 2x 20-day Average</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
              >
                <Plus size={15} />
                <span>Arm Trigger Alert</span>
              </button>
            </form>
          </div>

          {/* Active Alerts List */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem' }}>
              Active Monitored Triggers
            </h3>

            <div className="flex-col gap-2">
              {alerts.map((al) => (
                <div
                  key={al.id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.65)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    border: al.triggered ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div className="flex-row items-center gap-2">
                      <span className="num-font" style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.82rem' }}>
                        {al.symbol}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
                        {al.type}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                      {al.message}
                    </div>
                  </div>

                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: al.triggered ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                    color: al.triggered ? '#34d399' : '#94a3b8'
                  }}>
                    {al.triggered ? 'TRIGGERED' : 'ARMED'}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
