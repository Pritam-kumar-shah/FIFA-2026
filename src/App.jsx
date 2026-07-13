import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';

/* ── Lazy-load route components for code splitting ── */
const LandingPage = lazy(() => import('./components/shared/LandingPage'));
const FanApp = lazy(() => import('./components/fan/FanApp'));
const OpsApp = lazy(() => import('./components/ops/OpsApp'));

/* ── Loading spinner shown during lazy-load ── */
function LoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#06060f',
        flexDirection: 'column',
        gap: 16,
      }}
      role="status"
      aria-label="Loading application"
    >
      <div
        style={{
          width: 44,
          height: 44,
          border: '3px solid rgba(255,255,255,0.08)',
          borderTopColor: '#00A550',
          borderRadius: '50%',
          animation: 'sg-spin 0.8s linear infinite',
        }}
      />
      <span
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 14,
          color: 'rgba(255,255,255,0.55)',
          fontWeight: 500,
        }}
      >
        Loading StadiumGenie…
      </span>
    </div>
  );
}

/* ================================================================== */
/*  Hash-based router                                                  */
/*  #/        → LandingPage                                           */
/*  #/fan     → Fan App                                               */
/*  #/ops     → Ops Dashboard                                        */
/* ================================================================== */
function getRoute() {
  const hash = window.location.hash.replace('#', '') || '/';
  if (hash.startsWith('/fan')) return 'fan';
  if (hash.startsWith('/ops')) return 'ops';
  return 'home';
}

export default function App() {
  const [route, setRoute] = useState(getRoute);

  /* Listen for hash changes */
  useEffect(() => {
    const handleHash = () => setRoute(getRoute());
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  /* Navigation helper */
  const navigate = useCallback((path) => {
    window.location.hash = path;
  }, []);

  const goHome = useCallback(() => navigate('/'), [navigate]);

  return (
    <>
      {/* ── Skip-to-content link (accessibility) ── */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <main id="main-content">
        <Suspense fallback={<LoadingFallback />}>
          {route === 'home' && (
            <LandingPage
              onFanClick={() => navigate('/fan')}
              onOpsClick={() => navigate('/ops')}
            />
          )}
          {route === 'fan' && <FanApp onBack={goHome} />}
          {route === 'ops' && <OpsApp onBack={goHome} />}
        </Suspense>
      </main>
    </>
  );
}
