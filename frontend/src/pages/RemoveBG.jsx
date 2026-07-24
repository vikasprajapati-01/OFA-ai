import React, { useState } from 'react'
import { TbSparkles } from 'react-icons/tb'
import { FaEraser, FaDownload } from 'react-icons/fa'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '@clerk/react'

const ACCENT_FROM = '#F6AB41'
const ACCENT_TO = '#FF4938'

const ImageSkeleton = () => (
  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div className="skeleton" style={{ width: '100%', maxWidth: '400px', aspectRatio: '1/1', borderRadius: '14px' }} />
  </div>
)

const RemoveBG = () => {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [fileName, setFileName] = useState('')

  const { getToken } = useAuth()

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setContent('')
      const formData = new FormData()
      formData.append('image', input)
      const { data } = await axios.post('/api/ai/remove-image-bg',
        formData,
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      )
      if (data.success) setContent(data.data)
      else toast.error(data.message)
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }

  const handleFileChange = (e) => {
    setInput(e.target.files[0])
    setFileName(e.target.files[0]?.name || '')
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = content
    link.download = `unomate-nobg-${Date.now()}.png`
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
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>Background Remover</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>AI-powered background removal</div>
          </div>
        </div>

        <form onSubmit={onSubmitHandler} style={{ display: 'flex', flexDirection: 'column', gap: '18px', flex: 1 }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              Upload Image
            </label>
            {/* Custom file drop area */}
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '10px', padding: '28px 16px',
              border: `2px dashed ${fileName ? ACCENT_FROM : 'var(--border)'}`,
              borderRadius: '12px',
              background: fileName ? `${ACCENT_FROM}08` : 'var(--input-bg)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: fileName ? `${ACCENT_FROM}20` : 'var(--card)',
                border: `1px solid ${fileName ? ACCENT_FROM + '40' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FaEraser style={{ width: '18px', height: '18px', color: fileName ? ACCENT_FROM : 'var(--text-muted)' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                {fileName
                  ? <p style={{ fontSize: '0.8rem', fontWeight: 600, color: ACCENT_FROM }}>{fileName}</p>
                  : <>
                    <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Click to upload</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '3px' }}>JPG, PNG, WebP supported</p>
                  </>
                }
              </div>
              <input type="file" accept="image/*" onChange={handleFileChange} required style={{ display: 'none' }} />
            </label>
          </div>

          <div style={{
            padding: '12px 14px',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
          }}>
            💡 <strong style={{ color: 'var(--text-secondary)' }}>Tip:</strong> For best results, use images with clear subjects and contrasting backgrounds.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-accent"
            style={{
              width: '100%', justifyContent: 'center',
              background: `linear-gradient(135deg, ${ACCENT_FROM}, ${ACCENT_TO})`,
              boxShadow: `0 4px 16px ${ACCENT_TO}40`,
              padding: '12px', fontSize: '0.9rem', borderRadius: '12px', marginTop: 'auto',
            }}
          >
            {loading ? <span className="spinner" /> : <FaEraser style={{ width: '15px' }} />}
            {loading ? 'Processing...' : 'Remove Background'}
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
              background: `${ACCENT_TO}15`, border: `1px solid ${ACCENT_TO}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FaEraser style={{ width: '15px', height: '15px', color: ACCENT_TO }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>Processed Image</div>
              {content && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Background removed • PNG format</div>}
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
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT_TO; e.currentTarget.style.color = ACCENT_TO }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            >
              <FaDownload style={{ width: '13px' }} /> Download PNG
            </button>
          )}
        </div>

        <div style={{
          flex: 1, background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: '14px', minHeight: '300px',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {loading ? (
            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <ImageSkeleton />
            </div>
          ) : !content ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px', color: 'var(--text-muted)', padding: '20px' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '16px',
                background: `${ACCENT_TO}12`, border: `1px solid ${ACCENT_TO}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FaEraser style={{ width: '28px', height: '28px', color: ACCENT_TO, opacity: 0.5 }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--text-secondary)' }}>No result yet</p>
                <p style={{ fontSize: '0.82rem' }}>Upload an image to remove its background</p>
              </div>
            </div>
          ) : (
            <div style={{
              flex: 1,
              background: 'repeating-conic-gradient(#88888822 0% 25%, transparent 0% 50%)',
              backgroundSize: '20px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '12px',
            }}>
              <img src={content} alt="Background removed" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RemoveBG
