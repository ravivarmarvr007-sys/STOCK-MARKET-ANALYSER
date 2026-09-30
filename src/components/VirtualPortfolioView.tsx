import React, { useState, useEffect } from 'react';
import { fetchPortfolio, addPortfolioPosition } from '../services/api';
import { VirtualPortfolioData } from '../types';
import { 
  Briefcase, 
  Plus, 
  TrendingUp, 
  PieChart, 
  AlertCircle, 
  CheckCircle2, 
  DollarSign, 
  Trash2 
} from 'lucide-react';

interface VirtualPortfolioViewProps {
  onSelectStock: (symbol: string) => void;
}

export const VirtualPortfolioView: React.FC<VirtualPortfolioViewProps> = ({ onSelectStock }) => {
  const [portfolio, setPortfolio] = useState<VirtualPortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [symInput, setSymInput] = useState('TCS');
  const [sharesInput, setSharesInput] = useState('10');
  const [priceInput, setPriceInput] = useState('4100');

  const loadPortfolioData = async () => {
    setLoading(true);
    try {
      const data = await fetchPortfolio();
      setPortfolio(data);
    } catch (err) {
      console.error("Failed to load portfolio:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolioData();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addPortfolioPosition(symInput, Number(sharesInput), Number(priceInput));
    setShowAddModal(false);
    loadPortfolioData();
  };

  if (loading || !portfolio) {
    return (
      <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
        Loading virtual portfolio simulator...
      </div>
    );
  }

  const isTotalPos = portfolio.total_pnl >= 0;

  return (
    <div className="flex-col gap-6" style={{ paddingBottom: '3rem' }}>
      
      {/* 1. Header Banner & Add Position Button */}
      <div className="glass-panel-elevated" style={{ padding: '1.5rem' }}>
        <div className="flex-row items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="flex-row items-center gap-2">
              <Briefcase size={22} color="#10b981" />
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc' }}>
                Virtual Portfolio Simulator
              </h1>
              <span style={{ fontSize: '0.72rem', background: 'rgba(99,102,241,0.2)', color: '#818cf8', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                PAPER TRADING
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
              Simulate investment allocation, track real-time P&amp;L across Indian stocks, and receive explainable AI diagnostic portfolio checkups.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus size={16} />
            <span>Add Position</span>
          </button>
        </div>

        {/* Portfolio Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
          marginTop: '1.25rem'
        }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Current Portfolio Value</div>
            <div className="num-font" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
              ₹{portfolio.total_value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Total Invested Cost</div>
            <div className="num-font" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#cbd5e1', marginTop: '2px' }}>
              ₹{portfolio.total_invested.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Total Profit / Loss</div>
            <div className="num-font" style={{ fontSize: '1.35rem', fontWeight: 800, color: isTotalPos ? '#10b981' : '#f43f5e', marginTop: '2px' }}>
              {isTotalPos ? '+' : ''}₹{portfolio.total_pnl.toLocaleString('en-IN')} ({isTotalPos ? '+' : ''}{portfolio.total_pnl_pct}%)
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Portfolio Risk Status</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
              MODERATE RISK
            </div>
          </div>
        </div>
      </div>

      {/* 2. Holdings Table & Sector Allocation Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '1rem'
      }}>
        
        {/* Holdings Table */}
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
              Current Virtual Holdings
            </h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Stock</th>
                  <th>Qty</th>
                  <th>Avg Cost</th>
                  <th>Current Price</th>
                  <th>Holding Value</th>
                  <th>P&amp;L (%)</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.positions.map((pos) => {
                  const isPos = pos.pnl_pct >= 0;
                  return (
                    <tr 
                      key={pos.symbol}
                      onClick={() => onSelectStock(pos.symbol)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <div className="num-font" style={{ fontWeight: 800, color: '#10b981' }}>{pos.symbol}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{pos.sector}</div>
                      </td>
                      <td className="num-font">{pos.shares}</td>
                      <td className="num-font">₹{pos.avg_price.toLocaleString('en-IN')}</td>
                      <td className="num-font">₹{pos.current_price.toLocaleString('en-IN')}</td>
                      <td className="num-font">₹{pos.current_value.toLocaleString('en-IN')}</td>
                      <td className="num-font" style={{ fontWeight: 700, color: isPos ? '#10b981' : '#f43f5e' }}>
                        {isPos ? '+' : ''}{pos.pnl_pct}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Portfolio Diagnostics & Sector Allocation */}
        <div className="flex-col gap-4">
          
          {/* AI Diagnostics Card */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div className="flex-row items-center gap-2" style={{ marginBottom: '0.75rem' }}>
              <AlertCircle size={18} color="#06b6d4" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                AI Portfolio Health Diagnostics
              </h3>
            </div>
            <div className="flex-col gap-2">
              {portfolio.ai_diagnostics.map((diag, i) => (
                <div key={i} className="flex-row items-start gap-2" style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>
                  <CheckCircle2 size={14} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{diag}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sector Weights */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div className="flex-row items-center gap-2" style={{ marginBottom: '0.85rem' }}>
              <PieChart size={18} color="#8b5cf6" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                Sector Diversification
              </h3>
            </div>
            <div className="flex-col gap-2">
              {Object.entries(portfolio.sector_allocation).map(([sector, val]) => {
                const pct = ((val / (portfolio.total_value || 1)) * 100).toFixed(1);
                return (
                  <div key={sector}>
                    <div className="flex-row items-center justify-between" style={{ fontSize: '0.75rem', marginBottom: '3px' }}>
                      <span style={{ color: '#e2e8f0' }}>{sector}</span>
                      <span className="num-font" style={{ color: '#38bdf8', fontWeight: 700 }}>{pct}%</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: '#8b5cf6', borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Add Position Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div className="glass-panel-elevated" style={{ width: '100%', maxWidth: '420px', padding: '1.5rem' }}>
            <div className="flex-row items-center justify-between" style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                Add Stock to Virtual Portfolio
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="flex-col gap-4">
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Symbol</label>
                <select
                  value={symInput}
                  onChange={(e) => setSymInput(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.9)',
                    color: '#ffffff',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '0.55rem',
                    fontSize: '0.85rem'
                  }}
                >
                  <option value="TCS">TCS</option>
                  <option value="INFY">INFY</option>
                  <option value="RELIANCE">RELIANCE</option>
                  <option value="HDFCBANK">HDFCBANK</option>
                  <option value="TATAMOTORS">TATAMOTORS</option>
                  <option value="ZOMATO">ZOMATO</option>
                  <option value="TRENT">TRENT</option>
                  <option value="ITC">ITC</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Number of Shares</label>
                <input
                  type="number"
                  min="1"
                  value={sharesInput}
                  onChange={(e) => setSharesInput(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.9)',
                    color: '#ffffff',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '0.55rem',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Average Purchase Price (₹)</label>
                <input
                  type="number"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.9)',
                    color: '#ffffff',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '0.55rem',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div className="flex-row items-center justify-end gap-2" style={{ marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Confirm Position
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
