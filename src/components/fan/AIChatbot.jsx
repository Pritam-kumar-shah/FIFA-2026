import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Send, Bot, User, Sparkles, MessageCircle, Loader } from 'lucide-react';
import { askGenie } from '../../services/gemini';

/* ------------------------------------------------------------------ */
/*  Colour / font constants                                           */
/* ------------------------------------------------------------------ */
const C = {
  bg: '#06060f',
  surface: 'rgba(255,255,255,0.04)',
  surfaceHover: 'rgba(255,255,255,0.08)',
  border: 'rgba(255,255,255,0.07)',
  green: '#00A550',
  greenBright: '#00c962',
  gold: '#FFD700',
  orange: '#f6993f',
  yellow: '#ecc94b',
  red: '#e53e3e',
  textPrimary: '#f0f0f5',
  textSecondary: 'rgba(255,255,255,0.55)',
  textMuted: 'rgba(255,255,255,0.35)',
};

const F = {
  heading: "'Outfit', sans-serif",
  body: "'Inter', sans-serif",
};

const MAX_CHARS = 500;
const RATE_LIMIT_MS = 2000;

const QUICK_ACTIONS = [
  { id: 'qa-gate', label: '🚪 Gate Status', message: 'What is the current gate status? Which gate has the shortest wait?' },
  { id: 'qa-food', label: '🍕 Nearby Food', message: 'Where can I find nearby food courts? Any recommendations?' },
  { id: 'qa-accessible', label: '♿ Accessible Route', message: 'What are the accessible routes and wheelchair-friendly gates?' },
  { id: 'qa-transport', label: '🚇 Transport Options', message: 'What are my transport options to get to the stadium?' },
];

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'bot',
  text: '¡Hola! 👋 I\'m **StadiumGenie**, your AI assistant for FIFA World Cup 2026 at Estadio Azteca! 🏟️⚽\n\nI can help you with:\n• 🚪 Gate status & wait times\n• 🍕 Food courts & amenities\n• ♿ Accessible routes\n• 🚇 Transport options\n• 🌍 I speak your language!\n\nHow can I help you today?',
  timestamp: new Date(),
};

/* ------------------------------------------------------------------ */
/*  Inject keyframes                                                   */
/* ------------------------------------------------------------------ */
function useKeyframes() {
  useEffect(() => {
    const id = 'aichat-keyframes';
    if (document.getElementById(id)) return;
    const s = document.createElement('style');
    s.id = id;
    s.textContent = `
      @keyframes aichat-fadein {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes aichat-dots {
        0%, 20% { opacity: 0.2; transform: scale(0.8); }
        50%     { opacity: 1;   transform: scale(1.1); }
        100%    { opacity: 0.2; transform: scale(0.8); }
      }
      @keyframes aichat-pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(0,165,80,0.35); }
        50%      { box-shadow: 0 0 16px 4px rgba(0,165,80,0.15); }
      }
      @keyframes aichat-shimmer {
        0%   { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `;
    document.head.appendChild(s);
  }, []);
}

/* ------------------------------------------------------------------ */
/*  Loading Dots                                                       */
/* ------------------------------------------------------------------ */
function LoadingDots() {
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '4px 0' }}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: C.green,
            animation: `aichat-dots 1.2s ease infinite`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Format message text (basic markdown bold/newlines)                 */
/* ------------------------------------------------------------------ */
function formatText(text) {
  if (!text) return '';
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: C.textPrimary, fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
    }
    // Handle newlines
    const lines = part.split('\n');
    return lines.map((line, j) => (
      <React.Fragment key={`${i}-${j}`}>
        {j > 0 && <br />}
        {line}
      </React.Fragment>
    ));
  });
}

