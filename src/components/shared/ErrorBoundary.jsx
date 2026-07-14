import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * ErrorBoundary Component
 * Catches runtime errors in child components and displays a clean fallback UI.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.hash = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#06060f',
            color: '#f0f0f5',
            fontFamily: "'Inter', sans-serif",
            padding: 24,
            textAlign: 'center',
          }}
          role="alert"
          aria-live="assertive"
        >
          <div
            style={{
              fontSize: 48,
              marginBottom: 16,
            }}
          >
            ⚠️
          </div>
          <h1
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 28,
              fontWeight: 800,
              marginBottom: 12,
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              color: 'rgba(255,255,255,0.6)',
              maxWidth: 480,
              lineHeight: 1.6,
              marginBottom: 24,
              fontSize: 14,
            }}
          >
            An unexpected error occurred in the application. You can try to reset the application or go back to the landing page.
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: '12px 24px',
              borderRadius: 10,
              background: '#00A550',
              color: '#fff',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              transition: 'background 0.2s ease',
            }}
          >
            Reset Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};
