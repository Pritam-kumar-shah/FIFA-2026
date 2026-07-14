import { STATUS, COLOR, STADIUM } from '../utils/constants';

export const INITIAL_GATES = [
  { id: 'G1', name: 'Gate 1 - North Main', zone: 'North', occupancy: 42, capacity: 12000, status: STATUS.OK, color: COLOR.OK },
  { id: 'G2', name: 'Gate 2 - North Side', zone: 'North', occupancy: 38, capacity: 8000, status: STATUS.OK, color: COLOR.OK },
  { id: 'G3', name: 'Gate 3 - East', zone: 'East', occupancy: 71, capacity: 10000, status: STATUS.OK, color: COLOR.OK },
  { id: 'G4', name: 'Gate 4 - East Lower', zone: 'East', occupancy: 88, capacity: 7000, status: STATUS.CRITICAL, color: COLOR.CRITICAL },
  { id: 'G5', name: 'Gate 5 - South Main', zone: 'South', occupancy: 55, capacity: 12000, status: STATUS.OK, color: COLOR.OK },
  { id: 'G6', name: 'Gate 6 - South Side', zone: 'South', occupancy: 63, capacity: 8000, status: STATUS.OK, color: COLOR.OK },
  { id: 'G7', name: 'Gate 7 - West', zone: 'West', occupancy: 34, capacity: 10000, status: STATUS.OK, color: COLOR.OK },
  { id: 'G8', name: 'Gate 8 - West Lower', zone: 'West', occupancy: 28, capacity: 7000, status: STATUS.OK, color: COLOR.OK },
];

/**
 * Returns status classification based on occupancy percentage.
 * @param {number} occ - Occupancy percentage (0-100)
 * @returns {string} Status string: 'ok', 'warning', or 'critical'
 */
export function getStatus(occ) {
  if (occ >= 85) return STATUS.CRITICAL;
  if (occ >= 70) return STATUS.WARNING;
  return STATUS.OK;
}

/**
 * Returns display color for a given status.
 * @param {string} status - Gate status ('ok', 'warning', 'critical')
 * @returns {string} Hex color code
 */
export function getColor(status) {
  if (status === STATUS.CRITICAL) return COLOR.CRITICAL;
  if (status === STATUS.WARNING) return COLOR.WARNING;
  return COLOR.OK;
}

// Local simulation state initialized with INITIAL_GATES
let simulatedGates = [...INITIAL_GATES];

/**
 * Generates current gate data with simulated occupancy changes.
 * Modifies local simulated state.
 * @returns {Array<Object>} Array of gate objects
 */
export function getGateData() {
  simulatedGates = simulateStep(simulatedGates);
  return simulatedGates;
}

/**
 * Simulates a single step of occupancy changes.
 * @param {Array<Object>} gates - Current gate state
 * @returns {Array<Object>} Next gate state
 */
export function simulateStep(gates) {
  return gates.map(g => {
    const delta = Math.floor(Math.random() * 7) - 2; // -2 to +4
    const occ = Math.min(98, Math.max(10, g.occupancy + delta));
    const s = getStatus(occ);
    return { ...g, occupancy: occ, status: s, color: getColor(s) };
  });
}

/**
 * Calculates aggregate stadium statistics from gate data.
 * @param {Array<Object>} gateData - Current gate occupancy list
 * @returns {Object} Stadium statistics
 */
export function getStadiumStats(gateData) {
  if (!gateData || gateData.length === 0) {
    return {
      stadiumName: STADIUM.NAME,
      city: STADIUM.CITY,
      capacity: STADIUM.CAPACITY,
      totalFans: 0,
      avgOccupancy: 0,
      criticalGates: 0,
      totalGates: 0,
    };
  }

  const avgOccupancy = Math.round(gateData.reduce((sum, g) => sum + g.occupancy, 0) / gateData.length);
  const totalFans = Math.round((avgOccupancy / 100) * STADIUM.CAPACITY);
  const criticalGates = gateData.filter(g => g.status === STATUS.CRITICAL).length;

  return {
    stadiumName: STADIUM.NAME,
    city: STADIUM.CITY,
    capacity: STADIUM.CAPACITY,
    totalFans,
    avgOccupancy,
    criticalGates,
    totalGates: gateData.length,
  };
}
export function getStatusFromOccupancy(occupancy) {
  return getStatus(occupancy);
}
export function getStatusColor(status) {
  return getColor(status);
}