/* ------------------------------------------------------------------ */
/*  Chat Bubble                                                        */
/* ------------------------------------------------------------------ */
function ChatBubble({ message }) {
  const isBot = message.role === 'bot';
  const isError = message.isError;
  const timeStr = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div
      id={`chat-msg-${message.id}`}
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
        flexDirection: isBot ? 'row' : 'row-reverse',
        animation: 'aichat-fadein 0.35s ease',
        marginBottom: 6,
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: isBot
            ? `linear-gradient(135deg, ${C.green}, ${C.greenBright})`
            : 'rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {isBot ? (
          <Bot size={18} color="#fff" strokeWidth={2.2} />
        ) : (
          <User size={18} color={C.textSecondary} strokeWidth={2} />
        )}
      </div>

      {/* Bubble */}
      <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div
          style={{
            padding: '12px 16px',
            borderRadius: isBot ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
            background: isBot
              ? isError
                ? 'rgba(229,62,62,0.1)'
                : C.surface
              : 'rgba(0,165,80,0.12)',
            border: `1px solid ${isBot ? (isError ? 'rgba(229,62,62,0.2)' : C.border) : 'rgba(0,165,80,0.2)'}`,
            fontSize: 14,
            lineHeight: 1.6,
            color: isError ? C.red : C.textPrimary,
            fontFamily: F.body,
            wordBreak: 'break-word',
          }}
        >
          {message.loading ? <LoadingDots /> : formatText(message.text)}
        </div>
        <span
          style={{
            fontSize: 10,
            color: C.textMuted,
            fontFamily: F.body,
            paddingLeft: isBot ? 4 : 0,
            paddingRight: isBot ? 0 : 4,
            textAlign: isBot ? 'left' : 'right',
          }}
        >
          {isBot ? '🤖 StadiumGenie' : '👤 You'} • {timeStr}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function AIChatbot({ gates }) {
  useKeyframes();

  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const msgIdCounter = useRef(1);

  const nextId = useCallback(() => `msg-${msgIdCounter.current++}`, []);

  /* — Auto-scroll — */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* — Send message — */
  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isLoading || rateLimited) return;

    const userMsg = { id: nextId(), role: 'user', text: text.trim(), timestamp: new Date() };
    const loadingMsg = { id: nextId(), role: 'bot', text: '', loading: true, timestamp: new Date() };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setInput('');
    setIsLoading(true);
    setRateLimited(true);

    try {
      const response = await askGenie(text.trim(), gates);
      setMessages(prev =>
        prev.map(m =>
          m.id === loadingMsg.id
            ? { ...m, text: response, loading: false, timestamp: new Date() }
            : m
        )
      );
    } catch (err) {
      console.error('AIChatbot error:', err);
      setMessages(prev =>
        prev.map(m =>
          m.id === loadingMsg.id
            ? {
                ...m,
                text: 'Oops! I couldn\'t process that right now. 😅 Please try again in a moment, or ask a stadium volunteer for help!',
                loading: false,
                isError: true,
                timestamp: new Date(),
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      setTimeout(() => setRateLimited(false), RATE_LIMIT_MS);
    }
  }, [isLoading, rateLimited, gates, nextId]);

  /* — Handle key press — */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }, [input, sendMessage]);

  /* — Character count color — */
  const charCount = input.length;
  const charColor = useMemo(() => {
    if (charCount > MAX_CHARS) return C.red;
    if (charCount > MAX_CHARS * 0.85) return C.orange;
    return C.textMuted;
  }, [charCount]);

  const canSend = input.trim().length > 0 && charCount <= MAX_CHARS && !isLoading && !rateLimited;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 500,
        fontFamily: F.body,
        color: C.textPrimary,
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '16px 20px',
          borderBottom: `1px solid ${C.border}`,
          background: C.surface,
          borderRadius: '16px 16px 0 0',
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${C.green}, ${C.greenBright})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'aichat-pulse 2.5s ease infinite',
            flexShrink: 0,
          }}
        >
          <Sparkles size={22} color="#fff" strokeWidth={2.2} />
        </div>
        <div>
          <h2
            id="chatbot-heading"
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              fontFamily: F.heading,
              color: C.textPrimary,
            }}
          >
            StadiumGenie AI
          </h2>
          <div style={{ fontSize: 11, color: C.textMuted, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: C.greenBright,
                display: 'inline-block',
              }}
            />
            Online • Multilingual • FIFA World Cup 2026
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          padding: '12px 16px',
          overflowX: 'auto',
          borderBottom: `1px solid ${C.border}`,
          flexShrink: 0,
        }}
      >
        {QUICK_ACTIONS.map(qa => (
          <button
            key={qa.id}
            id={qa.id}
            aria-label={`Ask about ${qa.label}`}
            onClick={() => sendMessage(qa.message)}
            disabled={isLoading || rateLimited}
            style={{
              padding: '7px 14px',
              borderRadius: 20,
              border: `1px solid ${C.border}`,
              background: C.surface,
              color: C.textSecondary,
              fontSize: 12,
              fontWeight: 500,
              fontFamily: F.body,
              cursor: isLoading || rateLimited ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
              opacity: isLoading || rateLimited ? 0.5 : 1,
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              if (!isLoading && !rateLimited) {
                e.currentTarget.style.background = C.surfaceHover;
                e.currentTarget.style.borderColor = C.green;
                e.currentTarget.style.color = C.greenBright;
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = C.surface;
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.color = C.textSecondary;
            }}
          >
            {qa.label}
          </button>
        ))}
      </div>

      {/* ── Messages Area ── */}
      <div
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {messages.map(msg => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Area ── */}
      <div
        style={{
          padding: '14px 16px',
          borderTop: `1px solid ${C.border}`,
          background: C.surface,
          borderRadius: '0 0 16px 16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'flex-end',
          }}
        >
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              ref={inputRef}
              id="chatbot-input"
              aria-label="Type your message to StadiumGenie"
              placeholder="Ask me anything about the stadium..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={MAX_CHARS + 50}
              rows={1}
              style={{
                width: '100%',
                padding: '12px 14px',
                paddingRight: 60,
                borderRadius: 14,
                border: `1px solid ${input.length > MAX_CHARS ? C.red : C.border}`,
                background: 'rgba(255,255,255,0.03)',
                color: C.textPrimary,
                fontSize: 14,
                fontFamily: F.body,
                resize: 'none',
                outline: 'none',
                transition: 'border-color 0.2s ease',
                lineHeight: 1.5,
                boxSizing: 'border-box',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = C.green;
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = input.length > MAX_CHARS ? C.red : C.border;
              }}
            />
            <span
              style={{
                position: 'absolute',
                right: 14,
                bottom: 10,
                fontSize: 10,
                color: charColor,
                fontFamily: F.body,
              }}
            >
              {charCount}/{MAX_CHARS}
            </span>
          </div>

          <button
            id="chatbot-send-btn"
            aria-label="Send message"
            onClick={() => sendMessage(input)}
            disabled={!canSend}
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              border: 'none',
              background: canSend
                ? `linear-gradient(135deg, ${C.green}, ${C.greenBright})`
                : 'rgba(255,255,255,0.06)',
              color: canSend ? '#fff' : C.textMuted,
              cursor: canSend ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              if (canSend) e.currentTarget.style.transform = 'scale(1.06)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {isLoading ? (
              <Loader size={20} style={{ animation: 'aichat-dots 1.2s ease infinite' }} />
            ) : (
              <Send size={20} strokeWidth={2.2} />
            )}
          </button>
        </div>

        {rateLimited && !isLoading && (
          <div
            style={{
              fontSize: 11,
              color: C.textMuted,
              marginTop: 6,
              textAlign: 'center',
              fontFamily: F.body,
            }}
          >
            ⏳ Please wait a moment before sending another message...
          </div>
        )}
      </div>
    </div>
  );
}
