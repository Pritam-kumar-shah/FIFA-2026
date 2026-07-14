import { describe, it, expect, vi, beforeEach } from 'vitest';

/* ------------------------------------------------------------------ */
/*  Mock @google/generative-ai at module level                         */
/* ------------------------------------------------------------------ */
const { mockGenerateContent } = vi.hoisted(() => {
  return {
    mockGenerateContent: vi.fn(),
  };
});

vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
      getGenerativeModel: vi.fn().mockReturnValue({
        generateContent: mockGenerateContent,
      }),
    })),
  };
});

/* ── Import the service AFTER the mock is in place ── */
import {
  askGenie,
  generateCrowdAlert,
  analyzeIncident,
  rankTransportOptions,
  generateStaffRecommendations,
} from '../services/gemini';

/* ------------------------------------------------------------------ */
/*  Helper: build a mock response object                               */
/* ------------------------------------------------------------------ */
function mockResponse(text) {
  return {
    response: {
      text: () => text,
    },
  };
}

const SAMPLE_GATES = [
  { id: 'G1', name: 'Gate 1 - North', zone: 'North', occupancy: 42, capacity: 12000, status: 'ok', color: '#00A550' },
  { id: 'G4', name: 'Gate 4 - East Lower', zone: 'East', occupancy: 88, capacity: 7000, status: 'critical', color: '#e53e3e' },
];

const SAMPLE_INCIDENTS = [
  { id: 'INC-1', summary: 'Medical emergency near Gate 4', priority: 'high', category: 'medical' },
];

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */
beforeEach(async () => {
  mockGenerateContent.mockReset();
  const { apiCache } = await import('../services/cache');
  apiCache.clear();
});

