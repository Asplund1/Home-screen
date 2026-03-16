import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Här monteras hela React-appen in i div:en med id="root" i index.html.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* StrictMode hjälper under utveckling genom att hitta osäkra React-mönster tidigt. */}
    <App />
  </StrictMode>,
)
