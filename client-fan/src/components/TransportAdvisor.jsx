import { useState, useEffect } from "react";
import { Leaf, Clock, MapPin, Star, Loader } from "lucide-react";
import { rankTransportOptions } from "../gemini";

const TRANSPORT_OPTIONS = [
  {
    mode: "Metro Line 2",
    icon: "🚇",
    duration: 22,
    distance: 4.2,
    co2: 180,
    price: "MXN 5",
    details: "Tasqueña Station → Estadio Azteca (3 stops)",
    frequency: "Every 4 min",
  },
  {
    mode: "Bus Route 76",
    icon: "🚌",
    duration: 35,
    distance: 5.8,
    co2: 320,
    price: "MXN 8",
    details: "City Center → Gate 5 Direct",
    frequency: "Every 12 min",
  },
  {
    mode: "Carpool / Rideshare",
    icon: "🚗",
    duration: 28,
    distance: 6.1,
    co2: 890,
    price: "MXN 85",
    details: "Drop-off at Parking Lot D, Gate G5",
    frequency: "On demand",
  },
  {
    mode: "Walk + Metro",
    icon: "🚶",
    duration: 18,
    distance: 1.4,
    co2: 0,
    price: "Free",
    details: "Walk to metro, 2 stops, exit Gate 1",
    frequency: "Anytime",
  },
];

export default function TransportAdvisor({ accessibilityMode }) {
  const [ranked, setRanked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState("City Center (Zócalo)");

  useEffect(() => {
    loadRankings();
  }, []);

  const loadRankings = async () => {
    setLoading(true);
    try {
      const result = await rankTransportOptions(TRANSPORT_OPTIONS, userLocation);
      // Merge AI ranking with original data
      const merged = TRANSPORT_OPTIONS.map((opt, i) => {
        const ranked = result.find((r) => r.mode === opt.mode) || result[i] || {};
        return { ...opt, ...ranked };
      }).sort((a, b) => (a.rank || 99) - (b.rank || 99));
      setRanked(merged);
    } catch {
      setRanked(TRANSPORT_OPTIONS.map((o, i) => ({ ...o, rank: i + 1 })));
    } finally {
      setLoading(false);
    }
  };

  const getCO2Label = (co2) => {
    if (co2 === 0) return "Zero emissions 🌿";
    if (co2 < 300) return `${co2}g CO₂ (Low)`;
    if (co2 < 700) return `${co2}g CO₂ (Medium)`;
    return `${co2}g CO₂ (High)`;
  };

  return (
    <div style={{ padding: "12px 16px" }}>
      {/* Header */}
      <div
        className="glass"
        style={{
          padding: "16px",
          marginBottom: "16px",
          background: "linear-gradient(135deg, rgba(0,165,80,0.08), rgba(0,0,0,0))",
          border: "1px solid rgba(0,165,80,0.2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
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
            <Leaf size={18} color="#fff" />
          </div>
          <div>
            <div
              style={{
                fontFamily: "Outfit, sans-serif",
                fontWeight: 700,
                fontSize: accessibilityMode ? "1rem" : "0.9rem",
                color: "#f0f0f8",
              }}
            >
              Sustainable Transport Advisor
            </div>
            <div style={{ fontSize: "11px", color: "#8888aa" }}>
              AI-ranked options · Match day 18:00 kickoff
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "10px",
            padding: "8px 12px",
          }}
        >
          <MapPin size={12} color="#8888aa" />
          <span style={{ fontSize: "12px", color: "#8888aa", flex: 1 }}>From: {userLocation}</span>
          <span style={{ fontSize: "11px", color: "#00c962" }}>→ Estadio Azteca</span>
        </div>
      </div>

      {/* CO2 info banner */}
      <div
        style={{
          background: "rgba(0,165,80,0.06)",
          border: "1px solid rgba(0,165,80,0.2)",
          borderRadius: "12px",
          padding: "10px 14px",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span style={{ fontSize: "18px" }}>🌍</span>
        <div>
          <div style={{ fontSize: "12px", color: "#00c962", fontWeight: 600 }}>
            FIFA World Cup 2026 Sustainability Goal
          </div>
          <div style={{ fontSize: "11px", color: "#55556a", marginTop: "2px" }}>
            60% of fans using public transport → saves 14,200 tonnes CO₂ per match
          </div>
        </div>
      </div>

      {/* Transport cards */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass loading-shimmer" style={{ height: 100, borderRadius: "14px" }} />
          ))}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "8px" }}>
            <Loader size={14} color="#8888aa" style={{ animation: "spin 1s linear infinite" }} />
            <span style={{ fontSize: "12px", color: "#8888aa" }}>AI is ranking your options...</span>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {ranked.map((option, i) => (
            <div
              key={option.mode}
              className={`animate-fade-in-up ${i === 0 ? "transport-rank-1" : "glass"}`}
              style={{
                padding: "14px 16px",
                borderRadius: "14px",
                animationDelay: `${i * 0.1}s`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {i === 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 12,
                    background: "linear-gradient(135deg, #00A550, #FFD700)",
                    borderRadius: "20px",
                    padding: "2px 10px",
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Star size={10} fill="#fff" />
                  AI PICK
                </div>
              )}

              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <span style={{ fontSize: "24px" }}>{option.icon}</span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: accessibilityMode ? "15px" : "13px",
                      fontWeight: 700,
                      color: "#f0f0f8",
                      marginBottom: "2px",
                    }}
                  >
                    {option.mode}
                  </div>
                  <div style={{ fontSize: "11px", color: "#8888aa", marginBottom: "8px" }}>
                    {option.details}
                  </div>

                  {/* AI recommendation */}
                  {option.recommendation && (
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#00c962",
                        background: "rgba(0,165,80,0.08)",
                        borderRadius: "8px",
                        padding: "6px 10px",
                        marginBottom: "8px",
                        borderLeft: "2px solid #00A550",
                      }}
                    >
                      🤖 {option.recommendation}
                    </div>
                  )}

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        background: "rgba(255,255,255,0.06)",
                        borderRadius: "10px",
                        padding: "3px 8px",
                        fontSize: "10px",
                        color: "#d0d0e0",
                      }}
                    >
                      <Clock size={9} /> {option.duration} min
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        background:
                          option.co2 === 0
                            ? "rgba(0,165,80,0.15)"
                            : option.co2 < 400
                            ? "rgba(0,165,80,0.08)"
                            : "rgba(229,62,62,0.1)",
                        borderRadius: "10px",
                        padding: "3px 8px",
                        fontSize: "10px",
                        color: option.co2 === 0 ? "#00c962" : option.co2 < 400 ? "#86efac" : "#fc8181",
                      }}
                    >
                      🌿 {getCO2Label(option.co2)}
                    </span>
                    <span
                      style={{
                        background: "rgba(255,215,0,0.08)",
                        color: "#FFD700",
                        borderRadius: "10px",
                        padding: "3px 8px",
                        fontSize: "10px",
                      }}
                    >
                      {option.price}
                    </span>
                  </div>

                  {option.tip && (
                    <div style={{ marginTop: "8px", fontSize: "11px", color: "#55556a" }}>
                      💡 {option.tip}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
