"""
StockSense AI - Master REST API Server (Flask)
Exposes endpoints for Indian Stock Market Overview, Market Scanner, Stock Analysis,
AI Multi-horizon Predictions, Explainable Signals, Backtesting, Stock Comparison,
Virtual Portfolio, Watchlist & Alerts, AI Assistant (RAG), and Model Governance.
"""
import os
import sys
import json
import sqlite3

# Ensure backend root is on Python module search path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, request, jsonify
from flask_cors import CORS

from database import init_db, get_connection
from providers.demo_provider import DemoMarketDataProvider
from providers.live_provider import LiveMarketDataProvider
from services.technical_engine import TechnicalEngine
from services.fundamental_engine import FundamentalEngine
from services.sentiment_engine import SentimentEngine
from services.scoring_engine import ScoringEngine, DEFAULT_WEIGHTS, DEFAULT_THRESHOLDS
from services.ml_engine import MLPredictionEngine, MODEL_METADATA_AUDIT, FEATURE_IMPORTANCE_AUDIT
from services.backtest_engine import BacktestEngine
from services.ai_assistant_rag import AIAssistantRAG

app = Flask(__name__)
CORS(app)

# Initialize database
init_db()

# Initialize data provider (demo provider as default high-fidelity provider)
data_provider = DemoMarketDataProvider()
technical_engine = TechnicalEngine()
fundamental_engine = FundamentalEngine()
sentiment_engine = SentimentEngine()
scoring_engine = ScoringEngine()
assistant_rag = AIAssistantRAG(data_provider, technical_engine, fundamental_engine, scoring_engine)

# In-memory session stores for virtual portfolio, watchlist, and custom settings
VIRTUAL_PORTFOLIO = [
    {"symbol": "TCS", "shares": 25, "avg_price": 3950.0, "buy_date": "2024-03-15"},
    {"symbol": "INFY", "shares": 50, "avg_price": 1680.0, "buy_date": "2024-04-10"},
    {"symbol": "HDFCBANK", "shares": 60, "avg_price": 1520.0, "buy_date": "2024-05-02"},
    {"symbol": "TATAMOTORS", "shares": 80, "avg_price": 820.0, "buy_date": "2024-06-18"}
]

WATCHLIST = ["TCS", "RELIANCE", "TATAMOTORS", "ZOMATO", "TRENT"]

ALERTS = [
    {"id": 1, "symbol": "TCS", "type": "AI Score > 80", "threshold": 80, "triggered": True, "message": "TCS AI Score crossed 84 (Strong Buy setup)"},
    {"id": 2, "symbol": "TATAMOTORS", "type": "RSI Extreme", "threshold": 70, "triggered": False, "message": "Awaiting RSI >= 70 trigger"},
    {"id": 3, "symbol": "INFY", "type": "MACD Crossover", "threshold": 0, "triggered": True, "message": "Bullish MACD crossover confirmed"}
]

# Helper to precompute stock full summary
def compute_stock_summary(symbol: str) -> dict:
    quote = data_provider.get_quote(symbol)
    raw_funds = data_provider.get_fundamentals(symbol)
    funds = fundamental_engine.evaluate_fundamentals(raw_funds) if raw_funds else {}
    bars = data_provider.get_historical_data(symbol, "1Y")
    tech = technical_engine.analyze_full_technicals(bars)
    news = data_provider.get_news(symbol)
    sent_data = sentiment_engine.aggregate_news_sentiment(news)
    regime = data_provider.get_market_regime()
    signal = scoring_engine.compute_composite_signal(symbol, tech, funds, sent_data, regime)

    return {
        "symbol": symbol,
        "name": quote["name"] if quote else symbol,
        "sector": quote["sector"] if quote else "General",
        "market_cap_category": quote.get("market_cap_category", "Large Cap"),
        "current_price": quote["current_price"] if quote else 0.0,
        "change_amount": quote["change_amount"] if quote else 0.0,
        "change_pct": quote["change_pct"] if quote else 0.0,
        "week_52_high": quote.get("week_52_high", 0.0) if quote else 0.0,
        "week_52_low": quote.get("week_52_low", 0.0) if quote else 0.0,
        "ai_score": signal["ai_score"],
        "signal": signal["signal"],
        "confidence": signal["confidence"],
        "risk_level": signal["risk_level"],
        "technical_score": signal["technical_score"],
        "fundamental_score": signal["fundamental_score"],
        "momentum_score": signal["momentum_score"],
        "volume_score": signal["volume_score"],
        "sentiment_score": signal["sentiment_score"],
        "rsi": tech["rsi"],
        "pe_ratio": funds.get("pe_ratio", 0.0),
        "roe": funds.get("roe", 0.0),
        "debt_to_equity": funds.get("debt_to_equity", 0.0),
        "trend": tech["trend"],
        "why_factors": signal["why_factors"],
        "risks": signal["risks"],
        "data_freshness": quote.get("data_freshness", "DEMO DATA") if quote else "DEMO DATA",
        "data_mode": quote.get("data_mode", "DEMO DATA") if quote else "DEMO DATA"
    }

