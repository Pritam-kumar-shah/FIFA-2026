import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { Zap, RefreshCw, Clock, Users, Shield } from 'lucide-react';
import { generateStaffRecommendations } from '../../services/gemini';

/* ------------------------------------------------------------------ */
/*  Colour / font constants                                           */
/* ------------------------------------------------------------------ */
const C = {
  bg: '#06060f',
  surface: 'rgba(255,255,255,0.04)',
  surfaceAlt: 'rgba(255,255,255,0.06)',
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
/*  Priority styling                                                   */
/* ------------------------------------------------------------------ */
const PRIORITY = {
  critical: { emoji: '🔴', color: C.red, bg: 'rgba(229,62,62,0.14)', label: 'Critical' },
  high: { emoji: '🟠', color: C.orange, bg: 'rgba(246,153,63,0.14)', label: 'High' },
  medium: { emoji: '🟡', color: C.yellow, bg: 'rgba(236,201,75,0.14)', label: 'Medium' },
  low: { emoji: '🟢', color: C.green, bg: 'rgba(0,165,80,0.14)', label: 'Low' },
};

/* ------------------------------------------------------------------ */
/*  Fallback data if the API fails                                     */
/* ------------------------------------------------------------------ */
const FALLBACK_RECOMMENDATIONS = [
  {
    id: 'fb-1',
    priority: 'high',
    action: 'Deploy additional stewards to Gate A — occupancy trending above 85 %.',
    rationale:
      'Gate A has shown a 12 % increase in throughput over the last 15 minutes. If unchecked, it will breach critical capacity within 20 minutes.',
    timeframe: 'Next 15 min',
    assignTo: 'Crowd-Control Team',
  },
  {
    id: 'fb-2',
    priority: 'medium',
    action: 'Open auxiliary gates at South Stand to redistribute fan flow.',
    rationale:
      'Current ingress modeling shows 70 % of fans entering from the north. Spreading entry points will reduce average wait time by ~4 minutes.',
    timeframe: 'Next 30 min',
    assignTo: 'Gate Operations',
  },
  {
    id: 'fb-3',
    priority: 'low',
    action: 'Schedule hydration station restocks at East concourse.',
    rationale:
      'Predicted temperature of 29 °C and high crowd density indicate increased demand. Proactive restocking avoids service gaps at half-time.',
    timeframe: 'Before half-time',
    assignTo: 'Facilities Team',
  },
];

/* ------------------------------------------------------------------ */
/*  Auto-refresh interval (ms) — 2 minutes                            */
/* ------------------------------------------------------------------ */
const REFRESH_INTERVAL = 2 * 60 * 1000;

/* ------------------------------------------------------------------ */
/*  Inject keyframes                                                   */
/* ------------------------------------------------------------------ */
function useKeyframes() {
  useEffect(() => {
    const id = 'airec-keyframes';
    if (document.getElementById(id)) return;
    const s = document.createElement('style');
    s.id = id;
    s.textContent = `
      @keyframes airec-shimmer {
        0%   { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      @keyframes airec-spin {
        to { transform: rotate(360deg); }
      }
      @keyframes airec-fadein {
        from { opacity: 0; transform: translateY(6px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(s);
  }, []);
}

/* ------------------------------------------------------------------ */
/*  Shimmer Placeholder                                                */
/* ------------------------------------------------------------------ */
function ShimmerCard() {
  const bar = (w, h = 12) => ({
    width: w,
    height: h,
    borderRadius: 6,
    background:
      'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
    backgroundSize: '200% 100%',
    animation: 'airec-shimmer 1.6s ease infinite',
  });

  return (
    <div
      style={{
        padding: '20px 22px',
        borderRadius: 14,
        background: C.surface,
        border: `1px solid ${C.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={bar(60, 22)} />
        <div style={bar(80, 18)} />
      </div>
      <div style={bar('100%', 16)} />
      <div style={bar('85%', 14)} />
      <div style={bar('60%', 14)} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Context Summary Card                                               */
/* ------------------------------------------------------------------ */
function ContextCard({ icon: Icon, label, value, accent }) {
  return (
    <div
      style={{
        flex: '1 1 0',
        minWidth: 140,
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
          width: 36,
          height: 36,
          borderRadius: 10,
          background: `${accent}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={18} color={accent} strokeWidth={2} />
      </div>
      <div>
        <div
          style={{
            fontSize: 10,
            color: C.textSecondary,
            fontFamily: F.body,
            fontWeight: 500,
            marginBottom: 1,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 20,
            fontFamily: F.heading,
            fontWeight: 700,
            color: C.textPrimary,
            lineHeight: 1,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Recommendation Card                                                */
/* ------------------------------------------------------------------ */
function RecCard({ rec, onAcknowledge }) {
  const pri = PRIORITY[rec.priority] || PRIORITY.medium;

  return (
    <div
      id={`airec-card-${rec.id}`}
      style={{
        padding: '20px 22px',
        borderRadius: 14,
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderLeft: `4px solid ${pri.color}`,
        animation: 'airec-fadein 0.35s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>{pri.emoji}</span>

        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: pri.color,
            background: pri.bg,
            padding: '3px 10px',
            borderRadius: 6,
            fontFamily: F.body,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {pri.label}
        </span>

        {rec.timeframe && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              color: C.textMuted,
              marginLeft: 'auto',
            }}
          >
            <Clock size={12} /> {rec.timeframe}
          </span>
        )}
      </div>

      {/* Action */}
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          fontFamily: F.heading,
          color: C.textPrimary,
          lineHeight: 1.45,
        }}
      >
        {rec.action}
      </div>

      {/* Rationale */}
      {rec.rationale && (
        <div
          style={{
            fontSize: 13,
            color: C.textSecondary,
            lineHeight: 1.55,
            fontFamily: F.body,
          }}
        >
          {rec.rationale}
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          marginTop: 2,
        }}
      >
        {rec.assignTo && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: C.textSecondary,
              background: C.surfaceAlt,
              padding: '4px 12px',
              borderRadius: 20,
              fontFamily: F.body,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <Users size={12} color={C.textMuted} />
            {rec.assignTo}
          </span>
        )}

        <button
          id={`airec-ack-${rec.id}`}
          onClick={() => onAcknowledge?.(rec.id)}
          style={{
            marginLeft: 'auto',
            padding: '6px 16px',
            borderRadius: 8,
            border: `1px solid ${C.green}55`,
            background: 'rgba(0,165,80,0.08)',
            color: C.green,
            fontSize: 12,
            fontWeight: 600,
            fontFamily: F.body,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0,165,80,0.18)';
            e.currentTarget.style.borderColor = C.green;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0,165,80,0.08)';
            e.currentTarget.style.borderColor = `${C.green}55`;
          }}
        >
          <Shield size={13} />
          Acknowledge
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function AIRecommendations({ gates = [], incidents = [] }) {
  useKeyframes();

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [acknowledged, setAcknowledged] = useState(new Set());
  const intervalRef = useRef(null);

  /* — Derived context stats — */
  const gatesAnalyzed = gates.length;
  const openIncidents = incidents.length;
  const criticalGates = gates.filter((g) => g.status === 'critical').length;

  /* — Fetch recommendations — */
  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      const result = await generateStaffRecommendations(gates, incidents);
      if (Array.isArray(result) && result.length > 0) {
        setRecommendations(result.map((r, i) => ({ ...r, id: r.id || `rec-${i}` })));
      } else {
        throw new Error('Empty response');
      }
    } catch (err) {
      console.warn('AI recommendations fetch failed, using fallback:', err);
      setRecommendations(FALLBACK_RECOMMENDATIONS);
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  }, [gates, incidents]);

  /* — Initial load + auto-refresh — */
  useEffect(() => {
    fetchRecommendations();

    intervalRef.current = setInterval(fetchRecommendations, REFRESH_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [fetchRecommendations]);

  /* — Acknowledge handler — */
  const handleAcknowledge = useCallback((id) => {
    setAcknowledged((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  /* — Manual refresh — */
  const handleRefresh = useCallback(() => {
    setAcknowledged(new Set());
    fetchRecommendations();
  }, [fetchRecommendations]);

  /* — Time display — */
  const timeStr = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '—';

  /* — Visible recs (not acknowledged) — */
  const visibleRecs = recommendations.filter((r) => !acknowledged.has(r.id));

  return (
    <section style={{ fontFamily: F.body, color: C.textPrimary }}>
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 22,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
            }}
          >
            <Zap size={20} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
                fontFamily: F.heading,
                color: C.textPrimary,
              }}
            >
              AI Command Center
            </h2>
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
              Last updated: {timeStr} &middot; Auto-refreshes every 2 min
            </div>
          </div>
        </div>

        <button
          id="airec-refresh-btn"
          onClick={handleRefresh}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            borderRadius: 10,
            border: `1px solid ${C.border}`,
            background: 'transparent',
            color: loading ? C.textMuted : C.textSecondary,
            fontSize: 12,
            fontWeight: 600,
            fontFamily: F.body,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.borderColor = C.green;
              e.currentTarget.style.color = C.green;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = C.border;
            e.currentTarget.style.color = loading ? C.textMuted : C.textSecondary;
          }}
        >
          <RefreshCw
            size={14}
            style={{
              animation: loading ? 'airec-spin 1s linear infinite' : 'none',
            }}
          />
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* ── Context Summary ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12,
          marginBottom: 26,
        }}
      >
        <ContextCard
          icon={Shield}
          label="Gates Analyzed"
          value={gatesAnalyzed}
          accent={C.green}
        />
        <ContextCard
          icon={Zap}
          label="Open Incidents"
          value={openIncidents}
          accent={C.gold}
        />
        <ContextCard
          icon={Shield}
          label="Critical Gates"
          value={criticalGates}
          accent={criticalGates > 0 ? C.red : C.green}
        />
      </div>

      {/* ── Recommendation Cards ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {loading ? (
          <>
            <ShimmerCard />
            <ShimmerCard />
            <ShimmerCard />
          </>
        ) : visibleRecs.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: 40,
              color: C.textMuted,
              fontSize: 14,
              fontFamily: F.body,
            }}
          >
            ✅ All recommendations acknowledged. Refreshing in 2 min…
          </div>
        ) : (
          visibleRecs.map((rec) => (
            <RecCard
              key={rec.id}
              rec={rec}
              onAcknowledge={handleAcknowledge}
            />
          ))
        )}
      </div>
    </section>
  );
}

AIRecommendations.propTypes = {
  gates: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      zone: PropTypes.string.isRequired,
      occupancy: PropTypes.number.isRequired,
      status: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
    })
  ).isRequired,
  incidents: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      summary: PropTypes.string.isRequired,
      priority: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
    })
  ).isRequired,
};
