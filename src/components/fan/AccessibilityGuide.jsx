import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Accessibility, Eye, Type, Volume2, VolumeX, MapPin,
  Phone, Heart, ChevronRight, Shield, Users, Info, Ear
} from 'lucide-react';

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
/*  Accessibility data                                                 */
/* ------------------------------------------------------------------ */
const ACCESSIBLE_GATES = [
  { id: 'ag1', gate: 'Gate 1 - North Main', ramp: true, elevator: true, width: 'Wide (1.5m)', zone: 'North', note: 'Main accessible entrance — shortest path to wheelchair seating' },
  { id: 'ag2', gate: 'Gate 3 - East', ramp: true, elevator: false, width: 'Wide (1.5m)', zone: 'East', note: 'Connected to Metro Line 2 via accessible walkway' },
  { id: 'ag3', gate: 'Gate 5 - South Main', ramp: true, elevator: true, width: 'Extra Wide (2m)', zone: 'South', note: 'Best for rideshare drop-off — near Parking Lot D' },
  { id: 'ag4', gate: 'Gate 7 - West', ramp: true, elevator: true, width: 'Wide (1.5m)', zone: 'West', note: 'Family zone access, near first-aid station' },
];

const AMENITIES = [
  { id: 'am1', name: 'Accessible Restrooms', icon: Accessibility, count: '12 locations', location: 'All concourse levels', detail: 'Wheelchair-accessible with grab bars, changing tables' },
  { id: 'am2', name: 'First-Aid Stations', icon: Heart, count: '8 stations', location: 'Every other section', detail: 'Medical staff on duty, AED available' },
  { id: 'am3', name: 'Family Zones', icon: Users, count: '4 areas', location: 'North & South stands', detail: 'Quiet zones, sensory-friendly, nursing rooms' },
  { id: 'am4', name: 'Wheelchair Spaces', icon: Accessibility, count: '850 spaces', location: 'All stands, prime views', detail: 'Companion seating, level access, clear sightlines' },
  { id: 'am5', name: 'Audio Description', icon: Ear, count: 'Full coverage', location: 'Collect at any gate', detail: 'Real-time match commentary via headset' },
  { id: 'am6', name: 'Sensory Room', icon: Shield, count: '2 rooms', location: 'North & South concourse', detail: 'Low-stimulation space for neurodivergent fans' },
];

/* ------------------------------------------------------------------ */
/*  Inject keyframes                                                   */
/* ------------------------------------------------------------------ */
function useKeyframes() {
  useEffect(() => {
    const id = 'a11y-keyframes';
    if (document.getElementById(id)) return;
    const s = document.createElement('style');
    s.id = id;
    s.textContent = `
      @keyframes a11y-fadein {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes a11y-pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(0,165,80,0.3); }
        50%      { box-shadow: 0 0 14px 4px rgba(0,165,80,0.12); }
      }
    `;
    document.head.appendChild(s);
  }, []);
}

/* ------------------------------------------------------------------ */
/*  Toggle Switch                                                      */
/* ------------------------------------------------------------------ */
function ToggleSwitch({ id, label, description, icon: Icon, checked, onChange }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '16px 20px',
        borderRadius: 14,
        background: checked ? 'rgba(0,165,80,0.08)' : C.surface,
        border: `1px solid ${checked ? 'rgba(0,165,80,0.25)' : C.border}`,
        transition: 'all 0.2s ease',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 11,
          background: checked ? `linear-gradient(135deg, ${C.green}, ${C.greenBright})` : 'rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.2s ease',
        }}
      >
        <Icon size={20} color={checked ? '#fff' : C.textMuted} strokeWidth={2} />
      </div>

      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: C.textPrimary,
            fontFamily: F.heading,
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: 11, color: C.textMuted, fontFamily: F.body, marginTop: 2 }}>
          {description}
        </div>
      </div>

      <button
        id={id}
        role="switch"
        aria-checked={checked}
        aria-label={`${label}: ${checked ? 'on' : 'off'}`}
        onClick={onChange}
        style={{
          width: 52,
          height: 28,
          borderRadius: 14,
          border: 'none',
          background: checked ? C.green : 'rgba(255,255,255,0.12)',
          position: 'relative',
          cursor: 'pointer',
          transition: 'background 0.2s ease',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: '#fff',
            position: 'absolute',
            top: 3,
            left: checked ? 27 : 3,
            transition: 'left 0.2s ease',
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
          }}
        />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section Header                                                     */
