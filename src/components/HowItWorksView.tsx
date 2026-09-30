import React, { useState } from 'react';
import { 
  Info, 
  Database, 
  Sparkles, 
  Cpu, 
  BarChart, 
  DollarSign, 
  Newspaper, 
  BrainCircuit, 
  Sliders, 
  ShieldAlert, 
  Award, 
  CheckCircle2, 
  ArrowDown, 
  Layers,
  Code
} from 'lucide-react';

interface PipelineStep {
  id: number;
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  description: string;
  mathFormula?: string;
  safeguards: string[];
  techStack: string;
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: 1,
    title: "1. Market Data Ingestion",
    subtitle: "NSE Daily OHLCV & Real-Time Quotes",
    icon: Database,
    color: "#06b6d4",
    description: "Ingests raw order book updates and end-of-day candles across 25+ major Indian equities (Nifty 50 constituents). Designed with pluggable MarketDataProvider interface supporting both licensed real-time feeds and deterministic demo series.",
    safeguards: [
      "Strict data freshness stamping on every quote",
      "Explicit tagging of simulated vs authorized feeds",
      "Calendar-aware handling of Indian exchange holidays"
    ],
    techStack: "Python urllib, MarketDataProvider Interface, SQLite3 Store"
  },
  {
    id: 2,
    title: "2. Data Cleaning & Validation",
    subtitle: "Outlier Removal & Split Adjustments",
    icon: Sparkles,
    color: "#3b82f6",
    description: "Validates historical bar continuity, adjusts for stock splits and bonus issues, eliminates zero-volume holiday anomalies, and replaces missing ticks using forward-fill bounds.",
    safeguards: [
      "High/Low sanity checks: Low <= Open, Close <= High",
      "Volume continuity filters to prevent synthetic gaps",
      "No forward-peeking imputation"
    ],
    techStack: "Python stdlib statistics, Data Hygiene Filters"
  },
  {
    id: 3,
    title: "3. Feature Engineering",
    subtitle: "25+ Normalized Quantitative Factors",
    icon: Cpu,
    color: "#8b5cf6",
    description: "Transforms raw prices into relative ratios: moving average distances (P/SMA50, P/SMA200), normalized returns over 1d, 5d, and 20d, volatility cones, and rolling volume shocks.",
    mathFormula: "Ratio = Price_t / SMA50_t; Mom20 = (Price_t - Price_{t-20}) / Price_{t-20}",
    safeguards: [
      "Point-in-time calculation strictly using information available at t",
      "Rolling z-score normalization without global future statistics",
      "Embargoed windows around quarterly earnings events"
    ],
    techStack: "Pure Python Math Engine, Rolling Time Series Buffers"
  },
  {
    id: 4,
    title: "4. Technical Indicator Engine",
    subtitle: "Momentum & Volatility Oscillators",
    icon: BarChart,
    color: "#10b981",
    description: "Computes Wilder's Smoothed RSI (14), MACD (12, 26, 9) signal lines & histogram, Bollinger Bands (20, 2-std dev), Average True Range (ATR), Average Directional Index (ADX) with +DI/-DI, and dynamic Pivot Support/Resistance levels.",
    mathFormula: "RSI = 100 - (100 / (1 + AvgGain_14 / AvgLoss_14))",
    safeguards: [
      "Wilder's exponential smoothing prevents abrupt indicator swings",
      "Dual DMA verification prevents false breakout signals"
    ],
    techStack: "TechnicalEngine (RSI, MACD, BB, ATR, ADX, Pivots)"
  },
  {
    id: 5,
    title: "5. Fundamental Analysis Engine",
    subtitle: "Capital Efficiency, Valuation & Solvency",
    icon: DollarSign,
    color: "#f59e0b",
    description: "Extracts balance sheet and P&L metrics: Return on Equity (ROE), ROCE, Debt-to-Equity leverage, P/E multiples, Operating & Net Margins, and 4-year Revenue Trajectories. Classifies valuation as Undervalued, Fairly Valued, or Expensive.",
    mathFormula: "HealthScore = 0.5 * ROE + 0.4 * ROCE + SolvencyDeductions",
    safeguards: [
      "Banking/NBFC leverage treated with specialized solvency metrics",
      "Quarterly TTM updates mapped to exact filing dates"
    ],
    techStack: "FundamentalEngine (ROE, ROCE, P/E, Debt/Equity, Margins)"
  },
  {
    id: 6,
    title: "6. NLP News Sentiment Analyzer",
    subtitle: "Financial Lexicon Polarity Scoring",
    icon: Newspaper,
    color: "#ec4899",
    description: "Scans corporate announcements, earnings updates, and financial media headlines using financial domain polarity dictionaries. Normalizes sentiment from -100 to +100.",
    safeguards: [
      "Strict Rule: News sentiment alone can NEVER trigger a BUY signal",
      "Weighted at only 10% to prevent headline manipulation whipsaws"
    ],
    techStack: "SentimentEngine, Financial Polarity Lexicon"
  },
  {
    id: 7,
    title: "7. Machine Learning Prediction Models",
    subtitle: "Walk-Forward Quantitative Direction",
    icon: BrainCircuit,
    color: "#6366f1",
    description: "Multi-horizon quantitative model producing 1-Day, 5-Day, and 20-Day directional forecasts (UP/DOWN/SIDEWAYS), return estimate ranges, and calibrated model confidence.",
    safeguards: [
      "Strict chronological train/val/test split (NEVER random shuffling)",
      "Purged walk-forward validation across 4 distinct market cycles",
      "Model confidence calibrated to indicator consensus"
    ],
    techStack: "Ensemble Pipeline (Gradient Boosted Trees + Volatility Cones)"
  },
  {
    id: 8,
    title: "8. Composite AI Scoring Engine",
    subtitle: "Configurable Multi-Factor Weighting",
    icon: Sliders,
    color: "#14b8a6",
    description: "Combines all sub-systems into a unified 0-100 AI Score: Technical (30%), Fundamental (25%), Momentum (15%), Volume (10%), Market Regime (10%), and Sentiment (10%). Thresholds classify into STRONG BUY, BUY, HOLD, SELL, and STRONG SELL.",
    mathFormula: "AIScore = sum(Weight_i * SubScore_i) for i in [Tech, Fund, Mom, Vol, Regime, Sent]",
    safeguards: [
      "Fully configurable weights and thresholds in admin panel",
      "Transparent breakdown showing individual factor contributions"
    ],
    techStack: "ScoringEngine, Configurable Threshold Layer"
  },
  {
    id: 9,
    title: "9. Risk Guardrails & Anomaly Scanner",
    subtitle: "Breakdown & Exhaustion Detection",
    icon: ShieldAlert,
    color: "#f43f5e",
    description: "Acts as a protective circuit breaker. Detects 200 DMA breakdown, RSI extreme overbought exhaustion (>75), severe balance sheet debt, or volume anomalies, assigning a Risk Level: LOW, MODERATE, HIGH, or EXTREME.",
    safeguards: [
      "Dampens score if high risk conditions are triggered",
      "Clear visual warnings on detail cards"
    ],
    techStack: "Risk Engine, Anomaly Detector"
  },
  {
    id: 10,
    title: "10. Explainable AI Signal Layer",
    subtitle: "Transparent Why & Risk Checklists",
    icon: Award,
    color: "#10b981",
    description: "Translates complex mathematical computations into plain-English reasons: Why BUY? Why HOLD? Why SELL? Accompanied by model confidence % and specific risk checklists for educated user decisions.",
    safeguards: [
      "No black-box obscurity: every signal shows top contributing factors",
      "Prominent educational disclaimer on all recommendations"
    ],
    techStack: "ExplainabilityLayer, RAG Research Assistant"
  }
];

