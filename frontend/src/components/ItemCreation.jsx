import React, { useState } from 'react'
import Markdown from 'react-markdown'
import { HiChevronDown, HiChevronUp } from 'react-icons/hi2'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '@clerk/react'

const typeColors = {
  image: { from: '#3588F2', to: '#0BB0D7' },
  article: { from: '#6366f1', to: '#8b5cf6' },
  blog: { from: '#C341F6', to: '#8E37EB' },
  resume: { from: '#00DA83', to: '#009BB3' },
}

const ItemCreation = ({ item }) => {
  const [expanded, setExpanded] = useState(false)
  const [content, setContent] = useState(item.content ?? null)
  const [loadingContent, setLoadingContent] = useState(false)
  const { getToken } = useAuth()
  const colors = typeColors[item.type] || { from: '#6366f1', to: '#8b5cf6' }
  
  // Text content is loaded only when the card is opened (images already have their URL)
  const handleToggle = async () => {
    const opening = !expanded
    setExpanded(opening)

    if (opening && content === null) {
      setLoadingContent(true)
      try {
        const { data } = await axios.get(`/api/user/get-creation/${item.id}`, {
          headers: { Authorization: `Bearer ${await getToken()}` }
        })
        if (data.success) setContent(data.content)
        else toast.error(data.message)
      } catch (error) {
        toast.error(error.response?.data?.message || error.message)
      }
      setLoadingContent(false)
    }
  }

  return (
    <div
      className="glass-card"
      onClick={handleToggle}
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
              src={content}
              alt="Generated"
              style={{ width: '100%', maxWidth: '400px', borderRadius: '10px', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxHeight: '300px', overflowY: 'auto' }}>
              <div className="reset-tw">
                {loadingContent ? <p>Loading...</p> : <Markdown>{content || ''}</Markdown>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ItemCreation
