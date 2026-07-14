import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Plus, Clock, MapPin, Loader, X, Zap } from 'lucide-react';
import { analyzeIncident } from '../../services/gemini';

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
/*  Priority & Category maps                                          */
/* ------------------------------------------------------------------ */
const PRIORITY_META = {
  critical: { color: C.red, bg: 'rgba(229,62,62,0.15)', label: 'Critical' },
  high: { color: C.orange, bg: 'rgba(246,153,63,0.14)', label: 'High' },
  medium: { color: C.yellow, bg: 'rgba(236,201,75,0.14)', label: 'Medium' },
  low: { color: C.green, bg: 'rgba(0,165,80,0.14)', label: 'Low' },
};

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

const CATEGORY_ICON = {
  medical: '🩺',
  security: '🔒',
  crowd: '👥',
  facility: '🏗️',
  lost_found: '🔍',
  other: '📋',
};

const ZONE_OPTIONS = [
  'North Stand',
  'South Stand',
  'East Wing',
  'West Wing',
  'Gate A',
  'Gate B',
  'Gate C',
  'Gate D',
  'VIP Lounge',
  'Concourse',
  'Parking Lot',
  'Media Center',
];

const FILTER_OPTIONS = ['all', 'critical', 'high', 'medium', 'low'];

/* ------------------------------------------------------------------ */
/*  Keyframes                                                          */
/* ------------------------------------------------------------------ */
function useKeyframes() {
  React.useEffect(() => {
    const id = 'incident-keyframes';
    if (document.getElementById(id)) return;
    const s = document.createElement('style');
    s.id = id;
    s.textContent = `
      @keyframes inc-fadein {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes inc-spin {
        to { transform: rotate(360deg); }
      }
      @keyframes inc-overlay {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
    `;
    document.head.appendChild(s);
  }, []);
}

