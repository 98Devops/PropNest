import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider, DataProvider } from './parts/p1_imports_context.jsx'
import PropNestShell from './components/propnest/propnest-shell'
import { Toaster } from './components/ui/sonner'

const params = new URLSearchParams(window.location.search)
const showEfferd = params.has('efferd')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <DataProvider>
        {showEfferd ? <PropNestShell /> : <App />}
        <Toaster />
      </DataProvider>
    </AuthProvider>
  </StrictMode>,
)