# ----------------- API ROUTES ----------------- #

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "app": "StockSense AI",
        "version": "2.4.0",
        "timestamp": "2026-09-29T09:30:00+05:30",
        "mode": "DEMO DATA"
    })

@app.route("/api/market/overview", methods=["GET"])
def market_overview():
    indices = data_provider.get_indices()
    breadth = data_provider.get_market_breadth()
    regime = data_provider.get_market_regime()
    return jsonify({
        "indices": indices,
        "breadth": breadth,
        "regime": regime,
        "disclaimer": "Educational & decision-support tool. AI predictions are not guarantees of future returns."
    })

@app.route("/api/scanner", methods=["GET"])
def market_scanner():
    """Scans all supported Indian stocks and computes multi-factor AI scores and signals."""
    catalog = data_provider.get_all_symbols()
    sector_filter = request.args.get("sector")
    signal_filter = request.args.get("signal")
    min_score = request.args.get("min_score", type=float)
    sort_by = request.args.get("sort_by", "ai_score")
    order = request.args.get("order", "desc")

    results = []
    for item in catalog:
        summary = compute_stock_summary(item["symbol"])
        results.append(summary)

    # Filtering
    if sector_filter and sector_filter.lower() != "all":
        results = [r for r in results if sector_filter.lower() in r["sector"].lower()]
    if signal_filter and signal_filter.lower() != "all":
        results = [r for r in results if r["signal"].upper() == signal_filter.upper()]
    if min_score is not None:
        results = [r for r in results if r["ai_score"] >= min_score]

    # Sorting
    reverse = (order.lower() == "desc")
    if sort_by in ["ai_score", "technical_score", "fundamental_score", "current_price", "change_pct", "rsi", "pe_ratio", "roe"]:
        results.sort(key=lambda x: x.get(sort_by, 0), reverse=reverse)

    # Assign rank
    for idx, r in enumerate(results):
        r["rank"] = idx + 1

    return jsonify({
        "total_scanned": len(catalog),
        "total_returned": len(results),
        "stocks": results,
        "data_mode": "DEMO DATA",
        "timestamp": "2026-09-29 09:30 IST"
    })

@app.route("/api/top-opportunities", methods=["GET"])
def top_opportunities():
    """Returns top 6 ranked opportunities based on the AI scoring system."""
    catalog = data_provider.get_all_symbols()
    summaries = [compute_stock_summary(item["symbol"]) for item in catalog]
    summaries.sort(key=lambda x: x["ai_score"], reverse=True)
    top_picks = summaries[:6]
    for idx, p in enumerate(top_picks):
        p["rank"] = idx + 1
    return jsonify({
        "opportunities": top_picks,
        "count": len(top_picks)
    })

@app.route("/api/risk-scanner", methods=["GET"])
def risk_scanner():
    """Detects stocks exhibiting elevated technical, fundamental, or volatility risk factors."""
    catalog = data_provider.get_all_symbols()
    flagged = []
    for item in catalog:
        s = compute_stock_summary(item["symbol"])
        if s["risk_level"] in ["HIGH RISK", "EXTREME RISK", "MODERATE RISK"]:
            flagged.append({
                "symbol": s["symbol"],
                "name": s["name"],
                "current_price": s["current_price"],
                "change_pct": s["change_pct"],
                "risk_level": s["risk_level"],
                "ai_score": s["ai_score"],
                "risks": s["risks"]
            })
    flagged.sort(key=lambda x: len(x["risks"]), reverse=True)
    return jsonify({
        "flagged_stocks": flagged[:8],
        "total_flagged": len(flagged)
    })

