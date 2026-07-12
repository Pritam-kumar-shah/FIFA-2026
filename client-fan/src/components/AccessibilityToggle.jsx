import { useState } from "react";
import { Eye, EyeOff, Volume2, VolumeX, Type, Accessibility, ChevronRight } from "lucide-react";

const ACCESSIBILITY_FEATURES = [
  {
    id: "large-text",
    icon: Type,
    title: "Large Text Mode",
    desc: "Increases font size by 20% for easier reading",
  },
  {
    id: "tts",
    icon: Volume2,
    title: "Text-to-Speech",
    desc: "AI responses are read aloud automatically",
  },
  {
    id: "simple-lang",
    icon: Eye,
    title: "Simple Language",
    desc: "AI uses shorter, clearer sentences",
  },
];

const ACCESSIBLE_ROUTES = [
  {
    from: "Metro Exit",
    to: "Gate 1 (Accessible)",
    desc: "Ramp available, level path, 4 min",
    icon: "♿",
  },
  {
    from: "Parking Lot D",
    to: "Gate 5 (Accessible)",
    desc: "Wheelchair lift, dedicated path, 6 min",
    icon: "🅿️",
  },
  {
    from: "Drop-off Zone A",
    to: "Gate 7 (Accessible)",
    desc: "Direct accessible entry, 2 min",
    icon: "🚐",
  },
];

const AMENITIES = [
  { icon: "🚻", label: "Accessible Restrooms", count: 12, desc: "All levels, Zone A-D" },
  { icon: "🩺", label: "First Aid", count: 8, desc: "All gates + field level" },
  { icon: "👨‍👩‍👧", label: "Family Zones", count: 4, desc: "North & South stands" },
  { icon: "🦽", label: "Wheelchair Spaces", count: 850, desc: "Reserved seating" },
];

