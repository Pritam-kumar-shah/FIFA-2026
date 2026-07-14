import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Trophy, Users, LayoutDashboard, Zap, Shield, Globe, ArrowRight } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Design constants                                                   */
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
/*  Inject keyframes                                                   */
/* ------------------------------------------------------------------ */
function useKeyframes() {
  useEffect(() => {
    const id = 'landing-keyframes';
    if (document.getElementById(id)) return;
    const s = document.createElement('style');
    s.id = id;
    s.textContent = `
      @keyframes lp-float-1 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(30px, -20px) scale(1.05); }
        66% { transform: translate(-20px, 10px) scale(0.95); }
      }
      @keyframes lp-float-2 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(-25px, 15px) scale(1.08); }
        66% { transform: translate(15px, -25px) scale(0.92); }
      }
      @keyframes lp-fade-up {
        from { opacity: 0; transform: translateY(28px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes lp-scale-in {
        from { opacity: 0; transform: scale(0.92); }
        to   { opacity: 1; transform: scale(1); }
      }
      @keyframes lp-gradient {
        0%   { background-position: 0% 50%; }
        50%  { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes lp-glow {
        0%, 100% { box-shadow: 0 0 20px rgba(0,165,80,0.15); }
        50%      { box-shadow: 0 0 40px rgba(0,165,80,0.3); }
      }
      @keyframes lp-pulse-ring {
        0%   { transform: scale(0.95); opacity: 1; }
        100% { transform: scale(1.6); opacity: 0; }
      }
      @keyframes lp-typing {
        0%, 100% { opacity: 0.3; }
        50%      { opacity: 1; }
      }
    `;
    document.head.appendChild(s);
  }, []);
}

/* ------------------------------------------------------------------ */
/*  Feature Badge                                                      */
/* ------------------------------------------------------------------ */
function FeatureBadge({ icon: Icon, text }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 12px',
        borderRadius: 20,
        background: 'rgba(255,255,255,0.05)',
        border: `1px solid ${C.border}`,
        fontSize: 11,
        fontWeight: 500,
        color: C.textSecondary,
        fontFamily: F.body,
      }}
    >
      <Icon size={13} color={C.green} strokeWidth={2} />
      {text}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Route Card                                                         */
