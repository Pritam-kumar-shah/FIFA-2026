import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ErrorBoundary from '../components/shared/ErrorBoundary';
import { STATUS, COLOR } from '../utils/constants';

vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key-123');

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
    // Suppress console.error for this test to avoid polluting log output
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <CrashComponent shouldCrash={true} />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset Application/i })).toBeInTheDocument();

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

import FanApp from '../components/fan/FanApp';
import OpsApp from '../components/ops/OpsApp';

describe('FanApp and OpsApp Rendering', () => {
  it('should render FanApp without throwing', () => {
    render(<ErrorBoundary><FanApp onBack={() => {}} /></ErrorBoundary>);
  });

  it('should render OpsApp without throwing', () => {
    render(<ErrorBoundary><OpsApp onBack={() => {}} /></ErrorBoundary>);
  });
});