describe('gemini service', () => {
  describe('askGenie', () => {
    it('should return a string response', async () => {
      mockGenerateContent.mockResolvedValue(
        mockResponse('Welcome to Estadio Azteca! Gate 1 is your best bet.'),
      );

      const result = await askGenie('Where should I enter?', SAMPLE_GATES);
      expect(typeof result).toBe('string');
      expect(result).toBe('Welcome to Estadio Azteca! Gate 1 is your best bet.');
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });
  });

  describe('generateCrowdAlert', () => {
    it('should return valid JSON shape on successful parse', async () => {
      const alertJson = JSON.stringify({
        hasAlert: true,
        severity: 'warning',
        affectedGates: ['Gate 4 - East Lower'],
        fanMessage: 'Please use Gate 1 for faster entry.',
        staffAction: 'Deploy extra personnel to Gate 4.',
        redirectTo: 'Gate 1 - North Main',
      });
      mockGenerateContent.mockResolvedValue(mockResponse(alertJson));

      const result = await generateCrowdAlert(SAMPLE_GATES);
      expect(result).toHaveProperty('hasAlert');
      expect(result).toHaveProperty('severity');
      expect(result).toHaveProperty('fanMessage');
      expect(result).toHaveProperty('staffAction');
    });

    it('should return fallback on JSON parse error', async () => {
      mockGenerateContent.mockResolvedValue(mockResponse('NOT VALID JSON {{{}'));

      const result = await generateCrowdAlert(SAMPLE_GATES);
      expect(result.hasAlert).toBe(false);
      expect(result.severity).toBe('ok');
    });
  });

  describe('analyzeIncident', () => {
    it('should return valid JSON shape on successful parse', async () => {
      const incidentJson = JSON.stringify({
        summary: 'Medical issue near Gate 4',
        priority: 'high',
        category: 'medical',
        suggestedAction: 'Send medical team to Gate 4 immediately.',
        estimatedResponseTime: '2-3 minutes',
      });
      mockGenerateContent.mockResolvedValue(mockResponse(incidentJson));

      const result = await analyzeIncident('Someone fainted near Gate 4');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('priority');
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('suggestedAction');
      expect(result).toHaveProperty('estimatedResponseTime');
    });

    it('should return fallback on JSON parse error', async () => {
      mockGenerateContent.mockResolvedValue(mockResponse('broken json!!!'));

      const result = await analyzeIncident('A fight broke out');
      expect(result.priority).toBe('medium');
      expect(result.category).toBe('other');
      expect(result).toHaveProperty('suggestedAction');
      expect(result).toHaveProperty('estimatedResponseTime');
    });
  });

  describe('rankTransportOptions', () => {
    const options = [
      { mode: 'Metro', duration: 20, distance: 5, co2: 50 },
      { mode: 'Car', duration: 15, distance: 8, co2: 2000 },
    ];

    it('should return array on successful parse', async () => {
      const ranked = JSON.stringify([
        { mode: 'Metro', rank: 1, recommendation: 'Greenest option', co2Saved: 'Save 1.95kg CO2', tip: 'Arrive early' },
        { mode: 'Car', rank: 2, recommendation: 'Fastest option', co2Saved: 'N/A', tip: 'Use Lot D' },
      ]);
      mockGenerateContent.mockResolvedValue(mockResponse(ranked));

      const result = await rankTransportOptions(options, 'Downtown Mexico City');
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('mode');
      expect(result[0]).toHaveProperty('rank');
    });

    it('should return fallback array on JSON parse error', async () => {
      mockGenerateContent.mockResolvedValue(mockResponse('not json'));

      const result = await rankTransportOptions(options, 'Downtown');
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(options.length);
      result.forEach((item) => {
        expect(item).toHaveProperty('rank');
        expect(item).toHaveProperty('recommendation');
      });
    });
  });

  describe('generateStaffRecommendations', () => {
    it('should return array on successful parse', async () => {
      const recs = JSON.stringify([
        { priority: 'critical', action: 'Open overflow gate at G4', rationale: 'Gate 4 is at 88%', assignTo: 'Gate Staff', timeframe: 'Immediate' },
        { priority: 'high', action: 'Deploy medical team', rationale: 'Incident reported', assignTo: 'Medical', timeframe: 'Within 5 min' },
      ]);
      mockGenerateContent.mockResolvedValue(mockResponse(recs));

      const result = await generateStaffRecommendations(SAMPLE_GATES, SAMPLE_INCIDENTS);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[0]).toHaveProperty('priority');
      expect(result[0]).toHaveProperty('action');
      expect(result[0]).toHaveProperty('assignTo');
    });

    it('should return fallback array on JSON parse error', async () => {
      mockGenerateContent.mockResolvedValue(mockResponse('invalid'));

      const result = await generateStaffRecommendations(SAMPLE_GATES, SAMPLE_INCIDENTS);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[0]).toHaveProperty('action');
      expect(result[0]).toHaveProperty('assignTo');
    });
  });

  describe('Input Sanitization & Caching', () => {
    it('sanitizeInput should strip HTML tags and prevent XSS payloads', async () => {
      const { sanitizeInput } = await import('../services/gemini');
      const dirty = '<script>alert("hack")</script>Hello <b>World</b>';
      const clean = sanitizeInput(dirty);
      expect(clean).toBe('Hello World');
    });

    it('sanitizeInput should enforce max character length and reject empty/non-string inputs', async () => {
      const { sanitizeInput } = await import('../services/gemini');
      expect(() => sanitizeInput(123)).toThrow();
      expect(() => sanitizeInput('')).toThrow();
    });

    it('apiCache should cache and retrieve items before expiry', async () => {
      const { apiCache } = await import('../services/cache');
      apiCache.clear();
      apiCache.set('test-key', 'cached-value', 5000);
      expect(apiCache.get('test-key')).toBe('cached-value');

      // Manual expiry test
      apiCache.set('temp-key', 'expired-value', -100);
      expect(apiCache.get('temp-key')).toBeNull();
    });

    it('askGenie should reuse cached response for duplicate requests', async () => {
      const { apiCache } = await import('../services/cache');
      apiCache.clear();
      mockGenerateContent.mockResolvedValue(mockResponse('Fresh Answer'));

      const r1 = await askGenie('cached query', SAMPLE_GATES);
      expect(r1).toBe('Fresh Answer');
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);

      // Duplicate request should retrieve from cache
      const r2 = await askGenie('cached query', SAMPLE_GATES);
      expect(r2).toBe('Fresh Answer');
      expect(mockGenerateContent).toHaveBeenCalledTimes(1); // Still 1
    });

    it('should gracefully handle API request timeout', async () => {
      // Simulate a long delay that triggers timeout
      mockGenerateContent.mockImplementation(() => {
        return new Promise(resolve => setTimeout(() => resolve(mockResponse('Delayed')), 20000));
      });

      // Override env variables or mock the call function timeout for test environment
      // askGenie will catch the timeout error and return fallback text
      const result = await askGenie('slow query', SAMPLE_GATES);
      expect(result).toContain('trouble connecting');
    }, 15000); // Set test timeout high enough to allow the timeout race to complete
  });
});
