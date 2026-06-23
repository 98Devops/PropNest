import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider, DataProvider } from './parts/p1_imports_context.jsx'
import PropNestShell from './components/propnest/propnest-shell'
import { Toaster } from './components/ui/sonner'

// The new PropNest shell is the default UI. /?legacy=1 falls back to the
// original App for features the new shell hasn't fused yet (inline tenant
// edits, payment edit/delete, room rename/delete, repair-coverage admin).
const params = new URLSearchParams(window.location.search)
const showLegacy = params.has('legacy')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <DataProvider>
        {showLegacy ? <App /> : <PropNestShell />}
        <Toaster />
      </DataProvider>
    </AuthProvider>
  </StrictMode>,
)
