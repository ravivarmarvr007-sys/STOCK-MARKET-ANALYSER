import React, { useState, useEffect } from 'react';
import { fetchModelMonitoring, fetchScannerResults } from '../services/api';
import { 
  BrainCircuit, 
  ShieldCheck, 
  CheckCircle2, 
  BarChart, 
  TrendingUp, 
  Layers, 
  Sliders, 
  Calendar,
  Sparkles,
  Lock
} from 'lucide-react';

interface AIPredictionsViewProps {
  onSelectStock: (symbol: string) => void;
}

export const AIPredictionsView: React.FC<AIPredictionsViewProps> = ({ onSelectStock }) => {
  const [modelData, setModelData] = useState<any>(null);
  const [topStocks, setTopStocks] = useState<any[]>([]);
  const [selectedStock, setSelectedStock] = useState('TCS');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchModelMonitoring(),
      fetchScannerResults()
    ]).then(([monitoringRes, scannerRes]) => {
      setModelData(monitoringRes);
      setTopStocks(scannerRes.stocks || []);
      setLoading(false);
    }).catch(err => {
      console.error("Model monitoring fetch failed:", err);
      setLoading(false);
    });
  }, []);

  if (loading || !modelData) {
    return (
      <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
        Loading AI Prediction Pipeline &amp; Model Governance Dashboard...
      </div>
    );
  }

  const { metadata, feature_importance, walk_forward_epochs } = modelData;

  return (
    <div className="flex-col gap-6" style={{ paddingBottom: '3rem' }}>
      
      {/* 1. Header Banner */}
      <div className="glass-panel-elevated" style={{ padding: '1.5rem' }}>
        <div className="flex-row items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="flex-row items-center gap-2">
              <BrainCircuit size={24} color="#8b5cf6" />
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc' }}>
                AI Quantitative Prediction Engine &amp; Model Audit
              </h1>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
              Ensemble machine-learning architecture combining gradient boosting, regularized ridge regressors, and rolling volatility cones. Strictly evaluated with zero look-ahead bias.
            </p>
          </div>

          <div style={{
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '8px',
            padding: '0.45rem 0.85rem',
            fontSize: '0.75rem',
            color: '#c7d2fe'
          }}>
            Model Version: <strong style={{ color: '#ffffff' }}>{metadata.version}</strong>
          </div>
        </div>

        {/* Audit Metrics Banner */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.75rem',
          marginTop: '1.25rem'
        }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Directional Accuracy</div>
            <div className="num-font" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
              {metadata.directional_accuracy_pct}%
            </div>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>BUY Precision</div>
            <div className="num-font" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>
              {metadata.precision_buy_signals_pct}%
            </div>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>SELL Precision</div>
            <div className="num-font" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fb7185' }}>
              {metadata.precision_sell_signals_pct}%
            </div>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>F1 Score</div>
            <div className="num-font" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#818cf8' }}>
              {metadata.f1_score}
            </div>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Test MAE</div>
            <div className="num-font" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
              {metadata.test_mae_pct}%
            </div>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Sharpe (Net Costs)</div>
            <div className="num-font" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fbbf24' }}>
              {metadata.sharpe_after_costs}x
            </div>
          </div>
        </div>
      </div>

      {/* 2. Feature Importance & Walk-Forward Epochs Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '1rem'
      }}>
        
        {/* Feature Importance Card */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div className="flex-row items-center justify-between" style={{ marginBottom: '1rem' }}>
            <div className="flex-row items-center gap-2">
              <BarChart size={18} color="#06b6d4" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                Quantitative Feature Importance (SHAP / Gain Attribution)
              </h3>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Top 10 Factors</span>
          </div>

          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1rem' }}>
            Shows the relative empirical weight of each quantitative factor in predicting multi-day directional returns:
          </p>

          <div className="flex-col gap-2">
            {feature_importance.map((item: any, i: number) => {
              const pct = (item.importance * 100).toFixed(1);
              return (
                <div key={i}>
                  <div className="flex-row items-center justify-between" style={{ fontSize: '0.75rem', marginBottom: '3px' }}>
                    <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{item.feature}</span>
                    <span className="num-font" style={{ color: '#38bdf8', fontWeight: 700 }}>{pct}%</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${Number(pct) * 4.5}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)',
                      borderRadius: '3px'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Walk-Forward Validation Epochs */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div className="flex-row items-center justify-between" style={{ marginBottom: '1rem' }}>
            <div className="flex-row items-center gap-2">
              <Calendar size={18} color="#10b981" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                Walk-Forward Out-of-Sample Validation
              </h3>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#34d399' }}>4 Purged Epochs</span>
          </div>

          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1rem' }}>
            To rigorously prevent data leakage, training is conducted sequentially. Models trained on historical epochs are evaluated ONLY on forward periods:
          </p>

          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Validation Epoch</th>
                  <th>Accuracy</th>
                  <th>BUY Precision</th>
                  <th>Net Sharpe</th>
                </tr>
              </thead>
              <tbody>
                {walk_forward_epochs.map((ep: any, idx: number) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: '#f8fafc' }}>{ep.epoch}</td>
                    <td className="num-font" style={{ color: '#10b981' }}>{ep.accuracy_pct}%</td>
                    <td className="num-font" style={{ color: '#34d399' }}>{ep.precision_buy_pct}%</td>
                    <td className="num-font" style={{ color: '#fbbf24' }}>{ep.sharpe}x</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Anti-Data Leakage Checklist */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            padding: '0.85rem',
            borderRadius: '8px',
            border: '1px solid var(--border-color)'
          }}>
            <div className="flex-row items-center gap-2" style={{ marginBottom: '0.45rem' }}>
              <Lock size={15} color="#10b981" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399' }}>
                Anti-Data Leakage Protocol Active
              </span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {metadata.anti_leakage_safeguards.slice(0, 3).map((guard: string, gIdx: number) => (
                <li key={gIdx} style={{ fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '3px', display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span> {guard}
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
};
