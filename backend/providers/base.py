"""
StockSense AI - Market Data Provider Interface
Defines the abstract interface for market data providers (e.g. Demo Provider, NSE Direct, Yahoo Finance, etc.)
"""
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional

class MarketDataProvider(ABC):
    @abstractmethod
    def get_all_symbols(self) -> List[Dict[str, Any]]:
        """Return list of supported Indian stocks with basic info."""
        pass

    @abstractmethod
    def get_quote(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get live/latest market quote for a given symbol."""
        pass

    @abstractmethod
    def get_historical_data(self, symbol: str, timeframe: str = "1Y") -> List[Dict[str, Any]]:
        """Get historical OHLCV candle data."""
        pass

    @abstractmethod
    def get_fundamentals(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get balance sheet, valuation, and growth fundamentals."""
        pass

    @abstractmethod
    def get_market_breadth(self) -> Dict[str, Any]:
        """Get advance/decline ratio and market sentiment metrics."""
        pass

    @abstractmethod
    def get_market_regime(self) -> Dict[str, Any]:
        """Get market regime classification and supporting macro indicators."""
        pass

    @abstractmethod
    def get_news(self, symbol: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get recent financial news and corporate announcements."""
        pass

    @abstractmethod
    def get_company_profile(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get detailed company description, sector, and industry."""
        pass
