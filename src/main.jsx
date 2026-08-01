import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n/fonts.css'
import './i18n/i18n.js'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
        <App />
      </Suspense>
    </ErrorBoundary>
  </StrictMode>,
)