@app.route("/api/stock/<symbol>", methods=["GET"])
def stock_detail(symbol: str):
    """Deep-dive package for selected stock."""
    sym = symbol.upper()
    quote = data_provider.get_quote(sym)
    if not quote:
        return jsonify({"error": f"Symbol {sym} not found in supported universe."}), 404

    profile = data_provider.get_company_profile(sym)
    raw_funds = data_provider.get_fundamentals(sym)
    fund_eval = fundamental_engine.evaluate_fundamentals(raw_funds)
    
    bars = data_provider.get_historical_data(sym, "1Y")
    tech = technical_engine.analyze_full_technicals(bars)
    
    news = data_provider.get_news(sym)
    sentiment = sentiment_engine.aggregate_news_sentiment(news)
    regime = data_provider.get_market_regime()
    
    signal = scoring_engine.compute_composite_signal(sym, tech, fund_eval, sentiment, regime)
    features = MLPredictionEngine.extract_features(bars, tech, fund_eval, sentiment)
    predictions = MLPredictionEngine.generate_predictions(sym, features, signal["ai_score"])

    return jsonify({
        "quote": quote,
        "profile": profile,
        "signal": signal,
        "technical": tech,
        "fundamentals": fund_eval,
        "news": news,
        "sentiment": sentiment,
        "predictions": predictions["predictions"],
        "model_version": predictions["model_version"],
        "disclaimer": "This analysis is for research and decision support only. Past performance does not guarantee future results."
    })

@app.route("/api/stocks", methods=["GET"])
def get_all_stocks_list():
    """Returns directory of all supported Indian stocks."""
    catalog = data_provider.get_all_symbols()
    return jsonify({
        "count": len(catalog),
        "stocks": catalog
    })

@app.route("/api/predictions/<symbol>", methods=["GET"])
def get_stock_predictions_only(symbol: str):
    """Direct endpoint to retrieve multi-horizon ML predictions for a stock."""
    sym = symbol.upper()
    quote = data_provider.get_quote(sym)
    if not quote:
        return jsonify({"error": f"Symbol {sym} not found."}), 404
    raw_funds = data_provider.get_fundamentals(sym)
    fund_eval = fundamental_engine.evaluate_fundamentals(raw_funds)
    bars = data_provider.get_historical_data(sym, "1Y")
    tech = technical_engine.analyze_full_technicals(bars)
    news = data_provider.get_news(sym)
    sentiment = sentiment_engine.aggregate_news_sentiment(news)
    regime = data_provider.get_market_regime()
    signal = scoring_engine.compute_composite_signal(sym, tech, fund_eval, sentiment, regime)
    features = MLPredictionEngine.extract_features(bars, tech, fund_eval, sentiment)
    predictions = MLPredictionEngine.generate_predictions(sym, features, signal["ai_score"])
    return jsonify({
        "symbol": sym,
        "predictions": predictions["predictions"],
        "model_version": predictions["model_version"],
        "features": features
    })

@app.route("/api/stock/<symbol>/history", methods=["GET"])
def stock_history(symbol: str):
    sym = symbol.upper()
    timeframe = request.args.get("timeframe", "1Y").upper()
    bars = data_provider.get_historical_data(sym, timeframe)
    
    # Calculate indicator overlays
    closes = [b["close"] for b in bars]
    sma20 = technical_engine.calculate_sma(closes, 20)
    sma50 = technical_engine.calculate_sma(closes, 50)
    sma200 = technical_engine.calculate_sma(closes, 200)
    ema20 = technical_engine.calculate_ema(closes, 20)
    bb = technical_engine.calculate_bollinger_bands(closes, 20, 2.0)

    enriched_bars = []
    for i in range(len(bars)):
        enriched_bars.append({
            "date": bars[i]["date"],
            "open": bars[i]["open"],
            "high": bars[i]["high"],
            "low": bars[i]["low"],
            "close": bars[i]["close"],
            "volume": bars[i]["volume"],
            "sma_20": sma20[i],
            "sma_50": sma50[i],
            "sma_200": sma200[i],
            "ema_20": ema20[i],
            "bb_upper": bb["upper"][i],
            "bb_middle": bb["middle"][i],
            "bb_lower": bb["lower"][i]
        })

    return jsonify({
        "symbol": sym,
        "timeframe": timeframe,
        "bars_count": len(enriched_bars),
        "bars": enriched_bars
    })

