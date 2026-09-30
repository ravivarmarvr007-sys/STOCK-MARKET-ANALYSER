import React, { useState, useEffect } from 'react';
import { fetchSettings, updateSettings } from '../services/api';
import { Settings, Sliders, ShieldCheck, Check, RotateCcw, AlertTriangle } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [weights, setWeights] = useState({
    technical: 0.30,
    fundamental: 0.25,
    momentum: 0.15,
    volume: 0.10,
    regime: 0.10,
    sentiment: 0.10
  });

  const [thresholds, setThresholds] = useState({
    strong_buy: 80.0,
    buy: 65.0,
    hold: 45.0,
    sell: 30.0,
    strong_sell: 0.0
  });

  const [providerMode, setProviderMode] = useState<'DEMO' | 'LIVE'>('DEMO');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings().then(res => {
      if (res.weights) setWeights(res.weights);
      if (res.thresholds) setThresholds(res.thresholds);
      setLoading(false);
    }).catch(err => {
      console.warn("Settings fetch fallback:", err);
      setLoading(false);
    });
  }, []);

  const totalWeight = Math.round(
    Object.values(weights).reduce((a, b) => a + b, 0) * 100
  );

  const handleSave = async () => {
    try {
      await updateSettings(weights, thresholds);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Save settings error:", err);
    }
  };

  const handleReset = () => {
    setWeights({
      technical: 0.30,
      fundamental: 0.25,
      momentum: 0.15,
      volume: 0.10,
      regime: 0.10,
      sentiment: 0.10
    });
    setThresholds({
      strong_buy: 80.0,
      buy: 65.0,
      hold: 45.0,
      sell: 30.0,
      strong_sell: 0.0
    });
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
        Loading platform settings and configuration...
      </div>
    );
  }

  return (
    <div className="flex-col gap-6" style={{ paddingBottom: '3rem' }}>
      
      {/* 1. Header Banner */}
      <div className="glass-panel-elevated" style={{ padding: '1.5rem' }}>
        <div className="flex-row items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="flex-row items-center gap-2">
              <Settings size={22} color="#10b981" />
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc' }}>
                Platform Settings &amp; Quantitative Engine Tuning
              </h1>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
              Configure composite AI scoring weights, signal classification thresholds, and market data provider gateways.
            </p>
          </div>

          <div className="flex-row items-center gap-2">
            <button
              onClick={handleReset}
              className="btn-secondary"
            >
              <RotateCcw size={15} />
              <span>Reset Defaults</span>
            </button>

            <button
              onClick={handleSave}
              className="btn-primary"
            >
              <Check size={16} />
              <span>Save Configuration</span>
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.2)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#34d399',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontSize: '0.8rem',
            marginTop: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Check size={16} />
            <span>Settings saved successfully! Signal engine updated across all scanners and analysis views.</span>
          </div>
        )}
      </div>

      {/* 2. Config Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '1.25rem'
      }}>
        
        {/* Scoring Engine Weights */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div className="flex-row items-center justify-between" style={{ marginBottom: '1rem' }}>
            <div className="flex-row items-center gap-2">
              <Sliders size={18} color="#06b6d4" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                Scoring Engine Weights
              </h3>
            </div>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px',
              background: totalWeight === 100 ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
              color: totalWeight === 100 ? '#34d399' : '#f43f5e'
            }}>
              Total: {totalWeight}%
            </span>
          </div>

          <div className="flex-col gap-3">
            {[
              { key: 'technical', label: 'Technical Score', desc: 'RSI, MACD, 50/200 DMA, Bollinger, ATR' },
              { key: 'fundamental', label: 'Fundamental Score', desc: 'ROE, ROCE, Debt/Equity, Operating Margins' },
              { key: 'momentum', label: 'Momentum Score', desc: '5-Day & 20-Day Rate of Change' },
              { key: 'volume', label: 'Volume Score', desc: 'Volume Expansion vs 20-Day Average' },
              { key: 'regime', label: 'Market Regime Score', desc: 'NIFTY Breadth & Macro Volatility' },
              { key: 'sentiment', label: 'Sentiment Score', desc: 'Financial News & Corporate Updates' }
            ].map(item => {
              const currentVal = Math.round((weights as any)[item.key] * 100);
              return (
                <div key={item.key}>
                  <div className="flex-row items-center justify-between" style={{ fontSize: '0.78rem', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{item.label}</span>
                    <span className="num-font" style={{ fontWeight: 700, color: '#38bdf8' }}>{currentVal}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="5"
                    value={currentVal}
                    onChange={(e) => {
                      const newVal = Number(e.target.value) / 100.0;
                      setWeights({ ...weights, [item.key]: newVal });
                    }}
                    style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
                  />
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{item.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Signal Classification Thresholds & Data Provider */}
        <div className="flex-col gap-4">
          
          {/* Signal Thresholds Card */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem' }}>
              Signal Classification Thresholds
            </h3>

            <div className="flex-col gap-3">
              <div>
                <div className="flex-row items-center justify-between" style={{ fontSize: '0.78rem', marginBottom: '2px' }}>
                  <span style={{ color: '#34d399', fontWeight: 700 }}>STRONG BUY Minimum Score</span>
                  <span className="num-font" style={{ fontWeight: 700 }}>{thresholds.strong_buy} / 100</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="90"
                  value={thresholds.strong_buy}
                  onChange={(e) => setThresholds({ ...thresholds, strong_buy: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: '#10b981' }}
                />
              </div>

              <div>
                <div className="flex-row items-center justify-between" style={{ fontSize: '0.78rem', marginBottom: '2px' }}>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>BUY Minimum Score</span>
                  <span className="num-font" style={{ fontWeight: 700 }}>{thresholds.buy} / 100</span>
                </div>
                <input
                  type="range"
                  min="55"
                  max="75"
                  value={thresholds.buy}
                  onChange={(e) => setThresholds({ ...thresholds, buy: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: '#10b981' }}
                />
              </div>

              <div>
                <div className="flex-row items-center justify-between" style={{ fontSize: '0.78rem', marginBottom: '2px' }}>
                  <span style={{ color: '#fbbf24', fontWeight: 700 }}>HOLD Minimum Score</span>
                  <span className="num-font" style={{ fontWeight: 700 }}>{thresholds.hold} / 100</span>
                </div>
                <input
                  type="range"
                  min="35"
                  max="55"
                  value={thresholds.hold}
                  onChange={(e) => setThresholds({ ...thresholds, hold: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: '#f59e0b' }}
                />
              </div>

              <div>
                <div className="flex-row items-center justify-between" style={{ fontSize: '0.78rem', marginBottom: '2px' }}>
                  <span style={{ color: '#f43f5e', fontWeight: 700 }}>SELL Minimum Score</span>
                  <span className="num-font" style={{ fontWeight: 700 }}>{thresholds.sell} / 100</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="40"
                  value={thresholds.sell}
                  onChange={(e) => setThresholds({ ...thresholds, sell: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: '#f43f5e' }}
                />
              </div>
            </div>
          </div>

          {/* Data Provider Mode */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem' }}>
              Market Data Provider Architecture
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1rem' }}>
              Select the active market data provider engine:
            </p>

            <div className="flex-col gap-2">
              <div 
                onClick={() => setProviderMode('DEMO')}
                style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: providerMode === 'DEMO' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: providerMode === 'DEMO' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-color)'
                }}
              >
                <div className="flex-row items-center justify-between">
                  <strong style={{ fontSize: '0.82rem', color: '#ffffff' }}>DEMO MODE (Default)</strong>
                  <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>ACTIVE</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                  High-fidelity deterministic Indian Stock dataset (Nifty 50 constituents, multi-year daily bars, verified math).
                </div>
              </div>

              <div 
                onClick={() => setProviderMode('LIVE')}
                style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: providerMode === 'LIVE' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: providerMode === 'LIVE' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border-color)'
                }}
              >
                <div className="flex-row items-center justify-between">
                  <strong style={{ fontSize: '0.82rem', color: '#ffffff' }}>LIVE / AUTHORIZED NSE CONNECTOR</strong>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>CONFIGURABLE</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                  Connects to authorized NSE API or broker gateways. Requires API credentials set via environment variables.
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