/* ------------------------------------------------------------------ */
function RouteCard({ id, title, subtitle, description, icon: Icon, features, accentColor, onClick }) {
  const cardRef = useRef(null);

  return (
    <button
      id={id}
      ref={cardRef}
      onClick={onClick}
      aria-label={`Open ${title}`}
      style={{
        flex: '1 1 360px',
        maxWidth: 480,
        padding: '36px 32px 32px',
        borderRadius: 22,
        background: C.surface,
        border: `1px solid ${C.border}`,
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: F.body,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        animation: 'lp-scale-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) both',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.borderColor = accentColor;
        e.currentTarget.style.boxShadow = `0 16px 48px ${accentColor}22, 0 0 0 1px ${accentColor}44`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = C.border;
        e.currentTarget.style.boxShadow = 'none';
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = accentColor;
        e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}44`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = C.border;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Gradient accent line at top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88, transparent)`,
          borderRadius: '22px 22px 0 0',
        }}
      />

      {/* Icon */}
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: `${accentColor}14`,
          border: `1px solid ${accentColor}33`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={28} color={accentColor} strokeWidth={1.8} />
      </div>

      {/* Title */}
      <div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: accentColor,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: 6,
            fontFamily: F.body,
          }}
        >
          {subtitle}
        </div>
        <h2
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 800,
            fontFamily: F.heading,
            color: C.textPrimary,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </h2>
      </div>

      {/* Description */}
      <p
        style={{
          margin: 0,
          fontSize: 14,
          lineHeight: 1.6,
          color: C.textSecondary,
          fontFamily: F.body,
        }}
      >
        {description}
      </p>

      {/* Feature badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {features.map((f, i) => (
          <FeatureBadge key={i} icon={f.icon} text={f.text} />
        ))}
      </div>

      {/* CTA arrow */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginTop: 4,
          fontSize: 13,
          fontWeight: 700,
          color: accentColor,
          fontFamily: F.heading,
        }}
      >
        Launch {title.split(' ')[0]}
        <ArrowRight size={16} strokeWidth={2.5} />
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function LandingPage({ onFanClick, onOpsClick }) {
  useKeyframes();

  return (
    <div
      id="landing-page"
      style={{
        minHeight: '100vh',
        background: C.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
      role="region"
      aria-label="StadiumGenie welcome page"
    >
      {/* ── Animated background orbs ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-5%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,165,80,0.08) 0%, transparent 70%)',
          animation: 'lp-float-1 20s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '-15%',
          right: '-5%',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,215,0,0.05) 0%, transparent 70%)',
          animation: 'lp-float-2 25s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '30%',
          right: '20%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,201,98,0.04) 0%, transparent 70%)',
          animation: 'lp-float-1 18s ease-in-out infinite reverse',
          pointerEvents: 'none',
        }}
      />

      {/* ── Hero Section ── */}
      <div
        style={{
          textAlign: 'center',
          maxWidth: 720,
          marginBottom: 52,
          position: 'relative',
          zIndex: 1,
          animation: 'lp-fade-up 0.7s ease both',
        }}
      >
        {/* Live badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 18px',
            borderRadius: 24,
            background: 'rgba(0,165,80,0.1)',
            border: `1px solid rgba(0,165,80,0.25)`,
            marginBottom: 28,
            fontSize: 12,
            fontWeight: 600,
            color: C.green,
            fontFamily: F.body,
            letterSpacing: '0.02em',
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: C.green,
              display: 'inline-block',
              position: 'relative',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: -4,
                borderRadius: '50%',
                border: `2px solid ${C.green}`,
                animation: 'lp-pulse-ring 1.8s ease-out infinite',
              }}
            />
          </span>
          FIFA World Cup 2026 · Match Day Active
        </div>

        {/* Logo icon */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: `linear-gradient(135deg, ${C.green}, ${C.greenBright})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            animation: 'lp-glow 3s ease-in-out infinite',
          }}
          aria-hidden="true"
        >
          <Zap size={36} color="#fff" strokeWidth={2.2} />
        </div>

        {/* Title */}
        <h1
          style={{
            margin: 0,
            fontSize: 'clamp(36px, 5vw, 56px)',
            fontWeight: 900,
            fontFamily: F.heading,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            color: C.textPrimary,
          }}
        >
          Stadium
          <span
            style={{
              background: `linear-gradient(135deg, ${C.green}, ${C.greenBright}, ${C.gold})`,
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'lp-gradient 4s ease infinite',
            }}
          >
            Genie
          </span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            marginTop: 16,
            fontSize: 'clamp(15px, 2vw, 18px)',
            lineHeight: 1.6,
            color: C.textSecondary,
            fontFamily: F.body,
            fontWeight: 400,
            maxWidth: 560,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          AI-powered smart stadium assistant. Navigate the venue, get real-time
          crowd alerts, and manage operations — all with{' '}
          <strong style={{ color: C.textPrimary }}>Google Gemini AI</strong>.
        </p>

        {/* Tech badges */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 12,
            marginTop: 24,
            flexWrap: 'wrap',
          }}
        >
          {[
            { icon: Zap, text: 'Gemini AI' },
            { icon: Globe, text: '50+ Languages' },
            { icon: Shield, text: 'Real-time Data' },
          ].map((b, i) => (
            <FeatureBadge key={i} icon={b.icon} text={b.text} />
          ))}
        </div>
      </div>

      {/* ── Route Cards ── */}
      <div
        style={{
          display: 'flex',
          gap: 24,
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: 1020,
          width: '100%',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <RouteCard
          id="landing-fan-card"
          title="Fan Experience"
          subtitle="For Spectators"
          description="Your personal AI concierge for match day. Chat in any language, check gate crowds, find eco-friendly transport, and access the stadium with ease."
          icon={Users}
          accentColor={C.green}
          features={[
            { icon: Globe, text: 'Multilingual Chat' },
            { icon: Users, text: 'Live Crowd Alerts' },
            { icon: Shield, text: 'Accessibility' },
          ]}
          onClick={onFanClick}
        />

        <RouteCard
          id="landing-ops-card"
          title="Ops Dashboard"
          subtitle="For Staff & Organizers"
          description="AI-powered operations command center. Monitor live crowd heatmaps, AI-prioritized incident reports, and get real-time staff recommendations."
          icon={LayoutDashboard}
          accentColor={C.gold}
          features={[
            { icon: Trophy, text: 'Stadium Heatmap' },
            { icon: Zap, text: 'AI Command Center' },
            { icon: Shield, text: 'Incident Response' },
          ]}
          onClick={onOpsClick}
        />
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          marginTop: 56,
          textAlign: 'center',
          fontSize: 12,
          color: C.textMuted,
          fontFamily: F.body,
          position: 'relative',
          zIndex: 1,
          animation: 'lp-fade-up 0.7s ease 0.4s both',
        }}
      >
        <div style={{ marginBottom: 6 }}>
          <Trophy
            size={14}
            color={C.gold}
            style={{ verticalAlign: 'middle', marginRight: 6 }}
          />
          Estadio Azteca, Mexico City · Argentina vs France · 18:00
        </div>
        <div style={{ color: C.textMuted, fontSize: 11 }}>
          Built with React + Google Gemini AI · PromptWars Hackathon 2026
        </div>
      </div>
    </div>
  );
}

LandingPage.propTypes = {
  onFanClick: PropTypes.func.isRequired,
  onOpsClick: PropTypes.func.isRequired,
};
