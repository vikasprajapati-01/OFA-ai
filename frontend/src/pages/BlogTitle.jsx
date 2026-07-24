import React, { useState } from 'react'
import { TbSparkles } from 'react-icons/tb'
import { FaHashtag, FaCopy, FaCheck } from 'react-icons/fa'
import toast from 'react-hot-toast'
import Markdown from 'react-markdown'
import { useAuth } from '@clerk/react'
import axios from 'axios'

const ACCENT_FROM = '#C341F6'
const ACCENT_TO   = '#8E37EB'

const blogCategories = ['General', 'Technology', 'Health', 'Travel', 'Finance', 'Education', 'Food', 'Lifestyle', 'Entertainment', 'Sports']

const SkeletonLoader = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
    {[90, 70, 85, 60, 95, 75].map((w, i) => (
      <div key={i} className="skeleton" style={{ height: '14px', width: `${w}%` }} />
    ))}
  </div>
)

const BlogTitle = () => {
  const [selectedCategory, setSelectedCategory] = useState(blogCategories[0])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [copied, setCopied] = useState(false)

  const { getToken } = useAuth()

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setContent('')
      const prompt = `Generate a blog title about ${input} in the ${selectedCategory} category.`
      const { data } = await axios.post('/api/ai/generate-blog-title',
        { prompt },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      )
      if (data.success) setContent(data.data)
      else toast.error(data.message)
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="tool-page">
      {/* ── Left: Input panel ── */}
      <div className="tool-input-panel">
        {/* Header */}
        <div style={{
          padding: '14px 16px',
          background: `linear-gradient(135deg, ${ACCENT_FROM}18, ${ACCENT_TO}10)`,
          border: `1px solid ${ACCENT_FROM}30`,
          borderRadius: '12px',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '9px',
            background: `linear-gradient(135deg, ${ACCENT_FROM}, ${ACCENT_TO})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <TbSparkles style={{ width: '17px', height: '17px', color: '#fff' }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>Blog Title Generator</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>AI-powered title ideas</div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={onSubmitHandler} style={{ display: 'flex', flexDirection: 'column', gap: '18px', flex: 1 }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              Keyword / Topic
            </label>
            <input
              className="form-input"
              onChange={e => setInput(e.target.value)}
              value={input}
              type="text"
              placeholder="e.g. Artificial Intelligence..."
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
              Blog Category
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
              {blogCategories.map((cat, i) => (
                <span
                  key={i}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '5px 13px',
                    borderRadius: '99px',
                    border: `1px solid ${selectedCategory === cat ? ACCENT_FROM : 'var(--border)'}`,
                    background: selectedCategory === cat ? `${ACCENT_FROM}15` : 'var(--card)',
                    color: selectedCategory === cat ? ACCENT_FROM : 'var(--text-secondary)',
                    fontSize: '0.78rem',
                    fontWeight: selectedCategory === cat ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-accent"
            style={{
              width: '100%',
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${ACCENT_FROM}, ${ACCENT_TO})`,
              boxShadow: `0 4px 16px ${ACCENT_FROM}40`,
              padding: '12px',
              fontSize: '0.9rem',
              borderRadius: '12px',
              marginTop: 'auto',
            }}
          >
            {loading ? <span className="spinner" /> : <FaHashtag style={{ width: '15px' }} />}
            {loading ? 'Generating...' : 'Generate Title'}
          </button>
        </form>
      </div>

      {/* ── Right: Output panel ── */}
      <div className="tool-output-panel">
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '20px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '9px',
              background: `${ACCENT_FROM}15`,
              border: `1px solid ${ACCENT_FROM}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FaHashtag style={{ width: '15px', height: '15px', color: ACCENT_FROM }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>Generated Titles</div>
              {content && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Category: {selectedCategory}</div>}
            </div>
          </div>
          {content && !loading && (
            <button
              onClick={handleCopy}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px',
                background: copied ? '#10b98120' : 'var(--card)',
                border: `1px solid ${copied ? '#10b981' : 'var(--border)'}`,
                borderRadius: '8px',
                color: copied ? '#10b981' : 'var(--text-secondary)',
                fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500,
              }}
            >
              {copied ? <FaCheck style={{ width: '13px' }} /> : <FaCopy style={{ width: '13px' }} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>

        <div style={{
          flex: 1, background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: '14px', padding: '24px', minHeight: '300px',
          display: 'flex', flexDirection: 'column',
        }}>
          {loading ? <SkeletonLoader /> : !content ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px', color: 'var(--text-muted)' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '16px',
                background: `${ACCENT_FROM}12`, border: `1px solid ${ACCENT_FROM}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FaHashtag style={{ width: '28px', height: '28px', color: ACCENT_FROM, opacity: 0.5 }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--text-secondary)' }}>No titles yet</p>
                <p style={{ fontSize: '0.82rem' }}>Enter a keyword and generate blog titles</p>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <div className="reset-tw"><Markdown>{content}</Markdown></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BlogTitle
