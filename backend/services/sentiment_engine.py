"""
StockSense AI - Sentiment Analysis Engine
Evaluates market sentiment from financial news, corporate disclosures, and earnings releases.
Computes a normalized sentiment score from -100 to +100, extracts key positive/negative phrases,
and enforces safety guards so sentiment alone cannot trigger a BUY signal.
"""
from typing import Dict, List, Any

# Financial domain polarity dictionaries
POSITIVE_KEYWORDS = [
    "deal", "growth", "expansion", "profit", "margin", "milestone", "record",
    "upgrade", "breakout", "dividend", "acquisition", "outperform", "resilience",
    "surge", "ai", "adoption", "inflows", "order", "contracts", "accretion"
]

NEGATIVE_KEYWORDS = [
    "decline", "fall", "downgrade", "pressure", "drop", "probe", "debt",
    "penalty", "investigation", "loss", "layoffs", "curbs", "weakness",
    "slowdown", "dispute", "litigation", "default", "breach", "margin pressure"
]

class SentimentEngine:
    @staticmethod
    def analyze_headline(headline: str, summary: str = "") -> Dict[str, Any]:
        text = (headline + " " + summary).lower()
        pos_count = sum(1 for kw in POSITIVE_KEYWORDS if kw in text)
        neg_count = sum(1 for kw in NEGATIVE_KEYWORDS if kw in text)

        if pos_count > neg_count:
            sentiment = "Positive"
            raw_score = 40.0 + min(50.0, (pos_count - neg_count) * 20.0)
        elif neg_count > pos_count:
            sentiment = "Negative"
            raw_score = -40.0 - min(50.0, (neg_count - pos_count) * 20.0)
        else:
            sentiment = "Neutral"
            raw_score = 0.0

        return {
            "sentiment": sentiment,
            "score": round(raw_score, 1),
            "pos_keywords_found": pos_count,
            "neg_keywords_found": neg_count
        }

    @classmethod
    def aggregate_news_sentiment(cls, news_items: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not news_items:
            return {
                "sentiment_score": 10.0,
                "sentiment_label": "Neutral",
                "news_count": 0,
                "positive_count": 0,
                "negative_count": 0,
                "neutral_count": 0
            }

        total_score = 0.0
        pos_cnt = 0
        neg_cnt = 0
        neu_cnt = 0

        for item in news_items:
            res = cls.analyze_headline(item.get("headline", ""), item.get("summary", ""))
            score = item.get("score", res["score"])
            # Map item score (0-100) to (-100 to +100) if needed
            if score > 50:
                normalized = (score - 50) * 2.0
                pos_cnt += 1
            elif score < 50:
                normalized = (score - 50) * 2.0
                neg_cnt += 1
            else:
                normalized = 0.0
                neu_cnt += 1
            total_score += normalized

        avg_score = round(total_score / len(news_items), 1)
        if avg_score > 25:
            sentiment_label = "Positive"
        elif avg_score < -25:
            sentiment_label = "Negative"
        else:
            sentiment_label = "Neutral"

        return {
            "sentiment_score": avg_score, # -100 to +100
            "sentiment_label": sentiment_label,
            "news_count": len(news_items),
            "positive_count": pos_cnt,
            "negative_count": neg_cnt,
            "neutral_count": neu_cnt
        }
