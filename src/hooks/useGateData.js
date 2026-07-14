import { useState, useEffect, useRef } from 'react';
import { getGateData, getStadiumStats } from '../services/crowdSimulator';

/**
 * Custom Hook: useGateData
 * Handles periodic polling and simulation of gate occupancy data and aggregates stats.
 * @param {number} intervalMs - Polling interval in milliseconds
 * @returns {Object} Object containing gates data and aggregated stadium stats
 */
export default function useGateData(intervalMs = 5000) {
  const [gates, setGates] = useState(() => getGateData());
  const [stats, setStats] = useState(() => getStadiumStats(gates));
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const nextGates = getGateData();
      setGates(nextGates);
      setStats(getStadiumStats(nextGates));
    }, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [intervalMs]);

  return { gates, stats };
}
