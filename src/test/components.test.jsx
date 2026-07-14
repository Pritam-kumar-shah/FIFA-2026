import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, renderHook } from '@testing-library/react';
import ErrorBoundary from '../components/shared/ErrorBoundary';
import { STATUS, COLOR } from '../utils/constants';
import useGateData from '../hooks/useGateData';
import LandingPage from '../components/shared/LandingPage';
import FanApp from '../components/fan/FanApp';
import OpsApp from '../components/ops/OpsApp';
import AIChatbot from '../components/fan/AIChatbot';
import CrowdAlerts from '../components/fan/CrowdAlerts';
import TransportAdvisor from '../components/fan/TransportAdvisor';
import AccessibilityGuide from '../components/fan/AccessibilityGuide';
import StadiumHeatmap from '../components/ops/StadiumHeatmap';
import AIRecommendations from '../components/ops/AIRecommendations';
import IncidentFeed from '../components/ops/IncidentFeed';

// Mock Gemini service to prevent API calls in UI tests
vi.mock('../services/gemini', () => ({
  askGenie: vi.fn().mockResolvedValue('Mock AI response'),
  generateCrowdAlert: vi.fn().mockResolvedValue({
    hasAlert: true,
    severity: 'warning',
    fanMessage: 'Test alert message',
    staffAction: 'Test action',
  }),
  analyzeIncident: vi.fn().mockResolvedValue({
    summary: 'Test summary',
    priority: 'high',
    category: 'medical',
    suggestedAction: 'Test action',
    estimatedResponseTime: '2 min',
  }),
  rankTransportOptions: vi.fn().mockResolvedValue([
    { mode: 'Metro', rank: 1, recommendation: 'Eco', co2Saved: '1.2kg', tip: 'Tip' },
  ]),
  generateStaffRecommendations: vi.fn().mockResolvedValue([
    { priority: 'high', action: 'Action', rationale: 'Why', assignTo: 'Staff', timeframe: 'Immediate' },
  ]),
  sanitizeInput: vi.fn(text => text),
}));

// Mock window.speechSynthesis for accessibility text-to-speech tests
const mockSpeak = vi.fn();
const mockCancel = vi.fn();
if (typeof window !== 'undefined') {
  window.speechSynthesis = {
    speak: mockSpeak,
    cancel: mockCancel,
    speakUtterance: vi.fn(),
  };
}

// A simple crashing component for testing ErrorBoundary
const CrashComponent = ({ shouldCrash }) => {
  if (shouldCrash) {
    throw new Error('Crashed!');
  }
  return <div>Component is fine</div>;
};

describe('ErrorBoundary Component', () => {
  it('should render children normally if there is no error', () => {
    render(
      <ErrorBoundary>
        <CrashComponent shouldCrash={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Component is fine')).toBeInTheDocument();
  });

  it('should catch errors and render fallback UI with reset button', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <CrashComponent shouldCrash={true} />
      </ErrorBoundary>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    spy.mockRestore();
  });

  it('clicking reset button should reset error state', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    window.location.hash = '/different';
    render(
      <ErrorBoundary>
        <CrashComponent shouldCrash={true} />
      </ErrorBoundary>
    );
    const button = screen.getByRole('button', { name: /Reset Application/i });
    fireEvent.click(button);
    expect(window.location.hash).toBe('#/');
    spy.mockRestore();
  });
});

describe('Constants Module', () => {
  it('should export all status levels correctly', () => {
    expect(STATUS.OK).toBe('ok');
    expect(STATUS.WARNING).toBe('warning');
    expect(STATUS.CRITICAL).toBe('critical');
  });

  it('should export correct color codes', () => {
    expect(COLOR.OK).toBe('#00A550');
    expect(COLOR.WARNING).toBe('#f97316');
    expect(COLOR.CRITICAL).toBe('#e53e3e');
  });
});

describe('useGateData Custom Hook', () => {
  it('should return default gate data list and correct stats structure', () => {
    const { result } = renderHook(() => useGateData());
    expect(result.current.gates).toHaveLength(8);
    expect(result.current.stats).toHaveProperty('stadiumName', 'Estadio Azteca');
    expect(result.current.stats).toHaveProperty('capacity', 87523);
  });
});

describe('FanApp and OpsApp Rendering', () => {
  it('should render FanApp without throwing', () => {
    render(<ErrorBoundary><FanApp onBack={() => {}} /></ErrorBoundary>);
    expect(screen.getByText(/Fan Experience/i)).toBeInTheDocument();
  });

  it('should render OpsApp without throwing', () => {
    render(<ErrorBoundary><OpsApp onBack={() => {}} /></ErrorBoundary>);
    expect(screen.getByText(/Operations Overview/i)).toBeInTheDocument();
  });
});

describe('Subcomponent Suite', () => {
  const fakeGates = [
    { id: 'G1', name: 'Gate 1', zone: 'North', occupancy: 40, capacity: 12000, status: 'ok', color: '#00A550' },
  ];

  it('LandingPage should render features list', () => {
    render(<LandingPage onFanClick={vi.fn()} onOpsClick={vi.fn()} />);
    expect(screen.getByText(/Smart stadium assistant/i)).toBeInTheDocument();
  });

  it('AIChatbot should render welcome text and form input', () => {
    render(<AIChatbot gates={fakeGates} />);
    expect(screen.getByLabelText(/Type your message/i)).toBeInTheDocument();
  });

  it('CrowdAlerts should render live status layout', () => {
    render(<CrowdAlerts gates={fakeGates} />);
    expect(screen.getByText(/Crowd Monitor/i)).toBeInTheDocument();
  });

  it('TransportAdvisor should render option list', () => {
    render(<TransportAdvisor />);
    expect(screen.getByText(/Sustainable Transport/i)).toBeInTheDocument();
  });

  it('AccessibilityGuide should render properly', () => {
    render(<AccessibilityGuide />);
    expect(screen.getByText(/Display & Audio Settings/i)).toBeInTheDocument();
  });

  it('StadiumHeatmap should render oval layout', () => {
    render(<StadiumHeatmap gates={fakeGates} />);
    expect(screen.getByText(/Avg Occupancy/i)).toBeInTheDocument();
  });

  it('AIRecommendations should render staff command controls', () => {
    render(<AIRecommendations gates={fakeGates} incidents={[]} />);
    expect(screen.getByText(/AI Command Center/i)).toBeInTheDocument();
  });

  it('IncidentFeed should render incident input layout', () => {
    render(<IncidentFeed incidents={[]} onAddIncident={vi.fn()} />);
    const btn = screen.getByRole('button', { name: /Report Incident/i });
    fireEvent.click(btn);
    expect(screen.getByPlaceholderText(/Describe the incident/i)).toBeInTheDocument();
  });
});
