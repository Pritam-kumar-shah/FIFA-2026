import { describe, it, expect } from 'vitest';
import { INITIAL_GATES, simulateStep } from '../services/crowdSimulator';

describe('crowdSimulator', () => {
  describe('INITIAL_GATES', () => {
    it('should contain exactly 8 gates', () => {
      expect(INITIAL_GATES).toHaveLength(8);
    });

    it('each gate should have all required properties', () => {
      const requiredKeys = ['id', 'name', 'zone', 'occupancy', 'capacity', 'status', 'color'];
      INITIAL_GATES.forEach((gate) => {
        requiredKeys.forEach((key) => {
          expect(gate).toHaveProperty(key);
        });
      });
    });

    it('all gates should have numeric occupancy between 0 and 100', () => {
      INITIAL_GATES.forEach((gate) => {
        expect(typeof gate.occupancy).toBe('number');
        expect(gate.occupancy).toBeGreaterThanOrEqual(0);
        expect(gate.occupancy).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('simulateStep', () => {
    it('should return the same number of gates', () => {
      const result = simulateStep(INITIAL_GATES);
      expect(result).toHaveLength(INITIAL_GATES.length);
    });

    it('should keep occupancy within bounds (10-98)', () => {
      // Run multiple simulation steps to exercise the clamp logic
      let gates = INITIAL_GATES;
      for (let i = 0; i < 50; i++) {
        gates = simulateStep(gates);
        gates.forEach((gate) => {
          expect(gate.occupancy).toBeGreaterThanOrEqual(10);
          expect(gate.occupancy).toBeLessThanOrEqual(98);
        });
      }
    });

    it('should assign status "ok" for occupancy < 70', () => {
      const testGates = [
        { id: 'T1', name: 'Test', zone: 'N', occupancy: 50, capacity: 1000, status: 'ok', color: '#00A550' },
      ];
      // Run many times; if occupancy stays < 70 the status must be "ok"
      // We directly test the rule: create a gate with occupancy that will stay in ok range
      const lowGates = [
        { id: 'T1', name: 'Test', zone: 'N', occupancy: 15, capacity: 1000, status: 'ok', color: '#00A550' },
      ];
      const result = simulateStep(lowGates);
      // After one step from 15, max possible is 15 + 4 = 19 which is < 70
      result.forEach((gate) => {
        expect(gate.status).toBe('ok');
      });
    });

    it('should assign status "warning" for occupancy 70-84', () => {
      // Create a gate stuck at 75; after one step it can go 73-79, still warning
      const warnGates = [
        { id: 'T1', name: 'Test', zone: 'N', occupancy: 76, capacity: 1000, status: 'ok', color: '#00A550' },
      ];
      const result = simulateStep(warnGates);
      // Occupancy could range from 74 (warning) to 80 (warning) — delta is -2 to +4
      // 76-2=74 → warning, 76+4=80 → warning. Both are in 70-84. Always warning.
      result.forEach((gate) => {
        expect(gate.status).toBe('warning');
      });
    });

    it('should assign status "critical" for occupancy >= 85', () => {
      // Create a gate at 93; after one step range is 91-97, all critical
      const critGates = [
        { id: 'T1', name: 'Test', zone: 'N', occupancy: 93, capacity: 1000, status: 'ok', color: '#00A550' },
      ];
      const result = simulateStep(critGates);
      // 93-2=91 → critical, 93+4=97 → critical (capped at 98)
      result.forEach((gate) => {
        expect(gate.status).toBe('critical');
      });
    });

    it('should assign color matching the status', () => {
      const colorMap = {
        ok: '#00A550',
        warning: '#f97316',
        critical: '#e53e3e',
      };
      let gates = INITIAL_GATES;
      for (let i = 0; i < 20; i++) {
        gates = simulateStep(gates);
        gates.forEach((gate) => {
          expect(gate.color).toBe(colorMap[gate.status]);
        });
      }
    });
  });
});
