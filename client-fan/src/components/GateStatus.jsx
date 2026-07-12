import { Users, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

const STATUS_CONFIG = {
  ok: { label: "Open", color: "#00c962", bg: "rgba(0,165,80,0.15)", icon: CheckCircle },
  warning: { label: "Busy", color: "#fb923c", bg: "rgba(249,115,22,0.15)", icon: AlertTriangle },
  critical: { label: "Full!", color: "#fc8181", bg: "rgba(229,62,62,0.15)", icon: AlertTriangle },
};

export default function GateStatus({ gates, alert, accessibilityMode }) {
  const totalOccupancy = gates.length
    ? Math.round(gates.reduce((sum, g) => sum + g.occupancy, 0) / gates.length)
    : 0;

  return (
    <div style={{ padding: "12px 16px" }}>
      {/* Overall status */}
      <div
        className="glass"
        style={{
          padding: "16px",
          marginBottom: "16px",
          background: "linear-gradient(135deg, rgba(0,165,80,0.08), rgba(255,215,0,0.04))",
          border: "1px solid rgba(0,165,80,0.2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "12px", color: "#8888aa", marginBottom: "4px" }}>
              Stadium Overall Occupancy
            </div>
            <div
              style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: accessibilityMode ? "2.5rem" : "2rem",
                fontWeight: 800,
                background: "linear-gradient(135deg, #00c962, #FFD700)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {totalOccupancy}%
            </div>
          </div>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: `conic-gradient(#00A550 ${totalOccupancy * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#080810",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users size={22} color="#00c962" />
            </div>
          </div>
        </div>

        <div style={{ marginTop: "12px" }}>
          <div
            style={{
              height: 6,
              borderRadius: "3px",
              background: "rgba(255,255,255,0.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${totalOccupancy}%`,
                background:
                  totalOccupancy >= 85
                    ? "linear-gradient(90deg, #e53e3e, #fc8181)"
                    : totalOccupancy >= 70
                    ? "linear-gradient(90deg, #f97316, #fb923c)"
                    : "linear-gradient(90deg, #00A550, #00c962)",
                borderRadius: "3px",
                transition: "width 1s ease",
              }}
            />
          </div>
          <div
            style={{
              marginTop: "6px",
              fontSize: "11px",
              color: "#55556a",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>87,523 capacity venue</span>
            <span style={{ color: "#8888aa" }}>
              {gates.filter((g) => g.status === "ok").length} gates open
            </span>
          </div>
        </div>
      </div>

      {/* AI alert */}
      {alert?.hasAlert && (
        <div
          className={alert.severity === "critical" ? "alert-critical" : "alert-warning"}
          style={{
            padding: "12px 16px",
            borderRadius: "12px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
          }}
        >
          <AlertTriangle
            size={16}
            color={alert.severity === "critical" ? "#fc8181" : "#fb923c"}
            style={{ marginTop: "1px", flexShrink: 0 }}
          />
          <div>
            <div
              style={{
                fontSize: accessibilityMode ? "14px" : "12px",
                fontWeight: 600,
                color: alert.severity === "critical" ? "#fc8181" : "#fb923c",
                marginBottom: "2px",
              }}
            >
              🤖 AI Alert · {alert.severity?.toUpperCase()}
            </div>
            <div style={{ fontSize: accessibilityMode ? "13px" : "11px", color: "#8888aa" }}>
              {alert.fanMessage}
            </div>
          </div>
        </div>
      )}

      {/* Gate grid */}
      <div style={{ fontSize: "12px", color: "#55556a", marginBottom: "10px", fontWeight: 500 }}>
        LIVE GATE STATUS
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
        }}
      >
        {gates.map((gate) => {
          const cfg = STATUS_CONFIG[gate.status] || STATUS_CONFIG.ok;
          const Icon = cfg.icon;
          return (
            <div
              key={gate.id}
              className="animate-fade-in-up glass"
              style={{
                padding: "12px",
                border: `1px solid ${gate.status === "critical" ? "rgba(229,62,62,0.3)" : gate.status === "warning" ? "rgba(249,115,22,0.25)" : "rgba(255,255,255,0.08)"}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "10px", color: "#55556a", fontWeight: 600 }}>{gate.id}</span>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    color: cfg.color,
                    background: cfg.bg,
                    padding: "2px 8px",
                    borderRadius: "10px",
                  }}
                >
                  {cfg.label}
                </span>
              </div>
              <div
                style={{
                  fontSize: accessibilityMode ? "13px" : "11px",
                  color: "#d0d0e0",
                  marginBottom: "8px",
                  fontWeight: 500,
                  lineHeight: 1.3,
                }}
              >
                {gate.name.split(" - ")[1]}
              </div>

              {/* Occupancy bar */}
              <div style={{ marginBottom: "4px" }}>
                <div
                  style={{
                    height: 4,
                    borderRadius: "2px",
                    background: "rgba(255,255,255,0.06)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${gate.occupancy}%`,
                      background: gate.color,
                      borderRadius: "2px",
                      transition: "width 1s ease",
                    }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "10px", color: "#55556a" }}>{gate.zone} Zone</span>
                <span style={{ fontSize: "12px", fontWeight: 700, color: cfg.color }}>
                  {gate.occupancy}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
