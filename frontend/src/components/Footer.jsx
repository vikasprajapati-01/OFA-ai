import React from 'react'
import Logo from '../assets/Unomate.png'

const footerLinks = {
  Company: ['About us', 'Contact us', 'Privacy policy', 'Terms of Service'],
  Product: ['AI Tools', 'Pricing', 'Blog', 'Changelog'],
}

const Footer = () => {
  return (
    <footer style={{
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border)',
      padding: '64px 2rem 0',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '48px',
        paddingBottom: '48px',
      }}>
        {/* Brand col */}
        <div>
          <img src={Logo} alt="Unomate" style={{ height: '32px', objectFit: 'contain', marginBottom: '16px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.8, maxWidth: '260px' }}>
            Use AI for faster content creation and design. Unomate provides a seamless experience for creators and businesses.
          </p>
        </div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <h3 style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)', marginBottom: '18px' }}>
              {title}
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {links.map(link => (
                <li key={link}>
                  <a href="#" style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Newsletter col */}
        <div>
          <h3 style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)', marginBottom: '18px' }}>
            Newsletter
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.7, marginBottom: '16px' }}>
            The latest news, articles, and resources, sent to your inbox weekly.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="email"
              placeholder="Enter your email"
              className="form-input"
              style={{ flex: 1, minWidth: 0 }}
            />
            <button className="btn-accent" style={{ whiteSpace: 'nowrap', borderRadius: '10px' }}>
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid var(--border)',
        padding: '20px 0',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.8rem',
      }}>
        Copyright 2026 © UnoMate. All Rights Reserved.
      </div>
    </footer>
  )
}

export default Footer
