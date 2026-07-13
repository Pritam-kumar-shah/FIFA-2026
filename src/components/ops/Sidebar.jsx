import React from 'react';
import {
  Zap,
  LayoutDashboard,
  AlertTriangle,
  Activity,
  Users,
  Trophy,
  Wifi,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Style constants – all colours reference the global CSS-var palette */
/* ------------------------------------------------------------------ */
const COLOR = {
  bg: '#06060f',
  surface: 'rgba(255,255,255,0.04)',
  surfaceHover: 'rgba(255,255,255,0.08)',
  border: 'rgba(255,255,255,0.07)',
  green: '#00A550',
  greenBright: '#00c962',
  gold: '#FFD700',
  red: '#e53e3e',
  textPrimary: '#f0f0f5',
  textSecondary: 'rgba(255,255,255,0.55)',
  textMuted: 'rgba(255,255,255,0.35)',
};

const FONT = {
  heading: "'Outfit', sans-serif",
  body: "'Inter', sans-serif",
};

/* ------------------------------------------------------------------ */
/*  Navigation items definition                                       */
/* ------------------------------------------------------------------ */
const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'heatmap', label: 'Crowd Heatmap', icon: Activity },
  { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
  { id: 'ai', label: 'AI Command', icon: Zap },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function Sidebar({ active = 'overview', setActive, stats = {} }) {
  const { totalFans = 0, criticalGates = 0, openIncidents = 0 } = stats;

  /* ---- inline styles ---- */
  const styles = {
    root: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: 220,
      height: '100vh',
      background: COLOR.bg,
      borderRight: `1px solid ${COLOR.border}`,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: FONT.body,
      zIndex: 100,
      overflowY: 'auto',
    },

    /* — Logo block — */
    logoWrap: {
      padding: '22px 18px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    },
    logoIcon: {
      width: 34,
      height: 34,
      borderRadius: 10,
      background: `linear-gradient(135deg, ${COLOR.green}, ${COLOR.greenBright})`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    logoText: {
      fontFamily: FONT.heading,
      fontSize: 15,
      fontWeight: 700,
      color: COLOR.textPrimary,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    logoSub: {
      fontSize: 10,
      fontWeight: 500,
      color: COLOR.green,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    },

    /* — Match pill — */
    matchPill: {
      margin: '4px 14px 18px',
      padding: '10px 12px',
      borderRadius: 12,
      background: COLOR.surface,
      border: `1px solid ${COLOR.border}`,
    },
    matchTeams: {
      fontFamily: FONT.heading,
      fontWeight: 700,
      fontSize: 13,
      color: COLOR.textPrimary,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    },
    matchMeta: {
      fontSize: 11,
      color: COLOR.textSecondary,
      marginTop: 4,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    },
    liveDot: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: COLOR.red,
      display: 'inline-block',
      animation: 'pulse-dot 1.8s ease-in-out infinite',
    },

    /* — Nav section — */
    navSection: {
      flex: 1,
      padding: '0 10px',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    },
    navLabel: {
      fontSize: 10,
      fontWeight: 600,
      color: COLOR.textMuted,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      padding: '0 8px',
      marginBottom: 6,
    },

    /* — Bottom stats — */
    statsWrap: {
      padding: '14px 14px 18px',
      borderTop: `1px solid ${COLOR.border}`,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    },
    statsTitle: {
      fontSize: 10,
      fontWeight: 600,
      color: COLOR.textMuted,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
    },
    statRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: 12,
      color: COLOR.textSecondary,
    },
    statValue: {
      fontFamily: FONT.heading,
      fontWeight: 700,
      fontSize: 14,
    },
  };

  /* ---- helpers ---- */
  const navBtnStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '9px 12px',
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: isActive ? 600 : 500,
    fontFamily: FONT.body,
    color: isActive ? COLOR.textPrimary : COLOR.textSecondary,
    background: isActive
      ? `linear-gradient(90deg, rgba(0,165,80,0.18), rgba(0,165,80,0.06))`
      : 'transparent',
    borderLeft: isActive ? `3px solid ${COLOR.green}` : '3px solid transparent',
    transition: 'all 0.2s ease',
  });

  /* ---- keyframes injected once ---- */
  React.useEffect(() => {
    const id = 'sidebar-keyframes';
    if (document.getElementById(id)) return;
    const sheet = document.createElement('style');
    sheet.id = id;
    sheet.textContent = `
      @keyframes pulse-dot {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }
    `;
    document.head.appendChild(sheet);
  }, []);

  return (
    <aside style={styles.root} aria-label="Sidebar navigation">
      {/* ── Logo ── */}
      <div style={styles.logoWrap}>
        <div style={styles.logoIcon}>
          <Zap size={18} color="#fff" strokeWidth={2.5} />
        </div>
        <div>
          <div style={styles.logoText}>StadiumGenie</div>
          <div style={styles.logoSub}>OPS Dashboard</div>
        </div>
      </div>

      {/* ── Match Day Pill ── */}
      <div style={styles.matchPill}>
        <div style={styles.matchTeams}>
          <Trophy size={14} color={COLOR.gold} />
          ARG vs FRA
        </div>
        <div style={styles.matchMeta}>
          <span style={styles.liveDot} />
          18:00 &middot; Estadio Azteca
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav style={styles.navSection}>
        <div style={styles.navLabel}>Operations</div>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              id={`sidebar-${id}`}
              style={navBtnStyle(isActive)}
              onClick={() => setActive?.(id)}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = COLOR.surfaceHover;
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                size={17}
                color={isActive ? COLOR.green : COLOR.textSecondary}
                strokeWidth={isActive ? 2.4 : 1.8}
              />
              {label}
            </button>
          );
        })}
      </nav>

      {/* ── Live Summary ── */}
      <div style={styles.statsWrap}>
        <div style={styles.statsTitle}>
          <Wifi
            size={11}
            color={COLOR.green}
            style={{ marginRight: 5, verticalAlign: 'middle' }}
          />
          Live Summary
        </div>

        <div style={styles.statRow}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Users size={13} color={COLOR.textSecondary} />
            Fans Inside
          </span>
          <span style={{ ...styles.statValue, color: COLOR.textPrimary }}>
            {totalFans.toLocaleString()}
          </span>
        </div>

        <div style={styles.statRow}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={13} color={COLOR.red} />
            Critical Gates
          </span>
          <span
            style={{
              ...styles.statValue,
              color: criticalGates > 0 ? COLOR.red : COLOR.green,
            }}
          >
            {criticalGates}
          </span>
        </div>

        <div style={styles.statRow}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Activity size={13} color={COLOR.gold} />
            Open Incidents
          </span>
          <span
            style={{
              ...styles.statValue,
              color: openIncidents > 0 ? COLOR.gold : COLOR.green,
            }}
          >
            {openIncidents}
          </span>
        </div>
      </div>
    </aside>
  );
}
