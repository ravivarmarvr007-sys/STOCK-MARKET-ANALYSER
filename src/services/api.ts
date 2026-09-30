/**
 * StockSense AI - Frontend API Service Layer
 * Connects to the Python backend API with client-side fallback resilience.
 */
import {
  MarketIndex,
  MarketBreadth,
  MarketRegime,
  StockSummary,
  HistoricalBar,
  TechnicalDetails,
  FundamentalDetails,
  NewsItem,
  StockPredictions,
  BacktestResult,
  VirtualPortfolioData
} from '../types';

const API_BASE = '/api';

export async function fetchMarketOverview(): Promise<{
  indices: MarketIndex[];
  breadth: MarketBreadth;
  regime: MarketRegime;
  disclaimer: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/market/overview`);
    if (!res.ok) throw new Error('Failed to fetch market overview');
    return await res.json();
  } catch (err) {
    console.warn('Backend overview fetch fallback:', err);
    return {
      indices: [
        { symbol: "NIFTY 50", name: "Nifty 50 Index", current_value: 25840.60, change_amount: 164.20, change_pct: 0.64, trend: "Bullish", sparkline: [25620, 25680, 25640, 25710, 25790, 25760, 25840.60] },
        { symbol: "SENSEX", name: "BSE Sensex 30", current_value: 84520.40, change_amount: 512.80, change_pct: 0.61, trend: "Bullish", sparkline: [83890, 84050, 83950, 84200, 84380, 84320, 84520.40] },
        { symbol: "NIFTY BANK", name: "Nifty Bank Index", current_value: 53910.15, change_amount: 425.30, change_pct: 0.79, trend: "Bullish", sparkline: [53200, 53380, 53450, 53620, 53710, 53820, 53910.15] },
        { symbol: "NIFTY IT", name: "Nifty IT Sector Index", current_value: 42180.70, change_amount: 340.50, change_pct: 0.81, trend: "Bullish", sparkline: [41600, 41750, 41820, 41900, 42050, 42110, 42180.70] },
        { symbol: "NIFTY AUTO", name: "Nifty Auto Sector Index", current_value: 26450.90, change_amount: 215.10, change_pct: 0.82, trend: "Bullish", sparkline: [25980, 26100, 26180, 26290, 26340, 26390, 26450.90] },
        { symbol: "NIFTY PHARMA", name: "Nifty Pharma Index", current_value: 22780.20, change_amount: 85.40, change_pct: 0.38, trend: "Neutral", sparkline: [22650, 22690, 22680, 22720, 22740, 22760, 22780.20] },
        { symbol: "INDIA VIX", name: "India Volatility Index", current_value: 12.85, change_amount: -0.42, change_pct: -3.16, trend: "Bearish", sparkline: [13.8, 13.5, 13.6, 13.2, 13.1, 13.0, 12.85] }
      ],
      breadth: {
        advancing: 34,
        declining: 14,
        unchanged: 2,
        ad_ratio: 2.43,
        sentiment_score: 68.5,
        sentiment_category: "BULLISH",
        timestamp: "2026-09-29 09:30 IST",
        data_mode: "DEMO DATA"
      },
      regime: {
        regime: "Bullish",
        regime_score: 76.0,
        reasons: [
          "NIFTY 50 trading comfortably above both 50-day and 200-day moving averages",
          "Market breadth positive with Advance/Decline ratio at 2.43",
          "India VIX at 12.85 reflecting subdued macro volatility and institutional calm",
          "Sustained domestic institutional inflows (DII) providing liquidity cushion"
        ],
        data_mode: "DEMO DATA",
        updated_at: "2026-09-29 09:30 IST"
      },
      disclaimer: "Educational & decision-support tool. AI predictions are not guarantees of future returns."
    };
  }
}

export async function fetchScannerResults(filters?: {
  sector?: string;
  signal?: string;
  min_score?: number;
  sort_by?: string;
  order?: string;
}): Promise<{ total_scanned: number; total_returned: number; stocks: StockSummary[] }> {
  try {
    const params = new URLSearchParams();
    if (filters?.sector) params.append('sector', filters.sector);
    if (filters?.signal) params.append('signal', filters.signal);
    if (filters?.min_score) params.append('min_score', String(filters.min_score));
    if (filters?.sort_by) params.append('sort_by', filters.sort_by);
    if (filters?.order) params.append('order', filters.order);

    const res = await fetch(`${API_BASE}/scanner?${params.toString()}`);
    if (!res.ok) throw new Error('Scanner API failure');
    return await res.json();
  } catch (err) {
    console.warn('Backend scanner fetch fallback:', err);
    return {
      total_scanned: 25,
      total_returned: 1,
      stocks: []
    };
  }
}

export async function fetchTopOpportunities(): Promise<{ opportunities: StockSummary[] }> {
  try {
    const res = await fetch(`${API_BASE}/top-opportunities`);
    if (!res.ok) throw new Error('Top opportunities API failure');
    return await res.json();
  } catch (err) {
    console.warn('Backend top opportunities fallback:', err);
    return { opportunities: [] };
  }
}

export async function fetchRiskScanner(): Promise<{ flagged_stocks: any[]; total_flagged: number }> {
  try {
    const res = await fetch(`${API_BASE}/risk-scanner`);
    if (!res.ok) throw new Error('Risk scanner API failure');
    return await res.json();
  } catch (err) {
    console.warn('Backend risk scanner fallback:', err);
    return { flagged_stocks: [], total_flagged: 0 };
  }
}

export async function fetchStockDetail(symbol: string): Promise<{
  quote: any;
  profile: any;
  signal: any;
  technical: TechnicalDetails;
  fundamentals: FundamentalDetails;
  news: NewsItem[];
  sentiment: any;
  predictions: StockPredictions;
  model_version: string;
  disclaimer: string;
}> {
  const res = await fetch(`${API_BASE}/stock/${symbol}`);
  if (!res.ok) throw new Error(`Failed to fetch stock detail for ${symbol}`);
  return await res.json();
}

export async function fetchStockHistory(
  symbol: string,
  timeframe: string = '1Y'
): Promise<{ symbol: string; timeframe: string; bars: HistoricalBar[] }> {
  const res = await fetch(`${API_BASE}/stock/${symbol}/history?timeframe=${timeframe}`);
  if (!res.ok) throw new Error(`Failed to fetch historical bars for ${symbol}`);
  return await res.json();
}

export async function runBacktest(params: {
  symbol: string;
  strategy?: string;
  initial_capital?: number;
  transaction_cost_pct?: number;
  slippage_pct?: number;
}): Promise<BacktestResult> {
  const res = await fetch(`${API_BASE}/backtest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error('Backtest execution failed');
  return await res.json();
}

