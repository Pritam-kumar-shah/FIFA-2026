// Crowd simulator — shared between fan app and dashboard
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

function getStatus(occupancy) {
  if (occupancy >= 85) return "critical";
  if (occupancy >= 70) return "warning";
  return "ok";
}

function getColor(status) {
  if (status === "critical") return "#e53e3e";
  if (status === "warning") return "#f97316";
  return "#00A550";
}

export function simulateStep(gates) {
  return gates.map((gate) => {
    const delta = Math.floor(Math.random() * 7) - 2;
    const newOccupancy = Math.min(98, Math.max(10, gate.occupancy + delta));
    const status = getStatus(newOccupancy);
    return { ...gate, occupancy: newOccupancy, status, color: getColor(status) };
  });
}
