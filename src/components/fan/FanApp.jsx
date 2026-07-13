import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  MessageCircle, Users, Train, Accessibility,
  ArrowLeft, Trophy, Sparkles, Radio
} from 'lucide-react';
import { INITIAL_GATES, simulateStep } from '../../services/crowdSimulator';
import AIChatbot from './AIChatbot';
import CrowdAlerts from './CrowdAlerts';
import TransportAdvisor from './TransportAdvisor';
import AccessibilityGuide from './AccessibilityGuide';

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

/* ------------------------------------------------------------------ */
/*  Tab definitions                                                    */
/* ------------------------------------------------------------------ */
const TABS = [
  { id: 'chat', label: 'Chat', icon: MessageCircle, ariaLabel: 'AI Chat assistant' },
  { id: 'crowd', label: 'Crowd', icon: Users, ariaLabel: 'Live crowd status' },
  { id: 'transport', label: 'Transport', icon: Train, ariaLabel: 'Transport advisor' },
  { id: 'accessibility', label: 'Access', icon: Accessibility, ariaLabel: 'Accessibility guide' },
];

const GATE_SIM_INTERVAL = 5000; // 5 seconds

/* ------------------------------------------------------------------ */
/*  Inject keyframes                                                   */
/* ------------------------------------------------------------------ */
function useKeyframes() {
  useEffect(() => {
    const id = 'fanapp-keyframes';
    if (document.getElementById(id)) return;
    const s = document.createElement('style');
    s.id = id;
    s.textContent = `
      @keyframes fanapp-fadein {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes fanapp-slideup {
        from { opacity: 0; transform: translateY(20px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes fanapp-glow {
        0%, 100% { box-shadow: 0 0 20px rgba(0,165,80,0.2); }
        50%      { box-shadow: 0 0 40px rgba(0,165,80,0.1); }
      }
      @keyframes fanapp-live-dot {
        0%, 100% { opacity: 1; }
        50%      { opacity: 0.3; }
      }
      @keyframes fanapp-gradient {
        0%   { background-position: 0% 50%; }
        50%  { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes fanapp-tab-indicator {
        from { transform: scaleX(0); }
        to   { transform: scaleX(1); }
      }
    `;
    document.head.appendChild(s);
  }, []);
}