@app.route("/api/backtest", methods=["POST"])
def run_backtest():
    payload = request.json or {}
    symbol = payload.get("symbol", "TCS").upper()
    strategy = payload.get("strategy", "AI BUY/SELL")
    initial_cap = float(payload.get("initial_capital", 100000.0))
    cost_pct = float(payload.get("transaction_cost_pct", 0.15))
    slippage_pct = float(payload.get("slippage_pct", 0.05))

    # Pull 5Y history for backtest simulation
    bars = data_provider.get_historical_data(symbol, "5Y")
    results = BacktestEngine.run_backtest(
        bars=bars,
        symbol=symbol,
        strategy_name=strategy,
        initial_capital=initial_cap,
        transaction_cost_pct=cost_pct,
        slippage_pct=slippage_pct
    )
    return jsonify(results)

@app.route("/api/compare", methods=["GET"])
def compare_stocks():
    symbols_param = request.args.get("symbols", "TCS,INFY,HCLTECH")
    sym_list = [s.strip().upper() for s in symbols_param.split(",") if s.strip()][:5]
    
    comparisons = []
    for s in sym_list:
        summary = compute_stock_summary(s)
        comparisons.append(summary)

    return jsonify({
        "symbols": sym_list,
        "comparisons": comparisons
    })

@app.route("/api/portfolio", methods=["GET"])
def get_portfolio():
    positions = []
    total_val = 0.0
    total_inv = 0.0
    sector_alloc = {}

    for pos in VIRTUAL_PORTFOLIO:
        sym = pos["symbol"]
        quote = data_provider.get_quote(sym)
        price = quote["current_price"] if quote else pos["avg_price"]
        cur_val = price * pos["shares"]
        inv_val = pos["avg_price"] * pos["shares"]
        pnl = cur_val - inv_val
        pnl_pct = round((pnl / inv_val) * 100, 2)

        total_val += cur_val
        total_inv += inv_val

        sector = quote.get("sector", "Other") if quote else "Other"
        sector_alloc[sector] = sector_alloc.get(sector, 0.0) + cur_val

        positions.append({
            "symbol": sym,
            "name": quote["name"] if quote else sym,
            "sector": sector,
            "shares": pos["shares"],
            "avg_price": pos["avg_price"],
            "current_price": price,
            "current_value": round(cur_val, 2),
            "invested_value": round(inv_val, 2),
            "pnl_amount": round(pnl, 2),
            "pnl_pct": pnl_pct
        })

    # AI Diagnostic remarks
    diagnostics = []
    it_weight = (sector_alloc.get("Information Technology", 0.0) / max(1.0, total_val)) * 100
    if it_weight > 40:
        diagnostics.append(f"Sector Concentration: Portfolio is {it_weight:0.1f}% allocated to Information Technology. Consider diversifying across Consumer or Healthcare.")
    diagnostics.append("Portfolio Volatility: Moderate (Weighted Beta: 1.04).")
    diagnostics.append("Momentum Check: 3 of 4 positions are maintaining prices above their 50-day moving averages.")

    return jsonify({
        "positions": positions,
        "total_value": round(total_val, 2),
        "total_invested": round(total_inv, 2),
        "total_pnl": round(total_val - total_inv, 2),
        "total_pnl_pct": round(((total_val - total_inv) / max(1.0, total_inv)) * 100, 2),
        "sector_allocation": sector_alloc,
        "ai_diagnostics": diagnostics,
        "note": "Virtual Portfolio for research simulation. Orders are simulated."
    })

