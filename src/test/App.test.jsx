import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, act } from '@testing-library/react';

/*
 * App lazy-loads LandingPage, FanApp, and OpsApp via React.lazy.
 * For unit tests we mock those lazy imports so the tests run
 * synchronously without needing every child component's full tree.
 */

/* ── Mock the lazy-loaded modules ── */
vi.mock('../components/shared/LandingPage', () => ({
  default: function MockLandingPage({ onFanClick, onOpsClick }) {
    return (
      <div data-testid="landing-page">
        <button role="button" onClick={onFanClick}>Fan Experience</button>
        <button role="button" onClick={onOpsClick}>Ops Dashboard</button>
      </div>
    );
  },
}));

vi.mock('../components/fan/FanApp', () => ({
  default: function MockFanApp() {
    return <div data-testid="fan-app">Fan App</div>;
  },
}));

vi.mock('../components/ops/OpsApp', () => ({
  default: function MockOpsApp() {
    return <div data-testid="ops-app">Ops App</div>;
  },
}));

import App from '../App';

describe('App', () => {
  it('should render without crashing', async () => {
    window.location.hash = '/';
    let container;
    await act(async () => {
      const utils = render(<App />);
      container = utils.container;
    });
    await screen.findByTestId('landing-page');
    expect(container).toBeTruthy();
  });

  it('should render the LandingPage on the home route', async () => {
    window.location.hash = '/';
    await act(async () => {
      render(<App />);
    });
    // React.lazy + Suspense — wait for the mocked component
    const landing = await screen.findByTestId('landing-page');
    expect(landing).toBeInTheDocument();
  });

  it('should show "Fan Experience" and "Ops Dashboard" buttons on LandingPage', async () => {
    window.location.hash = '/';
    await act(async () => {
      render(<App />);
    });
    const fanBtn = await screen.findByText('Fan Experience');
    const opsBtn = await screen.findByText('Ops Dashboard');
    expect(fanBtn).toBeInTheDocument();
    expect(opsBtn).toBeInTheDocument();
  });

  it('buttons should have proper button roles for accessibility', async () => {
    window.location.hash = '/';
    await act(async () => {
      render(<App />);
    });
    const buttons = await screen.findAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    buttons.forEach((btn) => {
      expect(btn.tagName).toBe('BUTTON');
    });
  });
});
