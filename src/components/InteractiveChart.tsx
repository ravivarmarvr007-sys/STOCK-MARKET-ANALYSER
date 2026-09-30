import React, { useState, useRef } from 'react';
import { HistoricalBar } from '../types';
import { Eye, EyeOff, Layers, BarChart2, CandlestickChart } from 'lucide-react';

interface InteractiveChartProps {
  bars: HistoricalBar[];
  symbol: string;
  timeframe: string;
  onTimeframeChange: (tf: string) => void;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  bars,
  symbol,
  timeframe,
  onTimeframeChange
}) => {
  const [chartType, setChartType] = useState<'candlestick' | 'line'>('candlestick');
  const [showSMA20, setShowSMA20] = useState(false);
  const [showSMA50, setShowSMA50] = useState(true);
  const [showSMA200, setShowSMA200] = useState(true);
  const [showEMA20, setShowEMA20] = useState(false);
  const [showBB, setShowBB] = useState(true);
  const [showVolume, setShowVolume] = useState(true);

  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!bars || bars.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        Loading historical chart data...
      </div>
    );
  }

  // Sizing
  const width = 860;
  const height = 400;
  const margin = { top: 20, right: 65, bottom: 50, left: 10 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const volumeHeight = showVolume ? 70 : 0;
  const priceChartHeight = chartHeight - volumeHeight - 10;

  // Price range calculation
  let minPrice = Infinity;
  let maxPrice = -Infinity;
  let maxVolume = 0;

  bars.forEach(b => {
    if (b.low < minPrice) minPrice = b.low;
    if (b.high > maxPrice) maxPrice = b.high;
    if (showBB && b.bb_lower && b.bb_lower < minPrice) minPrice = b.bb_lower;
    if (showBB && b.bb_upper && b.bb_upper > maxPrice) maxPrice = b.bb_upper;
    if (b.volume > maxVolume) maxVolume = b.volume;
  });

  const pricePadding = (maxPrice - minPrice) * 0.05 || 10;
  const effectiveMin = minPrice - pricePadding;
  const effectiveMax = maxPrice + pricePadding;
  const priceRange = effectiveMax - effectiveMin;

  // Coordinate scales
  const getX = (index: number) => margin.left + (index / Math.max(1, bars.length - 1)) * chartWidth;
  const getYPrice = (val: number) => margin.top + priceChartHeight - ((val - effectiveMin) / priceRange) * priceChartHeight;
  const getYVolume = (vol: number) => margin.top + chartHeight - (vol / (maxVolume || 1)) * volumeHeight;

  // Hover detection
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - margin.left;
    const boundedX = Math.max(0, Math.min(chartWidth, mouseX));
    const idx = Math.round((boundedX / chartWidth) * (bars.length - 1));
    setHoverIndex(idx);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const activeBar = hoverIndex !== null ? bars[hoverIndex] : bars[bars.length - 1];

  // Path generators
  const generateLinePath = (getter: (b: HistoricalBar) => number | null | undefined) => {
    let path = '';
    bars.forEach((b, i) => {
      const val = getter(b);
      if (val !== null && val !== undefined) {
        const x = getX(i);
        const y = getYPrice(val);
        path += path === '' ? `M ${x} ${y}` : ` L ${x} ${y}`;
      }
    });
    return path;
  };

  const closeLinePath = generateLinePath(b => b.close);
  const areaPath = closeLinePath 
    ? `${closeLinePath} L ${getX(bars.length - 1)} ${margin.top + priceChartHeight} L ${getX(0)} ${margin.top + priceChartHeight} Z`
    : '';

  const sma20Path = showSMA20 ? generateLinePath(b => b.sma_20) : '';
  const sma50Path = showSMA50 ? generateLinePath(b => b.sma_50) : '';
  const sma200Path = showSMA200 ? generateLinePath(b => b.sma_200) : '';
  const ema20Path = showEMA20 ? generateLinePath(b => b.ema_20) : '';
  const bbUpperPath = showBB ? generateLinePath(b => b.bb_upper) : '';
  const bbLowerPath = showBB ? generateLinePath(b => b.bb_lower) : '';
  const bbMiddlePath = showBB ? generateLinePath(b => b.bb_middle) : '';

  const timeframes = ['1D', '1W', '1M', '3M', '6M', '1Y', '5Y'];

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
      
      {/* Top Header: Controls & Indicators Toggle */}
      <div className="flex-row items-center justify-between" style={{ flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        
        {/* Timeframe Buttons */}
        <div className="flex-row items-center gap-1" style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              style={{
                background: timeframe === tf ? '#10b981' : 'transparent',
                color: timeframe === tf ? '#ffffff' : '#94a3b8',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Chart View Toggle (Candles vs Line) */}
        <div className="flex-row items-center gap-1" style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setChartType('candlestick')}
            style={{
              background: chartType === 'candlestick' ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
              color: chartType === 'candlestick' ? '#818cf8' : '#94a3b8',
              border: chartType === 'candlestick' ? '1px solid rgba(99,102,241,0.5)' : 'none',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '0.72rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
          >
            <CandlestickChart size={13} /> Candles
          </button>
          <button
            onClick={() => setChartType('line')}
            style={{
              background: chartType === 'line' ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
              color: chartType === 'line' ? '#818cf8' : '#94a3b8',
              border: chartType === 'line' ? '1px solid rgba(99,102,241,0.5)' : 'none',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '0.72rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
          >
            <BarChart2 size={13} /> Area Line
          </button>
        </div>

        {/* Indicators Pill Toggles */}
        <div className="flex-row items-center gap-2" style={{ flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowSMA50(!showSMA50)}
            style={{
              background: showSMA50 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.04)',
              color: showSMA50 ? '#fbbf24' : '#64748b',
              border: showSMA50 ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '3px 8px',
              fontSize: '0.7rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            SMA 50
          </button>

          <button
            onClick={() => setShowSMA200(!showSMA200)}
            style={{
              background: showSMA200 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.04)',
              color: showSMA200 ? '#f87171' : '#64748b',
              border: showSMA200 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '3px 8px',
              fontSize: '0.7rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            SMA 200
          </button>

          <button
            onClick={() => setShowEMA20(!showEMA20)}
            style={{
              background: showEMA20 ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.04)',
              color: showEMA20 ? '#38bdf8' : '#64748b',
              border: showEMA20 ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '3px 8px',
              fontSize: '0.7rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            EMA 20
          </button>

          <button
            onClick={() => setShowBB(!showBB)}
            style={{
              background: showBB ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.04)',
              color: showBB ? '#c084fc' : '#64748b',
              border: showBB ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '3px 8px',
              fontSize: '0.7rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Bollinger (20,2)
          </button>

          <button
            onClick={() => setShowVolume(!showVolume)}
            style={{
              background: showVolume ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.04)',
              color: showVolume ? '#34d399' : '#64748b',
              border: showVolume ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '3px 8px',
              fontSize: '0.7rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Volume
          </button>
        </div>

      </div>

      {/* Crosshair / Active Bar Info Banner */}
      <div 
        className="flex-row items-center gap-4 num-font"
        style={{
          background: 'rgba(10, 16, 28, 0.9)',
          padding: '0.5rem 0.85rem',
          borderRadius: '8px',
          marginBottom: '0.75rem',
          fontSize: '0.75rem',
          color: '#94a3b8',
          border: '1px solid var(--border-color)',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}
      >
        <span>Date: <strong style={{ color: '#f8fafc' }}>{activeBar.date}</strong></span>
        <span>O: <strong style={{ color: '#f8fafc' }}>₹{activeBar.open}</strong></span>
        <span>H: <strong style={{ color: '#10b981' }}>₹{activeBar.high}</strong></span>
        <span>L: <strong style={{ color: '#f43f5e' }}>₹{activeBar.low}</strong></span>
        <span>C: <strong style={{ color: activeBar.close >= activeBar.open ? '#10b981' : '#f43f5e' }}>₹{activeBar.close}</strong></span>
        <span>Vol: <strong style={{ color: '#38bdf8' }}>{activeBar.volume.toLocaleString('en-IN')}</strong></span>
        {showSMA50 && activeBar.sma_50 && (
          <span style={{ color: '#fbbf24' }}>SMA50: <strong>₹{activeBar.sma_50}</strong></span>
        )}
        {showSMA200 && activeBar.sma_200 && (
          <span style={{ color: '#f87171' }}>SMA200: <strong>₹{activeBar.sma_200}</strong></span>
        )}
        {showBB && activeBar.bb_upper && (
          <span style={{ color: '#c084fc' }}>BB Upper: <strong>₹{activeBar.bb_upper}</strong></span>
        )}
      </div>

      {/* SVG Interactive Canvas */}
      <div ref={containerRef} style={{ width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', minWidth: '600px', cursor: 'crosshair', display: 'block' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="bbBandGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.2, 0.4, 0.6, 0.8].map((pct, i) => {
            const y = margin.top + priceChartHeight * pct;
            const priceLabel = (effectiveMax - pct * priceRange).toFixed(1);
            return (
              <g key={i}>
                <line
                  x1={margin.left}
                  y1={y}
                  x2={margin.left + chartWidth}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeDasharray="4 4"
                />
                <text
                  x={margin.left + chartWidth + 6}
                  y={y + 4}
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="'JetBrains Mono', monospace"
                >
                  ₹{priceLabel}
                </text>
              </g>
            );
          })}

          {/* Bollinger Bands Clouds */}
          {showBB && bbUpperPath && bbLowerPath && (
            <>
              <path d={bbUpperPath} fill="none" stroke="rgba(168, 85, 247, 0.45)" strokeWidth="1" strokeDasharray="3 3" />
              <path d={bbLowerPath} fill="none" stroke="rgba(168, 85, 247, 0.45)" strokeWidth="1" strokeDasharray="3 3" />
              <path d={bbMiddlePath} fill="none" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="1" />
            </>
          )}

          {/* Area/Line Mode */}
          {chartType === 'line' && (
            <>
              <path d={areaPath} fill="url(#areaGradient)" />
              <path d={closeLinePath} fill="none" stroke="#10b981" strokeWidth="2.5" />
            </>
          )}

          {/* Candlestick Mode */}
          {chartType === 'candlestick' && bars.map((bar, i) => {
            const x = getX(i);
            const isBull = bar.close >= bar.open;
            const candleColor = isBull ? '#10b981' : '#f43f5e';
            const yHigh = getYPrice(bar.high);
            const yLow = getYPrice(bar.low);
            const yOpen = getYPrice(bar.open);
            const yClose = getYPrice(bar.close);

            const bodyTop = Math.min(yOpen, yClose);
            const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));
            const candleWidth = Math.max(2, Math.min(10, (chartWidth / bars.length) * 0.7));

            return (
              <g key={i}>
                {/* Wick line */}
                <line
                  x1={x}
                  y1={yHigh}
                  x2={x}
                  y2={yLow}
                  stroke={candleColor}
                  strokeWidth="1.2"
                />
                {/* Body rect */}
                <rect
                  x={x - candleWidth / 2}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={isBull ? candleColor : candleColor}
                  rx="1"
                />
              </g>
            );
          })}

          {/* SMA 50 Line */}
          {showSMA50 && sma50Path && (
            <path d={sma50Path} fill="none" stroke="#fbbf24" strokeWidth="1.8" />
          )}

          {/* SMA 200 Line */}
          {showSMA200 && sma200Path && (
            <path d={sma200Path} fill="none" stroke="#ef4444" strokeWidth="2" />
          )}

          {/* EMA 20 Line */}
          {showEMA20 && ema20Path && (
            <path d={ema20Path} fill="none" stroke="#06b6d4" strokeWidth="1.5" />
          )}

          {/* Volume Histogram Bars */}
          {showVolume && bars.map((bar, i) => {
            const x = getX(i);
            const yVol = getYVolume(bar.volume);
            const isBull = bar.close >= bar.open;
            const barWidth = Math.max(1, Math.min(8, (chartWidth / bars.length) * 0.6));
            return (
              <rect
                key={i}
                x={x - barWidth / 2}
                y={yVol}
                width={barWidth}
                height={margin.top + chartHeight - yVol}
                fill={isBull ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)'}
              />
            );
          })}

          {/* Hover Crosshair & Pointer */}
          {hoverIndex !== null && (
            <g>
              {/* Vertical line */}
              <line
                x1={getX(hoverIndex)}
                y1={margin.top}
                x2={getX(hoverIndex)}
                y2={margin.top + chartHeight}
                stroke="rgba(255, 255, 255, 0.4)"
                strokeDasharray="3 3"
              />
              {/* Horizontal line */}
              <line
                x1={margin.left}
                y1={getYPrice(activeBar.close)}
                x2={margin.left + chartWidth}
                y2={getYPrice(activeBar.close)}
                stroke="rgba(255, 255, 255, 0.4)"
                strokeDasharray="3 3"
              />
              {/* Glow Dot at Close */}
              <circle
                cx={getX(hoverIndex)}
                cy={getYPrice(activeBar.close)}
                r="4"
                fill="#ffffff"
                stroke="#10b981"
                strokeWidth="2"
              />
            </g>
          )}

          {/* X Axis Date Labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const idx = Math.floor(pct * (bars.length - 1));
            const bar = bars[idx];
            if (!bar) return null;
            return (
              <text
                key={i}
                x={getX(idx)}
                y={margin.top + chartHeight + 18}
                fill="#64748b"
                fontSize="10"
                fontFamily="'JetBrains Mono', monospace"
                textAnchor="middle"
              >
                {bar.date.substring(5)}
              </text>
            );
          })}

        </svg>
      </div>

    </div>
  );
};
