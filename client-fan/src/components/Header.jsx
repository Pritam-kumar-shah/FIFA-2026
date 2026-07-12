import { Zap, Trophy, Wifi } from "lucide-react";

export default function Header({ alert, accessibilityMode }) {
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "rgba(8,8,16,0.95)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "12px 20px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #00A550, #FFD700)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Zap size={18} color="#fff" fill="#fff" />
          </div>
          <div>
            <div
              style={{
                fontFamily: "Outfit, sans-serif",
                fontWeight: 800,
                fontSize: accessibilityMode ? "1.2rem" : "1rem",
                background: "linear-gradient(135deg, #00c962, #FFD700)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                lineHeight: 1.1,
              }}
            >
              StadiumGenie
            </div>
            <div style={{ fontSize: "10px", color: "#55556a", letterSpacing: "0.5px" }}>
              FIFA World Cup 2026
            </div>
          </div>
        </div>

        {/* Status indicators */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Match indicator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(255,215,0,0.1)",
              border: "1px solid rgba(255,215,0,0.25)",
              borderRadius: "20px",
              padding: "4px 10px",
            }}
          >
            <Trophy size={12} color="#FFD700" />
            <span style={{ fontSize: "10px", color: "#FFD700", fontWeight: 600 }}>LIVE</span>
          </div>

          {/* Live indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: alert?.severity === "critical" ? "#e53e3e" : "#00c962",
                animation: "pulse-green 2s infinite",
              }}
            />
            <Wifi size={14} color="#55556a" />
          </div>
        </div>
      </div>

      {/* Match info bar */}
      <div
        style={{
          marginTop: "8px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "8px",
          padding: "6px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: accessibilityMode ? "14px" : "11px", color: "#8888aa" }}>
          🏟️ Estadio Azteca, Mexico City
        </span>
        <span style={{ fontSize: accessibilityMode ? "14px" : "11px", color: "#FFD700", fontWeight: 600 }}>
          🇦🇷 ARG vs FRA 🇫🇷 · 18:00
        </span>
      </div>

      {/* Alert banner */}
      {alert?.hasAlert && (
        <div
          className={alert.severity === "critical" ? "alert-critical" : "alert-warning"}
          style={{
            marginTop: "8px",
            borderRadius: "10px",
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            animationName: alert.severity === "critical" ? "pulse-green" : "none",
          }}
        >
          <span style={{ fontSize: "16px" }}>{alert.severity === "critical" ? "🚨" : "⚠️"}</span>
          <span style={{ fontSize: accessibilityMode ? "14px" : "12px", color: alert.severity === "critical" ? "#fc8181" : "#fb923c", fontWeight: 600 }}>
            {alert.fanMessage}
          </span>
        </div>
      )}
    </header>
  );
}
