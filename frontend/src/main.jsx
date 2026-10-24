import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/react'
import axios from 'axios'
import { ThemeProvider } from './context/ThemeContext.jsx'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

createRoot(document.getElementById('root')).render(
  <ThemeProvider>
        <ClerkProvider
          publishableKey={PUBLISHABLE_KEY}
          signInForceRedirectUrl="/ai"
          signUpForceRedirectUrl="/ai"
        >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </ThemeProvider>
)
