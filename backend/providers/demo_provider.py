"""
StockSense AI - Demo Market Data Provider
Supplies rich, realistic Indian Stock Market (NSE/BSE) data for 25+ major bluechip & growth stocks,
major indices (NIFTY 50, SENSEX, BANK NIFTY, IT, AUTO, PHARMA, India VIX), multi-year daily OHLCV series,
balance sheet fundamentals, and financial news with sentiment.
All records are transparently tagged with 'data_mode': 'DEMO DATA'.
"""
import math
import random
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from .base import MarketDataProvider

# Comprehensive catalog of Indian Bluechips and Growth Stocks
DEMO_STOCKS_CATALOG = [
    {
        "symbol": "TCS",
        "name": "Tata Consultancy Services Ltd.",
        "sector": "Information Technology",
        "industry": "IT Services & Consulting",
        "market_cap_category": "Large Cap",
        "base_price": 4180.50,
        "market_cap_cr": 1512400.0,
        "pe_ratio": 29.8,
        "pb_ratio": 13.4,
        "eps": 140.20,
        "roe": 48.5,
        "roce": 59.2,
        "debt_to_equity": 0.08,
        "revenue_growth_pct": 8.4,
        "profit_growth_pct": 10.2,
        "operating_margin_pct": 25.1,
        "net_margin_pct": 19.8,
        "dividend_yield_pct": 1.45,
        "trend_bias": 0.0006, # mildly bullish drift
        "volatility": 0.014
    },
    {
        "symbol": "INFY",
        "name": "Infosys Ltd.",
        "sector": "Information Technology",
        "industry": "IT Services & Consulting",
        "market_cap_category": "Large Cap",
        "base_price": 1890.25,
        "market_cap_cr": 784500.0,
        "pe_ratio": 28.4,
        "pb_ratio": 8.6,
        "eps": 66.50,
        "roe": 31.8,
        "roce": 40.5,
        "debt_to_equity": 0.09,
        "revenue_growth_pct": 6.8,
        "profit_growth_pct": 8.1,
        "operating_margin_pct": 21.2,
        "net_margin_pct": 16.9,
        "dividend_yield_pct": 2.10,
        "trend_bias": 0.0004,
        "volatility": 0.016
    },
    {
        "symbol": "HCLTECH",
        "name": "HCL Technologies Ltd.",
        "sector": "Information Technology",
        "industry": "IT Services & Consulting",
        "market_cap_category": "Large Cap",
        "base_price": 1785.40,
        "market_cap_cr": 484200.0,
        "pe_ratio": 26.2,
        "pb_ratio": 6.8,
        "eps": 68.10,
        "roe": 26.5,
        "roce": 32.4,
        "debt_to_equity": 0.12,
        "revenue_growth_pct": 9.5,
        "profit_growth_pct": 11.4,
        "operating_margin_pct": 19.4,
        "net_margin_pct": 14.8,
        "dividend_yield_pct": 2.90,
        "trend_bias": 0.0007,
        "volatility": 0.015
    },
    {
        "symbol": "WIPRO",
        "name": "Wipro Ltd.",
        "sector": "Information Technology",
        "industry": "IT Services & Consulting",
        "market_cap_category": "Large Cap",
        "base_price": 542.10,
        "market_cap_cr": 283100.0,
        "pe_ratio": 23.5,
        "pb_ratio": 3.9,
        "eps": 23.05,
        "roe": 15.8,
        "roce": 18.2,
        "debt_to_equity": 0.22,
        "revenue_growth_pct": 2.1,
        "profit_growth_pct": 3.5,
        "operating_margin_pct": 15.6,
        "net_margin_pct": 13.1,
        "dividend_yield_pct": 0.95,
        "trend_bias": -0.0001,
        "volatility": 0.018
    },
    {
        "symbol": "RELIANCE",
        "name": "Reliance Industries Ltd.",
        "sector": "Energy & Petrochemicals",
        "industry": "Oil, Gas & Retail/Telecom",
        "market_cap_category": "Large Cap",
        "base_price": 2980.75,
        "market_cap_cr": 2018500.0,
        "pe_ratio": 27.5,
        "pb_ratio": 2.5,
        "eps": 108.40,
        "roe": 9.8,
        "roce": 11.2,
        "debt_to_equity": 0.45,
        "revenue_growth_pct": 11.2,
        "profit_growth_pct": 12.8,
        "operating_margin_pct": 16.5,
        "net_margin_pct": 8.9,
        "dividend_yield_pct": 0.35,
        "trend_bias": 0.0005,
        "volatility": 0.015
    },
    {
        "symbol": "HDFCBANK",
        "name": "HDFC Bank Ltd.",
        "sector": "Banking & Financials",
        "industry": "Private Sector Bank",
        "market_cap_category": "Large Cap",
        "base_price": 1690.60,
        "market_cap_cr": 1285000.0,
        "pe_ratio": 18.9,
        "pb_ratio": 2.8,
        "eps": 89.40,
        "roe": 16.4,
        "roce": 17.5,
        "debt_to_equity": 1.20, # Banking leverage
        "revenue_growth_pct": 18.4,
        "profit_growth_pct": 19.5,
        "operating_margin_pct": 34.2,
        "net_margin_pct": 22.1,
        "dividend_yield_pct": 1.15,
        "trend_bias": 0.0003,
        "volatility": 0.014
    },
    {
        "symbol": "ICICIBANK",
        "name": "ICICI Bank Ltd.",
        "sector": "Banking & Financials",
        "industry": "Private Sector Bank",
        "market_cap_category": "Large Cap",
        "base_price": 1245.80,
        "market_cap_cr": 875400.0,
        "pe_ratio": 17.8,
        "pb_ratio": 3.1,
        "eps": 69.80,
        "roe": 18.9,
        "roce": 19.8,
        "debt_to_equity": 1.15,
        "revenue_growth_pct": 21.5,
        "profit_growth_pct": 23.2,
        "operating_margin_pct": 36.8,
        "net_margin_pct": 24.5,
        "dividend_yield_pct": 0.85,
        "trend_bias": 0.0008,
        "volatility": 0.015
    },
    {
        "symbol": "SBIN",
        "name": "State Bank of India",
        "sector": "Banking & Financials",
        "industry": "Public Sector Bank",
        "market_cap_category": "Large Cap",
        "base_price": 825.40,
        "market_cap_cr": 736800.0,
        "pe_ratio": 10.4,
        "pb_ratio": 1.7,
        "eps": 79.30,
        "roe": 17.6,
        "roce": 18.2,
        "debt_to_equity": 1.45,
        "revenue_growth_pct": 16.5,
        "profit_growth_pct": 20.4,
        "operating_margin_pct": 31.0,
        "net_margin_pct": 18.4,
        "dividend_yield_pct": 1.65,
        "trend_bias": 0.0006,
        "volatility": 0.019
    },
    {
        "symbol": "KOTAKBANK",
        "name": "Kotak Mahindra Bank Ltd.",
        "sector": "Banking & Financials",
        "industry": "Private Sector Bank",
        "market_cap_category": "Large Cap",
        "base_price": 1810.30,
        "market_cap_cr": 360200.0,
        "pe_ratio": 21.2,
        "pb_ratio": 3.2,
        "eps": 85.40,
        "roe": 15.2,
        "roce": 16.4,
        "debt_to_equity": 1.05,
        "revenue_growth_pct": 14.8,
        "profit_growth_pct": 15.6,
        "operating_margin_pct": 33.5,
        "net_margin_pct": 21.0,
        "dividend_yield_pct": 0.60,
        "trend_bias": 0.0002,
        "volatility": 0.016
    },
    {
        "symbol": "BAJFINANCE",
        "name": "Bajaj Finance Ltd.",
        "sector": "Banking & Financials",
        "industry": "NBFC Consumer Finance",
        "market_cap_category": "Large Cap",
        "base_price": 7320.00,
        "market_cap_cr": 453100.0,
        "pe_ratio": 31.5,
        "pb_ratio": 5.8,
        "eps": 232.40,
        "roe": 22.4,
        "roce": 24.1,
        "debt_to_equity": 3.80,
        "revenue_growth_pct": 25.4,
        "profit_growth_pct": 24.8,
        "operating_margin_pct": 38.2,
        "net_margin_pct": 24.8,
        "dividend_yield_pct": 0.50,
        "trend_bias": 0.0007,
        "volatility": 0.022
    },
    {
        "symbol": "TATAMOTORS",
        "name": "Tata Motors Ltd.",
        "sector": "Automobile",
        "industry": "Commercial & Passenger Vehicles / EV",
        "market_cap_category": "Large Cap",
        "base_price": 965.80,
        "market_cap_cr": 355000.0,
        "pe_ratio": 11.2,
        "pb_ratio": 3.4,
        "eps": 86.20,
        "roe": 36.5,
        "roce": 22.4,
        "debt_to_equity": 0.65,
        "revenue_growth_pct": 23.5,
        "profit_growth_pct": 45.2,
        "operating_margin_pct": 14.2,
        "net_margin_pct": 7.3,
        "dividend_yield_pct": 0.65,
        "trend_bias": 0.0009,
        "volatility": 0.024
    },
    {
        "symbol": "MARUTI",
        "name": "Maruti Suzuki India Ltd.",
        "sector": "Automobile",
        "industry": "Passenger Cars",
        "market_cap_category": "Large Cap",
        "base_price": 12850.00,
        "market_cap_cr": 403800.0,
        "pe_ratio": 29.5,
        "pb_ratio": 4.8,
        "eps": 435.50,
        "roe": 17.8,
        "roce": 23.5,
        "debt_to_equity": 0.02,
        "revenue_growth_pct": 17.5,
        "profit_growth_pct": 28.2,
        "operating_margin_pct": 11.8,
        "net_margin_pct": 9.2,
        "dividend_yield_pct": 1.05,
        "trend_bias": 0.0005,
        "volatility": 0.016
    },
    {
        "symbol": "M&M",
        "name": "Mahindra & Mahindra Ltd.",
        "sector": "Automobile",
        "industry": "Automotive & Farm Equipment",
        "market_cap_category": "Large Cap",
        "base_price": 2840.50,
        "market_cap_cr": 353200.0,
        "pe_ratio": 28.1,
        "pb_ratio": 4.5,
        "eps": 101.10,
        "roe": 19.5,
        "roce": 21.0,
        "debt_to_equity": 0.32,
        "revenue_growth_pct": 19.8,
        "profit_growth_pct": 24.1,
        "operating_margin_pct": 15.4,
        "net_margin_pct": 8.5,
        "dividend_yield_pct": 0.75,
        "trend_bias": 0.0011,
        "volatility": 0.020
    },
    {
        "symbol": "SUNPHARMA",
        "name": "Sun Pharmaceutical Industries Ltd.",
        "sector": "Pharmaceuticals",
        "industry": "Specialty & Generic Pharma",
        "market_cap_category": "Large Cap",
        "base_price": 1820.70,
        "market_cap_cr": 436800.0,
        "pe_ratio": 38.4,
        "pb_ratio": 6.2,
        "eps": 47.40,
        "roe": 16.8,
        "roce": 19.2,
        "debt_to_equity": 0.11,
        "revenue_growth_pct": 11.5,
        "profit_growth_pct": 16.8,
        "operating_margin_pct": 27.5,
        "net_margin_pct": 20.4,
        "dividend_yield_pct": 0.70,
        "trend_bias": 0.0006,
        "volatility": 0.015
    },
    {
        "symbol": "DRREDDY",
        "name": "Dr. Reddy's Laboratories Ltd.",
        "sector": "Pharmaceuticals",
        "industry": "Pharmaceutical Formulations",
        "market_cap_category": "Large Cap",
        "base_price": 6650.00,
        "market_cap_cr": 110900.0,
        "pe_ratio": 19.8,
        "pb_ratio": 3.8,
        "eps": 335.80,
        "roe": 21.4,
        "roce": 26.8,
        "debt_to_equity": 0.14,
        "revenue_growth_pct": 12.4,
        "profit_growth_pct": 14.5,
        "operating_margin_pct": 28.1,
        "net_margin_pct": 19.9,
        "dividend_yield_pct": 0.65,
        "trend_bias": 0.0003,
        "volatility": 0.017
    },
    {
        "symbol": "CIPLA",
        "name": "Cipla Ltd.",
        "sector": "Pharmaceuticals",
        "industry": "Respiratory & General Pharma",
        "market_cap_category": "Large Cap",
        "base_price": 1580.20,
        "market_cap_cr": 127500.0,
        "pe_ratio": 26.5,
        "pb_ratio": 4.1,
        "eps": 59.60,
        "roe": 16.9,
        "roce": 21.8,
        "debt_to_equity": 0.04,
        "revenue_growth_pct": 9.8,
        "profit_growth_pct": 18.2,
        "operating_margin_pct": 24.8,
        "net_margin_pct": 16.5,
        "dividend_yield_pct": 0.85,
        "trend_bias": 0.0004,
        "volatility": 0.016
    },
    {
        "symbol": "ITC",
        "name": "ITC Ltd.",
        "sector": "FMCG",
        "industry": "Cigarettes, FMCG & Agribusiness",
        "market_cap_category": "Large Cap",
        "base_price": 505.40,
        "market_cap_cr": 631200.0,
        "pe_ratio": 28.5,
        "pb_ratio": 8.9,
        "eps": 17.70,
        "roe": 29.5,
        "roce": 39.4,
        "debt_to_equity": 0.01,
        "revenue_growth_pct": 7.2,
        "profit_growth_pct": 8.6,
        "operating_margin_pct": 37.5,
        "net_margin_pct": 27.9,
        "dividend_yield_pct": 2.85,
        "trend_bias": 0.0003,
        "volatility": 0.012
    },
    {
        "symbol": "HINDUNILVR",
        "name": "Hindustan Unilever Ltd.",
        "sector": "FMCG",
        "industry": "Personal Care & Home Products",
        "market_cap_category": "Large Cap",
        "base_price": 2720.00,
        "market_cap_cr": 639100.0,
        "pe_ratio": 59.8,
        "pb_ratio": 12.4,
        "eps": 45.50,
        "roe": 20.8,
        "roce": 27.5,
        "debt_to_equity": 0.02,
        "revenue_growth_pct": 4.5,
        "profit_growth_pct": 4.8,
        "operating_margin_pct": 23.4,
        "net_margin_pct": 16.8,
        "dividend_yield_pct": 1.55,
        "trend_bias": 0.0001,
        "volatility": 0.013
    },
    {
        "symbol": "TITAN",
        "name": "Titan Company Ltd.",
        "sector": "Consumer Discretionary",
        "industry": "Jewellery, Watches & Eyewear",
        "market_cap_category": "Large Cap",
        "base_price": 3680.00,
        "market_cap_cr": 326700.0,
        "pe_ratio": 88.5,
        "pb_ratio": 23.8,
        "eps": 41.50,
        "roe": 30.5,
        "roce": 35.8,
        "debt_to_equity": 0.68,
        "revenue_growth_pct": 21.4,
        "profit_growth_pct": 14.8,
        "operating_margin_pct": 10.8,
        "net_margin_pct": 7.2,
        "dividend_yield_pct": 0.30,
        "trend_bias": 0.0006,
        "volatility": 0.019
    },
    {
        "symbol": "LT",
        "name": "Larsen & Toubro Ltd.",
        "sector": "Capital Goods & Infrastructure",
        "industry": "Engineering & Construction",
        "market_cap_category": "Large Cap",
        "base_price": 3640.20,
        "market_cap_cr": 500500.0,
        "pe_ratio": 36.8,
        "pb_ratio": 5.4,
        "eps": 98.90,
        "roe": 15.6,
        "roce": 17.8,
        "debt_to_equity": 1.15,
        "revenue_growth_pct": 19.8,
        "profit_growth_pct": 18.2,
        "operating_margin_pct": 11.5,
        "net_margin_pct": 6.8,
        "dividend_yield_pct": 0.85,
        "trend_bias": 0.0007,
        "volatility": 0.018
    },
    {
        "symbol": "TATASTEEL",
        "name": "Tata Steel Ltd.",
        "sector": "Metals & Mining",
        "industry": "Iron & Steel Production",
        "market_cap_category": "Large Cap",
        "base_price": 162.40,
        "market_cap_cr": 202800.0,
        "pe_ratio": 42.5,
        "pb_ratio": 2.2,
        "eps": 3.82,
        "roe": 5.8,
        "roce": 8.4,
        "debt_to_equity": 0.88,
        "revenue_growth_pct": -2.5,
        "profit_growth_pct": -8.5,
        "operating_margin_pct": 10.2,
        "net_margin_pct": 2.4,
        "dividend_yield_pct": 2.20,
        "trend_bias": -0.0003,
        "volatility": 0.026
    },
    {
        "symbol": "BHARTIARTL",
        "name": "Bharti Airtel Ltd.",
        "sector": "Telecommunications",
        "industry": "Telecom Services & Data Centers",
        "market_cap_category": "Large Cap",
        "base_price": 1640.50,
        "market_cap_cr": 978400.0,
        "pe_ratio": 64.2,
        "pb_ratio": 9.5,
        "eps": 25.50,
        "roe": 17.5,
        "roce": 16.4,
        "debt_to_equity": 1.75,
        "revenue_growth_pct": 13.8,
        "profit_growth_pct": 26.5,
        "operating_margin_pct": 52.8,
        "net_margin_pct": 9.8,
        "dividend_yield_pct": 0.55,
        "trend_bias": 0.0010,
        "volatility": 0.017
    },
    {
        "symbol": "ZOMATO",
        "name": "Zomato Ltd. (Eternal)",
        "sector": "Consumer Internet",
        "industry": "Food Delivery & Quick Commerce",
        "market_cap_category": "Large Cap",
        "base_price": 278.40,
        "market_cap_cr": 245600.0,
        "pe_ratio": 115.0,
        "pb_ratio": 11.2,
        "eps": 2.42,
        "roe": 7.8,
        "roce": 9.1,
        "debt_to_equity": 0.05,
        "revenue_growth_pct": 68.5,
        "profit_growth_pct": 140.0,
        "operating_margin_pct": 7.4,
        "net_margin_pct": 4.8,
        "dividend_yield_pct": 0.0,
        "trend_bias": 0.0014,
        "volatility": 0.032
    },
    {
        "symbol": "TRENT",
        "name": "Trent Ltd.",
        "sector": "Retail & Apparel",
        "industry": "Fast Fashion & Supermarket",
        "market_cap_category": "Large Cap",
        "base_price": 7450.00,
        "market_cap_cr": 264800.0,
        "pe_ratio": 145.0,
        "pb_ratio": 42.0,
        "eps": 51.40,
        "roe": 32.5,
        "roce": 36.8,
        "debt_to_equity": 0.28,
        "revenue_growth_pct": 52.0,
        "profit_growth_pct": 78.4,
        "operating_margin_pct": 15.6,
        "net_margin_pct": 9.8,
        "dividend_yield_pct": 0.05,
        "trend_bias": 0.0016,
        "volatility": 0.028
    },
    {
        "symbol": "POLYCAB",
        "name": "Polycab India Ltd.",
        "sector": "Capital Goods & Cables",
        "industry": "Wires, Cables & Fast Moving Electrical",
        "market_cap_category": "Mid Cap",
        "base_price": 6890.00,
        "market_cap_cr": 103500.0,
        "pe_ratio": 54.0,
        "pb_ratio": 12.8,
        "eps": 127.50,
        "roe": 26.2,
        "roce": 34.5,
        "debt_to_equity": 0.04,
        "revenue_growth_pct": 28.4,
        "profit_growth_pct": 32.0,
        "operating_margin_pct": 13.8,
        "net_margin_pct": 9.6,
        "dividend_yield_pct": 0.40,
        "trend_bias": 0.0008,
        "volatility": 0.022
    }
]

