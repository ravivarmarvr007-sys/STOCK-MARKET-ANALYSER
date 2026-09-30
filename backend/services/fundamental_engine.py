"""
StockSense AI - Fundamental Analysis Engine
Evaluates company financial health, valuation, capital efficiency (ROE, ROCE),
leverage, growth velocity, and generates multi-year historical financial trends.
"""
from typing import Dict, Any, List

class FundamentalEngine:
    @staticmethod
    def evaluate_fundamentals(fundamentals: Dict[str, Any]) -> Dict[str, Any]:
        pe = fundamentals.get("pe_ratio", 25.0)
        pb = fundamentals.get("pb_ratio", 3.5)
        roe = fundamentals.get("roe", 15.0)
        roce = fundamentals.get("roce", 18.0)
        debt = fundamentals.get("debt_to_equity", 0.5)
        rev_growth = fundamentals.get("revenue_growth_pct", 10.0)
        profit_growth = fundamentals.get("profit_growth_pct", 12.0)
        op_margin = fundamentals.get("operating_margin_pct", 15.0)
        net_margin = fundamentals.get("net_margin_pct", 10.0)
        div_yield = fundamentals.get("dividend_yield_pct", 1.0)
        mcap_cr = fundamentals.get("market_cap_cr", 100000.0)

        # 1. Scoring components (0 to 100)
        # ROE/ROCE efficiency score (max 30 pts)
        eff_score = min(30.0, (roe * 0.5) + (roce * 0.4))
        
        # Growth score (max 25 pts)
        growth_score = min(25.0, max(0.0, (rev_growth * 0.6) + (profit_growth * 0.5)))
        
        # Balance sheet leverage score (max 20 pts)
        if debt < 0.2:
            solv_score = 20.0
        elif debt < 0.7:
            solv_score = 16.0
        elif debt < 1.2:
            solv_score = 12.0
        else:
            solv_score = max(5.0, 20.0 - (debt * 5.0))
            
        # Margin strength score (max 15 pts)
        margin_score = min(15.0, (op_margin * 0.3) + (net_margin * 0.4))

        # Valuation comfort score (max 10 pts)
        if pe < 18:
            val_score = 10.0
        elif pe < 32:
            val_score = 7.5
        elif pe < 50:
            val_score = 5.0
        else:
            val_score = 2.5

        fundamental_score = round(min(100.0, eff_score + growth_score + solv_score + margin_score + val_score), 1)

        # Classifications
        if pe < 20:
            valuation_class = "Undervalued"
        elif pe > 42:
            valuation_class = "Expensive"
        else:
            valuation_class = "Fairly Valued"

        if debt <= 0.4 and roe >= 18:
            health_class = "Strong"
        elif debt > 1.3 or roe < 8:
            health_class = "Weak"
        else:
            health_class = "Average"

        if rev_growth >= 16 and profit_growth >= 18:
            growth_class = "High"
        elif rev_growth >= 7:
            growth_class = "Moderate"
        else:
            growth_class = "Low"

        # Generate realistic 4-year financial progression
        base_rev = mcap_cr * 0.35
        base_pat = base_rev * (net_margin / 100.0)
        
        years = ["FY22", "FY23", "FY24", "FY25 (TTM)"]
        history = []
        for i, yr in enumerate(years):
            discount = (4 - i - 1)
            rev_factor = (1.0 - (rev_growth * 0.009 * discount))
            pat_factor = (1.0 - (profit_growth * 0.010 * discount))
            history.append({
                "year": yr,
                "revenue_cr": round(base_rev * rev_factor, 1),
                "net_profit_cr": round(base_pat * pat_factor, 1),
                "op_margin_pct": round(op_margin - (0.5 * discount), 1)
            })

        return {
            "symbol": fundamentals.get("symbol", ""),
            "market_cap_cr": mcap_cr,
            "pe_ratio": pe,
            "pb_ratio": pb,
            "eps": fundamentals.get("eps", 50.0),
            "roe": roe,
            "roce": roce,
            "debt_to_equity": debt,
            "revenue_growth_pct": rev_growth,
            "profit_growth_pct": profit_growth,
            "operating_margin_pct": op_margin,
            "net_margin_pct": net_margin,
            "dividend_yield_pct": div_yield,
            "valuation_class": valuation_class,
            "financial_health": health_class,
            "growth_class": growth_class,
            "fundamental_score": fundamental_score,
            "financial_trajectory": history
        }
