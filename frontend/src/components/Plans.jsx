import React from 'react'
import { PricingTable } from '@clerk/react'

const Plans = () => {
  return (
    <section style={{
      padding: '100px 2rem',
      background: 'var(--bg)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative orb */}
      <div className="glow-orb" style={{
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, #8b5cf6, transparent)',
        top: '20%', right: '-150px',
        opacity: 0.15,
        animationDelay: '2s',
      }} />

      <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{
            display: 'inline-block',
            background: 'var(--accent-light)',
            border: '1px solid var(--accent)',
            borderRadius: '99px',
            padding: '5px 14px',
            marginBottom: '20px',
            fontSize: '0.78rem',
            color: 'var(--accent)',
            fontWeight: 500,
          }}>
            Pricing
          </div>
          <h2 className="section-title" style={{ marginBottom: '14px' }}>Choose Your Plan</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Start free and upgrade anytime. No credit card required to begin.
          </p>
        </div>

        {/* Clerk's PricingTable — untouched */}
        <div>
          <PricingTable />
        </div>
      </div>
    </section>
  )
}

export default Plans
