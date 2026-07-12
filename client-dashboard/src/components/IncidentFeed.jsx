import { useState } from "react";
import { Plus, Clock, MapPin, Loader, X } from "lucide-react";
import { analyzeIncident } from "../gemini";

const CATEGORY_ICONS = {
  medical: "🩺",
  security: "🔒",
  crowd: "👥",
  facility: "🏗️",
  lost_found: "🔍",
  other: "📋",
};

export default function IncidentFeed({ incidents, onAddIncident }) {
  const [showForm, setShowForm] = useState(false);
  const [formText, setFormText] = useState("");
  const [formZone, setFormZone] = useState("General");
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("all");

  const handleSubmit = async () => {
    if (!formText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const ai = await analyzeIncident(formText);
      const incident = {
        id: Date.now(),
        text: formText,
        zone: formZone,
        timestamp: new Date(),
        status: "open",
        ...ai,
      };
      onAddIncident(incident);
      setFormText("");
      setFormZone("General");
      setShowForm(false);
    } catch (err) {
      const incident = {
        id: Date.now(),
        text: formText,
        zone: formZone,
        timestamp: new Date(),
        status: "open",
        summary: formText.substring(0, 60),
        priority: "medium",
        category: "other",
        suggestedAction: "Investigate and report back.",
        estimatedResponseTime: "5-10 minutes",
      };
      onAddIncident(incident);
      setFormText("");
      setShowForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = filter === "all" ? incidents : incidents.filter((i) => i.priority === filter);

  const getPriorityOrder = (p) => ({ critical: 0, high: 1, medium: 2, low: 3 }[p] ?? 4);
  const sorted = [...filtered].sort((a, b) => getPriorityOrder(a.priority) - getPriorityOrder(b.priority));

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{ display: "flex", gap: "6px" }}>
          {["all", "critical", "high", "medium", "low"].map((f) => (
            <button
              key={f}
              id={`filter-${f}`}
              onClick={() => setFilter(f)}
              style={{
                padding: "5px 12px",
                borderRadius: "20px",
                border: filter === f ? "1px solid rgba(0,165,80,0.4)" : "1px solid rgba(255,255,255,0.08)",
                background: filter === f ? "rgba(0,165,80,0.12)" : "rgba(255,255,255,0.03)",
                color: filter === f ? "#00c962" : "#8888aa",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          id="add-incident-btn"
          onClick={() => setShowForm(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            background: "linear-gradient(135deg, #00A550, #00c962)",
            border: "none",
            borderRadius: "10px",
            color: "#fff",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Plus size={14} />
          Report Incident
        </button>
      </div>

      {/* Incident form modal */}
      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(8px)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            className="glass animate-fade-in-up"
            style={{ width: "100%", maxWidth: 480, padding: "24px" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <div style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: "1.1rem", color: "#f0f0f8" }}>
                  Report Incident
                </div>
                <div style={{ fontSize: "12px", color: "#8888aa", marginTop: "2px" }}>
                  AI will summarize and prioritize automatically
                </div>
              </div>
              <button
                onClick={() => setShowForm(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#55556a" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "11px", color: "#8888aa", display: "block", marginBottom: "6px" }}>
                Zone / Location
              </label>
              <select
                id="incident-zone"
                value={formZone}
                onChange={(e) => setFormZone(e.target.value)}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  padding: "9px 12px",
                  color: "#f0f0f8",
                  fontSize: "13px",
                  outline: "none",
                }}
              >
                {["General", "North Stand", "South Stand", "East Stand", "West Stand", "VIP Level", "Gate G1", "Gate G2", "Gate G3", "Gate G4", "Gate G5", "Gate G6", "Gate G7", "Gate G8", "Food Court", "Restrooms", "Parking"].map((z) => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "11px", color: "#8888aa", display: "block", marginBottom: "6px" }}>
                Incident Description
              </label>
              <textarea
                id="incident-text"
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
                placeholder="Describe what you observed... e.g. 'Fan collapsed near Gate 4, requires medical attention'"
                rows={4}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  color: "#f0f0f8",
                  fontSize: "13px",
                  resize: "none",
                  outline: "none",
                  fontFamily: "Inter, sans-serif",
                  lineHeight: 1.6,
                }}
              />
            </div>

            <button
              id="submit-incident-btn"
              onClick={handleSubmit}
              disabled={!formText.trim() || submitting}
              style={{
                width: "100%",
                padding: "11px",
                background: !formText.trim() || submitting ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg, #00A550, #00c962)",
                border: "none",
                borderRadius: "10px",
                color: !formText.trim() || submitting ? "#55556a" : "#fff",
                fontSize: "13px",
                fontWeight: 600,
                cursor: !formText.trim() || submitting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {submitting ? (
                <>
                  <Loader size={14} style={{ animation: "spin 1s linear infinite" }} />
                  AI Analyzing...
                </>
              ) : (
                "Submit & AI Analyze"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Incident list */}
      {sorted.length === 0 ? (
        <div
          className="glass"
          style={{ padding: "40px", textAlign: "center" }}
        >
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>✅</div>
          <div style={{ fontSize: "14px", color: "#8888aa" }}>No incidents reported</div>
          <div style={{ fontSize: "12px", color: "#55556a", marginTop: "4px" }}>
            All clear at Estadio Azteca
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {sorted.map((incident, i) => (
            <div
              key={incident.id}
              className={`incident-item ${incident.priority} animate-fade-in-up`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <span style={{ fontSize: "20px", flexShrink: 0 }}>
                  {CATEGORY_ICONS[incident.category] || "📋"}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                    <span className={`badge badge-${incident.priority}`}>
                      {incident.priority?.toUpperCase()}
                    </span>
                    <span
                      className={`badge cat-${incident.category}`}
                      style={{ fontSize: "10px", padding: "2px 8px" }}
                    >
                      {incident.category?.replace("_", " ")}
                    </span>
                    <span style={{ fontSize: "10px", color: "#55556a", marginLeft: "auto" }}>
                      {new Date(incident.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <div style={{ fontSize: "13px", color: "#d0d0e0", fontWeight: 600, marginBottom: "4px" }}>
                    {incident.summary}
                  </div>

                  <div style={{ fontSize: "11px", color: "#55556a", marginBottom: "8px" }}>
                    {incident.text}
                  </div>

                  {incident.suggestedAction && (
                    <div
                      style={{
                        background: "rgba(0,165,80,0.08)",
                        border: "1px solid rgba(0,165,80,0.15)",
                        borderRadius: "8px",
                        padding: "8px 10px",
                        display: "flex",
                        gap: "6px",
                        alignItems: "flex-start",
                      }}
                    >
                      <span style={{ fontSize: "14px" }}>🤖</span>
                      <div>
                        <div style={{ fontSize: "10px", color: "#00c962", fontWeight: 600, marginBottom: "2px" }}>
                          AI RECOMMENDED ACTION
                        </div>
                        <div style={{ fontSize: "11px", color: "#86efac" }}>
                          {incident.suggestedAction}
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: "8px", display: "flex", gap: "12px", alignItems: "center" }}>
                    {incident.zone && (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "#55556a" }}>
                        <MapPin size={10} /> {incident.zone}
                      </span>
                    )}
                    {incident.estimatedResponseTime && (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "#55556a" }}>
                        <Clock size={10} /> {incident.estimatedResponseTime}
                      </span>
                    )}
                    <button
                      id={`resolve-${incident.id}`}
                      style={{
                        marginLeft: "auto",
                        fontSize: "10px",
                        padding: "3px 10px",
                        background: "rgba(0,165,80,0.1)",
                        border: "1px solid rgba(0,165,80,0.2)",
                        borderRadius: "8px",
                        color: "#00c962",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
