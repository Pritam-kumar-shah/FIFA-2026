import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Train, Bus, Car, Footprints, Leaf, Sparkles, TrendingDown, Clock, MapPin, Loader, Award } from 'lucide-react';
import { rankTransportOptions } from '../../services/gemini';

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
/*  Transport options data                                             */
/* ------------------------------------------------------------------ */
const TRANSPORT_OPTIONS = [
  { mode: 'Metro', duration: 25, distance: 8, co2: 45, icon: Train },
  { mode: 'Bus', duration: 35, distance: 10, co2: 85, icon: Bus },
  { mode: 'Rideshare', duration: 20, distance: 12, co2: 180, icon: Car },
  { mode: 'Walk + Metro', duration: 40, distance: 8, co2: 20, icon: Footprints },
];

/* ------------------------------------------------------------------ */
/*  Inject keyframes                                                   */
/* ------------------------------------------------------------------ */
function useKeyframes() {
  useEffect(() => {
    const id = 'transport-keyframes';
    if (document.getElementById(id)) return;
    const s = document.createElement('style');
    s.id = id;
    s.textContent = `
      @keyframes transport-fadein {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes transport-shine {
        0%   { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      @keyframes transport-spin {
        to { transform: rotate(360deg); }
      }
      @keyframes transport-bounce {
        0%, 100% { transform: translateY(0); }
        50%      { transform: translateY(-3px); }
      }
      @keyframes transport-rank-pop {
        0%   { transform: scale(0.5); opacity: 0; }
        60%  { transform: scale(1.15); }
        100% { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(s);
  }, []);
}

/* ------------------------------------------------------------------ */
/*  Eco-friendliness helpers                                           */
/* ------------------------------------------------------------------ */
function getEcoLevel(co2) {
  if (co2 <= 30) return { label: 'Excellent', color: C.greenBright, leaves: 3 };
  if (co2 <= 60) return { label: 'Great', color: C.green, leaves: 2 };
  if (co2 <= 100) return { label: 'Good', color: C.yellow, leaves: 1 };
  return { label: 'High', color: C.orange, leaves: 0 };
}

/* ------------------------------------------------------------------ */
/*  Transport Card (Before AI)                                         */
/* ------------------------------------------------------------------ */
function TransportCard({ option, maxCO2, index }) {
  const Icon = option.icon;
  const eco = getEcoLevel(option.co2);
  const co2Pct = maxCO2 > 0 ? (option.co2 / maxCO2) * 100 : 0;

  return (
    <div
      id={`transport-card-${option.mode.toLowerCase().replace(/\s+/g, '-')}`}
      style={{
        padding: '20px 22px',
        borderRadius: 16,
        background: C.surface,
        border: `1px solid ${C.border}`,
        animation: `transport-fadein 0.4s ease ${index * 0.08}s both`,
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = C.surfaceHover;
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = C.surface;
        e.currentTarget.style.borderColor = C.border;
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: `${eco.color}15`,
            border: `1px solid ${eco.color}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={22} color={eco.color} strokeWidth={2} />
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: C.textPrimary,
              fontFamily: F.heading,
            }}
          >
            {option.mode}
          </div>
          <div style={{ fontSize: 11, color: C.textMuted, fontFamily: F.body, display: 'flex', gap: 10 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Clock size={10} /> {option.duration} min
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <MapPin size={10} /> {option.distance} km
            </span>
          </div>
        </div>
        {/* Eco badge */}
        {eco.leaves > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              padding: '4px 10px',
              borderRadius: 20,
              background: `${eco.color}15`,
              border: `1px solid ${eco.color}30`,
            }}
          >
            {Array.from({ length: eco.leaves }).map((_, i) => (
              <Leaf key={i} size={12} color={eco.color} fill={eco.color} strokeWidth={1.5} />
            ))}
            <span style={{ fontSize: 10, fontWeight: 600, color: eco.color, fontFamily: F.body, marginLeft: 2 }}>
              {eco.label}
            </span>
          </div>
        )}
      </div>

      {/* CO2 Bar */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: C.textSecondary, fontFamily: F.body }}>CO₂ Emissions</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: eco.color, fontFamily: F.heading }}>
            {option.co2}g
          </span>
        </div>
        <div
          style={{
            height: 6,
            borderRadius: 3,
            background: 'rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}
          role="progressbar"
          aria-valuenow={option.co2}
          aria-valuemax={maxCO2}
          aria-label={`${option.mode} CO2 emissions: ${option.co2} grams`}
        >
          <div
            style={{
              height: '100%',
              width: `${co2Pct}%`,
              borderRadius: 3,
              background: `linear-gradient(90deg, ${eco.color}, ${eco.color}aa)`,
              transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Ranked Transport Card (After AI)                                   */
/* ------------------------------------------------------------------ */
function RankedCard({ option, aiData, maxCO2, index }) {
  const baseOption = TRANSPORT_OPTIONS.find(o => o.mode === option.mode) || TRANSPORT_OPTIONS[0];
  const Icon = baseOption.icon;
  const eco = getEcoLevel(baseOption.co2);
  const co2Pct = maxCO2 > 0 ? (baseOption.co2 / maxCO2) * 100 : 0;
  const rank = aiData.rank || index + 1;
  const isTop = rank === 1;

  const rankColors = {
    1: C.gold,
    2: '#c0c0c0',
    3: '#cd7f32',
  };
  const rankColor = rankColors[rank] || C.textMuted;

  return (
    <div
      id={`transport-ranked-${option.mode.toLowerCase().replace(/\s+/g, '-')}`}
      style={{
        padding: '22px 24px',
        borderRadius: 16,
        background: isTop ? 'rgba(0,165,80,0.06)' : C.surface,
        border: `1px solid ${isTop ? 'rgba(0,165,80,0.25)' : C.border}`,
        borderLeft: `4px solid ${rankColor}`,
        animation: `transport-fadein 0.4s ease ${index * 0.12}s both`,
        position: 'relative',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = isTop ? 'rgba(0,165,80,0.4)' : 'rgba(255,255,255,0.12)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = isTop ? 'rgba(0,165,80,0.25)' : C.border;
      }}
    >
      {/* Rank badge */}
      <div
        style={{
          position: 'absolute',
          top: -10,
          right: 16,
          width: 32,
          height: 32,
          borderRadius: 10,
          background: `${rankColor}22`,
          border: `2px solid ${rankColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: `transport-rank-pop 0.4s ease ${index * 0.12 + 0.2}s both`,
        }}
      >
        {isTop ? (
          <Award size={16} color={rankColor} strokeWidth={2.5} />
        ) : (
          <span style={{ fontSize: 14, fontWeight: 800, color: rankColor, fontFamily: F.heading }}>
            {rank}
          </span>
        )}
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 13,
            background: isTop
              ? `linear-gradient(135deg, ${C.green}, ${C.greenBright})`
              : `${eco.color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={24} color={isTop ? '#fff' : eco.color} strokeWidth={2} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: C.textPrimary,
                fontFamily: F.heading,
              }}
            >
              {option.mode}
            </span>
            {isTop && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: C.green,
                  background: 'rgba(0,165,80,0.15)',
                  padding: '2px 8px',
                  borderRadius: 6,
                  fontFamily: F.body,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                ⭐ Best Choice
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: C.textMuted, fontFamily: F.body, display: 'flex', gap: 10, marginTop: 2 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Clock size={10} /> {baseOption.duration} min
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <MapPin size={10} /> {baseOption.distance} km
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <TrendingDown size={10} /> {baseOption.co2}g CO₂
            </span>
          </div>
        </div>
      </div>

      {/* AI Recommendation */}
      {aiData.recommendation && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${C.border}`,
            marginBottom: 12,
            fontSize: 13,
            color: C.textSecondary,
            fontFamily: F.body,
            lineHeight: 1.5,
          }}
        >
          💡 {aiData.recommendation}
        </div>
      )}

      {/* CO2 Saved + Tip */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {aiData.co2Saved && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 12px',
              borderRadius: 20,
              background: 'rgba(0,165,80,0.1)',
              border: '1px solid rgba(0,165,80,0.2)',
              fontSize: 11,
              fontWeight: 600,
              color: C.greenBright,
              fontFamily: F.body,
            }}
          >
            <Leaf size={12} fill={C.greenBright} /> {aiData.co2Saved}
          </span>
        )}
        {aiData.tip && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 12px',
              borderRadius: 20,
              background: 'rgba(255,215,0,0.08)',
              border: '1px solid rgba(255,215,0,0.2)',
              fontSize: 11,
              fontWeight: 500,
              color: C.gold,
              fontFamily: F.body,
            }}
          >
            📌 {aiData.tip}
          </span>
        )}
      </div>

      {/* CO2 Bar */}
      <div style={{ marginTop: 14 }}>
        <div
          style={{
            height: 5,
            borderRadius: 3,
            background: 'rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}
          role="progressbar"
          aria-valuenow={baseOption.co2}
          aria-valuemax={maxCO2}
          aria-label={`${option.mode} CO2 emissions: ${baseOption.co2} grams`}
        >
          <div
            style={{
              height: '100%',
              width: `${co2Pct}%`,
              borderRadius: 3,
              background: `linear-gradient(90deg, ${eco.color}, ${eco.color}aa)`,
              transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function TransportAdvisor() {
  useKeyframes();

  const [aiRanking, setAiRanking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const maxCO2 = useMemo(
    () => Math.max(...TRANSPORT_OPTIONS.map(o => o.co2)),
    []
  );

  const handleGetRecommendation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const options = TRANSPORT_OPTIONS.map(({ mode, duration, distance, co2 }) => ({
        mode, duration, distance, co2,
      }));
      const result = await rankTransportOptions(options, 'Mexico City Center');
      if (Array.isArray(result) && result.length > 0) {
        setAiRanking(result);
      } else {
        throw new Error('Invalid AI response');
      }
    } catch (err) {
      console.error('TransportAdvisor AI error:', err);
      setError('Could not get AI recommendations right now. Showing default options.');
      setAiRanking(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /* — Merge AI ranking with transport options — */
  const rankedOptions = useMemo(() => {
    if (!aiRanking) return null;
    return aiRanking
      .map(ai => {
        const base = TRANSPORT_OPTIONS.find(o =>
          o.mode.toLowerCase() === ai.mode.toLowerCase()
        );
        return base ? { ...base, ai } : null;
      })
      .filter(Boolean)
      .sort((a, b) => (a.ai.rank || 99) - (b.ai.rank || 99));
  }, [aiRanking]);

  return (
    <section style={{ fontFamily: F.body, color: C.textPrimary }}>
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 22,
          flexWrap: 'wrap',
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
            flexShrink: 0,
          }}
        >
          <Train size={22} color="#fff" strokeWidth={2.2} />
        </div>
        <div>
          <h2
            id="transport-heading"
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 700,
              fontFamily: F.heading,
              color: C.textPrimary,
            }}
          >
            Transport Advisor
          </h2>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2, fontFamily: F.body }}>
            🌱 Sustainable travel to Estadio Azteca • From Mexico City Center
          </div>
        </div>
      </div>

      {/* ── Info Banner ── */}
      <div
        style={{
          padding: '14px 18px',
          borderRadius: 12,
          background: 'rgba(0,165,80,0.06)',
          border: '1px solid rgba(0,165,80,0.15)',
          marginBottom: 22,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 13,
          color: C.textSecondary,
          fontFamily: F.body,
          lineHeight: 1.5,
        }}
      >
        <Leaf size={18} color={C.green} style={{ flexShrink: 0 }} />
        <span>
          FIFA 2026 promotes <strong style={{ color: C.greenBright }}>sustainable transport</strong>.
          Compare options below and get an AI-powered recommendation for the greenest route! 🌍
        </span>
      </div>

      {/* ── AI Recommendation Button ── */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 26 }}>
        <button
          id="transport-ai-btn"
          onClick={handleGetRecommendation}
          disabled={loading}
          aria-label="Get AI transport recommendation"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 32px',
            borderRadius: 14,
            border: 'none',
            background: loading
              ? 'rgba(255,255,255,0.06)'
              : `linear-gradient(135deg, ${C.green}, ${C.greenBright})`,
            color: loading ? C.textMuted : '#fff',
            fontSize: 15,
            fontWeight: 700,
            fontFamily: F.heading,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: loading ? 'none' : '0 4px 20px rgba(0,165,80,0.25)',
          }}
          onMouseEnter={e => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,165,80,0.35)';
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = loading ? 'none' : '0 4px 20px rgba(0,165,80,0.25)';
          }}
        >
          {loading ? (
            <>
              <Loader size={18} style={{ animation: 'transport-spin 1s linear infinite' }} />
              Analyzing routes...
            </>
          ) : (
            <>
              <Sparkles size={18} strokeWidth={2.2} />
              {aiRanking ? 'Re-rank with AI' : 'Get AI Recommendation'}
            </>
          )}
        </button>
      </div>

      {/* ── Error message ── */}
      {error && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 10,
            background: 'rgba(229,62,62,0.08)',
            border: '1px solid rgba(229,62,62,0.2)',
            color: C.orange,
            fontSize: 13,
            fontFamily: F.body,
            marginBottom: 20,
            textAlign: 'center',
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* ── Transport Cards ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 16,
        }}
      >
        {rankedOptions ? (
          rankedOptions.map((opt, i) => (
            <RankedCard
              key={opt.mode}
              option={opt}
              aiData={opt.ai}
              maxCO2={maxCO2}
              index={i}
            />
          ))
        ) : (
          TRANSPORT_OPTIONS.map((opt, i) => (
            <TransportCard
              key={opt.mode}
              option={opt}
              maxCO2={maxCO2}
              index={i}
            />
          ))
        )}
      </div>

      {/* ── CO2 Legend ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 20,
          padding: '20px 0 0',
          marginTop: 24,
          borderTop: `1px solid ${C.border}`,
          flexWrap: 'wrap',
        }}
      >
        {[
          { leaves: 3, label: '≤ 30g – Excellent', color: C.greenBright },
          { leaves: 2, label: '≤ 60g – Great', color: C.green },
          { leaves: 1, label: '≤ 100g – Good', color: C.yellow },
          { leaves: 0, label: '> 100g – High', color: C.orange },
        ].map(item => (
          <div
            key={item.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              color: C.textSecondary,
              fontFamily: F.body,
            }}
          >
            {item.leaves > 0 ? (
              Array.from({ length: item.leaves }).map((_, i) => (
                <Leaf key={i} size={10} color={item.color} fill={item.color} />
              ))
            ) : (
              <span style={{ width: 10, height: 10, borderRadius: 3, background: item.color, display: 'inline-block' }} />
            )}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