/* ------------------------------------------------------------------ */
function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          background: `${C.green}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={18} color={C.green} strokeWidth={2.2} />
      </div>
      <div>
        <h3
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 700,
            fontFamily: F.heading,
            color: C.textPrimary,
          }}
        >
          {title}
        </h3>
        {subtitle && (
          <div style={{ fontSize: 11, color: C.textMuted, fontFamily: F.body, marginTop: 1 }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function AccessibilityGuide() {
  useKeyframes();

  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const ttsRef = useRef(null);

  /* — Apply accessibility modes to document — */
  useEffect(() => {
    const root = document.documentElement;
    if (largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }
    return () => root.classList.remove('large-text');
  }, [largeText]);

  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    return () => root.classList.remove('high-contrast');
  }, [highContrast]);

  /* — Text-to-Speech — */
  const speakText = useCallback((text) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    ttsRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled]);

  const handleTtsToggle = useCallback(() => {
    const newVal = !ttsEnabled;
    setTtsEnabled(newVal);
    if (newVal) {
      if (window.speechSynthesis) {
        const msg = new SpeechSynthesisUtterance('Text to speech enabled. I will read content aloud for you.');
        msg.rate = 0.9;
        window.speechSynthesis.speak(msg);
      }
    } else {
      window.speechSynthesis?.cancel();
    }
  }, [ttsEnabled]);

  /* — Speak section on hover if TTS enabled — */
  const handleSectionHover = useCallback((text) => {
    if (ttsEnabled && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(text);
      msg.rate = 0.9;
      window.speechSynthesis.speak(msg);
    }
  }, [ttsEnabled]);

  return (
    <section
      role="main"
      aria-label="Accessibility Guide"
      style={{ fontFamily: F.body, color: C.textPrimary }}
    >
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 13,
            background: `linear-gradient(135deg, ${C.green}, ${C.greenBright})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            animation: 'a11y-pulse 2.5s ease infinite',
          }}
        >
          <Accessibility size={24} color="#fff" strokeWidth={2.2} />
        </div>
        <div>
          <h2
            id="a11y-heading"
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 700,
              fontFamily: F.heading,
              color: C.textPrimary,
            }}
          >
            Accessibility Hub
          </h2>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2, fontFamily: F.body }}>
            ♿ Estadio Azteca is committed to being accessible to all fans
          </div>
        </div>
      </div>

      {/* ── Quick Info Banner ── */}
      <div
        style={{
          padding: '14px 18px',
          borderRadius: 12,
          background: 'rgba(0,165,80,0.06)',
          border: '1px solid rgba(0,165,80,0.15)',
          marginBottom: 26,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 13,
          color: C.textSecondary,
          fontFamily: F.body,
        }}
        onMouseEnter={() => handleSectionHover(
          'Estadio Azteca features 850 wheelchair spaces, 12 accessible restrooms, ramps at all gates, and audio description services.'
        )}
      >
        <Info size={18} color={C.green} style={{ flexShrink: 0 }} />
        <span>
          <strong style={{ color: C.greenBright }}>850 wheelchair spaces</strong> •{' '}
          <strong style={{ color: C.greenBright }}>12 accessible restrooms</strong> •{' '}
          Ramps at all gates • Audio description available
        </span>
      </div>

      {/* ── Accessibility Controls ── */}
      <div style={{ marginBottom: 32 }}>
        <SectionHeader
          icon={Eye}
          title="Display & Audio Settings"
          subtitle="Customize your experience"
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ToggleSwitch
            id="a11y-toggle-large-text"
            label="Large Text"
            description="Increase text size across the app"
            icon={Type}
            checked={largeText}
            onChange={() => setLargeText(p => !p)}
          />
          <ToggleSwitch
            id="a11y-toggle-high-contrast"
            label="High Contrast"
            description="Enhanced colors for better visibility"
            icon={Eye}
            checked={highContrast}
            onChange={() => setHighContrast(p => !p)}
          />
          <ToggleSwitch
            id="a11y-toggle-tts"
            label="Text-to-Speech"
            description="Read content aloud when you hover over sections"
            icon={ttsEnabled ? Volume2 : VolumeX}
            checked={ttsEnabled}
            onChange={handleTtsToggle}
          />
        </div>
      </div>

      {/* ── Accessible Routes ── */}
      <div style={{ marginBottom: 32 }}>
        <SectionHeader
          icon={MapPin}
          title="Accessible Gates & Routes"
          subtitle="All gates feature step-free access"
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ACCESSIBLE_GATES.map((gate, idx) => (
            <div
              key={gate.id}
              id={`a11y-gate-${gate.id}`}
              style={{
                padding: '16px 20px',
                borderRadius: 14,
                background: C.surface,
                border: `1px solid ${C.border}`,
                animation: `a11y-fadein 0.3s ease ${idx * 0.06}s both`,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = C.surfaceHover;
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                handleSectionHover(`${gate.gate}. ${gate.note}. ${gate.ramp ? 'Has ramp.' : ''} ${gate.elevator ? 'Has elevator.' : ''}`);
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = C.surface;
                e.currentTarget.style.borderColor = C.border;
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: `${C.green}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Accessibility size={18} color={C.green} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary, fontFamily: F.heading }}>
                    {gate.gate}
                  </div>
                  <div style={{ fontSize: 11, color: C.textMuted, fontFamily: F.body }}>
                    {gate.zone} Zone • Width: {gate.width}
                  </div>
                </div>
                <ChevronRight size={16} color={C.textMuted} />
              </div>

              {/* Features */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                {gate.ramp && (
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: 6,
                      background: 'rgba(0,165,80,0.12)',
                      fontSize: 11,
                      fontWeight: 600,
                      color: C.green,
                      fontFamily: F.body,
                    }}
                  >
                    ♿ Ramp
                  </span>
                )}
                {gate.elevator && (
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: 6,
                      background: 'rgba(255,215,0,0.12)',
                      fontSize: 11,
                      fontWeight: 600,
                      color: C.gold,
                      fontFamily: F.body,
                    }}
                  >
                    🛗 Elevator
                  </span>
                )}
              </div>

              <div style={{ fontSize: 12, color: C.textSecondary, fontFamily: F.body, lineHeight: 1.5 }}>
                {gate.note}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Amenities Grid ── */}
      <div style={{ marginBottom: 32 }}>
        <SectionHeader
          icon={Heart}
          title="Accessible Amenities"
          subtitle="Services available throughout the stadium"
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 12,
          }}
        >
          {AMENITIES.map((amenity, idx) => {
            const AmenityIcon = amenity.icon;
            return (
              <div
                key={amenity.id}
                id={`a11y-amenity-${amenity.id}`}
                style={{
                  padding: '18px 20px',
                  borderRadius: 14,
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  animation: `a11y-fadein 0.3s ease ${idx * 0.06}s both`,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = C.surfaceHover;
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                  handleSectionHover(`${amenity.name}. ${amenity.count}. Located at ${amenity.location}. ${amenity.detail}`);
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = C.surface;
                  e.currentTarget.style.borderColor = C.border;
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: `${C.green}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <AmenityIcon size={19} color={C.green} strokeWidth={2} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary, fontFamily: F.heading }}>
                      {amenity.name}
                    </div>
                    <div style={{ fontSize: 11, color: C.greenBright, fontWeight: 600, fontFamily: F.body }}>
                      {amenity.count}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: C.textMuted, fontFamily: F.body, marginBottom: 4 }}>
                  📍 {amenity.location}
                </div>
                <div style={{ fontSize: 12, color: C.textSecondary, fontFamily: F.body, lineHeight: 1.5 }}>
                  {amenity.detail}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Emergency Contact ── */}
      <div
        id="a11y-emergency-card"
        role="region"
        aria-label="Emergency contacts"
        style={{
          padding: '24px 28px',
          borderRadius: 16,
          background: 'rgba(229,62,62,0.06)',
          border: '1px solid rgba(229,62,62,0.2)',
          borderLeft: `4px solid ${C.red}`,
        }}
        onMouseEnter={() => handleSectionHover(
          'Emergency contact. Stadium Emergency Hotline. Call plus 52 55 5555 0911. Available 24 7 during match days. For medical emergencies, security issues, or accessibility assistance. Stadium security and medical teams can reach you within 3 minutes.'
        )}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(229,62,62,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Phone size={22} color={C.red} strokeWidth={2.2} />
          </div>
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 700,
                fontFamily: F.heading,
                color: C.textPrimary,
              }}
            >
              🚨 Emergency Contact
            </h3>
            <div style={{ fontSize: 12, color: C.textMuted, fontFamily: F.body, marginTop: 2 }}>
              Available 24/7 during match days
            </div>
          </div>
        </div>

        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            fontFamily: F.heading,
            color: C.red,
            marginBottom: 8,
            letterSpacing: '0.02em',
          }}
        >
          📞 +52 55 5555-0911
        </div>

        <div style={{ fontSize: 14, color: C.textPrimary, fontFamily: F.body, fontWeight: 600, marginBottom: 4 }}>
          Stadium Emergency Hotline
        </div>
        <div style={{ fontSize: 13, color: C.textSecondary, fontFamily: F.body, lineHeight: 1.6 }}>
          For medical emergencies, security issues, or accessibility assistance.
          Stadium security and medical teams can reach you within <strong style={{ color: C.textPrimary }}>3 minutes</strong>.
        </div>

        <div
          style={{
            display: 'flex',
            gap: 8,
            marginTop: 14,
            flexWrap: 'wrap',
          }}
        >
          {['Medical', 'Security', 'Accessibility', 'Lost & Found'].map(tag => (
            <span
              key={tag}
              style={{
                padding: '4px 12px',
                borderRadius: 8,
                background: 'rgba(229,62,62,0.1)',
                fontSize: 11,
                fontWeight: 600,
                color: C.red,
                fontFamily: F.body,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
