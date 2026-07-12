import { Users, AlertTriangle, Activity, CheckCircle, TrendingUp } from "lucide-react";

export default function StadiumHeatmap({ gates, accessibilityMode }) {
  const ZONE_LAYOUT = [
    { zone: "North", gates: ["G1", "G2"] },
    { zone: "East", gates: ["G3", "G4"] },
    { zone: "South", gates: ["G5", "G6"] },
    { zone: "West", gates: ["G7", "G8"] },
  ];

  const getGate = (id) => gates.find((g) => g.id === id) || {};

  const getGateClass = (status) => {
    if (status === "critical") return "gate-critical";
    if (status === "warning") return "gate-warning";
    return "gate-ok";
  };

  const getTextColor = (status) => {
    if (status === "critical") return "#fc8181";
    if (status === "warning") return "#fb923c";
    return "#00c962";
  };

  const totalCapacity = gates.reduce((s, g) => s + g.capacity, 0);
  const totalOccupied = gates.reduce((s, g) => s + Math.round((g.occupancy / 100) * g.capacity), 0);
  const avgOccupancy = gates.length
    ? Math.round(gates.reduce((s, g) => s + g.occupancy, 0) / gates.length)
    : 0;
  const criticalCount = gates.filter((g) => g.status === "critical").length;
  const warningCount = gates.filter((g) => g.status === "warning").length;

  return (
    <div>
      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        {[
          {
            label: "Total Fans",
            value: totalOccupied.toLocaleString(),
            sub: `of ${totalCapacity.toLocaleString()}`,
            icon: Users,
            color: "#00c962",
          },
          {
            label: "Avg Occupancy",
            value: `${avgOccupancy}%`,
            sub: "all gates",
            icon: Activity,
            color: avgOccupancy >= 85 ? "#fc8181" : avgOccupancy >= 70 ? "#fb923c" : "#00c962",
          },
          {
            label: "Critical Gates",
            value: criticalCount,
            sub: `${warningCount} warnings`,
            icon: AlertTriangle,
            color: criticalCount > 0 ? "#fc8181" : "#00c962",
          },
          {
            label: "Gates OK",
            value: gates.filter((g) => g.status === "ok").length,
            sub: `of ${gates.length} total`,
            icon: CheckCircle,
            color: "#00c962",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="stat-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ fontSize: "11px", color: "#55556a", fontWeight: 500 }}>{stat.label}</span>
                <Icon size={15} color={stat.color} />
              </div>
              <div
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontSize: "1.6rem",
                  fontWeight: 800,
                  color: stat.color,
                  lineHeight: 1,
                  marginBottom: "4px",
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: "10px", color: "#55556a" }}>{stat.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Heatmap */}
      <div className="glass" style={{ padding: "20px" }}>
        <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div
              style={{
                fontFamily: "Outfit, sans-serif",
                fontWeight: 700,
                fontSize: "1rem",
                color: "#f0f0f8",
                marginBottom: "2px",
              }}
            >
              Stadium Gate Heatmap
            </div>
            <div style={{ fontSize: "11px", color: "#55556a" }}>
              Estadio Azteca · Live occupancy · Updates every 5s
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {[
              { color: "#00c962", label: "< 70%" },
              { color: "#fb923c", label: "70-85%" },
              { color: "#fc8181", label: "> 85%" },
            ].map((l) => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <div
                  style={{ width: 10, height: 10, borderRadius: "3px", background: l.color, opacity: 0.8 }}
                />
                <span style={{ fontSize: "10px", color: "#8888aa" }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stadium SVG visualization */}
        <div style={{ position: "relative", marginBottom: "20px" }}>
          {/* Stadium oval background */}
          <div
            style={{
              width: "100%",
              height: 240,
              borderRadius: "50%",
              border: "2px solid rgba(0,165,80,0.15)",
              background: "rgba(0,165,80,0.03)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {/* Field */}
            <div
              style={{
                width: "55%",
                height: "55%",
                borderRadius: "50%",
                background: "rgba(0,165,80,0.08)",
                border: "1px solid rgba(0,165,80,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: "11px", color: "#55556a", fontWeight: 600 }}>⚽ PITCH</span>
            </div>

            {/* North gates */}
            <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", display: "flex", gap: "8px" }}>
              {["G1", "G2"].map((id) => {
                const g = getGate(id);
                return (
                  <div
                    key={id}
                    className={getGateClass(g.status)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      textAlign: "center",
                      minWidth: 64,
                    }}
                  >
                    <div style={{ fontSize: "10px", fontWeight: 700, color: getTextColor(g.status) }}>{id}</div>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: getTextColor(g.status) }}>
                      {g.occupancy}%
                    </div>
                  </div>
                );
              })}
            </div>

            {/* South gates */}
            <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", display: "flex", gap: "8px" }}>
              {["G5", "G6"].map((id) => {
                const g = getGate(id);
                return (
                  <div
                    key={id}
                    className={getGateClass(g.status)}
                    style={{ padding: "6px 12px", borderRadius: "8px", textAlign: "center", minWidth: 64 }}
                  >
                    <div style={{ fontSize: "10px", fontWeight: 700, color: getTextColor(g.status) }}>{id}</div>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: getTextColor(g.status) }}>
                      {g.occupancy}%
                    </div>
                  </div>
                );
              })}
            </div>

            {/* East gates */}
            <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: "8px" }}>
              {["G3", "G4"].map((id) => {
                const g = getGate(id);
                return (
                  <div
                    key={id}
                    className={getGateClass(g.status)}
                    style={{ padding: "6px 12px", borderRadius: "8px", textAlign: "center", minWidth: 64 }}
                  >
                    <div style={{ fontSize: "10px", fontWeight: 700, color: getTextColor(g.status) }}>{id}</div>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: getTextColor(g.status) }}>
                      {g.occupancy}%
                    </div>
                  </div>
                );
              })}
            </div>

            {/* West gates */}
            <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: "8px" }}>
              {["G7", "G8"].map((id) => {
                const g = getGate(id);
                return (
                  <div
                    key={id}
                    className={getGateClass(g.status)}
                    style={{ padding: "6px 12px", borderRadius: "8px", textAlign: "center", minWidth: 64 }}
                  >
                    <div style={{ fontSize: "10px", fontWeight: 700, color: getTextColor(g.status) }}>{id}</div>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: getTextColor(g.status) }}>
                      {g.occupancy}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Gate list with bars */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {gates.map((gate) => (
            <div
              key={gate.id}
              style={{
                padding: "10px 12px",
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${gate.status === "critical" ? "rgba(229,62,62,0.3)" : gate.status === "warning" ? "rgba(249,115,22,0.25)" : "rgba(255,255,255,0.07)"}`,
                borderRadius: "10px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "11px", color: "#8888aa", fontWeight: 600 }}>
                  {gate.id} · {gate.zone}
                </span>
                <span style={{ fontSize: "12px", fontWeight: 800, color: gate.color }}>
                  {gate.occupancy}%
                </span>
              </div>
              <div style={{ height: 4, borderRadius: "2px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
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
          ))}
        </div>
      </div>
    </div>
  );
}
