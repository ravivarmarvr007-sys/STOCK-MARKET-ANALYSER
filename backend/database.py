"""
StockSense AI - Database Layer
Implements schema and SQLite helper methods for auditability, persistence, and fast queries.
"""
import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "stocksense.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Stocks table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS stocks (
        symbol TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        sector TEXT NOT NULL,
        market_cap_category TEXT NOT NULL,
        current_price REAL NOT NULL,
        change_amount REAL NOT NULL,
        change_pct REAL NOT NULL,
        day_high REAL NOT NULL,
        day_low REAL NOT NULL,
        week_52_high REAL NOT NULL,
        week_52_low REAL NOT NULL,
        volume INTEGER NOT NULL,
        avg_volume INTEGER NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)

    # 2. Historical Prices
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS historical_prices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT NOT NULL,
        date TEXT NOT NULL,
        open REAL NOT NULL,
        high REAL NOT NULL,
        low REAL NOT NULL,
        close REAL NOT NULL,
        volume INTEGER NOT NULL,
        UNIQUE(symbol, date)
    )
    """)

    # 3. Technical Indicators
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS technical_indicators (
        symbol TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        rsi REAL NOT NULL,
        macd REAL NOT NULL,
        macd_signal REAL NOT NULL,
        macd_hist REAL NOT NULL,
        ema_20 REAL NOT NULL,
        sma_50 REAL NOT NULL,
        sma_200 REAL NOT NULL,
        bb_upper REAL NOT NULL,
        bb_middle REAL NOT NULL,
        bb_lower REAL NOT NULL,
        atr REAL NOT NULL,
        adx REAL NOT NULL,
        stoch_rsi REAL NOT NULL,
        volume_change_pct REAL NOT NULL,
        support REAL NOT NULL,
        resistance REAL NOT NULL,
        trend TEXT NOT NULL
    )
    """)

    # 4. Fundamentals
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS fundamentals (
        symbol TEXT PRIMARY KEY,
        market_cap_cr REAL NOT NULL,
        pe_ratio REAL NOT NULL,
        pb_ratio REAL NOT NULL,
        eps REAL NOT NULL,
        roe REAL NOT NULL,
        roce REAL NOT NULL,
        debt_to_equity REAL NOT NULL,
        revenue_growth_pct REAL NOT NULL,
        profit_growth_pct REAL NOT NULL,
        operating_margin_pct REAL NOT NULL,
        net_margin_pct REAL NOT NULL,
        dividend_yield_pct REAL NOT NULL,
        valuation_class TEXT NOT NULL,
        financial_health TEXT NOT NULL,
        growth_class TEXT NOT NULL
    )
    """)

    # 5. News & Sentiment
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS news (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT NOT NULL,
        headline TEXT NOT NULL,
        source TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        sentiment TEXT NOT NULL,
        score REAL NOT NULL,
        summary TEXT NOT NULL
    )
    """)

    # 6. AI Signals
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ai_signals (
        symbol TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        signal TEXT NOT NULL,
        ai_score REAL NOT NULL,
        technical_score REAL NOT NULL,
        fundamental_score REAL NOT NULL,
        momentum_score REAL NOT NULL,
        volume_score REAL NOT NULL,
        regime_score REAL NOT NULL,
        sentiment_score REAL NOT NULL,
        confidence REAL NOT NULL,
        risk_level TEXT NOT NULL,
        why_factors TEXT NOT NULL,
        risks TEXT NOT NULL
    )
    """)

    # 7. AI Predictions (Multi-horizon audit store)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ai_predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        model_version TEXT NOT NULL,
        horizon TEXT NOT NULL,
        direction TEXT NOT NULL,
        est_min_pct REAL NOT NULL,
        est_max_pct REAL NOT NULL,
        confidence REAL NOT NULL
    )
    """)

    # 8. Model Versions & Audit Logs
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS model_versions (
        version TEXT PRIMARY KEY,
        training_date TEXT NOT NULL,
        train_period TEXT NOT NULL,
        directional_accuracy REAL NOT NULL,
        precision_buy REAL NOT NULL,
        precision_sell REAL NOT NULL,
        recall REAL NOT NULL,
        f1_score REAL NOT NULL,
        test_mae REAL NOT NULL,
        test_rmse REAL NOT NULL,
        feature_importance TEXT NOT NULL,
        safeguards TEXT NOT NULL
    )
    """)

    # 9. Virtual Portfolio
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS portfolio_positions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT NOT NULL UNIQUE,
        quantity INTEGER NOT NULL,
        avg_price REAL NOT NULL,
        added_date TEXT NOT NULL
    )
    """)

    # 10. Watchlist
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS watchlist (
        symbol TEXT PRIMARY KEY,
        added_at TEXT NOT NULL
    )
    """)

    # 11. Alerts
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT NOT NULL,
        alert_type TEXT NOT NULL,
        condition TEXT NOT NULL,
        threshold REAL NOT NULL,
        is_triggered INTEGER DEFAULT 0,
        message TEXT,
        created_at TEXT NOT NULL
    )
    """)

    # 12. Settings / Weight configs
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    )
    """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