@app.route("/api/portfolio/add", methods=["POST"])
def add_portfolio_position():
    payload = request.json or {}
    symbol = payload.get("symbol", "").upper()
    shares = int(payload.get("shares", 10))
    avg_price = float(payload.get("avg_price", 1000.0))

    if not symbol:
        return jsonify({"error": "Symbol required"}), 400

    # Update or append
    found = False
    for p in VIRTUAL_PORTFOLIO:
        if p["symbol"] == symbol:
            p["shares"] += shares
            found = True
            break
    if not found:
        VIRTUAL_PORTFOLIO.append({
            "symbol": symbol,
            "shares": shares,
            "avg_price": avg_price,
            "buy_date": "2026-09-29"
        })
    return jsonify({"success": True, "message": f"Added {shares} shares of {symbol}."})

@app.route("/api/watchlist", methods=["GET"])
def get_watchlist():
    items = [compute_stock_summary(s) for s in WATCHLIST]
    return jsonify({
        "watchlist": items,
        "symbols": WATCHLIST
    })

@app.route("/api/watchlist/<symbol>", methods=["POST"])
def toggle_watchlist(symbol: str):
    sym = symbol.upper()
    if sym in WATCHLIST:
        WATCHLIST.remove(sym)
        is_added = False
    else:
        WATCHLIST.append(sym)
        is_added = True
    return jsonify({"symbol": sym, "in_watchlist": is_added})

@app.route("/api/alerts", methods=["GET", "POST"])
def alerts_handler():
    if request.method == "POST":
        payload = request.json or {}
        new_alert = {
            "id": len(ALERTS) + 1,
            "symbol": payload.get("symbol", "TCS").upper(),
            "type": payload.get("type", "AI Score > 80"),
            "threshold": float(payload.get("threshold", 80)),
            "triggered": False,
            "message": f"Alert set for {payload.get('symbol')} on condition {payload.get('type')}"
        }
        ALERTS.append(new_alert)
        return jsonify(new_alert)
    return jsonify({"alerts": ALERTS})

@app.route("/api/assistant", methods=["POST"])
def ask_assistant():
    payload = request.json or {}
    query = payload.get("query", "")
    if not query:
        return jsonify({"error": "Query parameter cannot be empty"}), 400
    res = assistant_rag.answer_query(query)
    return jsonify(res)

@app.route("/api/model-monitoring", methods=["GET"])
def model_monitoring():
    return jsonify({
        "metadata": MODEL_METADATA_AUDIT,
        "feature_importance": FEATURE_IMPORTANCE_AUDIT,
        "walk_forward_epochs": [
            {"epoch": "WF-1 (2020-2021)", "accuracy_pct": 64.2, "precision_buy_pct": 70.1, "sharpe": 1.72},
            {"epoch": "WF-2 (2022-2023)", "accuracy_pct": 65.8, "precision_buy_pct": 71.5, "sharpe": 1.85},
            {"epoch": "WF-3 (2024)", "accuracy_pct": 67.1, "precision_buy_pct": 74.0, "sharpe": 2.05},
            {"epoch": "WF-4 (2025-2026)", "accuracy_pct": 66.4, "precision_buy_pct": 72.8, "sharpe": 1.94}
        ]
    })

@app.route("/api/settings", methods=["GET", "POST"])
def settings_handler():
    global scoring_engine
    if request.method == "POST":
        payload = request.json or {}
        new_weights = payload.get("weights", DEFAULT_WEIGHTS)
        new_thresh = payload.get("thresholds", DEFAULT_THRESHOLDS)
        scoring_engine = ScoringEngine(weights=new_weights, thresholds=new_thresh)
        return jsonify({"success": True, "weights": scoring_engine.weights, "thresholds": scoring_engine.thresholds})
    return jsonify({
        "weights": scoring_engine.weights,
        "thresholds": scoring_engine.thresholds,
        "data_mode": "DEMO DATA"
    })

if __name__ == "__main__":
    print("Starting StockSense AI Backend on http://127.0.0.1:5000 ...")
    app.run(host="127.0.0.1", port=5000, debug=False)
