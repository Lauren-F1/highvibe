'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '1rem' }}>Something went wrong</h1>
          <p style={{ color: '#666', marginBottom: '1.5rem', maxWidth: '28rem' }}>
            A critical error occurred. Please try refreshing the page.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={reset}
              style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', backgroundColor: '#000', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
            >
              Try Again
            </button>
            <a
              href="/"
              style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', border: '1px solid #ccc', textDecoration: 'none', color: '#000', fontSize: '0.875rem' }}
            >
              Go Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
