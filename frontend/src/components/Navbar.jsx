import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowRight } from 'react-icons/fa6'
import { HiSun, HiMoon } from 'react-icons/hi2'
import { useClerk, UserButton, useUser } from '@clerk/react'
import { useTheme } from '../context/ThemeContext'
import Logo from '../assets/Unomate.png'

const Navbar = () => {
  const navigate = useNavigate()
  const { user } = useUser()
  const { openSignIn } = useClerk()
  const { theme, toggleTheme } = useTheme()

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      background: 'var(--nav-bg)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 2rem',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <img
          src={Logo}
          alt="Unomate"
          onClick={() => navigate('/')}
          style={{ height: '36px', cursor: 'pointer', objectFit: 'contain' }}
        />

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            {theme === 'dark'
              ? <HiSun style={{ width: '18px', height: '18px', color: '#f59e0b' }} />
              : <HiMoon style={{ width: '18px', height: '18px', color: '#6366f1' }} />
            }
          </button>

          {/* Auth */}
          {user
            ? <UserButton />
            : (
              <button
                onClick={() => openSignIn({ forceRedirectUrl: '/ai' })}
                className="btn-accent"
                style={{ borderRadius: '99px', padding: '9px 22px' }}
              >
                Get started <FaArrowRight style={{ width: '14px', height: '14px' }} />
              </button>
            )
          }
        </div>
      </div>
    </nav>
  )
}

export default Navbar
