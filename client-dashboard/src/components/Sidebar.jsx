import { Zap, LayoutDashboard, AlertTriangle, Activity, Users, Settings, Trophy } from "lucide-react";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "heatmap", label: "Crowd Heatmap", icon: Activity },
  { id: "incidents", label: "Incidents", icon: AlertTriangle },
  { id: "recommendations", label: "AI Command", icon: Zap },
];

export default function Sidebar({ active, setActive, stats }) {
  return (
    <aside
      style={{
        width: 220,
        minHeight: "100vh",
        background: "rgba(6,6,15,0.98)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
        padding: "20px 12px",
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: "28px", padding: "0 6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "9px",
              background: "linear-gradient(135deg, #00A550, #FFD700)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Zap size={16} color="#fff" fill="#fff" />
          </div>
          <div>
            <div
              style={{
                fontFamily: "Outfit, sans-serif",
                fontWeight: 800,
                fontSize: "0.95rem",
                background: "linear-gradient(135deg, #00c962, #FFD700)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                lineHeight: 1.1,
              }}
            >
              StadiumGenie
            </div>
            <div style={{ fontSize: "9px", color: "#55556a", letterSpacing: "0.8px" }}>OPS DASHBOARD</div>
          </div>
        </div>
        {/* Match pill */}
        <div
          style={{
            marginTop: "10px",
            background: "rgba(255,215,0,0.08)",
            border: "1px solid rgba(255,215,0,0.2)",
            borderRadius: "8px",
            padding: "6px 10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "2px" }}>
            <Trophy size={10} color="#FFD700" />
            <span style={{ fontSize: "9px", color: "#FFD700", fontWeight: 700, letterSpacing: "0.5px" }}>
              MATCH DAY · LIVE
            </span>
          </div>
          <div style={{ fontSize: "10px", color: "#d0d0e0", fontWeight: 600 }}>ARG vs FRA · 18:00</div>
          <div style={{ fontSize: "9px", color: "#55556a" }}>Estadio Azteca, Mexico City</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-${item.id}`}
              onClick={() => setActive(item.id)}
              className={`sidebar-link ${isActive ? "active" : ""}`}
              style={{ width: "100%", textAlign: "left", fontFamily: "Inter, sans-serif" }}
            >
              <Icon size={16} />
              {item.label}
              {item.id === "incidents" && stats.openIncidents > 0 && (
                <span
                  style={{
                    marginLeft: "auto",
                    background: "#e53e3e",
                    color: "#fff",
                    fontSize: "10px",
                    fontWeight: 700,
                    borderRadius: "10px",
                    padding: "1px 7px",
                    minWidth: "20px",
                    textAlign: "center",
                  }}
                >
                  {stats.openIncidents}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Stats summary */}
      <div
        style={{
          marginTop: "auto",
          padding: "12px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "12px",
        }}
      >
        <div style={{ fontSize: "10px", color: "#55556a", fontWeight: 600, marginBottom: "8px" }}>
          LIVE SUMMARY
        </div>
        {[
          { label: "Fans Inside", value: stats.totalFans?.toLocaleString() || "–", color: "#00c962" },
          { label: "Critical Gates", value: stats.criticalGates, color: stats.criticalGates > 0 ? "#fc8181" : "#00c962" },
          { label: "Open Incidents", value: stats.openIncidents, color: stats.openIncidents > 2 ? "#fb923c" : "#00c962" },
        ].map((s) => (
          <div
            key={s.label}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}
          >
            <span style={{ fontSize: "11px", color: "#8888aa" }}>{s.label}</span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
