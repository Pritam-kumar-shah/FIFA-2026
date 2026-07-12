import { MessageSquare, Activity, Truck, Eye, LayoutDashboard } from "lucide-react";

export default function NavBar({ active, setActive }) {
  const tabs = [
    { id: "chat", label: "Concierge", icon: MessageSquare },
    { id: "gates", label: "Gates", icon: Activity },
    { id: "transport", label: "Transport", icon: Truck },
    { id: "access", label: "Accessibility", icon: Eye },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "rgba(8,8,16,0.95)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        padding: "8px 16px 20px",
        display: "flex",
        gap: "8px",
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            id={`nav-${tab.id}`}
            onClick={() => setActive(tab.id)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              padding: "8px 4px",
              borderRadius: "12px",
              border: isActive ? "1px solid rgba(0,165,80,0.3)" : "1px solid transparent",
              background: isActive ? "rgba(0,165,80,0.12)" : "transparent",
              color: isActive ? "#00c962" : "#55556a",
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontSize: "10px",
              fontWeight: isActive ? 600 : 400,
              letterSpacing: "0.3px",
            }}
          >
            <Icon size={20} />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
