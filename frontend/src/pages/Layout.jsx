import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { FiX } from 'react-icons/fi'
import { AiOutlineMenu } from 'react-icons/ai'
import { HiSun, HiMoon } from 'react-icons/hi2'
import Sidebar from '../components/Sidebar'
import Logo from '../assets/Unomate.png'
import { useUser, SignIn } from '@clerk/react'
import { useTheme } from '../context/ThemeContext'

const Layout = () => {
  const navigate = useNavigate()
  const [sidebar, setSidebar] = useState(false)
  const { user } = useUser()
  const { theme, toggleTheme } = useTheme()

  return user ? (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: 'var(--bg)',
      color: 'var(--text)',
    }}>
      {/* Top nav */}
      <nav style={{
        width: '100%',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        zIndex: 20,
      }}>
        <img
          src={Logo}
          alt="Unomate"
          onClick={() => navigate('/')}
          style={{ height: '32px', cursor: 'pointer', objectFit: 'contain' }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title="Toggle theme"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            {theme === 'dark'
              ? <HiSun style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
              : <HiMoon style={{ width: '16px', height: '16px', color: '#6366f1' }} />
            }
          </button>

          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setSidebar(s => !s)}
            style={{
              display: 'none',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              width: '34px',
              height: '34px',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
            className="mobile-menu-btn"
          >
            {sidebar
              ? <FiX style={{ width: '16px', height: '16px' }} />
              : <AiOutlineMenu style={{ width: '16px', height: '16px' }} />
            }
          </button>
        </div>
      </nav>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        <Sidebar sidebar={sidebar} setSidebar={setSidebar} />
        <main style={{
          flex: 1,
          overflow: 'hidden',
          background: 'var(--bg)',
        }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  ) : (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'var(--bg)',
    }}>
      <SignIn afterSignInUrl="/ai" />
    </div>
  )
}

export default Layout