# Market Indices catalog
DEMO_INDICES = [
    {
        "symbol": "NIFTY 50",
        "name": "Nifty 50 Index",
        "current_value": 25840.60,
        "change_amount": 164.20,
        "change_pct": 0.64,
        "trend": "Bullish",
        "sparkline": [25620, 25680, 25640, 25710, 25790, 25760, 25840.60]
    },
    {
        "symbol": "SENSEX",
        "name": "BSE Sensex 30",
        "current_value": 84520.40,
        "change_amount": 512.80,
        "change_pct": 0.61,
        "trend": "Bullish",
        "sparkline": [83890, 84050, 83950, 84200, 84380, 84320, 84520.40]
    },
    {
        "symbol": "NIFTY BANK",
        "name": "Nifty Bank Index",
        "current_value": 53910.15,
        "change_amount": 425.30,
        "change_pct": 0.79,
        "trend": "Bullish",
        "sparkline": [53200, 53380, 53450, 53620, 53710, 53820, 53910.15]
    },
    {
        "symbol": "NIFTY IT",
        "name": "Nifty IT Sector Index",
        "current_value": 42180.70,
        "change_amount": 340.50,
        "change_pct": 0.81,
        "trend": "Bullish",
        "sparkline": [41600, 41750, 41820, 41900, 42050, 42110, 42180.70]
    },
    {
        "symbol": "NIFTY AUTO",
        "name": "Nifty Auto Sector Index",
        "current_value": 26450.90,
        "change_amount": 215.10,
        "change_pct": 0.82,
        "trend": "Bullish",
        "sparkline": [25980, 26100, 26180, 26290, 26340, 26390, 26450.90]
    },
    {
        "symbol": "NIFTY PHARMA",
        "name": "Nifty Pharma Index",
        "current_value": 22780.20,
        "change_amount": 85.40,
        "change_pct": 0.38,
        "trend": "Neutral",
        "sparkline": [22650, 22690, 22680, 22720, 22740, 22760, 22780.20]
    },
    {
        "symbol": "INDIA VIX",
        "name": "India Volatility Index",
        "current_value": 12.85,
        "change_amount": -0.42,
        "change_pct": -3.16,
        "trend": "Bearish", # VIX falling is positive for equities
        "sparkline": [13.8, 13.5, 13.6, 13.2, 13.1, 13.0, 12.85]
    }
]

