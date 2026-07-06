'use client';
import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: '#161B22',
          color: '#E6EDF3',
          border: '1px solid #21262D',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '14px',
          maxWidth: '380px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        },
        success: {
          iconTheme: { primary: '#22C55E', secondary: '#0A0B0D' },
        },
        error: {
          iconTheme: { primary: '#EF4444', secondary: '#0A0B0D' },
        },
      }}
    />
  );
}

export { default as toast } from 'react-hot-toast';
