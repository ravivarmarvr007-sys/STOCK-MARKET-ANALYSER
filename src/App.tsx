import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { MarketOverview } from './components/MarketOverview';
import { TopOpportunities } from './components/TopOpportunities';
import { RiskScannerSection } from './components/RiskScannerSection';
import { MarketScannerView } from './components/MarketScannerView';
import { StockAnalysisView } from './components/StockAnalysisView';
import { AIPredictionsView } from './components/AIPredictionsView';
import { BacktestingView } from './components/BacktestingView';
import { StockComparisonView } from './components/StockComparisonView';
import { VirtualPortfolioView } from './components/VirtualPortfolioView';
import { WatchlistView } from './components/WatchlistView';
import { AIAssistantView } from './components/AIAssistantView';
import { HowItWorksView } from './components/HowItWorksView';
import { SettingsView } from './components/SettingsView';

import { 
  fetchMarketOverview, 
  fetchTopOpportunities, 
  fetchRiskScanner 
} from './services/api';

import { MarketIndex, MarketBreadth, MarketRegime, StockSummary } from './types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('TCS');

  // Dashboard Overview state
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [breadth, setBreadth] = useState<MarketBreadth | null>(null);
  const [regime, setRegime] = useState<MarketRegime | null>(null);
  const [topOpportunities, setTopOpportunities] = useState<StockSummary[]>([]);
  const [flaggedStocks, setFlaggedStocks] = useState<any[]>([]);
  const [overviewLoading, setOverviewLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchMarketOverview(),
      fetchTopOpportunities(),
      fetchRiskScanner()
    ]).then(([overviewRes, oppsRes, riskRes]) => {
      setIndices(overviewRes.indices || []);
      setBreadth(overviewRes.breadth || null);
      setRegime(overviewRes.regime || null);
      setTopOpportunities(oppsRes.opportunities || []);
      setFlaggedStocks(riskRes.flagged_stocks || []);
      setOverviewLoading(false);
    }).catch(err => {
      console.warn("Failed to load initial overview:", err);
      setOverviewLoading(false);
    });
  }, []);

  const handleSelectStock = (symbol: string) => {
    setSelectedSymbol(symbol.toUpperCase());
    setCurrentTab('analysis');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. Regulatory Educational Disclaimer Banner */}
      <DisclaimerBanner />

      {/* 2. Top Navigation Bar */}
      <Navbar 
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onSelectStock={handleSelectStock}
      />

      {/* 3. Main Content Container */}
      <main className="app-container" style={{ flex: 1, paddingTop: '1.5rem' }}>
        
        {/* TAB 1: DASHBOARD */}
        {currentTab === 'dashboard' && (
          <div>
            {overviewLoading || !breadth || !regime ? (
              <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
                <div className="live-pulse-dot" style={{ width: '14px', height: '14px', marginBottom: '1rem' }} />
                <p>Loading live Indian equity benchmarks, market breadth, and AI regime status...</p>
              </div>
            ) : (
              <>
                {/* Market Indices, Breadth, Sentiment & Regime */}
                <MarketOverview 
                  indices={indices}
                  breadth={breadth}
                  regime={regime}
                />

                {/* AI Top Opportunities */}
                <TopOpportunities 
                  opportunities={topOpportunities}
                  onSelectStock={handleSelectStock}
                />

                {/* AI Risk Scanner */}
                <RiskScannerSection 
                  flaggedStocks={flaggedStocks}
                  onSelectStock={handleSelectStock}
                />
              </>
            )}
          </div>
        )}

        {/* TAB 2: MARKET SCANNER */}
        {currentTab === 'scanner' && (
          <MarketScannerView onSelectStock={handleSelectStock} />
        )}

        {/* TAB 3: STOCK ANALYSIS */}
        {currentTab === 'analysis' && (
          <StockAnalysisView 
            symbol={selectedSymbol}
            onSelectStock={handleSelectStock}
          />
        )}

        {/* TAB 4: AI PREDICTIONS & GOVERNANCE */}
        {currentTab === 'predictions' && (
          <AIPredictionsView onSelectStock={handleSelectStock} />
        )}

        {/* TAB 5: STOCK COMPARISON */}
        {currentTab === 'compare' && (
          <StockComparisonView onSelectStock={handleSelectStock} />
        )}

        {/* TAB 6: VIRTUAL PORTFOLIO SIMULATOR */}
        {currentTab === 'portfolio' && (
          <VirtualPortfolioView onSelectStock={handleSelectStock} />
        )}

        {/* TAB 7: BACKTESTING ENGINE */}
        {currentTab === 'backtest' && (
          <BacktestingView />
        )}

        {/* TAB 8: AI ASSISTANT (RAG) */}
        {currentTab === 'assistant' && (
          <AIAssistantView />
        )}

        {/* TAB 9: WATCHLIST & ALERTS */}
        {currentTab === 'watchlist' && (
          <WatchlistView onSelectStock={handleSelectStock} />
        )}

        {/* TAB 10: HOW IT WORKS (PRESENTATION) */}
        {currentTab === 'how-it-works' && (
          <HowItWorksView />
        )}

        {/* TAB 11: SETTINGS / ADMIN */}
        {currentTab === 'settings' && (
          <SettingsView />
        )}

      </main>

      {/* 4. Footer */}
      <footer style={{
        background: 'rgba(8, 13, 25, 0.95)',
        borderTop: '1px solid var(--border-color)',
        padding: '2rem 1.5rem',
        marginTop: 'auto'
      }}>
        <div className="app-container" style={{ padding: 0 }}>
          <div className="flex-row items-center justify-between" style={{ flexWrap: 'wrap', gap: '1.25rem' }}>
            <div>
              <div className="flex-row items-center gap-2">
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                  StockSense <span style={{ color: '#10b981' }}>AI</span>
                </span>
                <span style={{ fontSize: '0.65rem', background: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  v2.4 Production Build
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                AI-Powered Indian Stock Market Analysis, Multi-Horizon Prediction, and Decision-Support Platform.
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Developed for <strong>AI Immersion &amp; Quantitative Data Science Presentation</strong>
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                Chronological Walk-Forward ML • Zero Look-Ahead Bias • Explainable Factors
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            fontSize: '0.68rem',
            color: '#64748b',
            lineHeight: 1.5
          }}>
            <strong>Regulatory &amp; Market Data Disclaimer:</strong> StockSense AI is strictly an educational research platform and decision-support simulator. 
            All scores, predictive ranges, and BUY/HOLD/SELL signals are model estimates generated from quantitative algorithmic analysis and are subject to market risks. 
            They do not guarantee financial returns or constitute registered SEBI investment advice. Always consult a certified financial advisor before committing capital.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
