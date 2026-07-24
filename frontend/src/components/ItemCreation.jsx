import React, { useState } from 'react'
import Markdown from 'react-markdown'
import { HiChevronDown, HiChevronUp } from 'react-icons/hi2'

const typeColors = {
  image: { from: '#3588F2', to: '#0BB0D7' },
  article: { from: '#6366f1', to: '#8b5cf6' },
  blog: { from: '#C341F6', to: '#8E37EB' },
  resume: { from: '#00DA83', to: '#009BB3' },
}

const ItemCreation = ({ item }) => {
  const [expanded, setExpanded] = useState(false)
  const colors = typeColors[item.type] || { from: '#6366f1', to: '#8b5cf6' }

  return (
    <div
      className="glass-card"
      onClick={() => setExpanded(!expanded)}
      style={{ padding: '16px 20px', cursor: 'pointer', borderRadius: '12px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--text)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginBottom: '4px',
          }}>
            {item.prompt}
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {item.type} · {new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {/* Type badge */}
          <span style={{
            background: `linear-gradient(135deg, ${colors.from}22, ${colors.to}22)`,
            border: `1px solid ${colors.from}44`,
            color: colors.from,
            padding: '3px 12px',
            borderRadius: '99px',
            fontSize: '0.72rem',
            fontWeight: 600,
            textTransform: 'capitalize',
          }}>
            {item.type}
          </span>
          {/* Expand icon */}
          <span style={{ color: 'var(--text-muted)', display: 'flex' }}>
            {expanded
              ? <HiChevronUp style={{ width: '16px', height: '16px' }} />
              : <HiChevronDown style={{ width: '16px', height: '16px' }} />
            }
          </span>
        </div>
      </div>

      {expanded && (
        <div style={{
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border)',
        }}>
          {item.type === 'image' ? (
            <img
              src={item.content}
              alt="Generated"
              style={{ width: '100%', maxWidth: '400px', borderRadius: '10px', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxHeight: '300px', overflowY: 'auto' }}>
              <div className="reset-tw">
                <Markdown>{item.content}</Markdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ItemCreation
