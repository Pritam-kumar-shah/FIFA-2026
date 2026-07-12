import { useState, useEffect, useCallback } from "react";
import { Toaster, toast } from "react-hot-toast";
import Header from "./components/Header";
import NavBar from "./components/NavBar";
import ChatInterface from "./components/ChatInterface";
import GateStatus from "./components/GateStatus";
import AccessibilityToggle from "./components/AccessibilityToggle";
import TransportAdvisor from "./components/TransportAdvisor";
import { INITIAL_GATES, simulateStep } from "./crowdSimulator";
import { generateCrowdAlert } from "./gemini";

export default function App() {
  const [activeTab, setActiveTab] = useState("chat");
  const [gates, setGates] = useState(INITIAL_GATES);
  const [crowdAlert, setCrowdAlert] = useState(null);
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [lastAlertCheck, setLastAlertCheck] = useState(Date.now());

  // Apply accessibility class to body
  useEffect(() => {
    if (accessibilityMode) {
      document.body.classList.add("large-text");
    } else {
      document.body.classList.remove("large-text");
    }
  }, [accessibilityMode]);

  // Crowd simulator — updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setGates((prev) => simulateStep(prev));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // AI crowd analysis — checks every 30 seconds
  useEffect(() => {
    const checkCrowd = async () => {
      try {
        const alert = await generateCrowdAlert(gates);
        if (alert?.hasAlert && alert.fanMessage) {
          setCrowdAlert(alert);
          if (alert.severity === "critical") {
            toast.error(`🚨 ${alert.fanMessage}`, {
              duration: 6000,
              style: {
                background: "rgba(229,62,62,0.15)",
                border: "1px solid rgba(229,62,62,0.4)",
                color: "#fc8181",
                fontFamily: "Inter, sans-serif",
                fontSize: "13px",
              },
            });
          } else if (alert.severity === "warning") {
            toast(`⚠️ ${alert.fanMessage}`, {
              duration: 5000,
              style: {
                background: "rgba(249,115,22,0.15)",
                border: "1px solid rgba(249,115,22,0.3)",
                color: "#fb923c",
                fontFamily: "Inter, sans-serif",
                fontSize: "13px",
              },
            });
          }
        } else {
          setCrowdAlert(null);
        }
      } catch (err) {
        // Silent fail — don't disrupt user experience
      }
    };

    const interval = setInterval(checkCrowd, 30000);
    // Run once immediately on mount
    checkCrowd();
    return () => clearInterval(interval);
  }, [gates]);

  const handleAccessibilityToggle = (val) => {
    setAccessibilityMode(val);
    if (val) {
      toast.success("♿ Accessibility mode enabled", {
        style: {
          background: "rgba(0,165,80,0.15)",
          border: "1px solid rgba(0,165,80,0.3)",
          color: "#00c962",
          fontFamily: "Inter, sans-serif",
          fontSize: "13px",
        },
      });
    }
  };

  const HEADER_HEIGHT = crowdAlert?.hasAlert ? 160 : 128;

  return (
    <div style={{ position: "relative", minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Animated background */}
      <div className="bg-mesh" />

      {/* Toast notifications */}
      <Toaster position="top-center" containerStyle={{ top: HEADER_HEIGHT + 8 }} />

      {/* Header */}
      <Header alert={crowdAlert} accessibilityMode={accessibilityMode} />

      {/* Main content */}
      <main
        style={{
          paddingTop: `${HEADER_HEIGHT + 8}px`,
          paddingBottom: "90px",
          minHeight: "100vh",
          position: "relative",
          zIndex: 1,
        }}
      >
        {activeTab === "chat" && (
          <div
            style={{
              height: `calc(100vh - ${HEADER_HEIGHT + 8 + 90}px)`,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <ChatInterface gates={gates} accessibilityMode={accessibilityMode} />
          </div>
        )}

        {activeTab === "gates" && (
          <GateStatus gates={gates} alert={crowdAlert} accessibilityMode={accessibilityMode} />
        )}

        {activeTab === "transport" && (
          <TransportAdvisor accessibilityMode={accessibilityMode} />
        )}

        {activeTab === "access" && (
          <AccessibilityToggle
            accessibilityMode={accessibilityMode}
            setAccessibilityMode={handleAccessibilityToggle}
          />
        )}
      </main>

      {/* Bottom nav */}
      <NavBar active={activeTab} setActive={setActiveTab} />
    </div>
  );
}
