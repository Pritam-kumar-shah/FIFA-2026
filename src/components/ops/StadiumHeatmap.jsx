import React, { useMemo } from 'react';
import { Users, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Colour & font constants                                           */
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
/*  Status helpers                                                     */
/* ------------------------------------------------------------------ */
const STATUS_COLOR = {
  ok: C.green,
  warning: C.orange,
  critical: C.red,
};

const STATUS_BG = {
  ok: 'rgba(0,165,80,0.12)',
  warning: 'rgba(246,153,63,0.12)',
  critical: 'rgba(229,62,62,0.15)',
};

const pct = (occ, cap) => (cap > 0 ? Math.round((occ / cap) * 100) : 0);

/* ------------------------------------------------------------------ */
/*  Inject keyframes once                                              */
/* ------------------------------------------------------------------ */
function useKeyframes() {
  React.useEffect(() => {
    const id = 'heatmap-keyframes';
    if (document.getElementById(id)) return;
    const s = document.createElement('style');
    s.id = id;
    s.textContent = `
      @keyframes hm-pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(229,62,62,0.45); }
        50% { box-shadow: 0 0 14px 4px rgba(229,62,62,0.25); }
      }
      @keyframes hm-shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `;
    document.head.appendChild(s);
  }, []);
}

/* ------------------------------------------------------------------ */
/*  Stat Card                                                          */
/* ------------------------------------------------------------------ */
function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div
      style={{
        flex: '1 1 0',
        minWidth: 150,
        padding: '16px 18px',
        borderRadius: 14,
        background: C.surface,
        border: `1px solid ${C.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 11,
          background: `${accent}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={20} color={accent} strokeWidth={2} />
      </div>
      <div>
        <div
          style={{
            fontSize: 11,
            color: C.textSecondary,
            fontFamily: F.body,
            fontWeight: 500,
            marginBottom: 2,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 22,
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
/*  Gate Cell (placed on the oval)                                     */
/* ------------------------------------------------------------------ */
function GateCell({ gate, positionStyle }) {
  const color = STATUS_COLOR[gate.status] || C.green;
  const isPulse = gate.status === 'critical';
  const occupancy = pct(gate.occupancy, gate.capacity);

  return (
    <div
      id={`heatmap-gate-${gate.id}`}
      style={{
        position: 'absolute',
        ...positionStyle,
        width: 58,
        height: 58,
        borderRadius: 13,
        background: STATUS_BG[gate.status] || STATUS_BG.ok,
        border: `2px solid ${color}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        animation: isPulse ? 'hm-pulse 1.6s ease-in-out infinite' : 'none',
        cursor: 'default',
        zIndex: 5,
      }}
      title={`${gate.name} — ${occupancy}%`}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: C.textSecondary,
          fontFamily: F.body,
          lineHeight: 1,
        }}
      >
        {gate.name.replace('Gate ', 'G')}
      </span>
      <span
        style={{
          fontSize: 16,
          fontWeight: 800,
          fontFamily: F.heading,
          color,
          lineHeight: 1.3,
        }}
      >
        {occupancy}%
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Progress Row (below the oval)                                      */
/* ------------------------------------------------------------------ */
function GateRow({ gate }) {
  const occupancy = pct(gate.occupancy, gate.capacity);
  const color = STATUS_COLOR[gate.status] || C.green;

  return (
    <div
      id={`heatmap-row-${gate.id}`}
      style={{
        padding: '12px 14px',
        borderRadius: 12,
        background: C.surface,
        border: `1px solid ${C.border}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            fontFamily: F.body,
            color: C.textPrimary,
          }}
        >
          {gate.name}
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color,
            fontFamily: F.heading,
            padding: '2px 8px',
            borderRadius: 6,
            background: `${color}18`,
          }}
        >
          {occupancy}%
        </span>
      </div>

      {/* progress bar */}
      <div
        style={{
          height: 6,
          borderRadius: 3,
          background: 'rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${occupancy}%`,
            borderRadius: 3,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            transition: 'width 0.6s ease',
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 5,
          fontSize: 10,
          color: C.textMuted,
          fontFamily: F.body,
        }}
      >
        <span>{gate.zone}</span>
        <span>
          {gate.occupancy.toLocaleString()} / {gate.capacity.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function StadiumHeatmap({ gates = [] }) {
  useKeyframes();

  /* — derived stats — */
  const totalFans = useMemo(
    () => gates.reduce((s, g) => s + g.occupancy, 0),
    [gates],
  );
  const totalCapacity = useMemo(
    () => gates.reduce((s, g) => s + g.capacity, 0),
    [gates],
  );
  const avgOccupancy = totalCapacity > 0 ? Math.round((totalFans / totalCapacity) * 100) : 0;
  const criticalCount = useMemo(
    () => gates.filter((g) => g.status === 'critical').length,
    [gates],
  );
  const okCount = useMemo(
    () => gates.filter((g) => g.status === 'ok').length,
    [gates],
  );

  /* — map gates to N/S/E/W positions — */
  const positionMap = useMemo(() => {
    const positions = [
      // top row (North)
      { top: -10, left: '50%', transform: 'translateX(-70%)' },
      { top: -10, left: '50%', transform: 'translateX(10%)' },
      // right (East)
      { top: '50%', right: -10, transform: 'translateY(-70%)' },
      { top: '50%', right: -10, transform: 'translateY(10%)' },
      // bottom (South)
      { bottom: -10, left: '50%', transform: 'translateX(-70%)' },
      { bottom: -10, left: '50%', transform: 'translateX(10%)' },
      // left (West)
      { top: '50%', left: -10, transform: 'translateY(-70%)' },
      { top: '50%', left: -10, transform: 'translateY(10%)' },
    ];
    return positions;
  }, []);

  /* ---- Styles ---- */
  const sectionStyle = {
    fontFamily: F.body,
    color: C.textPrimary,
  };

  return (
    <section style={sectionStyle}>
      {/* ── Stat Cards ── */}
      <div
        style={{
          display: 'flex',
          gap: 14,
          flexWrap: 'wrap',
          marginBottom: 28,
        }}
      >
        <StatCard
          icon={Users}
          label="Total Fans"
          value={totalFans.toLocaleString()}
          accent={C.green}
        />
        <StatCard
          icon={Activity}
          label="Avg Occupancy"
          value={`${avgOccupancy}%`}
          accent={C.gold}
        />
        <StatCard
          icon={AlertTriangle}
          label="Critical Gates"
          value={criticalCount}
          accent={C.red}
        />
        <StatCard
          icon={CheckCircle}
          label="Gates OK"
          value={okCount}
          accent={C.greenBright}
        />
      </div>

      {/* ── Oval Stadium Visualization ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: 32,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: 420,
            height: 290,
            borderRadius: '50%',
            border: `2px solid ${C.border}`,
            background: 'rgba(255,255,255,0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Pitch */}
          <div
            style={{
              width: 180,
              height: 110,
              borderRadius: 8,
              border: `1.5px solid ${C.green}55`,
              background: `linear-gradient(135deg, rgba(0,165,80,0.06), rgba(0,165,80,0.02))`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}
          >
            <span
              style={{
                fontSize: 10,
                color: C.textMuted,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Pitch
            </span>
            <span
              style={{
                fontSize: 18,
                fontWeight: 800,
                fontFamily: F.heading,
                color: C.green,
                marginTop: 2,
              }}
            >
              {totalFans.toLocaleString()}
            </span>
            <span style={{ fontSize: 10, color: C.textMuted }}>fans inside</span>
          </div>

          {/* Gate Cells */}
          {gates.slice(0, 8).map((gate, i) => (
            <GateCell
              key={gate.id}
              gate={gate}
              positionStyle={positionMap[i] || {}}
            />
          ))}

          {/* Cardinal labels */}
          {[
            { label: 'N', style: { top: 22, left: '50%', transform: 'translateX(-50%)' } },
            { label: 'S', style: { bottom: 22, left: '50%', transform: 'translateX(-50%)' } },
            { label: 'E', style: { top: '50%', right: 24, transform: 'translateY(-50%)' } },
            { label: 'W', style: { top: '50%', left: 24, transform: 'translateY(-50%)' } },
          ].map(({ label, style }) => (
            <span
              key={label}
              style={{
                position: 'absolute',
                ...style,
                fontSize: 10,
                fontWeight: 700,
                color: C.textMuted,
                fontFamily: F.heading,
                letterSpacing: '0.06em',
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Legend ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 24,
          marginBottom: 28,
          fontSize: 11,
          color: C.textSecondary,
          fontFamily: F.body,
        }}
      >
        {[
          { color: C.green, label: '< 70%' },
          { color: C.orange, label: '70–85%' },
          { color: C.red, label: '> 85%' },
        ].map(({ color, label }) => (
          <span
            key={label}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: color,
                display: 'inline-block',
              }}
            />
            {label}
          </span>
        ))}
      </div>

      {/* ── Gate Grid ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 12,
        }}
      >
        {gates.map((gate) => (
          <GateRow key={gate.id} gate={gate} />
        ))}
      </div>
    </section>
  );
}
