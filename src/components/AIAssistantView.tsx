import React, { useState } from 'react';
import { askAssistant } from '../services/api';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  ShieldCheck, 
  HelpCircle,
  TrendingUp,
  Cpu
} from 'lucide-react';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  context?: any;
  timestamp: string;
}

const PRESET_QUESTIONS = [
  "Why is TCS showing BUY?",
  "Compare TCS vs Infosys",
  "Which IT stocks have strong momentum?",
  "Find stocks with low debt and positive earnings growth",
  "Explain RSI like I'm a beginner",
  "What is MACD crossover?"
];

export const AIAssistantView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: (
        "Hello! I am **StockSense AI**, your grounded quantitative financial research assistant.\n\n" +
        "I retrieve live calculated technical indicators, fundamental balance sheets, and machine-learning model scores across Indian equities (NSE/BSE). " +
        "I strictly avoid fabricating data and answer with real figures.\n\n" +
        "Ask me anything or select a prompt below to get started!"
      ),
      timestamp: "09:30"
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || loading) return;

    const userMsg: Message = {
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await askAssistant(q);
      const assistantMsg: Message = {
        sender: 'assistant',
        text: res.answer,
        context: res.retrieved_context,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        sender: 'assistant',
        text: "I encountered an error querying the market engine. Please verify the backend connection and try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Simple Markdown renderer for messages
  const renderFormattedText = (txt: string) => {
    // Break by double newline
    const paragraphs = txt.split('\n\n');
    return (
      <div className="flex-col gap-2">
        {paragraphs.map((para, pIdx) => {
          // Headers
          if (para.startsWith('### ')) {
            return (
              <h3 key={pIdx} style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8', margin: '0.25rem 0' }}>
                {para.replace('### ', '')}
              </h3>
            );
          }
          if (para.startsWith('#### ')) {
            return (
              <h4 key={pIdx} style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34d399', margin: '0.25rem 0' }}>
                {para.replace('#### ', '')}
              </h4>
            );
          }
          // Blockquotes
          if (para.startsWith('> ')) {
            return (
              <div key={pIdx} style={{
                borderLeft: '3px solid #38bdf8',
                paddingLeft: '0.75rem',
                color: '#94a3b8',
                fontSize: '0.8rem',
                fontStyle: 'italic',
                margin: '0.35rem 0'
              }}>
                {para.replace('> ', '')}
              </div>
            );
          }
          // Tables
          if (para.includes('|')) {
            const lines = para.split('\n').filter(l => l.trim().startsWith('|'));
            if (lines.length >= 2) {
              const headers = lines[0].split('|').map(c => c.trim()).filter(c => c !== '');
              const rows = lines.slice(2).map(l => l.split('|').map(c => c.trim()).filter(c => c !== ''));
              return (
                <div key={pIdx} style={{ overflowX: 'auto', margin: '0.5rem 0' }}>
                  <table className="fin-table">
                    <thead>
                      <tr>
                        {headers.map((h, hI) => <th key={hI}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, rI) => (
                        <tr key={rI}>
                          {row.map((cell, cI) => <td key={cI}>{cell}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }
          }
          // Bullet list
          if (para.includes('* ') || para.includes('- ')) {
            const items = para.split('\n').filter(l => l.trim().startsWith('* ') || l.trim().startsWith('- '));
            return (
              <ul key={pIdx} style={{ paddingLeft: '1.25rem', margin: '0.25rem 0', listStyle: 'disc' }}>
                {items.map((item, iIdx) => (
                  <li key={iIdx} style={{ fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '3px' }}>
                    {item.replace(/^\* |^- /, '')}
                  </li>
                ))}
              </ul>
            );
          }
          // Regular paragraph
          return (
            <p key={pIdx} style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              {para}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex-col gap-6" style={{ paddingBottom: '3rem' }}>
      
      {/* 1. Header Banner */}
      <div className="glass-panel-elevated" style={{ padding: '1.5rem' }}>
        <div className="flex-row items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="flex-row items-center gap-2">
              <Bot size={24} color="#10b981" />
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc' }}>
                AI Financial Research Assistant
              </h1>
              <span style={{ fontSize: '0.72rem', background: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                RAG GROUNDED
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
              Queries live mathematical metrics, moving averages, valuation multiples, and model predictions with a strict anti-hallucination policy.
            </p>
          </div>

          <div className="flex-row items-center gap-2" style={{ fontSize: '0.72rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(16,185,129,0.3)' }}>
            <ShieldCheck size={14} />
            <span>Never fabricates unavailable data</span>
          </div>
        </div>

        {/* Preset Question Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
            Quick Prompts:
          </span>
          {PRESET_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-color)',
                borderRadius: '9999px',
                padding: '4px 12px',
                color: '#cbd5e1',
                fontSize: '0.75rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
                e.currentTarget.style.borderColor = '#818cf8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Chat Conversation Box */}
      <div className="glass-panel" style={{ padding: '1.25rem', minHeight: '460px', display: 'flex', flexDirection: 'column' }}>
        
        {/* Messages Stream */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
          {messages.map((m, idx) => {
            const isUser = m.sender === 'user';
            return (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  maxWidth: isUser ? '80%' : '92%',
                  alignSelf: isUser ? 'flex-end' : 'flex-start'
                }}
              >
                {!isUser && (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Bot size={18} color="#ffffff" />
                  </div>
                )}

                <div style={{
                  background: isUser ? 'rgba(99, 102, 241, 0.25)' : 'rgba(15, 23, 42, 0.75)',
                  border: isUser ? '1px solid rgba(99, 102, 241, 0.45)' : '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '0.9rem 1.1rem',
                  color: '#f8fafc'
                }}>
                  {renderFormattedText(m.text)}
                  <div style={{ fontSize: '0.65rem', color: '#64748b', textAlign: 'right', marginTop: '6px' }}>
                    {m.timestamp}
                  </div>
                </div>

                {isUser && (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <User size={16} color="#e2e8f0" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.8rem', paddingLeft: '40px' }}>
              <div className="live-pulse-dot" />
              <span>Retrieving factual market metrics &amp; synthesizing analysis...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(10, 16, 28, 0.8)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '0.4rem 0.6rem'
          }}
        >
          <input
            type="text"
            placeholder="Ask about Indian stocks (e.g. 'Why is TCS showing BUY?', 'Compare TCS vs Infosys')..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={loading}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              padding: '0.5rem',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={loading || !inputQuery.trim()}
            className="btn-primary"
            style={{ padding: '0.55rem 1rem' }}
          >
            <Send size={15} />
            <span>Send</span>
          </button>
        </form>

      </div>

    </div>
  );
};