class DemoMarketDataProvider(MarketDataProvider):
    """
    Supplies realistic Indian equity datasets for research, education, and decision support.
    Uses seeded deterministic pseudo-random walks so historical tests and demonstrations
    are consistent, realistic, and reproducible.
    """
    def __init__(self):
        self._stocks = {s["symbol"]: s for s in DEMO_STOCKS_CATALOG}
        self._indices = {i["symbol"]: i for i in DEMO_INDICES}
        self._cache_history: Dict[str, List[Dict[str, Any]]] = {}

    def get_all_symbols(self) -> List[Dict[str, Any]]:
        symbols_list = []
        for symbol, info in self._stocks.items():
            symbols_list.append({
                "symbol": symbol,
                "name": info["name"],
                "sector": info["sector"],
                "industry": info["industry"],
                "market_cap_category": info["market_cap_category"],
                "data_mode": "DEMO DATA"
            })
        return symbols_list

    def get_indices(self) -> List[Dict[str, Any]]:
        return list(self._indices.values())

    def get_quote(self, symbol: str) -> Optional[Dict[str, Any]]:
        if symbol not in self._stocks:
            return None
        info = self._stocks[symbol]
        history = self.get_historical_data(symbol, "1M")
        latest = history[-1]
        prev = history[-2] if len(history) > 1 else latest
        change_amount = round(latest["close"] - prev["close"], 2)
        change_pct = round((change_amount / prev["close"]) * 100, 2)
        
        # Calculate 52w range from 1Y history
        hist_1y = self.get_historical_data(symbol, "1Y")
        highs = [b["high"] for b in hist_1y]
        lows = [b["low"] for b in hist_1y]
        w52_high = max(highs) if highs else round(latest["close"] * 1.25, 2)
        w52_low = min(lows) if lows else round(latest["close"] * 0.75, 2)

        return {
            "symbol": symbol,
            "name": info["name"],
            "sector": info["sector"],
            "industry": info["industry"],
            "market_cap_category": info["market_cap_category"],
            "current_price": round(latest["close"], 2),
            "open": round(latest["open"], 2),
            "high": round(latest["high"], 2),
            "low": round(latest["low"], 2),
            "close": round(latest["close"], 2),
            "prev_close": round(prev["close"], 2),
            "change_amount": change_amount,
            "change_pct": change_pct,
            "volume": latest["volume"],
            "avg_volume": int(sum(b["volume"] for b in history[-20:]) / max(1, len(history[-20:]))),
            "week_52_high": round(w52_high, 2),
            "week_52_low": round(w52_low, 2),
            "data_freshness": "DEMO DATA - 2026-09-29 09:30 IST",
            "data_mode": "DEMO DATA"
        }

    def get_historical_data(self, symbol: str, timeframe: str = "1Y") -> List[Dict[str, Any]]:
        if symbol in self._cache_history:
            full_series = self._cache_history[symbol]
        else:
            full_series = self._generate_synthetic_history(symbol)
            self._cache_history[symbol] = full_series

        # Slice based on timeframe: 1D (intraday 30m), 1W, 1M, 3M, 6M, 1Y, 5Y
        now_bars = len(full_series)
        tf_map = {
            "1D": 15,
            "1W": 7,
            "1M": 30,
            "3M": 90,
            "6M": 180,
            "1Y": 365,
            "5Y": min(1825, now_bars)
        }
        bar_count = tf_map.get(timeframe.upper(), 365)
        return full_series[-bar_count:]

    def _generate_synthetic_history(self, symbol: str) -> List[Dict[str, Any]]:
        stock = self._stocks.get(symbol, {
            "base_price": 1000.0,
            "trend_bias": 0.0005,
            "volatility": 0.015
        })
        base_price = stock["base_price"]
        trend_bias = stock["trend_bias"]
        volatility = stock["volatility"]

        # Deterministic seed based on symbol so chart patterns are consistent across sessions
        seed_val = sum(ord(c) for c in symbol) * 42
        rng = random.Random(seed_val)

        total_days = 1500 # ~5.5 years of daily trading bars
        end_date = datetime(2026, 9, 29)
        
        # We simulate prices backwards or forward: let's start at (end_date - timedelta(days=total_days))
        start_date = end_date - timedelta(days=int(total_days * 1.45))
        
        bars = []
        cur_price = base_price * (0.55 if trend_bias > 0 else 1.25)
        cur_date = start_date
        
        day_idx = 0
        while len(bars) < total_days:
            # Skip Saturday and Sunday for realistic stock exchange calendar
            if cur_date.weekday() < 5:
                # Geometric Brownian Motion with macro cycle sine wave
                cycle = math.sin(day_idx / 90.0) * 0.002
                shock = rng.gauss(0, 1) * volatility
                daily_ret = trend_bias + cycle + shock
                
                open_price = cur_price * (1 + rng.gauss(0, volatility * 0.2))
                close_price = cur_price * (1 + daily_ret)
                high_price = max(open_price, close_price) * (1 + abs(rng.gauss(0, volatility * 0.5)))
                low_price = min(open_price, close_price) * (1 - abs(rng.gauss(0, volatility * 0.5)))
                
                # Volume simulation: higher on large price swings
                vol_base = 1200000 if stock.get("market_cap_category") == "Large Cap" else 450000
                vol_multiplier = 1.0 + abs(daily_ret) * 15 + rng.random() * 0.8
                volume = int(vol_base * vol_multiplier)

                bars.append({
                    "date": cur_date.strftime("%Y-%m-%d"),
                    "open": round(open_price, 2),
                    "high": round(high_price, 2),
                    "low": round(low_price, 2),
                    "close": round(close_price, 2),
                    "volume": volume
                })
                cur_price = close_price
                day_idx += 1
            cur_date += timedelta(days=1)

        # Scale final bar closely to base_price for realism
        ratio = base_price / bars[-1]["close"]
        for b in bars:
            b["open"] = round(b["open"] * ratio, 2)
            b["high"] = round(b["high"] * ratio, 2)
            b["low"] = round(b["low"] * ratio, 2)
            b["close"] = round(b["close"] * ratio, 2)

        return bars

    def get_fundamentals(self, symbol: str) -> Optional[Dict[str, Any]]:
        if symbol not in self._stocks:
            return None
        info = self._stocks[symbol]
        
        # Classification heuristics
        pe = info["pe_ratio"]
        debt = info["debt_to_equity"]
        roe = info["roe"]
        rev_growth = info["revenue_growth_pct"]

        if pe < 20:
            val_class = "Undervalued"
        elif pe > 45:
            val_class = "Expensive"
        else:
            val_class = "Fairly Valued"

        if debt < 0.5 and roe > 20:
            fin_health = "Strong"
        elif debt > 1.3:
            fin_health = "Weak"
        else:
            fin_health = "Average"

        if rev_growth > 18:
            growth_class = "High"
        elif rev_growth > 8:
            growth_class = "Moderate"
        else:
            growth_class = "Low"

        return {
            "symbol": symbol,
            "market_cap_cr": info["market_cap_cr"],
            "pe_ratio": info["pe_ratio"],
            "pb_ratio": info["pb_ratio"],
            "eps": info["eps"],
            "roe": info["roe"],
            "roce": info["roce"],
            "debt_to_equity": info["debt_to_equity"],
            "revenue_growth_pct": info["revenue_growth_pct"],
            "profit_growth_pct": info["profit_growth_pct"],
            "operating_margin_pct": info["operating_margin_pct"],
            "net_margin_pct": info["net_margin_pct"],
            "dividend_yield_pct": info["dividend_yield_pct"],
            "valuation_class": val_class,
            "financial_health": fin_health,
            "growth_class": growth_class,
            "data_freshness": "DEMO DATA - FY25 Annualized",
            "data_mode": "DEMO DATA"
        }

    def get_market_breadth(self) -> Dict[str, Any]:
        advancing = 34
        declining = 14
        unchanged = 2
        ratio = round(advancing / max(1, declining), 2)
        
        return {
            "advancing": advancing,
            "declining": declining,
            "unchanged": unchanged,
            "ad_ratio": ratio,
            "sentiment_score": 68.5,
            "sentiment_category": "BULLISH", # VERY BEARISH, BEARISH, NEUTRAL, BULLISH, VERY BULLISH
            "timestamp": "2026-09-29 09:30 IST",
            "data_mode": "DEMO DATA"
        }

    def get_market_regime(self) -> Dict[str, Any]:
        return {
            "regime": "Bullish", # Strong Bullish, Bullish, Sideways, Bearish, Strong Bearish
            "regime_score": 76.0,
            "reasons": [
                "NIFTY 50 trading comfortably above both 50-day and 200-day moving averages",
                "Market breadth positive with Advance/Decline ratio at 2.43",
                "India VIX at 12.85 reflecting subdued macro volatility and institutional calm",
                "Sustained domestic institutional inflows (DII) providing liquidity cushion",
                "Momentum indicators across heavyweight banking and auto indices remain positive"
            ],
            "data_mode": "DEMO DATA",
            "updated_at": "2026-09-29 09:30 IST"
        }

    def get_news(self, symbol: Optional[str] = None) -> List[Dict[str, Any]]:
        news_pool = [
            {
                "symbol": "TCS",
                "headline": "TCS secures multi-year $1.2B digital transformation deal with European retail giant",
                "source": "Financial Express",
                "timestamp": "2026-09-29 08:15 IST",
                "sentiment": "Positive",
                "score": 85.0,
                "summary": "Tata Consultancy Services announced a major enterprise cloud modernization mandate, reinforcing its international IT services deal pipeline."
            },
            {
                "symbol": "TCS",
                "headline": "Analysts project 11% EBIT margin resilience for TCS in upcoming Q2 earnings",
                "source": "Economic Times",
                "timestamp": "2026-09-28 14:30 IST",
                "sentiment": "Positive",
                "score": 72.0,
                "summary": "Brokerages maintain an accumulate stance citing healthy employee utilization and strategic investments in generative AI."
            },
            {
                "symbol": "INFY",
                "headline": "Infosys expands Topaz AI capabilities across global banking clients",
                "source": "Mint",
                "timestamp": "2026-09-29 07:45 IST",
                "sentiment": "Positive",
                "score": 80.0,
                "summary": "Infosys is scaling enterprise generative AI solutions for automated underwriting and compliance in tier-1 financial institutions."
            },
            {
                "symbol": "RELIANCE",
                "headline": "Reliance Retail commences rollout of 200 new automated fulfillment centers",
                "source": "Business Standard",
                "timestamp": "2026-09-28 16:20 IST",
                "sentiment": "Positive",
                "score": 78.0,
                "summary": "The logistics expansion is expected to cut delivery turnaround times by 35% across high-density metro corridors."
            },
            {
                "symbol": "HDFCBANK",
                "headline": "HDFC Bank reports steady deposit accretion in monthly operational update",
                "source": "CNBC-TV18",
                "timestamp": "2026-09-29 09:00 IST",
                "sentiment": "Positive",
                "score": 74.0,
                "summary": "Lender's post-merger CD ratio continues its downward trend toward regulatory equilibrium targets."
            },
            {
                "symbol": "TATAMOTORS",
                "headline": "Tata Motors EV division achieves milestone of 150,000 cumulative electric sales",
                "source": "Autocar India",
                "timestamp": "2026-09-27 11:10 IST",
                "sentiment": "Positive",
                "score": 90.0,
                "summary": "Record EV adoption driven by Curvv EV and Nexon EV updates cements company's 68% market share in passenger EVs."
            },
            {
                "symbol": "TATASTEEL",
                "headline": "Tata Steel initiates phased transition of Port Talbot blast furnace to electric arc furnace",
                "source": "Reuters",
                "timestamp": "2026-09-28 10:45 IST",
                "sentiment": "Neutral",
                "score": 50.0,
                "summary": "Decarbonization capital expenditures may pressure near-term European operating margins during the infrastructure replacement phase."
            },
            {
                "symbol": "WIPRO",
                "headline": "Wipro completes senior leadership restructuring to streamline client consulting",
                "source": "Livemint",
                "timestamp": "2026-09-27 15:30 IST",
                "sentiment": "Neutral",
                "score": 52.0,
                "summary": "CEO outlines renewed focus on high-margin cloud migrations and strategic partnerships."
            }
        ]

        if symbol:
            matched = [n for n in news_pool if n["symbol"] == symbol.upper()]
            if matched:
                return matched
            # Fallback generic news for requested symbol
            return [{
                "symbol": symbol.upper(),
                "headline": f"{symbol.upper()} quarterly business update shows steady operating performance",
                "source": "Market Wire",
                "timestamp": "2026-09-28 12:00 IST",
                "sentiment": "Positive",
                "score": 65.0,
                "summary": f"{symbol.upper()} maintains strong business fundamentals and disciplined capital deployment in line with peer group expectations."
            }]
        return news_pool

    def get_company_profile(self, symbol: str) -> Optional[Dict[str, Any]]:
        if symbol not in self._stocks:
            return None
        info = self._stocks[symbol]
        return {
            "symbol": symbol,
            "name": info["name"],
            "sector": info["sector"],
            "industry": info["industry"],
            "market_cap_category": info["market_cap_category"],
            "description": f"{info['name']} is a leading constituent of the NIFTY index, operating in {info['sector']} with a focus on {info['industry']}. It is recognized for robust capital allocation, operational efficiency, and institutional interest."
        }
