import React, { useState } from 'react'
import { TbSparkles } from 'react-icons/tb'
import { FaEdit, FaCopy, FaCheck } from 'react-icons/fa'
import axios from 'axios'
import { useAuth } from '@clerk/react'
import toast from 'react-hot-toast'
import Markdown from 'react-markdown'

const ACCENT_FROM = '#226BFF'
const ACCENT_TO   = '#65ADFF'

const articleLengths = [
  { length: 800,  text: 'Short (500-800 words)' },
  { length: 1200, text: 'Medium (800-1200 words)' },
  { length: 1600, text: 'Long (1200+ words)' },
]

const SkeletonLoader = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '4px' }}>
    {[100, 90, 100, 75, 95, 60].map((w, i) => (
      <div key={i} className="skeleton" style={{ height: '14px', width: `${w}%` }} />
    ))}
    <div className="skeleton" style={{ height: '14px', width: '80%', marginTop: '8px' }} />
    {[100, 88, 100, 70].map((w, i) => (
      <div key={i} className="skeleton" style={{ height: '14px', width: `${w}%` }} />
    ))}
    {[95, 60, 100, 82].map((w, i) => (
      <div key={i} className="skeleton" style={{ height: '14px', width: `${w}%`, marginTop: i === 0 ? '8px' : '0' }} />
    ))}
  </div>
)

const GenerateArticle = () => {
  const [selectedLength, setSelectedLength] = useState(articleLengths[0])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [article, setArticle] = useState('')
  const [copied, setCopied] = useState(false)

  const { getToken } = useAuth()

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setArticle('')
      const prompt = `Write an article about ${input} in ${selectedLength.text} words.`
      const { data } = await axios.post('/api/ai/generate-article',
        { prompt, length: selectedLength.length },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      )
      if (data.success) setArticle(data.data)
      else toast.error(data.message)
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
    setLoading(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(article)
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
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>Article Generator</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>AI-powered content writing</div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={onSubmitHandler} style={{ display: 'flex', flexDirection: 'column', gap: '18px', flex: 1 }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              Article Topic
            </label>
            <input
              className="form-input"
              onChange={e => setInput(e.target.value)}
              value={input}
              type="text"
              placeholder="e.g. The future of renewable energy..."
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
              Article Length
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {articleLengths.map((item, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedLength(item)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: `1px solid ${selectedLength.text === item.text ? ACCENT_FROM : 'var(--border)'}`,
                    background: selectedLength.text === item.text ? `${ACCENT_FROM}12` : 'var(--card)',
                    color: selectedLength.text === item.text ? ACCENT_FROM : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.83rem',
                    fontWeight: selectedLength.text === item.text ? 600 : 400,
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}
                >
                  {item.text}
                  {selectedLength.text === item.text && (
                    <span style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: ACCENT_FROM, flexShrink: 0,
                    }} />
                  )}
                </div>
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
            {loading ? <span className="spinner" /> : <FaEdit style={{ width: '15px' }} />}
            {loading ? 'Generating...' : 'Generate Article'}
          </button>
        </form>
      </div>

      {/* ── Right: Output panel ── */}
      <div className="tool-output-panel">
        {/* Output header */}
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
              <FaEdit style={{ width: '15px', height: '15px', color: ACCENT_FROM }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>Generated Article</div>
              {article && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{article.split(' ').length} words</div>}
            </div>
          </div>
          {article && !loading && (
            <button
              onClick={handleCopy}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px',
                background: copied ? '#10b98120' : 'var(--card)',
                border: `1px solid ${copied ? '#10b981' : 'var(--border)'}`,
                borderRadius: '8px',
                color: copied ? '#10b981' : 'var(--text-secondary)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'all 0.2s',
              }}
            >
              {copied ? <FaCheck style={{ width: '13px' }} /> : <FaCopy style={{ width: '13px' }} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>

        {/* Content area */}
        <div style={{
          flex: 1,
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '24px',
          minHeight: '300px',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {loading ? (
            <SkeletonLoader />
          ) : !article ? (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '14px', color: 'var(--text-muted)',
            }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '16px',
                background: `${ACCENT_FROM}12`,
                border: `1px solid ${ACCENT_FROM}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FaEdit style={{ width: '28px', height: '28px', color: ACCENT_FROM, opacity: 0.5 }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--text-secondary)' }}>No article yet</p>
                <p style={{ fontSize: '0.82rem' }}>Enter a topic and generate your article</p>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <div className="reset-tw"><Markdown>{article}</Markdown></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GenerateArticle
