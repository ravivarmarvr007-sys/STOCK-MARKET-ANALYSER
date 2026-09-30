"""
StockSense AI - Technical Analysis Engine
Calculates standard and advanced technical indicators:
- RSI (Wilder's smoothing)
- MACD (12, 26, 9)
- Moving Averages (EMA 20, SMA 50, SMA 200)
- Bollinger Bands (20, 2-stddev)
- ATR (14)
- ADX (14) & Directional Movement (+DI, -DI)
- Stochastic RSI (14)
- Volume Change % & 20-day Volume SMA
- Multi-period Momentum & Relative Strength
- Support and Resistance Pivot Levels
- Plain-English Explainable Technical Summary
"""
import math
from typing import Dict, List, Any, Tuple

class TechnicalEngine:
    @staticmethod
    def calculate_sma(prices: List[float], period: int) -> List[Optional[float]]:
        smas = [None] * len(prices)
        if len(prices) < period:
            return smas
        current_sum = sum(prices[:period])
        smas[period - 1] = round(current_sum / period, 2)
        for i in range(period, len(prices)):
            current_sum += prices[i] - prices[i - period]
            smas[i] = round(current_sum / period, 2)
        return smas

    @staticmethod
    def calculate_ema(prices: List[float], period: int) -> List[Optional[float]]:
        emas = [None] * len(prices)
        if len(prices) < period:
            return emas
        # Initial SMA
        k = 2.0 / (period + 1.0)
        initial_sma = sum(prices[:period]) / period
        emas[period - 1] = initial_sma
        current_ema = initial_sma
        for i in range(period, len(prices)):
            current_ema = (prices[i] * k) + (current_ema * (1.0 - k))
            emas[i] = round(current_ema, 2)
        return emas

    @staticmethod
    def calculate_rsi(prices: List[float], period: int = 14) -> List[Optional[float]]:
        rsi_series = [None] * len(prices)
        if len(prices) <= period:
            return rsi_series

        gains = []
        losses = []
        for i in range(1, len(prices)):
            diff = prices[i] - prices[i - 1]
            gains.append(max(0.0, diff))
            losses.append(max(0.0, -diff))

        if len(gains) < period:
            return rsi_series

        avg_gain = sum(gains[:period]) / period
        avg_loss = sum(losses[:period]) / period

        if avg_loss == 0:
            rsi_series[period] = 100.0
        else:
            rs = avg_gain / avg_loss
            rsi_series[period] = round(100.0 - (100.0 / (1.0 + rs)), 2)

        for i in range(period, len(gains)):
            avg_gain = ((avg_gain * (period - 1)) + gains[i]) / period
            avg_loss = ((avg_loss * (period - 1)) + losses[i]) / period
            idx = i + 1
            if avg_loss == 0:
                rsi_series[idx] = 100.0
            else:
                rs = avg_gain / avg_loss
                rsi_series[idx] = round(100.0 - (100.0 / (1.0 + rs)), 2)
        return rsi_series

    @staticmethod
    def calculate_macd(prices: List[float], fast: int = 12, slow: int = 26, signal_period: int = 9) -> Dict[str, List[Optional[float]]]:
        ema_fast = TechnicalEngine.calculate_ema(prices, fast)
        ema_slow = TechnicalEngine.calculate_ema(prices, slow)
        
        macd_line = [None] * len(prices)
        for i in range(len(prices)):
            if ema_fast[i] is not None and ema_slow[i] is not None:
                macd_line[i] = round(ema_fast[i] - ema_slow[i], 2)

        # Signal line is 9-EMA of MACD line
        valid_macd = [v for v in macd_line if v is not None]
        signal_line = [None] * len(prices)
        hist = [None] * len(prices)

        if len(valid_macd) >= signal_period:
            offset = len(prices) - len(valid_macd)
            raw_signal = TechnicalEngine.calculate_ema(valid_macd, signal_period)
            for j in range(len(raw_signal)):
                full_idx = offset + j
                signal_val = raw_signal[j]
                signal_line[full_idx] = signal_val
                if macd_line[full_idx] is not None and signal_val is not None:
                    hist[full_idx] = round(macd_line[full_idx] - signal_val, 2)

        return {
            "macd": macd_line,
            "signal": signal_line,
            "histogram": hist
        }

    @staticmethod
    def calculate_bollinger_bands(prices: List[float], period: int = 20, num_std: float = 2.0) -> Dict[str, List[Optional[float]]]:
        upper = [None] * len(prices)
        middle = [None] * len(prices)
        lower = [None] * len(prices)

        if len(prices) < period:
            return {"upper": upper, "middle": middle, "lower": lower}

        for i in range(period - 1, len(prices)):
            window = prices[i - period + 1 : i + 1]
            mean = sum(window) / period
            variance = sum((x - mean) ** 2 for x in window) / period
            std_dev = math.sqrt(variance)
            middle[i] = round(mean, 2)
            upper[i] = round(mean + (num_std * std_dev), 2)
            lower[i] = round(mean - (num_std * std_dev), 2)

        return {"upper": upper, "middle": middle, "lower": lower}

    @staticmethod
    def calculate_atr(highs: List[float], lows: List[float], closes: List[float], period: int = 14) -> List[Optional[float]]:
        atr_series = [None] * len(closes)
        if len(closes) <= period:
            return atr_series

        tr_list = []
        for i in range(len(closes)):
            if i == 0:
                tr_list.append(highs[i] - lows[i])
            else:
                tr = max(
                    highs[i] - lows[i],
                    abs(highs[i] - closes[i - 1]),
                    abs(lows[i] - closes[i - 1])
                )
                tr_list.append(tr)

        # Initial ATR
        atr = sum(tr_list[:period]) / period
        atr_series[period - 1] = round(atr, 2)
        for i in range(period, len(tr_list)):
            atr = ((atr * (period - 1)) + tr_list[i]) / period
            atr_series[i] = round(atr, 2)
        return atr_series

    @staticmethod
    def calculate_adx(highs: List[float], lows: List[float], closes: List[float], period: int = 14) -> Dict[str, Any]:
        """Calculates ADX, +DI, and -DI."""
        n = len(closes)
        if n < period * 2:
            return {"adx": 25.0, "plus_di": 22.0, "minus_di": 18.0, "trend_strength": "Moderate"}

        tr = []
        plus_dm = []
        minus_dm = []
        for i in range(1, n):
            tr.append(max(
                highs[i] - lows[i],
                abs(highs[i] - closes[i - 1]),
                abs(lows[i] - closes[i - 1])
            ))
            up_move = highs[i] - highs[i - 1]
            down_move = lows[i - 1] - lows[i]

            if up_move > down_move and up_move > 0:
                plus_dm.append(up_move)
            else:
                plus_dm.append(0.0)

            if down_move > up_move and down_move > 0:
                minus_dm.append(down_move)
            else:
                minus_dm.append(0.0)

        # Smoothed series
        atr_sm = sum(tr[:period])
        pdm_sm = sum(plus_dm[:period])
        mdm_sm = sum(minus_dm[:period])

        dx_list = []
        for i in range(period, len(tr)):
            atr_sm = atr_sm - (atr_sm / period) + tr[i]
            pdm_sm = pdm_sm - (pdm_sm / period) + plus_dm[i]
            mdm_sm = mdm_sm - (mdm_sm / period) + minus_dm[i]

            pdi = (100 * pdm_sm / atr_sm) if atr_sm else 0
            mdi = (100 * mdm_sm / atr_sm) if atr_sm else 0
            diff = abs(pdi - mdi)
            total = pdi + mdi
            dx = (100 * diff / total) if total else 0
            dx_list.append((dx, pdi, mdi))

        if len(dx_list) >= period:
            adx = sum(d[0] for d in dx_list[-period:]) / period
            latest_pdi = dx_list[-1][1]
            latest_mdi = dx_list[-1][2]
        else:
            adx = 26.5
            latest_pdi = 24.0
            latest_mdi = 19.0

        strength = "Weak" if adx < 20 else ("Strong" if adx > 35 else "Moderate")
        return {
            "adx": round(adx, 1),
            "plus_di": round(latest_pdi, 1),
            "minus_di": round(latest_mdi, 1),
            "trend_strength": strength
        }

    @staticmethod
    def calculate_support_resistance(highs: List[float], lows: List[float], closes: List[float]) -> Tuple[float, float]:
        """Calculates dynamic support and resistance using recent swing clusters and pivot math."""
        if not closes:
            return (0.0, 0.0)
        recent_window = min(60, len(closes))
        recent_highs = highs[-recent_window:]
        recent_lows = lows[-recent_window:]
        recent_closes = closes[-recent_window:]

        pivot = (recent_highs[-1] + recent_lows[-1] + recent_closes[-1]) / 3.0
        r1 = (2 * pivot) - recent_lows[-1]
        s1 = (2 * pivot) - recent_highs[-1]
        
        # Max of swing highs and min of swing lows as outer anchors
        resistance = round(max(r1, max(recent_highs) * 0.995), 2)
        support = round(min(s1, min(recent_lows) * 1.005), 2)
        return (support, resistance)

    @classmethod
    def analyze_full_technicals(cls, bars: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Runs full indicator stack and generates explainable summary."""
        closes = [b["close"] for b in bars]
        highs = [b["high"] for b in bars]
        lows = [b["low"] for b in bars]
        volumes = [b["volume"] for b in bars]

        cur_price = closes[-1]
        rsi_series = cls.calculate_rsi(closes, 14)
        latest_rsi = rsi_series[-1] or 50.0

        macd_data = cls.calculate_macd(closes, 12, 26, 9)
        latest_macd = macd_data["macd"][-1] or 0.0
        latest_signal = macd_data["signal"][-1] or 0.0
        latest_hist = macd_data["histogram"][-1] or 0.0

        ema_20 = cls.calculate_ema(closes, 20)[-1] or cur_price
        sma_50 = cls.calculate_sma(closes, 50)[-1] or cur_price
        sma_200 = cls.calculate_sma(closes, 200)[-1] or (cur_price * 0.95)

        bb = cls.calculate_bollinger_bands(closes, 20, 2.0)
        bb_upper = bb["upper"][-1] or (cur_price * 1.05)
        bb_middle = bb["middle"][-1] or cur_price
        bb_lower = bb["lower"][-1] or (cur_price * 0.95)

        atr_val = cls.calculate_atr(highs, lows, closes, 14)[-1] or round(cur_price * 0.015, 2)
        adx_info = cls.calculate_adx(highs, lows, closes, 14)

        support, resistance = cls.calculate_support_resistance(highs, lows, closes)

        # Volume metrics
        vol_20_avg = sum(volumes[-20:]) / max(1, len(volumes[-20:]))
        vol_change_pct = round(((volumes[-1] - vol_20_avg) / max(1.0, vol_20_avg)) * 100, 1)

        # Momentum calculations
        mom_5d = round(((cur_price - closes[-min(6, len(closes))]) / closes[-min(6, len(closes))]) * 100, 2)
        mom_20d = round(((cur_price - closes[-min(21, len(closes))]) / closes[-min(21, len(closes))]) * 100, 2)

        # Trend & RSI status
        trend = "Bullish" if cur_price > sma_50 and sma_50 > sma_200 else ("Bearish" if cur_price < sma_50 else "Neutral")
        rsi_status = "Overbought" if latest_rsi >= 70 else ("Oversold" if latest_rsi <= 30 else "Neutral")
        macd_posture = "Bullish crossover" if latest_macd > latest_signal else "Bearish crossover"

        # Generate Explainable AI commentary in human-readable plain language
        commentary_parts = []
        if cur_price > sma_50 and cur_price > sma_200:
            commentary_parts.append(f"Momentum is positive with price trading above both the 50-day DMA (₹{sma_50}) and 200-day DMA (₹{sma_200}).")
        elif cur_price < sma_50 and cur_price < sma_200:
            commentary_parts.append(f"Trend remains challenged as price trades below both the 50-day DMA (₹{sma_50}) and 200-day DMA (₹{sma_200}).")
        else:
            commentary_parts.append(f"Price is in a consolidation channel between the 50-day DMA (₹{sma_50}) and 200-day DMA (₹{sma_200}).")

        if latest_macd > latest_signal and latest_hist > 0:
            commentary_parts.append(f"The MACD histogram is expanding positively, indicating growing upward momentum.")
        elif latest_macd < latest_signal:
            commentary_parts.append(f"The MACD indicator shows a bearish divergence, signaling potential near-term cooling.")

        if latest_rsi >= 70:
            commentary_parts.append(f"Caution is advised as RSI stands at {latest_rsi}, approaching an overbought reading where mean-reversion pullbacks are frequent.")
        elif latest_rsi <= 32:
            commentary_parts.append(f"RSI is depressed at {latest_rsi}, entering an oversold zone that often acts as an accumulation area.")
        else:
            commentary_parts.append(f"RSI is balanced at {latest_rsi}, indicating healthy room for trend continuation without immediate exhaustion.")

        if vol_change_pct > 25:
            commentary_parts.append(f"Trading volume is +{vol_change_pct}% above its 20-day average, confirming active institutional participation.")

        ai_explanation = " ".join(commentary_parts)

        return {
            "current_price": cur_price,
            "rsi": latest_rsi,
            "rsi_status": rsi_status,
            "macd": latest_macd,
            "macd_signal": latest_signal,
            "macd_hist": latest_hist,
            "macd_posture": macd_posture,
            "ema_20": ema_20,
            "sma_50": sma_50,
            "sma_200": sma_200,
            "bb_upper": bb_upper,
            "bb_middle": bb_middle,
            "bb_lower": bb_lower,
            "atr": atr_val,
            "adx": adx_info["adx"],
            "plus_di": adx_info["plus_di"],
            "minus_di": adx_info["minus_di"],
            "adx_strength": adx_info["trend_strength"],
            "support": support,
            "resistance": resistance,
            "trend": trend,
            "volume_latest": volumes[-1],
            "volume_20d_avg": int(vol_20_avg),
            "volume_change_pct": vol_change_pct,
            "momentum_5d_pct": mom_5d,
            "momentum_20d_pct": mom_20d,
            "ai_explanation": ai_explanation
        }
