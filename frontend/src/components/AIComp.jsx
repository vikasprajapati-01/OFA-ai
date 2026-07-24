import React from 'react'
import { AiToolsData } from '../assets/data'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/react'
import { TbSparkles } from 'react-icons/tb'

const AIComp = () => {
  const navigate = useNavigate()
  const { user } = useUser()

  return (
    <section style={{
      padding: '100px 2rem',
      background: 'var(--bg-secondary)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle glow */}
      <div className="glow-orb" style={{
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, #6366f1, transparent)',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        opacity: 0.1,
        animationDuration: '10s',
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--accent-light)',
            border: '1px solid var(--accent)',
            borderRadius: '99px',
            padding: '5px 14px',
            marginBottom: '20px',
            fontSize: '0.78rem',
            color: 'var(--accent)',
            fontWeight: 500,
          }}>
            <TbSparkles style={{ width: '13px' }} /> Our Tools
          </div>
          <h2 className="section-title" style={{ marginBottom: '14px' }}>Powerful AI Tools</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
            Everything you need to supercharge your daily creative workflow.
          </p>
        </div>

        {/* Tool cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}>
          {AiToolsData.map((tool, index) => (
            <div
              key={index}
              className="glass-card"
              onClick={() => user && navigate(tool.path)}
              style={{
                padding: '28px',
                cursor: user ? 'pointer' : 'default',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Icon */}
              <div style={{
                width: '52px', height: '52px',
                borderRadius: '14px',
                background: `linear-gradient(135deg, ${tool.bg.from}, ${tool.bg.to})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                boxShadow: `0 4px 16px ${tool.bg.from}40`,
              }}>
                <tool.Icon style={{ width: '24px', height: '24px', color: '#fff' }} />
              </div>

              <h3 style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                color: 'var(--text)',
                marginBottom: '8px',
              }}>
                {tool.title}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                {tool.description}
              </p>

              {/* Hover accent line */}
              <div style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                height: '2px',
                background: `linear-gradient(90deg, ${tool.bg.from}, ${tool.bg.to})`,
                transform: 'scaleX(0)',
                transformOrigin: 'left',
                transition: 'transform 0.3s ease',
              }}
              className="tool-underline"
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .glass-card:hover .tool-underline { transform: scaleX(1) !important; }
      `}</style>
    </section>
  )
}

export default AIComp