/* ------------------------------------------------------------------ */
/*  Main FanApp Component                                              */
/* ------------------------------------------------------------------ */
export default function FanApp({ onBack }) {
  useKeyframes();

  const [activeTab, setActiveTab] = useState('chat');
  const [gates, setGates] = useState(INITIAL_GATES);
  const intervalRef = useRef(null);

  /* — Gate simulation interval — */
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setGates(prev => simulateStep(prev));
    }, GATE_SIM_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, []);

  /* — Accessibility mode toggle — */
  const handleA11yToggle = useCallback(() => {
    const root = document.documentElement;
    const isOn = root.classList.contains('high-contrast');
    if (isOn) {
      root.classList.remove('high-contrast', 'large-text');
    } else {
      root.classList.add('high-contrast', 'large-text');
    }
  }, []);

  /* — Tab change — */
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

  /* — Handle keyboard nav for tabs — */
  const handleTabKeyDown = useCallback((e) => {
    const currentIdx = TABS.findIndex(t => t.id === activeTab);
    let nextIdx = currentIdx;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIdx = (currentIdx + 1) % TABS.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIdx = (currentIdx - 1 + TABS.length) % TABS.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIdx = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIdx = TABS.length - 1;
    }
    if (nextIdx !== currentIdx) {
      setActiveTab(TABS[nextIdx].id);
      document.getElementById(`fanapp-tab-${TABS[nextIdx].id}`)?.focus();
    }
  }, [activeTab]);

  /* — Live indicator data — */
  const liveStats = useMemo(() => {
    const critical = gates.filter(g => g.status === 'critical').length;
    const avg = Math.round(gates.reduce((s, g) => s + g.occupancy, 0) / gates.length);
    return { critical, avg };
  }, [gates]);

  /* — Render active tab content — */
  const renderTabPanel = useMemo(() => {
    switch (activeTab) {
      case 'chat':
        return <AIChatbot gates={gates} />;
      case 'crowd':
        return <CrowdAlerts gates={gates} />;
      case 'transport':
        return <TransportAdvisor />;
      case 'accessibility':
        return <AccessibilityGuide />;
      default:
        return <AIChatbot gates={gates} />;
    }
  }, [activeTab, gates]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: C.bg,
        fontFamily: F.body,
        color: C.textPrimary,
      }}
    >
      {/* ══════════════════════════════════════════════════════════════ */}
      {/*  HEADER                                                      */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(6,6,15,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            gap: 10,
          }}
        >
          {/* Back button */}
          <button
            id="fanapp-back-btn"
            onClick={onBack}
            aria-label="Go back to landing page"
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              border: `1px solid ${C.border}`,
              background: 'transparent',
              color: C.textSecondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = C.green;
              e.currentTarget.style.color = C.green;
              e.currentTarget.style.background = 'rgba(0,165,80,0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.color = C.textSecondary;
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <ArrowLeft size={18} strokeWidth={2.2} />
          </button>

          {/* Logo / Title */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                background: `linear-gradient(135deg, ${C.green}, ${C.greenBright})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                animation: 'fanapp-glow 3s ease infinite',
              }}
            >
              <Trophy size={20} color="#fff" strokeWidth={2.2} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 800,
                  fontFamily: F.heading,
                  color: C.textPrimary,
                  lineHeight: 1.1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                StadiumGenie
                <Sparkles size={14} color={C.gold} strokeWidth={2.5} />
              </div>
              <div style={{ fontSize: 10, color: C.textMuted, fontFamily: F.body, letterSpacing: '0.04em' }}>
                FIFA World Cup 2026 • Fan Experience
              </div>
            </div>
          </div>

          {/* Live status pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 12px',
              borderRadius: 20,
              background: liveStats.critical > 0
                ? 'rgba(229,62,62,0.12)'
                : 'rgba(0,165,80,0.1)',
              border: `1px solid ${liveStats.critical > 0
                ? 'rgba(229,62,62,0.3)'
                : 'rgba(0,165,80,0.2)'}`,
              fontSize: 11,
              fontWeight: 600,
              fontFamily: F.body,
              color: liveStats.critical > 0 ? C.red : C.greenBright,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: liveStats.critical > 0 ? C.red : C.greenBright,
                animation: 'fanapp-live-dot 1.5s ease infinite',
              }}
            />
            <Radio size={11} />
            LIVE
          </div>

          {/* A11y toggle */}
          <button
            id="fanapp-a11y-toggle"
            onClick={handleA11yToggle}
            aria-label="Toggle accessibility mode (high contrast and large text)"
            title="Toggle high contrast & large text"
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              border: `1px solid ${C.border}`,
              background: 'transparent',
              color: C.textMuted,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = C.gold;
              e.currentTarget.style.color = C.gold;
              e.currentTarget.style.background = 'rgba(255,215,0,0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.color = C.textMuted;
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Accessibility size={18} strokeWidth={2.2} />
          </button>
        </div>

        {/* ── Match info strip ── */}
        <div
          style={{
            padding: '6px 16px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            fontSize: 11,
            fontFamily: F.body,
            color: C.textMuted,
            background: 'rgba(255,255,255,0.02)',
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <span>🇦🇷 Argentina vs France 🇫🇷</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: C.textMuted }} />
          <span>⏰ Kickoff 18:00</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: C.textMuted }} />
          <span>🏟️ Estadio Azteca</span>
        </div>

        {/* ── Tab Navigation ── */}
        <div
          role="tablist"
          aria-label="Fan App sections"
          onKeyDown={handleTabKeyDown}
          style={{
            display: 'flex',
            padding: '0 8px',
          }}
        >
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                id={`fanapp-tab-${tab.id}`}
                role="tab"
                aria-selected={isActive}
                aria-controls={`fanapp-panel-${tab.id}`}
                aria-label={tab.ariaLabel}
                tabIndex={isActive ? 0 : -1}
                onClick={() => handleTabChange(tab.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  padding: '10px 4px 8px',
                  border: 'none',
                  background: 'transparent',
                  color: isActive ? C.greenBright : C.textMuted,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  fontFamily: F.body,
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = C.textSecondary;
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = C.textMuted;
                  }
                }}
              >
                <TabIcon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: isActive ? 700 : 500,
                    letterSpacing: '0.02em',
                  }}
                >
                  {tab.label}
                </span>
                {/* Active indicator bar */}
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: '15%',
                      right: '15%',
                      height: 3,
                      borderRadius: '3px 3px 0 0',
                      background: `linear-gradient(90deg, ${C.green}, ${C.greenBright})`,
                      animation: 'fanapp-tab-indicator 0.25s ease',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/*  TAB PANEL CONTENT                                           */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <main
        style={{
          padding: activeTab === 'chat' ? 0 : '20px 16px 40px',
          maxWidth: 960,
          margin: '0 auto',
          animation: 'fanapp-slideup 0.3s ease',
        }}
      >
        <div
          id={`fanapp-panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`fanapp-tab-${activeTab}`}
          style={{
            animation: 'fanapp-fadein 0.3s ease',
            minHeight: activeTab === 'chat' ? 'calc(100vh - 170px)' : 'auto',
          }}
        >
          {renderTabPanel}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer
        style={{
          textAlign: 'center',
          padding: '20px 16px 28px',
          borderTop: `1px solid ${C.border}`,
          fontSize: 11,
          color: C.textMuted,
          fontFamily: F.body,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Sparkles size={12} color={C.gold} />
          <span>Powered by <strong style={{ color: C.textSecondary }}>Gemini AI</strong> & <strong style={{ color: C.textSecondary }}>Google Cloud</strong></span>
          <Sparkles size={12} color={C.gold} />
        </div>
        <div style={{ marginTop: 4 }}>
          StadiumGenie © 2026 • FIFA World Cup™
        </div>
      </footer>
    </div>
  );
}
