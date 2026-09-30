"""
StockSense AI - Scoring & Decision-Support Signal Engine
Combines Technical, Fundamental, Momentum, Volume, Market Regime, and Sentiment
components into a composite 0-100 AI Score and generates explainable BUY/HOLD/SELL signals.
Configurable weights and thresholds.
"""
from typing import Dict, List, Any, Tuple

DEFAULT_WEIGHTS = {
    "technical": 0.30,
    "fundamental": 0.25,
    "momentum": 0.15,
    "volume": 0.10,
    "regime": 0.10,
    "sentiment": 0.10
}

DEFAULT_THRESHOLDS = {
    "strong_buy": 80.0,
    "buy": 65.0,
    "hold": 45.0,
    "sell": 30.0,
    "strong_sell": 0.0
}

class ScoringEngine:
    def __init__(self, weights: Dict[str, float] = None, thresholds: Dict[str, float] = None):
        self.weights = weights or dict(DEFAULT_WEIGHTS)
        self.thresholds = thresholds or dict(DEFAULT_THRESHOLDS)

    def calculate_technical_score(self, tech: Dict[str, Any]) -> float:
        score = 50.0 # base neutral
        cur_price = tech.get("current_price", 100.0)
        sma_50 = tech.get("sma_50", cur_price)
        sma_200 = tech.get("sma_200", cur_price)
        rsi = tech.get("rsi", 50.0)
        macd_hist = tech.get("macd_hist", 0.0)
        adx = tech.get("adx", 20.0)
        plus_di = tech.get("plus_di", 20.0)
        minus_di = tech.get("minus_di", 20.0)

        # DMA positioning (+20 max)
        if cur_price > sma_50 and sma_50 > sma_200:
            score += 20.0
        elif cur_price > sma_50:
            score += 10.0
        elif cur_price < sma_50 and cur_price < sma_200:
            score -= 18.0

        # MACD alignment (+15 max)
        if macd_hist > 0:
            score += 12.0
        else:
            score -= 10.0

        # RSI sweet-spot (+10 max)
        if 48 <= rsi <= 65:
            score += 10.0
        elif rsi > 75:
            score -= 8.0 # overbought deduction
        elif rsi < 30:
            score += 4.0 # potential oversold reversal setup

        # ADX trend confirmation (+8 max)
        if adx > 25 and plus_di > minus_di:
            score += 8.0
        elif adx > 25 and minus_di > plus_di:
            score -= 8.0

        return max(0.0, min(100.0, round(score, 1)))

    def calculate_momentum_score(self, tech: Dict[str, Any]) -> float:
        mom_5d = tech.get("momentum_5d_pct", 0.0)
        mom_20d = tech.get("momentum_20d_pct", 0.0)
        score = 50.0 + (mom_20d * 2.0) + (mom_5d * 1.5)
        return max(0.0, min(100.0, round(score, 1)))

    def calculate_volume_score(self, tech: Dict[str, Any]) -> float:
        vol_change = tech.get("volume_change_pct", 0.0)
        cur_price = tech.get("current_price", 100.0)
        sma_50 = tech.get("sma_50", cur_price)

        score = 50.0
        # Volume expansion in direction of trend
        if vol_change > 20 and cur_price >= sma_50:
            score += 30.0
        elif vol_change > 10:
            score += 15.0
        elif vol_change < -20:
            score -= 15.0
        return max(0.0, min(100.0, round(score, 1)))

    def compute_composite_signal(
        self,
        symbol: str,
        tech: Dict[str, Any],
        fund: Dict[str, Any],
        sentiment_data: Dict[str, Any],
        regime_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        # Component scores (all 0 - 100)
        tech_score = self.calculate_technical_score(tech)
        fund_score = fund.get("fundamental_score", 60.0)
        mom_score = self.calculate_momentum_score(tech)
        vol_score = self.calculate_volume_score(tech)
        regime_score = regime_data.get("regime_score", 65.0)

        # Sentiment is -100 to +100 -> map to 0-100
        sent_raw = sentiment_data.get("sentiment_score", 10.0)
        sent_score = round(max(0.0, min(100.0, (sent_raw + 100.0) / 2.0)), 1)

        # Weighted combination
        ai_score = (
            (tech_score * self.weights["technical"]) +
            (fund_score * self.weights["fundamental"]) +
            (mom_score * self.weights["momentum"]) +
            (vol_score * self.weights["volume"]) +
            (regime_score * self.weights["regime"]) +
            (sent_score * self.weights["sentiment"])
        )
        ai_score = round(ai_score, 1)

        # Classification based on thresholds
        if ai_score >= self.thresholds["strong_buy"]:
            signal = "STRONG BUY"
        elif ai_score >= self.thresholds["buy"]:
            signal = "BUY"
        elif ai_score >= self.thresholds["hold"]:
            signal = "HOLD"
        elif ai_score >= self.thresholds["sell"]:
            signal = "SELL"
        else:
            signal = "STRONG SELL"

        # Model Confidence (measures consistency between sub-components)
        components = [tech_score, fund_score, mom_score, vol_score, regime_score, sent_score]
        mean_c = sum(components) / len(components)
        var_c = sum((c - mean_c) ** 2 for c in components) / len(components)
        std_c = var_c ** 0.5
        # Lower variance among indicators = higher agreement = higher model confidence
        raw_conf = max(45.0, min(92.0, 92.0 - (std_c * 1.5)))
        model_confidence = round(raw_conf, 1)

        # Explainable AI factors: Why? & Risks
        why_factors = []
        risks = []
        cur_price = tech.get("current_price", 100.0)
        sma_50 = tech.get("sma_50", cur_price)
        sma_200 = tech.get("sma_200", cur_price)
        rsi = tech.get("rsi", 50.0)
        roe = fund.get("roe", 15.0)
        debt = fund.get("debt_to_equity", 0.5)
        rev_g = fund.get("revenue_growth_pct", 10.0)
        pe = fund.get("pe_ratio", 25.0)

        # Why positive
        if cur_price > sma_50:
            why_factors.append(f"Price trading above 50-day moving average (₹{sma_50})")
        if cur_price > sma_200:
            why_factors.append("Sustained long-term trend intact above 200 DMA")
        if tech.get("macd_hist", 0) > 0:
            why_factors.append("Positive MACD momentum histogram expanding")
        if roe >= 18:
            why_factors.append(f"Superior capital efficiency with ROE of {roe}%")
        if debt < 0.4:
            why_factors.append(f"Conservative debt-to-equity ratio of {debt}x")
        if rev_g >= 12:
            why_factors.append(f"Robust top-line revenue expansion (+{rev_g}% YoY)")
        if sent_raw > 25:
            why_factors.append("Constructive institutional and financial news sentiment")
        if tech.get("volume_change_pct", 0) > 15:
            why_factors.append("Volume surge validates price action accumulation")

        # Fallback if few
        if not why_factors:
            why_factors.append("Neutral consolidation with balanced technical levels")

        # Risks / Negatives
        if rsi >= 68:
            risks.append(f"RSI at {rsi} is approaching overbought conditions; susceptible to brief pullbacks")
        if pe > 40:
            risks.append(f"Valuation is relatively elevated at {pe}x P/E ratio")
        if cur_price < sma_50:
            risks.append(f"Stock trading below 50-day moving average (₹{sma_50})")
        if cur_price < sma_200:
            risks.append("Major breakdown: Price is below long-term 200 DMA anchor")
        if debt > 1.2:
            risks.append(f"Higher balance sheet leverage (Debt/Equity: {debt}x)")
        if rev_g < 5:
            risks.append(f"Subdued revenue growth velocity (+{rev_g}% YoY)")
        if sent_raw < -20:
            risks.append("Recent news sentiment tilted negative")

        if not risks:
            risks.append("General macroeconomic market volatility and sector rotation risk")

        # Overall Risk Level classification
        risk_points = len(risks)
        if rsi >= 75 or cur_price < sma_200 or debt > 2.0:
            risk_points += 2

        if risk_points <= 1:
            risk_level = "LOW RISK"
        elif risk_points <= 3:
            risk_level = "MODERATE RISK"
        elif risk_points <= 4:
            risk_level = "HIGH RISK"
        else:
            risk_level = "EXTREME RISK"

        return {
            "symbol": symbol,
            "signal": signal,
            "ai_score": ai_score,
            "technical_score": tech_score,
            "fundamental_score": fund_score,
            "momentum_score": mom_score,
            "volume_score": vol_score,
            "regime_score": regime_score,
            "sentiment_score": sent_score,
            "confidence": model_confidence,
            "risk_level": risk_level,
            "why_factors": why_factors[:5],
            "risks": risks[:4],
            "weights_used": self.weights,
            "timestamp": "2026-09-29 09:30 IST",
            "disclaimer": "Model confidence is an indicator of sub-system agreement, not a guarantee of future return."
        }