/* ------------------------------------------------------------------ */
/*  Filter Pill Button                                                 */
/* ------------------------------------------------------------------ */
function FilterPill({ filter, active, onClick }) {
  const isActive = filter === active;
  const meta = PRIORITY_META[filter];
  const accent = meta ? meta.color : C.textSecondary;

  return (
    <button
      id={`incident-filter-${filter}`}
      onClick={onClick}
      style={{
        padding: '6px 14px',
        borderRadius: 8,
        border: isActive ? `1.5px solid ${accent}` : `1px solid ${C.border}`,
        background: isActive ? `${accent}18` : 'transparent',
        color: isActive ? accent : C.textSecondary,
        fontSize: 12,
        fontWeight: 600,
        fontFamily: F.body,
        cursor: 'pointer',
        textTransform: 'capitalize',
        transition: 'all 0.15s ease',
      }}
    >
      {filter === 'all' ? 'All' : PRIORITY_META[filter]?.label || filter}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Incident Card                                                      */
/* ------------------------------------------------------------------ */
function IncidentCard({ incident, onResolve }) {
  const pri = PRIORITY_META[incident.priority] || PRIORITY_META.low;
  const catIcon = CATEGORY_ICON[incident.category] || '📋';
  const ts =
    typeof incident.timestamp === 'string'
      ? incident.timestamp
      : new Date(incident.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

  return (
    <div
      id={`incident-card-${incident.id}`}
      style={{
        padding: '18px 20px',
        borderRadius: 14,
        background: C.surface,
        border: `1px solid ${C.border}`,
        animation: 'inc-fadein 0.35s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        {/* Category icon */}
        <span style={{ fontSize: 22, lineHeight: 1 }}>{catIcon}</span>

        {/* Priority badge */}
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

        {/* Category badge */}
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: C.textSecondary,
            background: C.surfaceHover,
            padding: '3px 10px',
            borderRadius: 6,
            fontFamily: F.body,
            textTransform: 'capitalize',
          }}
        >
          {(incident.category || 'other').replace('_', ' ')}
        </span>

        {/* Timestamp */}
        <span
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11,
            color: C.textMuted,
          }}
        >
          <Clock size={12} /> {ts}
        </span>
      </div>

      {/* AI Summary */}
      {incident.aiSummary && (
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: C.textPrimary,
            fontFamily: F.heading,
            lineHeight: 1.4,
          }}
        >
          {incident.aiSummary}
        </div>
      )}

      {/* Original text */}
      <div
        style={{
          fontSize: 13,
          color: C.textSecondary,
          lineHeight: 1.5,
          fontFamily: F.body,
        }}
      >
        {incident.text || incident.description}
      </div>

      {/* AI Suggested Action */}
      {incident.suggestedAction && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            background: 'rgba(0,165,80,0.08)',
            border: `1px solid rgba(0,165,80,0.18)`,
            fontSize: 12,
            color: C.greenBright,
            lineHeight: 1.5,
            fontFamily: F.body,
          }}
        >
          <span style={{ marginRight: 6 }}>🤖</span>
          <strong>AI Action:</strong> {incident.suggestedAction}
        </div>
      )}

      {/* Footer: zone, response time, resolve */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          flexWrap: 'wrap',
          marginTop: 2,
        }}
      >
        {incident.zone && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              color: C.textMuted,
            }}
          >
            <MapPin size={12} /> {incident.zone}
          </span>
        )}

        {incident.responseTime && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              color: C.textMuted,
            }}
          >
            <Clock size={12} /> {incident.responseTime}
          </span>
        )}

        <button
          id={`incident-resolve-${incident.id}`}
          onClick={() => onResolve?.(incident.id)}
          style={{
            marginLeft: 'auto',
            padding: '5px 14px',
            borderRadius: 8,
            border: `1px solid ${C.border}`,
            background: 'transparent',
            color: C.textSecondary,
            fontSize: 11,
            fontWeight: 600,
            fontFamily: F.body,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = C.green;
            e.currentTarget.style.color = C.green;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = C.border;
            e.currentTarget.style.color = C.textSecondary;
          }}
        >
          Resolve
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Report Modal                                                       */
/* ------------------------------------------------------------------ */
function ReportModal({ onClose, onSubmit }) {
  const [zone, setZone] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!description.trim()) {
        setError('Please describe the incident.');
        return;
      }
      setLoading(true);
      setError('');

      try {
        const analysis = await analyzeIncident(description);
        onSubmit?.({
          id: `inc-${Date.now()}`,
          text: description,
          zone: zone || 'Unknown',
          timestamp: new Date().toISOString(),
          ...(analysis || {}),
        });
        onClose?.();
      } catch (err) {
        console.error('Incident analysis failed:', err);
        setError('AI analysis failed — submitting without AI insights.');
        onSubmit?.({
          id: `inc-${Date.now()}`,
          text: description,
          zone: zone || 'Unknown',
          priority: 'medium',
          category: 'other',
          aiSummary: description,
          suggestedAction: 'Review manually and assign appropriate team.',
          timestamp: new Date().toISOString(),
        });
        onClose?.();
      } finally {
        setLoading(false);
      }
    },
    [description, zone, onClose, onSubmit],
  );

  const inputBase = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    border: `1px solid ${C.border}`,
    background: 'rgba(255,255,255,0.04)',
    color: C.textPrimary,
    fontSize: 13,
    fontFamily: F.body,
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div
      id="incident-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 500,
        animation: 'inc-overlay 0.2s ease',
      }}
    >
      <form
        id="incident-report-form"
        onSubmit={handleSubmit}
        style={{
          width: 440,
          maxWidth: '92vw',
          background: '#0e0e1a',
          border: `1px solid ${C.border}`,
          borderRadius: 18,
          padding: '28px 26px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        {/* Modal header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              fontFamily: F.heading,
              color: C.textPrimary,
            }}
          >
            Report Incident
          </h3>
          <button
            id="incident-modal-close"
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: C.textMuted,
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Zone select */}
        <div>
          <label
            htmlFor="incident-zone-select"
            style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 600,
              color: C.textSecondary,
              marginBottom: 6,
              fontFamily: F.body,
            }}
          >
            Zone
          </label>
          <select
            id="incident-zone-select"
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            style={{
              ...inputBase,
              appearance: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="" style={{ background: '#0e0e1a' }}>
              Select zone…
            </option>
            {ZONE_OPTIONS.map((z) => (
              <option key={z} value={z} style={{ background: '#0e0e1a' }}>
                {z}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="incident-description"
            style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 600,
              color: C.textSecondary,
              marginBottom: 6,
              fontFamily: F.body,
            }}
          >
            Description
          </label>
          <textarea
            id="incident-description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the incident in detail…"
            style={{
              ...inputBase,
              resize: 'vertical',
              minHeight: 90,
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{ fontSize: 12, color: C.red, fontFamily: F.body }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          id="incident-submit-btn"
          type="submit"
          disabled={loading}
          style={{
            padding: '11px 0',
            borderRadius: 10,
            border: 'none',
            background: loading
              ? C.textMuted
              : `linear-gradient(135deg, ${C.green}, ${C.greenBright})`,
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
            fontFamily: F.heading,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'opacity 0.15s ease',
          }}
        >
          {loading ? (
            <>
              <Loader
                size={16}
                style={{ animation: 'inc-spin 1s linear infinite' }}
              />
              Analyzing with AI…
            </>
          ) : (
            <>
              <Zap size={16} />
              Submit &amp; Analyze
            </>
          )}
        </button>
      </form>
    </div>
  );
}


/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function IncidentFeed({ incidents = [], onAddIncident }) {
  useKeyframes();
  const [filter, setFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);

  /* Sort by priority then filter */
  const sorted = useMemo(() => {
    const list = [...incidents].sort(
      (a, b) =>
        (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99),
    );
    if (filter === 'all') return list;
    return list.filter((i) => i.priority === filter);
  }, [incidents, filter]);

  return (
    <section style={{ fontFamily: F.body, color: C.textPrimary }}>
      {/* ── Toolbar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
          marginBottom: 22,
        }}
      >
        {/* Filters */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
          {FILTER_OPTIONS.map((f) => (
            <FilterPill
              key={f}
              filter={f}
              active={filter}
              onClick={() => setFilter(f)}
            />
          ))}
        </div>

        {/* Report button */}
        <button
          id="incident-report-btn"
          onClick={() => setModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 18px',
            borderRadius: 10,
            border: 'none',
            background: `linear-gradient(135deg, ${C.green}, ${C.greenBright})`,
            color: '#fff',
            fontSize: 13,
            fontWeight: 700,
            fontFamily: F.heading,
            cursor: 'pointer',
            transition: 'opacity 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <Plus size={16} strokeWidth={2.5} />
          Report Incident
        </button>
      </div>

      {/* ── Count badge ── */}
      <div
        style={{
          fontSize: 12,
          color: C.textMuted,
          marginBottom: 14,
          fontWeight: 500,
        }}
      >
        {sorted.length} incident{sorted.length !== 1 ? 's' : ''}{' '}
        {filter !== 'all' ? `(${filter})` : ''}
      </div>

      {/* ── Incident List ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {sorted.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: 40,
              color: C.textMuted,
              fontSize: 14,
            }}
          >
            No incidents to display.
          </div>
        ) : (
          sorted.map((inc) => (
            <IncidentCard
              key={inc.id}
              incident={inc}
              onResolve={(id) => {
                /* could be lifted to parent */
              }}
            />
          ))
        )}
      </div>

      {modalOpen && (
        <ReportModal
          onClose={() => setModalOpen(false)}
          onSubmit={(data) => onAddIncident?.(data)}
        />
      )}
    </section>
  );
}

IncidentFeed.propTypes = {
  incidents: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      summary: PropTypes.string,
      text: PropTypes.string,
      priority: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      zone: PropTypes.string,
    })
  ).isRequired,
  onAddIncident: PropTypes.func.isRequired,
};
