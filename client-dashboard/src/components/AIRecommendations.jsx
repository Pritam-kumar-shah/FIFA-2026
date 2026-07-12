import { useState, useEffect } from "react";
import { Zap, RefreshCw, Clock, Users, Shield } from "lucide-react";
import { generateStaffRecommendations } from "../gemini";

const PRIORITY_CONFIG = {
  critical: { color: "#fc8181", bg: "rgba(229,62,62,0.15)", border: "rgba(229,62,62,0.3)", icon: "🚨" },
  high: { color: "#fb923c", bg: "rgba(249,115,22,0.15)", border: "rgba(249,115,22,0.3)", icon: "⚠️" },
  medium: { color: "#fde047", bg: "rgba(234,179,8,0.12)", border: "rgba(234,179,8,0.25)", icon: "📋" },
};

const ASSIGNEE_ICONS = {
  "Security Team": "🔒",
  Medical: "🩺",
  "Gate Staff": "🚪",
  "Crowd Control": "👥",
  "All Staff": "📢",
};

export default function AIRecommendations({ gates, incidents }) {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchRecs = async () => {
    setLoading(true);
    try {
      const result = await generateStaffRecommendations(gates, incidents);
      setRecs(result);
      setLastUpdated(new Date());
    } catch {
      setRecs([
        {
          priority: "high",
          action: "Open additional lanes at Gate 4 (88% capacity)",
          rationale: "Gate 4 critically overcrowded, risk of crowd crush",
          assignTo: "Gate Staff",
          timeframe: "Immediate",
        },
        {
          priority: "medium",
          action: "Pre-position medical teams near East Stand",
          rationale: "High fan density increases medical incident probability",
          assignTo: "Medical",
          timeframe: "Within 5 min",
        },
        {
          priority: "medium",
          action: "Broadcast PA announcement directing fans to Gate 7",
          rationale: "Gate 7 only 34% — redistribute crowd pressure",
          assignTo: "All Staff",
          timeframe: "Immediate",
        },
      ]);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs();
  }, []);

  // Refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(fetchRecs, 120000);
    return () => clearInterval(interval);
  }, [gates, incidents]);

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div>
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
              <div style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: "1.05rem", color: "#f0f0f8" }}>
                AI Command Center
              </div>
              <div style={{ fontSize: "11px", color: "#55556a" }}>
                Gemini AI · Crowd + Incident Analysis
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {lastUpdated && (
            <span style={{ fontSize: "10px", color: "#55556a" }}>
              Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            id="refresh-recs-btn"
            onClick={fetchRecs}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "7px 12px",
              background: "rgba(0,165,80,0.1)",
              border: "1px solid rgba(0,165,80,0.25)",
              borderRadius: "9px",
              color: "#00c962",
              fontSize: "11px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            <RefreshCw
              size={12}
              style={{ animation: loading ? "spin 1s linear infinite" : "none" }}
            />
            {loading ? "Analyzing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Context summary */}
      <div
        className="glass"
        style={{
          padding: "16px",
          marginBottom: "20px",
          background: "rgba(0,165,80,0.05)",
          border: "1px solid rgba(0,165,80,0.15)",
        }}
      >
        <div style={{ fontSize: "11px", color: "#55556a", fontWeight: 600, marginBottom: "10px" }}>
          ANALYSIS CONTEXT
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
          {[
            {
              icon: Users,
              label: "Gates Analyzed",
              value: gates.length,
              color: "#00c962",
            },
            {
              icon: Shield,
              label: "Open Incidents",
              value: incidents.filter((i) => i.status === "open").length,
              color: incidents.filter((i) => i.status === "open").length > 0 ? "#fb923c" : "#00c962",
            },
            {
              icon: Zap,
              label: "Critical Gates",
              value: gates.filter((g) => g.status === "critical").length,
              color: gates.filter((g) => g.status === "critical").length > 0 ? "#fc8181" : "#00c962",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} style={{ textAlign: "center" }}>
                <Icon size={16} color={item.color} style={{ margin: "0 auto 4px" }} />
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: item.color }}>{item.value}</div>
                <div style={{ fontSize: "10px", color: "#55556a" }}>{item.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      <div style={{ fontSize: "12px", color: "#55556a", fontWeight: 600, marginBottom: "12px" }}>
        AI-GENERATED STAFF ACTIONS
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass loading-shimmer" style={{ height: 130, borderRadius: "14px" }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {recs.map((rec, i) => {
            const cfg = PRIORITY_CONFIG[rec.priority] || PRIORITY_CONFIG.medium;
            return (
              <div
                key={i}
                className="animate-fade-in-up"
                style={{
                  background: cfg.bg,
                  border: `1px solid ${cfg.border}`,
                  borderRadius: "14px",
                  padding: "16px",
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <span style={{ fontSize: "18px" }}>{cfg.icon}</span>
                  <span
                    className={`badge badge-${rec.priority}`}
                    style={{ fontSize: "10px" }}
                  >
                    {rec.priority?.toUpperCase()}
                  </span>
                  <span
                    style={{
                      marginLeft: "auto",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "10px",
                      color: "#8888aa",
                    }}
                  >
                    <Clock size={10} /> {rec.timeframe}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: cfg.color,
                    marginBottom: "6px",
                    lineHeight: 1.3,
                  }}
                >
                  {rec.action}
                </div>
                <div style={{ fontSize: "12px", color: "#8888aa", marginBottom: "10px", lineHeight: 1.5 }}>
                  {rec.rationale}
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "8px",
                      padding: "5px 10px",
                      fontSize: "11px",
                      color: "#d0d0e0",
                    }}
                  >
                    <span>{ASSIGNEE_ICONS[rec.assignTo] || "👤"}</span>
                    <span>{rec.assignTo}</span>
                  </div>

                  <button
                    id={`ack-rec-${i}`}
                    style={{
                      padding: "5px 12px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#8888aa",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Acknowledge
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
