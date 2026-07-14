import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { ArrowLeft, Users, AlertTriangle, Activity, Zap } from 'lucide-react';
import Sidebar from './Sidebar';
import StadiumHeatmap from './StadiumHeatmap';
import IncidentFeed from './IncidentFeed';
import AIRecommendations from './AIRecommendations';
import useGateData from '../../hooks/useGateData';

/* ------------------------------------------------------------------ */
/*  Design-system constants                                            */
/* ------------------------------------------------------------------ */
const COLOR = {
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

const FONT = {
  heading: "'Outfit', sans-serif",
  body: "'Inter', sans-serif",
};

/* ------------------------------------------------------------------ */
/*  Panel titles                                                       */
/* ------------------------------------------------------------------ */
const PANEL_TITLES = {
  overview: 'Operations Overview',
  heatmap: 'Crowd Heatmap',
  incidents: 'Incident Management',
  ai: 'AI Command Center',
};

/* ------------------------------------------------------------------ */
/*  Stat Card (used in overview panel)                                 */
/* ------------------------------------------------------------------ */
function StatCard({ id, icon: Icon, label, value, accent }) {
  return (
    <div
      id={id}
      style={{
        flex: '1 1 200px',
        background: COLOR.surface,
        border: `1px solid ${COLOR.border}`,
        borderRadius: 14,
        padding: '22px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: `${accent}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={22} color={accent} strokeWidth={2} />
      </div>
      <div>
        <div
          style={{
            fontFamily: FONT.heading,
            fontSize: 26,
            fontWeight: 700,
            color: COLOR.textPrimary,
            lineHeight: 1.1,
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: 12,
            color: COLOR.textSecondary,
            marginTop: 2,
            fontWeight: 500,
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Main OpsApp component                                              */
/* ================================================================== */
export default function OpsApp({ onBack }) {
  const { gates } = useGateData(5000);
  const [incidents, setIncidents] = useState([]);
  const [activePanel, setActivePanel] = useState('overview');

  /* ── Derived stats for Sidebar ── */
  const stats = useMemo(() => {
    const totalFans = gates.reduce(
      (sum, g) => sum + Math.round((g.occupancy / 100) * g.capacity),
      0,
    );
    const criticalGates = gates.filter((g) => g.status === 'critical').length;
    const openIncidents = incidents.length;
    return { totalFans, criticalGates, openIncidents };
  }, [gates, incidents]);

  /* ── Overview derived stats ── */
  const avgOccupancy = useMemo(() => {
    if (!gates.length) return 0;
    return Math.round(gates.reduce((s, g) => s + g.occupancy, 0) / gates.length);
  }, [gates]);

  const warningGates = useMemo(
    () => gates.filter((g) => g.status === 'warning').length,
    [gates],
  );

  /* ── Incident handler ── */
  const handleAddIncident = useCallback((incident) => {
    setIncidents((prev) => [
      {
        ...incident,
        id: incident.id || `INC-${Date.now()}`,
        timestamp: incident.timestamp || new Date().toISOString(),
      },
      ...prev,
    ]);
  }, []);

  /* ── Inline styles ── */
  const styles = useMemo(
    () => ({
      wrapper: {
        minHeight: '100vh',
        background: COLOR.bg,
        fontFamily: FONT.body,
        color: COLOR.textPrimary,
      },
      main: {
        marginLeft: 220,
        padding: 28,
        minHeight: '100vh',
      },
      header: {
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        marginBottom: 28,
      },
      backBtn: {
        width: 38,
        height: 38,
        borderRadius: 10,
        border: `1px solid ${COLOR.border}`,
        background: COLOR.surface,
        color: COLOR.textSecondary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        flexShrink: 0,
      },
      title: {
        fontFamily: FONT.heading,
        fontSize: 22,
        fontWeight: 700,
        color: COLOR.textPrimary,
        letterSpacing: '-0.02em',
      },
      cardsRow: {
        display: 'flex',
        gap: 16,
        flexWrap: 'wrap',
        marginBottom: 28,
      },
      miniHeatmapWrap: {
        background: COLOR.surface,
        border: `1px solid ${COLOR.border}`,
        borderRadius: 14,
        padding: 20,
      },
      miniHeatmapTitle: {
        fontFamily: FONT.heading,
        fontWeight: 600,
        fontSize: 15,
        color: COLOR.textPrimary,
        marginBottom: 14,
      },
      miniGateRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '7px 0',
        borderBottom: `1px solid ${COLOR.border}`,
        fontSize: 13,
      },
      gateBar: {
        height: 6,
        borderRadius: 3,
        flex: 1,
        background: 'rgba(255,255,255,0.06)',
        overflow: 'hidden',
      },
    }),
    [],
  );

  return (
    <div style={styles.wrapper}>
      {/* ── Sidebar ── */}
      <Sidebar
        active={activePanel}
        setActive={setActivePanel}
        stats={stats}
      />

      {/* ── Main content ── */}
      <div style={styles.main}>
        {/* ── Header ── */}
        <div style={styles.header}>
          <button
            id="ops-back-btn"
            style={styles.backBtn}
            onClick={onBack}
            aria-label="Go back to landing page"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = COLOR.surfaceHover;
              e.currentTarget.style.color = COLOR.textPrimary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = COLOR.surface;
              e.currentTarget.style.color = COLOR.textSecondary;
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <h1 style={styles.title}>{PANEL_TITLES[activePanel] || 'Dashboard'}</h1>
        </div>

        {/* ── Overview Panel ── */}
        {activePanel === 'overview' && (
          <div id="ops-overview-panel">
            {/* Stat cards */}
            <div style={styles.cardsRow}>
              <StatCard
                id="stat-total-fans"
                icon={Users}
                label="Total Fans Inside"
                value={stats.totalFans.toLocaleString()}
                accent={COLOR.green}
              />
              <StatCard
                id="stat-avg-occupancy"
                icon={Activity}
                label="Avg Occupancy"
                value={`${avgOccupancy}%`}
                accent={COLOR.gold}
              />
              <StatCard
                id="stat-critical-gates"
                icon={AlertTriangle}
                label="Critical Gates"
                value={stats.criticalGates}
                accent={COLOR.red}
              />
              <StatCard
                id="stat-open-incidents"
                icon={Zap}
                label="Open Incidents"
                value={stats.openIncidents}
                accent={COLOR.orange}
              />
            </div>

            {/* Mini heatmap summary */}
            <div style={styles.miniHeatmapWrap}>
              <div style={styles.miniHeatmapTitle}>Gate Occupancy Summary</div>
              {gates.map((g) => (
                <div key={g.id} style={styles.miniGateRow}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: g.color,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ minWidth: 140, color: COLOR.textSecondary }}>
                    {g.name}
                  </span>
                  <div style={styles.gateBar}>
                    <div
                      style={{
                        height: '100%',
                        width: `${g.occupancy}%`,
                        borderRadius: 3,
                        background: g.color,
                        transition: 'width 0.6s ease',
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontFamily: FONT.heading,
                      fontWeight: 600,
                      fontSize: 13,
                      minWidth: 38,
                      textAlign: 'right',
                      color: g.status === 'critical' ? COLOR.red : COLOR.textPrimary,
                    }}
                  >
                    {g.occupancy}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Heatmap Panel ── */}
        {activePanel === 'heatmap' && (
          <div id="ops-heatmap-panel">
            <StadiumHeatmap gates={gates} />
          </div>
        )}

        {/* ── Incidents Panel ── */}
        {activePanel === 'incidents' && (
          <div id="ops-incidents-panel">
            <IncidentFeed incidents={incidents} onAddIncident={handleAddIncident} />
          </div>
        )}

        {/* ── AI Panel ── */}
        {activePanel === 'ai' && (
          <div id="ops-ai-panel">
            <AIRecommendations gates={gates} incidents={incidents} />
          </div>
        )}
      </div>
    </div>
  );
}

OpsApp.propTypes = {
  onBack: PropTypes.func.isRequired,
};
