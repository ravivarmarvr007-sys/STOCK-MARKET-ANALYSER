import React, { useState } from 'react';
import { 
  TrendingUp, 
  Search, 
  BarChart3, 
  Sliders, 
  BrainCircuit, 
  Layers, 
  Briefcase, 
  History, 
  Bot, 
  Bookmark, 
  Settings, 
  Info,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onSelectStock: (symbol: string) => void;
}

const SUPPORTED_SYMBOLS = [
  { symbol: "TCS", name: "Tata Consultancy Services" },
  { symbol: "INFY", name: "Infosys Ltd." },
  { symbol: "HCLTECH", name: "HCL Technologies" },
  { symbol: "RELIANCE", name: "Reliance Industries" },
  { symbol: "HDFCBANK", name: "HDFC Bank" },
  { symbol: "ICICIBANK", name: "ICICI Bank" },
  { symbol: "SBIN", name: "State Bank of India" },
  { symbol: "TATAMOTORS", name: "Tata Motors" },
  { symbol: "SUNPHARMA", name: "Sun Pharma" },
  { symbol: "ITC", name: "ITC Ltd." },
  { symbol: "LT", name: "Larsen & Toubro" },
  { symbol: "BHARTIARTL", name: "Bharti Airtel" },
  { symbol: "ZOMATO", name: "Zomato Ltd." },
  { symbol: "TRENT", name: "Trent Ltd." }
];

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onSelectStock }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const filtered = searchQuery.trim() 
    ? SUPPORTED_SYMBOLS.filter(s => 
        s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelect = (sym: string) => {
    onSelectStock(sym);
    setSearchQuery('');
    setIsSearchOpen(false);
    setCurrentTab('analysis');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'scanner', label: 'Market Scanner', icon: Sliders },
    { id: 'predictions', label: 'AI Predictions', icon: BrainCircuit },
    { id: 'analysis', label: 'Stock Analysis', icon: TrendingUp },
    { id: 'compare', label: 'Compare', icon: Layers },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { id: 'backtest', label: 'Backtesting', icon: History },
    { id: 'assistant', label: 'AI Assistant', icon: Bot },
    { id: 'watchlist', label: 'Watchlist', icon: Bookmark },
    { id: 'how-it-works', label: 'How It Works', icon: Info },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-[rgba(255,255,255,0.08)] bg-[#080d19]/90 backdrop-blur-md">
      <div className="app-container" style={{ paddingBottom: '0.5rem', paddingTop: '0.75rem' }}>
        <div className="flex-row items-center justify-between gap-4" style={{ flexWrap: 'wrap' }}>
          
          {/* Logo & Tagline */}
          <div 
            className="flex-row items-center gap-3 cursor-pointer"
            onClick={() => setCurrentTab('dashboard')}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)'
            }}>
              <TrendingUp size={22} color="#ffffff" strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex-row items-center gap-2">
                <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                  StockSense <span style={{ color: '#10b981' }}>AI</span>
                </span>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(16,185,129,0.15)',
                  color: '#10b981',
                  border: '1px solid rgba(16,185,129,0.3)'
                }}>
                  NSE PRO
                </span>
              </div>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '-2px' }}>
                Scan. Analyze. Understand. Invest Smarter.
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div style={{ position: 'relative', width: '280px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '0.45rem 0.75rem',
              gap: '0.5rem'
            }}>
              <Search size={16} color="#64748b" />
              <input 
                type="text"
                placeholder="Search Indian stocks (TCS, INFY...)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#f8fafc',
                  outline: 'none',
                  fontSize: '0.82rem',
                  width: '100%'
                }}
              />
            </div>

            {/* Dropdown Results */}
            {isSearchOpen && filtered.length > 0 && (
              <div 
                className="glass-panel-elevated"
                style={{
                  position: 'absolute',
                  top: '110%',
                  left: 0,
                  right: 0,
                  zIndex: 100,
                  maxHeight: '260px',
                  overflowY: 'auto',
                  padding: '0.4rem'
                }}
              >
                {filtered.map(item => (
                  <div
                    key={item.symbol}
                    onClick={() => handleSelect(item.symbol)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.65rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div>
                      <div className="num-font" style={{ fontWeight: 700, color: '#10b981', fontSize: '0.85rem' }}>
                        {item.symbol}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        {item.name}
                      </div>
                    </div>
                    <ChevronRight size={14} color="#64748b" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="flex-row items-center gap-3">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              fontSize: '0.72rem',
              color: '#34d399',
              fontWeight: 600
            }}>
              <span className="live-pulse-dot" />
              <span>DEMO DATA — 2026-09-29</span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.72rem',
              color: '#94a3b8',
              padding: '0.35rem 0.6rem',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.04)'
            }}>
              <ShieldCheck size={14} color="#10b981" />
              <span>Walk-Forward ML</span>
            </div>
          </div>

        </div>

        {/* Navigation Tabs Bar */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          marginTop: '0.75rem',
          overflowX: 'auto',
          paddingBottom: '0.25rem'
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`btn-tab ${isActive ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
