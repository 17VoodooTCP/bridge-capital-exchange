'use client';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ background: '#0A0B0D', color: '#E6EDF3', fontFamily: 'Arial, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', margin: 0, textAlign: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ fontSize: 14, color: '#8B949E', marginBottom: 20 }}>Your funds and account are safe.</p>
          <button
            onClick={reset}
            style={{ background: '#F59E0B', color: '#000', border: 'none', padding: '10px 24px', borderRadius: 10, fontWeight: 'bold', fontSize: 14, cursor: 'pointer' }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
