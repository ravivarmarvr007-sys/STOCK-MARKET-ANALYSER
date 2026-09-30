import React, { useState, useEffect } from 'react';
import { fetchScannerResults } from '../services/api';
import { StockSummary } from '../types';
import { 
  Sliders, 
  Search, 
  Download, 
  RefreshCw, 
  ArrowUpDown, 
  Sparkles, 
  ShieldCheck, 
  Filter,
  ArrowUpRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface MarketScannerViewProps {
  onSelectStock: (symbol: string) => void;
}

export const MarketScannerView: React.FC<MarketScannerViewProps> = ({ onSelectStock }) => {
  const [stocks, setStocks] = useState<StockSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanningAnimation, setScanningAnimation] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [signalFilter, setSignalFilter] = useState('ALL');
  const [capFilter, setCapFilter] = useState('ALL');
  const [presetFilter, setPresetFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('ai_score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const loadScannerData = async () => {
    setLoading(true);
    try {
      const res = await fetchScannerResults({
        sector: sectorFilter !== 'ALL' ? sectorFilter : undefined,
        signal: signalFilter !== 'ALL' ? signalFilter : undefined,
        sort_by: sortBy,
        order: sortOrder
      });
      setStocks(res.stocks || []);
    } catch (err) {
      console.error("Scanner fetch failed:", err);
    } finally {
      setLoading(false);
      setScanningAnimation(false);
    }
  };

  useEffect(() => {
    loadScannerData();
  }, [sectorFilter, signalFilter, sortBy, sortOrder]);

  const handleScanClick = () => {
    setScanningAnimation(true);
    setTimeout(() => {
      loadScannerData();
    }, 600);
  };

  // Filter application
  let displayedStocks = stocks.filter(stock => {
    const matchesSearch = 
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (capFilter !== 'ALL' && stock.market_cap_category.toLowerCase() !== capFilter.toLowerCase()) {
      return false;
    }

    if (presetFilter === 'BUY_ONLY' && !stock.signal.includes('BUY')) return false;
    if (presetFilter === 'STRONG_BUY' && stock.signal !== 'STRONG BUY') return false;
    if (presetFilter === 'HIGH_MOMENTUM' && stock.momentum_score < 65) return false;
    if (presetFilter === 'UNDERVALUED' && stock.pe_ratio > 22) return false;
    if (presetFilter === 'LOW_DEBT' && stock.debt_to_equity > 0.3) return false;
    if (presetFilter === 'SCORE_70' && stock.ai_score < 70) return false;

    return true;
  });

  const exportCSV = () => {
    const headers = ["Rank", "Symbol", "Name", "Sector", "Price", "Change %", "AI Score", "Signal", "Technical Score", "Fundamental Score", "Confidence", "Risk"];
    const rows = displayedStocks.map((s, idx) => [
      idx + 1,
      s.symbol,
      `"${s.name}"`,
      s.sector,
      s.current_price,
      s.change_pct,
      s.ai_score,
      s.signal,
      s.technical_score,
      s.fundamental_score,
      `${s.confidence}%`,
      s.risk_level
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `stocksense_ai_scanner_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSignalBadgeClass = (sig: string) => {
    if (sig === 'STRONG BUY') return 'badge-strong-buy';
    if (sig === 'BUY') return 'badge-buy';
    if (sig === 'HOLD') return 'badge-hold';
    if (sig === 'SELL') return 'badge-sell';
    return 'badge-strong-sell';
  };

  return (
    <div className="flex-col gap-6" style={{ paddingBottom: '3rem' }}>
      
      {/* 1. Header Banner & Action Button */}
      <div className="glass-panel-elevated" style={{ padding: '1.5rem' }}>
        <div className="flex-row items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="flex-row items-center gap-2">
              <Sliders size={22} color="#10b981" />
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc' }}>
                AI Market Scanner
              </h1>
              <span style={{
                fontSize: '0.72rem',
                background: 'rgba(16,185,129,0.15)',
                color: '#34d399',
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: 700
              }}>
                NSE Universe
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
              Multi-factor quantitative scanning across 25+ Indian bluechips, measuring technical posture, earnings power, balance sheet resilience, and news sentiment.
            </p>
          </div>

          <div className="flex-row items-center gap-3">
            <button
              onClick={exportCSV}
              className="btn-secondary"
              title="Export current filtered view to CSV"
            >
              <Download size={15} />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleScanClick}
              className="btn-primary"
              disabled={scanningAnimation}
            >
              <RefreshCw size={16} className={scanningAnimation ? 'animate-spin' : ''} />
              <span>{scanningAnimation ? 'SCANNING UNIVERSE...' : 'SCAN MARKET'}</span>
            </button>
          </div>
        </div>

        {/* Preset Filter Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Presets:
          </span>
          {[
            { id: 'ALL', label: 'All Stocks' },
            { id: 'BUY_ONLY', label: 'BUY & Strong Buy' },
            { id: 'SCORE_70', label: 'AI Score > 70' },
            { id: 'HIGH_MOMENTUM', label: 'High Momentum' },
            { id: 'UNDERVALUED', label: 'Undervalued (P/E < 22)' },
            { id: 'LOW_DEBT', label: 'Low Debt (D/E < 0.3)' }
          ].map(preset => (
            <button
              key={preset.id}
              onClick={() => setPresetFilter(preset.id)}
              style={{
                background: presetFilter === preset.id ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                color: presetFilter === preset.id ? '#34d399' : '#94a3b8',
                border: presetFilter === preset.id ? '1px solid rgba(16, 185, 129, 0.45)' : '1px solid var(--border-color)',
                borderRadius: '9999px',
                padding: '4px 12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Controls & Search Row */}
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(10, 16, 28, 0.7)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.45rem 0.75rem', width: '260px', gap: '6px' }}>
          <Search size={15} color="#64748b" />
          <input
            type="text"
            placeholder="Search by symbol or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.8rem',
              outline: 'none',
              width: '100%'
            }}
          />
        </div>

        {/* Sector Filter */}
        <div className="flex-row items-center gap-2">
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Sector:</span>
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            style={{
              background: 'rgba(15, 23, 42, 0.9)',
              color: '#ffffff',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '0.4rem 0.65rem',
              fontSize: '0.78rem',
              outline: 'none'
            }}
          >
            <option value="ALL">All Sectors</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Banking">Banking &amp; Financials</option>
            <option value="Automobile">Automobile</option>
            <option value="Pharmaceuticals">Pharmaceuticals</option>
            <option value="FMCG">FMCG</option>
            <option value="Energy">Energy</option>
            <option value="Capital Goods">Capital Goods</option>
          </select>
        </div>

        {/* Signal Filter */}
        <div className="flex-row items-center gap-2">
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Signal:</span>
          <select
            value={signalFilter}
            onChange={(e) => setSignalFilter(e.target.value)}
            style={{
              background: 'rgba(15, 23, 42, 0.9)',
              color: '#ffffff',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '0.4rem 0.65rem',
              fontSize: '0.78rem',
              outline: 'none'
            }}
          >
            <option value="ALL">All Signals</option>
            <option value="STRONG BUY">Strong Buy</option>
            <option value="BUY">Buy</option>
            <option value="HOLD">Hold</option>
            <option value="SELL">Sell</option>
          </select>
        </div>

        {/* Market Cap Filter */}
        <div className="flex-row items-center gap-2">
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Cap:</span>
          <select
            value={capFilter}
            onChange={(e) => setCapFilter(e.target.value)}
            style={{
              background: 'rgba(15, 23, 42, 0.9)',
              color: '#ffffff',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '0.4rem 0.65rem',
              fontSize: '0.78rem',
              outline: 'none'
            }}
          >
            <option value="ALL">All Caps</option>
            <option value="Large Cap">Large Cap</option>
            <option value="Mid Cap">Mid Cap</option>
          </select>
        </div>

        {/* Results Counter */}
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
          Showing <strong style={{ color: '#10b981' }}>{displayedStocks.length}</strong> securities
        </div>

      </div>

      {/* 3. Comprehensive Scanner Table */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="fin-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>Rank</th>
                <th>Stock</th>
                <th>Sector</th>
                <th>Price (₹)</th>
                <th>Change</th>
                <th 
                  onClick={() => {
                    if (sortBy === 'ai_score') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else { setSortBy('ai_score'); setSortOrder('desc'); }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="flex-row items-center gap-1">
                    <span>AI Score</span>
                    <ArrowUpDown size={12} color="#38bdf8" />
                  </div>
                </th>
                <th>Signal</th>
                <th>Tech Score</th>
                <th>Fund Score</th>
                <th>RSI</th>
                <th>P/E</th>
                <th>Risk</th>
                <th>Model Confidence</th>
              </tr>
            </thead>
            <tbody>
              {displayedStocks.map((stock, idx) => {
                const isPos = stock.change_pct >= 0;
                return (
                  <tr 
                    key={stock.symbol}
                    onClick={() => onSelectStock(stock.symbol)}
                    style={{ cursor: 'pointer', transition: 'background 0.15s ease' }}
                  >
                    {/* Rank */}
                    <td className="num-font" style={{ color: '#64748b', fontWeight: 600 }}>
                      #{idx + 1}
                    </td>

                    {/* Stock Symbol & Name */}
                    <td>
                      <div>
                        <div className="num-font" style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.9rem' }}>
                          {stock.symbol}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {stock.name}
                        </div>
                      </div>
                    </td>

                    {/* Sector */}
                    <td style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                      {stock.sector.split(' ')[0]}
                    </td>

                    {/* Current Price */}
                    <td className="num-font" style={{ fontWeight: 700, color: '#ffffff' }}>
                      ₹{stock.current_price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>

                    {/* Change % */}
                    <td className="num-font" style={{ fontWeight: 600, color: isPos ? '#10b981' : '#f43f5e' }}>
                      {isPos ? '+' : ''}{stock.change_pct.toFixed(2)}%
                    </td>

                    {/* AI Score */}
                    <td>
                      <div className="flex-row items-center gap-2">
                        <span className="num-font" style={{ fontWeight: 800, fontSize: '0.95rem', color: stock.ai_score >= 75 ? '#34d399' : (stock.ai_score >= 50 ? '#fbbf24' : '#f43f5e') }}>
                          {stock.ai_score}
                        </span>
                        <div style={{ width: '45px', height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${stock.ai_score}%`,
                            height: '100%',
                            background: stock.ai_score >= 75 ? '#10b981' : (stock.ai_score >= 50 ? '#fbbf24' : '#f43f5e')
                          }} />
                        </div>
                      </div>
                    </td>

                    {/* Signal Badge */}
                    <td>
                      <span className={`badge ${getSignalBadgeClass(stock.signal)}`}>
                        {stock.signal}
                      </span>
                    </td>

                    {/* Technical Score */}
                    <td className="num-font" style={{ color: '#e2e8f0' }}>
                      {stock.technical_score}
                    </td>

                    {/* Fundamental Score */}
                    <td className="num-font" style={{ color: '#e2e8f0' }}>
                      {stock.fundamental_score}
                    </td>

                    {/* RSI */}
                    <td className="num-font" style={{ color: stock.rsi >= 70 ? '#fbbf24' : (stock.rsi <= 32 ? '#34d399' : '#94a3b8') }}>
                      {stock.rsi}
                    </td>

                    {/* P/E Ratio */}
                    <td className="num-font" style={{ color: '#cbd5e1' }}>
                      {stock.pe_ratio}x
                    </td>

                    {/* Risk */}
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

                    {/* Model Confidence */}
                    <td className="num-font" style={{ fontWeight: 600, color: '#a78bfa' }}>
                      {stock.confidence}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
