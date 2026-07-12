import { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import Sidebar from "./components/Sidebar";
import StadiumHeatmap from "./components/StadiumHeatmap";
import IncidentFeed from "./components/IncidentFeed";
import AIRecommendations from "./components/AIRecommendations";
import { INITIAL_GATES, simulateStep } from "./crowdSimulator";
import { Activity, AlertTriangle, Users, Clock, Zap, Wifi } from "lucide-react";

const INITIAL_INCIDENTS = [
  {
    id: 1,
    text: "Fan reported feeling dizzy near Gate 4 East section",
    timestamp: new Date(Date.now() - 8 * 60000),
    status: "open",
    summary: "Fan experiencing dizziness near Gate 4",
    priority: "high",
    category: "medical",
    suggestedAction: "Dispatch medical team to Gate 4 immediately.",
    estimatedResponseTime: "2-3 minutes",
    zone: "Gate G4",
  },
  {
    id: 2,
    text: "Turnstile malfunction at Gate 2, creating backlog of fans",
    timestamp: new Date(Date.now() - 15 * 60000),
    status: "open",
    summary: "Turnstile malfunction causing fan queue buildup at Gate 2",
    priority: "medium",
    category: "facility",
    suggestedAction: "Send technical staff and open adjacent gate for overflow.",
    estimatedResponseTime: "5-8 minutes",
    zone: "Gate G2",
  },
  {
    id: 3,
    text: "Lost child, approximately 7 years old, wearing Argentina jersey, found near food court C",
    timestamp: new Date(Date.now() - 22 * 60000),
    status: "open",
    summary: "Lost child found at Food Court C wearing Argentina jersey",
    priority: "critical",
    category: "lost_found",
    suggestedAction: "Escort child to Family Zone and initiate PA announcement.",
    estimatedResponseTime: "Immediate",
    zone: "Food Court",
  },
];

export default function App() {
  const [activePage, setActivePage] = useState("overview");
  const [gates, setGates] = useState(INITIAL_GATES);
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
  const [time, setTime] = useState(new Date());

  // Clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Crowd simulator
  useEffect(() => {
    const interval = setInterval(() => {
      setGates((prev) => simulateStep(prev));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Notify on critical gate change
  useEffect(() => {
    gates.forEach((g) => {
      if (g.status === "critical") {
        // Only show toast occasionally to avoid spam
      }
    });
  }, [gates]);

  const handleAddIncident = (incident) => {
    setIncidents((prev) => [incident, ...prev]);
    const priorityColors = {
      critical: "#fc8181",
      high: "#fb923c",
      medium: "#fde047",
      low: "#00c962",
    };
    toast(`🚨 New ${incident.priority?.toUpperCase()} incident: ${incident.summary}`, {
      duration: 5000,
      style: {
        background: "rgba(15,15,26,0.98)",
        border: `1px solid ${priorityColors[incident.priority] || "#8888aa"}`,
        color: priorityColors[incident.priority] || "#f0f0f8",
        fontFamily: "Inter, sans-serif",
        fontSize: "12px",
      },
    });
  };

  const stats = {
    totalFans: gates.reduce((s, g) => s + Math.round((g.occupancy / 100) * g.capacity), 0),
    criticalGates: gates.filter((g) => g.status === "critical").length,
    openIncidents: incidents.filter((i) => i.status === "open").length,
  };

  const avgOccupancy = gates.length
    ? Math.round(gates.reduce((s, g) => s + g.occupancy, 0) / gates.length)
    : 0;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#06060f" }}>
      <Toaster position="top-right" />

      {/* Sidebar */}
      <Sidebar active={activePage} setActive={setActivePage} stats={stats} />

      {/* Main */}
      <main style={{ marginLeft: 220, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Top bar */}
        <header
          style={{
            height: 60,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            background: "rgba(6,6,15,0.95)",
            backdropFilter: "blur(20px)",
            position: "sticky",
            top: 0,
            zIndex: 40,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "Outfit, sans-serif",
                fontWeight: 700,
                fontSize: "1rem",
                color: "#f0f0f8",
              }}
            >
              {activePage === "overview" && "Operations Overview"}
              {activePage === "heatmap" && "Live Crowd Heatmap"}
              {activePage === "incidents" && "Incident Management"}
              {activePage === "recommendations" && "AI Command Center"}
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Stats pills */}
            <div style={{ display: "flex", gap: "8px" }}>
              {stats.criticalGates > 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    background: "rgba(229,62,62,0.15)",
                    border: "1px solid rgba(229,62,62,0.3)",
                    borderRadius: "20px",
                    padding: "4px 10px",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#fc8181",
                    animation: "pulse-green 2s infinite",
                  }}
                >
                  <AlertTriangle size={11} />
                  {stats.criticalGates} Critical
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  background: "rgba(0,165,80,0.1)",
                  border: "1px solid rgba(0,165,80,0.2)",
                  borderRadius: "20px",
                  padding: "4px 10px",
                  fontSize: "11px",
                  color: "#00c962",
                }}
              >
                <Wifi size={11} />
                LIVE
              </div>
            </div>

            {/* Clock */}
            <div
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#FFD700",
                fontFamily: "Outfit, sans-serif",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <Clock size={13} color="#FFD700" />
              {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
          {/* OVERVIEW PAGE */}
          {activePage === "overview" && (
            <div>
              {/* Quick stats */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "14px",
                  marginBottom: "24px",
                }}
              >
                {[
                  { label: "Total Fans Inside", value: stats.totalFans.toLocaleString(), icon: Users, color: "#00c962", sub: "87,523 max capacity" },
                  { label: "Avg Gate Occupancy", value: `${avgOccupancy}%`, icon: Activity, color: avgOccupancy > 80 ? "#fc8181" : avgOccupancy > 65 ? "#fb923c" : "#00c962", sub: "8 gates monitored" },
                  { label: "Open Incidents", value: stats.openIncidents, icon: AlertTriangle, color: stats.openIncidents > 2 ? "#fc8181" : "#00c962", sub: "Requires attention" },
                  { label: "Critical Gates", value: stats.criticalGates, icon: Zap, color: stats.criticalGates > 0 ? "#fc8181" : "#00c962", sub: "> 85% capacity" },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className="stat-card animate-fade-in-up">
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                        <span style={{ fontSize: "11px", color: "#55556a", fontWeight: 500 }}>{s.label}</span>
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: "8px",
                            background: `${s.color}18`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Icon size={15} color={s.color} />
                        </div>
                      </div>
                      <div
                        style={{
                          fontFamily: "Outfit",
                          fontSize: "1.8rem",
                          fontWeight: 800,
                          color: s.color,
                          lineHeight: 1,
                          marginBottom: "4px",
                        }}
                      >
                        {s.value}
                      </div>
                      <div style={{ fontSize: "10px", color: "#55556a" }}>{s.sub}</div>
                    </div>
                  );
                })}
              </div>

              {/* Split view: heatmap + recent incidents */}
              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "16px" }}>
                <div>
                  <div style={{ fontSize: "12px", color: "#55556a", fontWeight: 600, marginBottom: "12px" }}>
                    LIVE GATE STATUS
                  </div>
                  <StadiumHeatmap gates={gates} />
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "#55556a", fontWeight: 600, marginBottom: "12px" }}>
                    RECENT INCIDENTS
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {incidents.slice(0, 4).map((inc) => (
                      <div
                        key={inc.id}
                        className={`incident-item ${inc.priority}`}
                        style={{ padding: "12px" }}
                      >
                        <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                          <span
                            className={`badge badge-${inc.priority}`}
                            style={{ flexShrink: 0, fontSize: "10px" }}
                          >
                            {inc.priority?.toUpperCase()}
                          </span>
                          <div>
                            <div style={{ fontSize: "12px", color: "#d0d0e0", fontWeight: 600 }}>
                              {inc.summary}
                            </div>
                            <div style={{ fontSize: "10px", color: "#55556a", marginTop: "3px" }}>
                              {new Date(inc.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {inc.zone}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePage === "heatmap" && (
            <StadiumHeatmap gates={gates} />
          )}

          {activePage === "incidents" && (
            <IncidentFeed incidents={incidents} onAddIncident={handleAddIncident} />
          )}

          {activePage === "recommendations" && (
            <AIRecommendations gates={gates} incidents={incidents} />
          )}
        </div>
      </main>
    </div>
  );
}
