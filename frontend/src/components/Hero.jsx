import React from 'react'
import { useNavigate } from 'react-router-dom'
import { TbSparkles } from 'react-icons/tb'
import { HiArrowRight } from 'react-icons/hi2'
import { useClerk } from '@clerk/react'

const Hero = () => {
  const navigate = useNavigate()
  const { openSignIn } = useClerk()

  return (
    <section style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      background: 'var(--bg)',
      paddingTop: '64px',
    }}>
      {/* Decorative glow orbs */}
      <div className="glow-orb" style={{
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, #6366f1, transparent)',
        top: '-100px', left: '-150px',
        animationDelay: '0s',
      }} />
      <div className="glow-orb" style={{
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, #8b5cf6, transparent)',
        bottom: '-80px', right: '-120px',
        animationDelay: '3s',
      }} />
      <div className="glow-orb" style={{
        width: '300px', height: '300px',
        background: 'radial-gradient(circle, #0ea5e9, transparent)',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        animationDelay: '1.5s',
        opacity: 0.12,
      }} />

      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(var(--border) 1px, transparent 1px),
          linear-gradient(90deg, var(--border) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        opacity: 0.4,
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        textAlign: 'center',
        padding: '0 1.5rem',
        maxWidth: '800px',
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--accent-light)',
          border: '1px solid var(--accent)',
          borderRadius: '99px',
          padding: '6px 16px',
          marginBottom: '32px',
          fontSize: '0.8rem',
          color: 'var(--accent)',
          fontWeight: 500,
        }}>
          <TbSparkles style={{ width: '15px', height: '15px' }} />
          Powered by Advanced AI
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 5rem)',
          fontWeight: 800,
          lineHeight: 1.1,
          marginBottom: '24px',
          color: 'var(--text)',
        }}>
          Let{' '}
          <span style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #0ea5e9)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            AI
          </span>
          {' '}create<br />for you
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '1.1rem',
          color: 'var(--text-secondary)',
          maxWidth: '500px',
          margin: '0 auto 40px',
          lineHeight: 1.7,
        }}>
          Transform your creativity with premium AI tools. Generate images, write articles, enhance workflows, and more.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/ai')}
            className="btn-accent"
            style={{ padding: '13px 32px', fontSize: '1rem', borderRadius: '12px' }}
          >
            Try now free <HiArrowRight />
          </button>
          <button
            className="btn-ghost"
            style={{ padding: '13px 32px', fontSize: '1rem', borderRadius: '12px' }}
          >
            Watch Demo
          </button>
        </div>

        {/* Social proof */}
        <div style={{
          marginTop: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '32px',
          flexWrap: 'wrap',
        }}>
          {[
            { label: '6+ AI Tools', sub: 'All in one place' },
            { label: '100% Secure', sub: 'Powered by Clerk' },
            { label: 'Free to Start', sub: 'No credit card' },
          ].map(({ label, sub }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)' }}>{label}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Hero
