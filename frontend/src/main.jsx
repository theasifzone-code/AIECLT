
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Failed to find the root element')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1e293b',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '16px 20px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        },
        success: {
          icon: '✅',
          style: {
            background: '#065f46',
            color: '#6ee7b7',
            border: '1px solid rgba(52, 211, 153, 0.2)',
          },
        },
        error: {
          icon: '❌',
          style: {
            background: '#7f1d1d',
            color: '#fca5a5',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          },
        },
        loading: {
          style: {
            background: '#1e3a8a',
            color: '#93c5fd',
            border: '1px solid rgba(59, 130, 246, 0.2)',
          },
        },
      }}
    />
  </StrictMode>
)