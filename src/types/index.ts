/**
 * StockSense AI - TypeScript Type Definitions
 */

export interface MarketIndex {
  symbol: string;
  name: string;
  current_value: number;
  change_amount: number;
  change_pct: number;
  trend: 'Bullish' | 'Bearish' | 'Neutral';
  sparkline: number[];
}

export interface MarketBreadth {
  advancing: number;
  declining: number;
  unchanged: number;
  ad_ratio: number;
  sentiment_score: number;
  sentiment_category: 'VERY BEARISH' | 'BEARISH' | 'NEUTRAL' | 'BULLISH' | 'VERY BULLISH';
  timestamp: string;
  data_mode: string;
}

export interface MarketRegime {
  regime: 'Strong Bullish' | 'Bullish' | 'Sideways' | 'Bearish' | 'Strong Bearish';
  regime_score: number;
  reasons: string[];
  data_mode: string;
  updated_at: string;
}

export interface StockSummary {
  rank?: number;
  symbol: string;
  name: string;
  sector: string;
  market_cap_category: string;
  current_price: number;
  change_amount: number;
  change_pct: number;
  week_52_high: number;
  week_52_low: number;
  ai_score: number;
  signal: 'STRONG BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG SELL';
  confidence: number;
  risk_level: 'LOW RISK' | 'MODERATE RISK' | 'HIGH RISK' | 'EXTREME RISK';
  technical_score: number;
  fundamental_score: number;
  momentum_score: number;
  volume_score: number;
  sentiment_score: number;
  rsi: number;
  pe_ratio: number;
  roe: number;
  debt_to_equity: number;
  trend: 'Bullish' | 'Bearish' | 'Neutral';
  why_factors: string[];
  risks: string[];
  data_freshness: string;
  data_mode: string;
}

export interface HistoricalBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  sma_20?: number | null;
  sma_50?: number | null;
  sma_200?: number | null;
  ema_20?: number | null;
  bb_upper?: number | null;
  bb_middle?: number | null;
  bb_lower?: number | null;
}

export interface TechnicalDetails {
  current_price: number;
  rsi: number;
  rsi_status: 'Overbought' | 'Oversold' | 'Neutral';
  macd: number;
  macd_signal: number;
  macd_hist: number;
  macd_posture: string;
  ema_20: number;
  sma_50: number;
  sma_200: number;
  bb_upper: number;
  bb_middle: number;
  bb_lower: number;
  atr: number;
  adx: number;
  plus_di: number;
  minus_di: number;
  adx_strength: string;
  support: number;
  resistance: number;
  trend: string;
  volume_latest: number;
  volume_20d_avg: number;
  volume_change_pct: number;
  momentum_5d_pct: number;
  momentum_20d_pct: number;
  ai_explanation: string;
}

export interface FinancialYearItem {
  year: string;
  revenue_cr: number;
  net_profit_cr: number;
  op_margin_pct: number;
}

export interface FundamentalDetails {
  symbol: string;
  market_cap_cr: number;
  pe_ratio: number;
  pb_ratio: number;
  eps: number;
  roe: number;
  roce: number;
  debt_to_equity: number;
  revenue_growth_pct: number;
  profit_growth_pct: number;
  operating_margin_pct: number;
  net_margin_pct: number;
  dividend_yield_pct: number;
  valuation_class: 'Undervalued' | 'Fairly Valued' | 'Expensive';
  financial_health: 'Strong' | 'Average' | 'Weak';
  growth_class: 'High' | 'Moderate' | 'Low';
  fundamental_score: number;
  financial_trajectory: FinancialYearItem[];
}

export interface NewsItem {
  id?: number;
  symbol: string;
  headline: string;
  source: string;
  timestamp: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  score: number;
  summary: string;
}

export interface HorizonPrediction {
  horizon: string;
  direction: 'UP' | 'DOWN' | 'SIDEWAYS';
  estimated_range: string;
  min_pct: number;
  max_pct: number;
  confidence: number;
  rationale: string;
}

export interface StockPredictions {
  day_1: HorizonPrediction;
  day_5: HorizonPrediction;
  day_20: HorizonPrediction;
}

export interface BacktestResult {
  symbol: string;
  strategy: string;
  period: string;
  initial_capital: number;
  final_capital: number;
  total_return_pct: number;
  cagr_pct: number;
  max_drawdown_pct: number;
  sharpe_ratio: number;
  win_rate_pct: number;
  total_trades: number;
  winning_trades_count: number;
  losing_trades_count: number;
  avg_trade_return_pct: number;
  best_trade_pct: number;
  worst_trade_pct: number;
  benchmark_bh_return_pct: number;
  benchmark_bh_cagr_pct: number;
  benchmark_nifty_return_pct: number;
  equity_curve: Array<{ date: string; ai_strategy: number; buy_and_hold: number; nifty_50: number }>;
  drawdown_curve: Array<{ date: string; drawdown_pct: number }>;
  trades_sample: Array<{
    entry_date: string;
    exit_date: string;
    type: string;
    entry_price: number;
    exit_price: number;
    shares: number;
    return_pct: number;
    reason: string;
  }>;
  transaction_cost_applied: string;
  disclaimer: string;
}

export interface PortfolioPosition {
  symbol: string;
  name: string;
  sector: string;
  shares: number;
  avg_price: number;
  current_price: number;
  current_value: number;
  invested_value: number;
  pnl_amount: number;
  pnl_pct: number;
}

export interface VirtualPortfolioData {
  positions: PortfolioPosition[];
  total_value: number;
  total_invested: number;
  total_pnl: number;
  total_pnl_pct: number;
  sector_allocation: Record<string, number>;
  ai_diagnostics: string[];
  note: string;
}
