import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Shield, TrendingUp, Users } from 'lucide-react';
import { generateCrowdAlert } from '../../services/gemini';

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

const ALERT_INTERVAL = 30000; // 30 seconds

const STATUS_CONFIG = {
  ok: {
    color: C.green,
    bg: 'rgba(0,165,80,0.10)',
    borderColor: 'rgba(0,165,80,0.25)',
    Icon: CheckCircle,
    label: 'Normal',
  },
  warning: {
    color: C.orange,
    bg: 'rgba(246,153,63,0.10)',
    borderColor: 'rgba(246,153,63,0.25)',
    Icon: AlertTriangle,
    label: 'Busy',
  },
  critical: {
    color: C.red,
    bg: 'rgba(229,62,62,0.12)',
    borderColor: 'rgba(229,62,62,0.30)',
    Icon: XCircle,
    label: 'Critical',
  },
};

/* ------------------------------------------------------------------ */
/*  Inject keyframes                                                   */
/* ------------------------------------------------------------------ */
function useKeyframes() {
  useEffect(() => {
    const id = 'crowd-keyframes';
    if (document.getElementById(id)) return;
    const s = document.createElement('style');
    s.id = id;
    s.textContent = `
      @keyframes crowd-fadein {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes crowd-pulse-red {
        0%, 100% { box-shadow: 0 0 0 0 rgba(229,62,62,0.4); }
        50%      { box-shadow: 0 0 20px 6px rgba(229,62,62,0.15); }
      }
      @keyframes crowd-pulse-orange {
        0%, 100% { box-shadow: 0 0 0 0 rgba(246,153,63,0.35); }
        50%      { box-shadow: 0 0 16px 4px rgba(246,153,63,0.12); }
      }
      @keyframes crowd-shimmer {
        0%   { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      @keyframes crowd-banner-slide {
        from { opacity: 0; transform: translateY(-12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes crowd-spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(s);
  }, []);
}

/* ------------------------------------------------------------------ */
/*  Alert Banner                                                       */
/* ------------------------------------------------------------------ */
function AlertBanner({ alert, loading }) {
  if (loading) {
    return (
      <div
        style={{
          padding: '16px 20px',
          borderRadius: 14,
          background: C.surface,
          border: `1px solid ${C.border}`,
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <RefreshCw
          size={18}
          color={C.textMuted}
          style={{ animation: 'crowd-spin 1s linear infinite' }}
        />
        <span style={{ fontSize: 13, color: C.textMuted, fontFamily: F.body }}>
          Analyzing crowd patterns with AI...
        </span>
      </div>
    );
  }

  if (!alert || !alert.hasAlert) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label="Crowd alert status"
        style={{
          padding: '16px 20px',
          borderRadius: 14,
          background: 'rgba(0,165,80,0.06)',
          border: `1px solid rgba(0,165,80,0.2)`,
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          animation: 'crowd-banner-slide 0.4s ease',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'rgba(0,165,80,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <CheckCircle size={20} color={C.green} strokeWidth={2.2} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.green, fontFamily: F.heading }}>
            All Clear
          </div>
          <div style={{ fontSize: 12, color: C.textSecondary, fontFamily: F.body, marginTop: 2 }}>
            All gates operating normally. No congestion detected. Enjoy the match! ⚽
          </div>
        </div>
      </div>
    );
  }

  const isCritical = alert.severity === 'critical';
  const alertColor = isCritical ? C.red : C.orange;
  const alertBg = isCritical ? 'rgba(229,62,62,0.08)' : 'rgba(246,153,63,0.08)';
  const alertBorder = isCritical ? 'rgba(229,62,62,0.3)' : 'rgba(246,153,63,0.25)';

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-label={`Crowd alert: ${alert.severity}`}
      style={{
        padding: '18px 22px',
        borderRadius: 14,
        background: alertBg,
        border: `1px solid ${alertBorder}`,
        borderLeft: `4px solid ${alertColor}`,
        marginBottom: 24,
        animation: `crowd-banner-slide 0.4s ease, ${isCritical ? 'crowd-pulse-red' : 'crowd-pulse-orange'} 2s ease infinite`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <AlertTriangle size={20} color={alertColor} strokeWidth={2.2} />
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: alertColor,
            fontFamily: F.body,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            background: `${alertColor}18`,
            padding: '3px 10px',
            borderRadius: 6,
          }}
        >
          {alert.severity === 'critical' ? '🔴 Critical' : '🟠 Warning'}
        </span>
        {alert.affectedGates && alert.affectedGates.length > 0 && (
          <span style={{ fontSize: 11, color: C.textMuted, fontFamily: F.body, marginLeft: 'auto' }}>
            Affected: {alert.affectedGates.join(', ')}
          </span>
        )}
      </div>

      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: C.textPrimary,
          fontFamily: F.heading,
          lineHeight: 1.4,
          marginBottom: 6,
        }}
      >
        {alert.fanMessage}
      </div>

      {alert.redirectTo && (
        <div
          style={{
            fontSize: 12,
            color: C.greenBright,
            fontWeight: 600,
            fontFamily: F.body,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 6,
          }}
        >
          <TrendingUp size={14} /> Recommended: Head to {alert.redirectTo}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Gate Card                                                          */
/* ------------------------------------------------------------------ */
function GateCard({ gate }) {
  const config = STATUS_CONFIG[gate.status] || STATUS_CONFIG.ok;
  const StatusIcon = config.Icon;
  const occupancy = gate.occupancy;

  return (
    <div
      id={`crowd-gate-${gate.id}`}
      style={{
        padding: '18px 20px',
        borderRadius: 14,
        background: config.bg,
        border: `1px solid ${config.borderColor}`,
        animation: gate.status === 'critical'
          ? 'crowd-fadein 0.3s ease, crowd-pulse-red 2.5s ease infinite'
          : 'crowd-fadein 0.3s ease',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StatusIcon
            size={18}
            color={config.color}
            strokeWidth={2.2}
            aria-label={config.label}
          />
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: C.textPrimary,
              fontFamily: F.heading,
            }}
          >
            {gate.name.replace('Gate ', 'G').replace(' - ', ' · ')}
          </span>
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: config.color,
            fontFamily: F.body,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            background: `${config.color}15`,
            padding: '3px 10px',
            borderRadius: 6,
          }}
        >
          {config.label}
        </span>
      </div>

      {/* Occupancy Display */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 6,
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontSize: 32,
            fontWeight: 800,
            fontFamily: F.heading,
            color: config.color,
            lineHeight: 1,
          }}
        >
          {occupancy}
        </span>
        <span
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: config.color,
            fontFamily: F.heading,
            opacity: 0.7,
          }}
        >
          %
        </span>
        <span
          style={{
            fontSize: 11,
            color: C.textMuted,
            fontFamily: F.body,
            marginLeft: 'auto',
          }}
        >
          {gate.zone} Zone
        </span>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          height: 8,
          borderRadius: 4,
          background: 'rgba(255,255,255,0.06)',
          overflow: 'hidden',
          position: 'relative',
        }}
        role="progressbar"
        aria-valuenow={occupancy}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${gate.name} occupancy ${occupancy}%`}
      >
        <div
          style={{
            height: '100%',
            width: `${occupancy}%`,
            borderRadius: 4,
            background: `linear-gradient(90deg, ${config.color}, ${config.color}bb)`,
            transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      </div>

      {/* Capacity info */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 8,
          fontSize: 10,
          color: C.textMuted,
          fontFamily: F.body,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Users size={10} /> Capacity: {gate.capacity.toLocaleString()}
        </span>
        <span>
          ~{Math.round(gate.capacity * occupancy / 100).toLocaleString()} inside
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function CrowdAlerts({ gates }) {
  useKeyframes();

  const [alert, setAlert] = useState(null);
  const [alertLoading, setAlertLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  /* — Derived stats — */
  const stats = useMemo(() => {
    const ok = gates.filter(g => g.status === 'ok').length;
    const warning = gates.filter(g => g.status === 'warning').length;
    const critical = gates.filter(g => g.status === 'critical').length;
    const avgOccupancy = gates.length > 0
      ? Math.round(gates.reduce((s, g) => s + g.occupancy, 0) / gates.length)
      : 0;
    return { ok, warning, critical, avgOccupancy };
  }, [gates]);

  /* — Fetch alert — */
  const fetchAlert = useCallback(async () => {
    setAlertLoading(true);
    try {
      const result = await generateCrowdAlert(gates);
      setAlert(result);
    } catch (err) {
      console.warn('CrowdAlerts: AI alert fetch failed:', err);
      setAlert({ hasAlert: false, severity: 'ok', fanMessage: '' });
    } finally {
      setAlertLoading(false);
      setLastUpdated(new Date());
    }
  }, [gates]);

  /* — Auto refresh every 30s — */
  useEffect(() => {
    fetchAlert();
    intervalRef.current = setInterval(fetchAlert, ALERT_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [fetchAlert]);

  const timeStr = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '—';

  return (
    <section style={{ fontFamily: F.body, color: C.textPrimary }}>
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 11,
              background: `linear-gradient(135deg, ${C.green}, ${C.greenBright})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Shield size={22} color="#fff" strokeWidth={2.2} />
          </div>
          <div>
            <h2
              id="crowd-heading"
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
                fontFamily: F.heading,
                color: C.textPrimary,
              }}
            >
              Live Crowd Monitor
            </h2>
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2, fontFamily: F.body }}>
              AI-powered • Updated: {timeStr} • Refreshes every 30s
            </div>
          </div>
        </div>

        <button
          id="crowd-refresh-btn"
          onClick={fetchAlert}
          disabled={alertLoading}
          aria-label="Refresh crowd alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            borderRadius: 10,
            border: `1px solid ${C.border}`,
            background: 'transparent',
            color: alertLoading ? C.textMuted : C.textSecondary,
            fontSize: 12,
            fontWeight: 600,
            fontFamily: F.body,
            cursor: alertLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            if (!alertLoading) {
              e.currentTarget.style.borderColor = C.green;
              e.currentTarget.style.color = C.green;
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = C.border;
            e.currentTarget.style.color = alertLoading ? C.textMuted : C.textSecondary;
          }}
        >
          <RefreshCw
            size={14}
            style={{ animation: alertLoading ? 'crowd-spin 1s linear infinite' : 'none' }}
          />
          {alertLoading ? 'Analyzing...' : 'Refresh'}
        </button>
      </div>

      {/* ── Summary Stats ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12,
          marginBottom: 22,
        }}
      >
        {[
          { label: 'Avg Occupancy', value: `${stats.avgOccupancy}%`, color: stats.avgOccupancy > 75 ? C.orange : C.green, Icon: TrendingUp },
          { label: 'Normal', value: stats.ok, color: C.green, Icon: CheckCircle },
          { label: 'Busy', value: stats.warning, color: C.orange, Icon: AlertTriangle },
          { label: 'Critical', value: stats.critical, color: C.red, Icon: XCircle },
        ].map(stat => (
          <div
            key={stat.label}
            style={{
              padding: '14px 16px',
              borderRadius: 12,
              background: C.surface,
              border: `1px solid ${C.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: `${stat.color}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <stat.Icon size={17} color={stat.color} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: C.textSecondary, fontWeight: 500, fontFamily: F.body }}>
                {stat.label}
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  fontFamily: F.heading,
                  color: C.textPrimary,
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── AI Alert Banner ── */}
      <AlertBanner alert={alert} loading={alertLoading} />

      {/* ── Gate Grid ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 14,
          marginBottom: 24,
        }}
      >
        {gates.map(gate => (
          <GateCard key={gate.id} gate={gate} />
        ))}
      </div>

      {/* ── Legend ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 28,
          padding: '16px 0',
          borderTop: `1px solid ${C.border}`,
          flexWrap: 'wrap',
        }}
      >
        {[
          { Icon: CheckCircle, color: C.green, label: 'Normal (< 70%)' },
          { Icon: AlertTriangle, color: C.orange, label: 'Busy (70–85%)' },
          { Icon: XCircle, color: C.red, label: 'Critical (> 85%)' },
        ].map(item => (
          <div
            key={item.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              color: C.textSecondary,
              fontFamily: F.body,
            }}
          >
            <item.Icon size={14} color={item.color} strokeWidth={2.2} />
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: item.color,
                display: 'inline-block',
              }}
            />
            {item.label}
          </div>
        ))}
      </div>
    </section>
  );
}
