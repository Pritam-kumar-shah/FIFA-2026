export const INITIAL_GATES = [
  { id: "G1", name: "Gate 1 - North Main", zone: "North", occupancy: 42, capacity: 12000, status: "ok", color: "#00A550" },
  { id: "G2", name: "Gate 2 - North Side", zone: "North", occupancy: 38, capacity: 8000, status: "ok", color: "#00A550" },
  { id: "G3", name: "Gate 3 - East", zone: "East", occupancy: 71, capacity: 10000, status: "ok", color: "#00A550" },
  { id: "G4", name: "Gate 4 - East Lower", zone: "East", occupancy: 88, capacity: 7000, status: "critical", color: "#e53e3e" },
  { id: "G5", name: "Gate 5 - South Main", zone: "South", occupancy: 55, capacity: 12000, status: "ok", color: "#00A550" },
  { id: "G6", name: "Gate 6 - South Side", zone: "South", occupancy: 63, capacity: 8000, status: "ok", color: "#00A550" },
  { id: "G7", name: "Gate 7 - West", zone: "West", occupancy: 34, capacity: 10000, status: "ok", color: "#00A550" },
  { id: "G8", name: "Gate 8 - West Lower", zone: "West", occupancy: 28, capacity: 7000, status: "ok", color: "#00A550" },
];

function getStatus(occ) {
  if (occ >= 85) return "critical";
  if (occ >= 70) return "warning";
  return "ok";
}

function getColor(s) {
  if (s === "critical") return "#e53e3e";
  if (s === "warning") return "#f97316";
  return "#00A550";
}

export function simulateStep(gates) {
  return gates.map(g => {
    const delta = Math.floor(Math.random() * 7) - 2;
    const occ = Math.min(98, Math.max(10, g.occupancy + delta));
    const s = getStatus(occ);
    return { ...g, occupancy: occ, status: s, color: getColor(s) };
  });
}