export async function compareStocks(symbols: string[]): Promise<{ symbols: string[]; comparisons: StockSummary[] }> {
  const res = await fetch(`${API_BASE}/compare?symbols=${symbols.join(',')}`);
  if (!res.ok) throw new Error('Stock comparison failed');
  return await res.json();
}

export async function fetchPortfolio(): Promise<VirtualPortfolioData> {
  const res = await fetch(`${API_BASE}/portfolio`);
  if (!res.ok) throw new Error('Failed to fetch portfolio');
  return await res.json();
}

export async function addPortfolioPosition(symbol: string, shares: number, avgPrice: number) {
  const res = await fetch(`${API_BASE}/portfolio/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbol, shares, avg_price: avgPrice })
  });
  return await res.json();
}

export async function fetchWatchlist(): Promise<{ watchlist: StockSummary[]; symbols: string[] }> {
  const res = await fetch(`${API_BASE}/watchlist`);
  if (!res.ok) throw new Error('Failed to fetch watchlist');
  return await res.json();
}

export async function toggleWatchlist(symbol: string): Promise<{ symbol: string; in_watchlist: boolean }> {
  const res = await fetch(`${API_BASE}/watchlist/${symbol}`, { method: 'POST' });
  return await res.json();
}

export async function fetchAlerts(): Promise<{ alerts: any[] }> {
  const res = await fetch(`${API_BASE}/alerts`);
  return await res.json();
}

export async function createAlert(alert: { symbol: string; type: string; threshold: number }) {
  const res = await fetch(`${API_BASE}/alerts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(alert)
  });
  return await res.json();
}

export async function askAssistant(query: string): Promise<{ query: string; answer: string; retrieved_context: any }> {
  const res = await fetch(`${API_BASE}/assistant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  if (!res.ok) throw new Error('Assistant query failed');
  return await res.json();
}

export async function fetchModelMonitoring() {
  const res = await fetch(`${API_BASE}/model-monitoring`);
  return await res.json();
}

export async function fetchSettings() {
  const res = await fetch(`${API_BASE}/settings`);
  return await res.json();
}

export async function updateSettings(weights: any, thresholds: any) {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ weights, thresholds })
  });
  return await res.json();
}