export const HowItWorksView: React.FC = () => {
  const [selectedStep, setSelectedStep] = useState<PipelineStep>(PIPELINE_STEPS[0]);

  return (
    <div className="flex-col gap-6" style={{ paddingBottom: '3rem' }}>
      
      {/* 1. Header Banner */}
      <div className="glass-panel-elevated" style={{ padding: '1.75rem' }}>
        <div className="flex-row items-center gap-2">
          <Info size={24} color="#10b981" />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>
            How StockSense AI Works — Quantitative Architecture
          </h1>
          <span style={{ fontSize: '0.72rem', background: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
            DATA SCIENCE PIPELINE
          </span>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '6px', maxWidth: '900px', lineHeight: 1.5 }}>
          This educational platform implements a rigorous 10-stage Data Science and Quantitative Finance pipeline. 
          Unlike simplistic LLM chatbots that hallucinate stock prices, StockSense AI computes every indicator from first principles, 
          strictly eliminates look-ahead bias, and produces audited, explainable investment signals.
        </p>
      </div>

      {/* 2. Interactive Pipeline Visualizer */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.25rem'
      }}>
        
        {/* Left: Pipeline Steps List */}
        <div className="glass-panel" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Interactive 10-Stage Pipeline (Click to Inspect)
          </div>

          <div className="flex-col gap-2">
            {PIPELINE_STEPS.map((step) => {
              const Icon = step.icon;
              const isSelected = selectedStep.id === step.id;
              return (
                <div
                  key={step.id}
                  onClick={() => setSelectedStep(step)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                    border: isSelected ? '1px solid rgba(16, 185, 129, 0.45)' : '1px solid var(--border-color)',
                    transition: 'all 0.18s ease'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    background: isSelected ? step.color : 'rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isSelected ? '#ffffff' : step.color,
                    flexShrink: 0
                  }}>
                    <Icon size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isSelected ? '#ffffff' : '#e2e8f0' }}>
                      {step.title}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: isSelected ? '#34d399' : '#94a3b8' }}>
                      {step.subtitle}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Step Deep Dive Card */}
        <div className="glass-panel-elevated" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="flex-row items-center gap-3" style={{ marginBottom: '1rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: selectedStep.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <selectedStep.icon size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
                  {selectedStep.title}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {selectedStep.subtitle}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              {selectedStep.description}
            </p>

            {/* Formula box if present */}
            {selectedStep.mathFormula && (
              <div style={{
                background: 'rgba(10, 16, 28, 0.9)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                marginBottom: '1.25rem'
              }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Mathematical Specification:
                </div>
                <code className="num-font" style={{ fontSize: '0.82rem', color: '#38bdf8' }}>
                  {selectedStep.mathFormula}
                </code>
              </div>
            )}

            {/* Academic Rigor / Data Leakage Safeguards */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Academic Rigor &amp; Anti-Leakage Safeguards:
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {selectedStep.safeguards.map((safe, i) => (
                  <li key={i} style={{ fontSize: '0.78rem', color: '#e2e8f0', marginBottom: '0.4rem', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <CheckCircle2 size={15} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{safe}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Implementation Tech Stack Tag */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem'
          }}>
            <span style={{ color: '#94a3b8' }}>Implementation Layer:</span>
            <span className="num-font" style={{ color: '#818cf8', fontWeight: 700 }}>{selectedStep.techStack}</span>
          </div>

        </div>

      </div>

    </div>
  );
};