export default function AccessibilityToggle({ accessibilityMode, setAccessibilityMode }) {
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [simpleLang, setSimpleLang] = useState(false);

  const toggleTTS = () => {
    if (ttsEnabled && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setTtsEnabled(!ttsEnabled);
  };

  const testTTS = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(
        "Welcome to Estadio Azteca. Gate 1 is now open and accessible. Please follow the ramp to your left."
      );
      u.rate = 0.85;
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div style={{ padding: "12px 16px" }}>
      {/* Header card */}
      <div
        className="glass-bright"
        style={{ padding: "20px", marginBottom: "16px", textAlign: "center" }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "16px",
            background: "linear-gradient(135deg, #00A550, #FFD700)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 12px",
          }}
        >
          <Accessibility size={28} color="#fff" />
        </div>
        <div
          style={{
            fontFamily: "Outfit, sans-serif",
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "#f0f0f8",
            marginBottom: "4px",
          }}
        >
          Accessibility Mode
        </div>
        <div style={{ fontSize: "12px", color: "#8888aa" }}>
          Customized for wheelchair users, elderly, and visually impaired fans
        </div>

        {/* Master toggle */}
        <div style={{ marginTop: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
          <span style={{ fontSize: "13px", color: "#8888aa" }}>Off</span>
          <button
            id="accessibility-master-toggle"
            onClick={() => setAccessibilityMode(!accessibilityMode)}
            style={{
              width: 56,
              height: 28,
              borderRadius: "14px",
              background: accessibilityMode
                ? "linear-gradient(90deg, #00A550, #00c962)"
                : "rgba(255,255,255,0.1)",
              border: "none",
              cursor: "pointer",
              position: "relative",
              transition: "background 0.3s ease",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 3,
                left: accessibilityMode ? 30 : 3,
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "#fff",
                transition: "left 0.3s ease",
                boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
              }}
            />
          </button>
          <span style={{ fontSize: "13px", color: accessibilityMode ? "#00c962" : "#8888aa", fontWeight: 600 }}>
            {accessibilityMode ? "Active" : "On"}
          </span>
        </div>
      </div>

      {/* Feature toggles */}
      <div style={{ fontSize: "12px", color: "#55556a", marginBottom: "10px", fontWeight: 500 }}>
        FEATURES
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
        {/* Large text - linked to master toggle */}
        <div
          className="glass"
          style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px" }}
        >
          <Type size={18} color={accessibilityMode ? "#00c962" : "#55556a"} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "13px", color: "#d0d0e0", fontWeight: 500 }}>Large Text Mode</div>
            <div style={{ fontSize: "11px", color: "#55556a", marginTop: "2px" }}>
              Increases font size for easier reading
            </div>
          </div>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: accessibilityMode ? "#00c962" : "#55556a",
              background: accessibilityMode ? "rgba(0,165,80,0.15)" : "rgba(255,255,255,0.05)",
              padding: "3px 10px",
              borderRadius: "10px",
            }}
          >
            {accessibilityMode ? "Active" : "Off"}
          </div>
        </div>

        {/* TTS toggle */}
        <div
          className="glass"
          style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px" }}
        >
          {ttsEnabled ? (
            <Volume2 size={18} color="#00c962" />
          ) : (
            <VolumeX size={18} color="#55556a" />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "13px", color: "#d0d0e0", fontWeight: 500 }}>Text-to-Speech</div>
            <div style={{ fontSize: "11px", color: "#55556a", marginTop: "2px" }}>
              AI reads responses aloud automatically
            </div>
          </div>
          <button
            id="tts-toggle"
            onClick={toggleTTS}
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: ttsEnabled ? "#00c962" : "#55556a",
              background: ttsEnabled ? "rgba(0,165,80,0.15)" : "rgba(255,255,255,0.05)",
              padding: "3px 10px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
            }}
          >
            {ttsEnabled ? "Active" : "Off"}
          </button>
        </div>

        {/* Test TTS button */}
        {ttsEnabled && (
          <button
            id="test-tts-btn"
            onClick={testTTS}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              background: "rgba(255,215,0,0.08)",
              border: "1px solid rgba(255,215,0,0.25)",
              borderRadius: "12px",
              padding: "10px",
              color: "#FFD700",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Volume2 size={14} />
            Test Voice Announcement
          </button>
        )}
      </div>

      {/* Accessible routes */}
      <div style={{ fontSize: "12px", color: "#55556a", marginBottom: "10px", fontWeight: 500 }}>
        ♿ ACCESSIBLE ROUTES
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
        {ACCESSIBLE_ROUTES.map((route, i) => (
          <div
            key={i}
            className="glass"
            style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: "12px" }}
          >
            <span style={{ fontSize: "20px" }}>{route.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "12px", color: "#8888aa" }}>
                {route.from} →
              </div>
              <div style={{ fontSize: "13px", color: "#d0d0e0", fontWeight: 600 }}>
                {route.to}
              </div>
              <div style={{ fontSize: "11px", color: "#55556a", marginTop: "2px" }}>
                {route.desc}
              </div>
            </div>
            <ChevronRight size={14} color="#55556a" />
          </div>
        ))}
      </div>

      {/* Amenities */}
      <div style={{ fontSize: "12px", color: "#55556a", marginBottom: "10px", fontWeight: 500 }}>
        ACCESSIBLE AMENITIES
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        {AMENITIES.map((a, i) => (
          <div key={i} className="glass" style={{ padding: "12px" }}>
            <div style={{ fontSize: "20px", marginBottom: "6px" }}>{a.icon}</div>
            <div style={{ fontSize: "12px", color: "#d0d0e0", fontWeight: 600, marginBottom: "2px" }}>
              {a.label}
            </div>
            <div style={{ fontSize: "11px", color: "#00c962", fontWeight: 700 }}>
              {a.count}
            </div>
            <div style={{ fontSize: "10px", color: "#55556a" }}>{a.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
