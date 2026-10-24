import React, { useState } from 'react'
import { TbSparkles } from 'react-icons/tb'
import { FaImage, FaDownload } from 'react-icons/fa'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '@clerk/react'

const ACCENT_FROM = '#00AD25'
const ACCENT_TO = '#04FF50'

const imageStyles = ['Realistic', 'Cartoon', 'Ghibli', 'Anime', 'Fantasy', '3D', 'Portrait']

const ImageSkeleton = () => (
  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div className="skeleton" style={{ width: '100%', maxWidth: '400px', aspectRatio: '1/1', borderRadius: '14px' }} />
  </div>
)

const GenerateImages = () => {
  const [selectedStyle, setSelectedStyle] = useState(imageStyles[0])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')

  const { getToken } = useAuth()

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setContent('')
      const prompt = `Generate an image of ${input} in the ${selectedStyle} style.`
      const { data } = await axios.post('/api/ai/generate-image',
        { prompt },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      )
      if (data.success) setContent(data.data)
      else toast.error(data.message)
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
    setLoading(false)
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = content
    link.download = `unomate-image-${Date.now()}.png`
    link.click()
    toast.success('Image downloaded!')
  }

  return (
    <div className="tool-page">
      {/* ── Left: Input panel ── */}
      <div className="tool-input-panel">
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
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>Image Generator</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>AI-powered image creation</div>
          </div>
        </div>

        <form onSubmit={onSubmitHandler} style={{ display: 'flex', flexDirection: 'column', gap: '18px', flex: 1 }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              Describe your Image
            </label>
            <textarea
              className="form-input"
              onChange={e => setInput(e.target.value)}
              value={input}
              rows={5}
              placeholder="A futuristic city at sunset with flying cars..."
              required
              style={{ resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
              Image Style
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px' }}>
              {imageStyles.map((style, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedStyle(style)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '9px',
                    border: `1px solid ${selectedStyle === style ? ACCENT_FROM : 'var(--border)'}`,
                    background: selectedStyle === style ? `${ACCENT_FROM}15` : 'var(--card)',
                    color: selectedStyle === style ? ACCENT_FROM : 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    fontWeight: selectedStyle === style ? 600 : 400,
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  {style}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-accent"
            style={{
              width: '100%', justifyContent: 'center',
              background: `linear-gradient(135deg, ${ACCENT_FROM}, ${ACCENT_TO})`,
              boxShadow: `0 4px 16px ${ACCENT_FROM}40`,
              padding: '12px', fontSize: '0.9rem', borderRadius: '12px', marginTop: 'auto',
            }}
          >
            {loading ? <span className="spinner" /> : <FaImage style={{ width: '15px' }} />}
            {loading ? 'Generating...' : 'Generate Image'}
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
              background: `${ACCENT_FROM}15`, border: `1px solid ${ACCENT_FROM}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FaImage style={{ width: '15px', height: '15px', color: ACCENT_FROM }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>Generated Image</div>
              {content && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Style: {selectedStyle}</div>}
            </div>
          </div>
          {content && !loading && (
            <button
              onClick={handleDownload}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px',
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: '8px', color: 'var(--text-secondary)',
                fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT_FROM; e.currentTarget.style.color = ACCENT_FROM }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            >
              <FaDownload style={{ width: '13px' }} /> Download
            </button>
          )}
        </div>

        <div style={{
          flex: 1, background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: '14px', padding: '20px', minHeight: '300px',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {loading ? <ImageSkeleton /> : !content ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px', color: 'var(--text-muted)' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '16px',
                background: `${ACCENT_FROM}12`, border: `1px solid ${ACCENT_FROM}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FaImage style={{ width: '28px', height: '28px', color: ACCENT_FROM, opacity: 0.5 }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--text-secondary)' }}>No image yet</p>
                <p style={{ fontSize: '0.82rem' }}>Describe your vision and generate an image</p>
              </div>
            </div>
          ) : (
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'repeating-conic-gradient(var(--bg-tertiary) 0% 25%, transparent 0% 50%)',
              backgroundSize: '20px 20px',
              borderRadius: '10px', overflow: 'hidden',
            }}>
              <img
                src={content}
                alt="AI Generated"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GenerateImages
