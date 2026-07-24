import React, { useState } from 'react'
import { TbSparkles } from 'react-icons/tb'
import { FiFileText } from 'react-icons/fi'
import { FaCopy, FaCheck } from 'react-icons/fa'
import Markdown from 'react-markdown'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '@clerk/react'

const ACCENT_FROM = '#00DA83'
const ACCENT_TO   = '#009BB3'

const SkeletonLoader = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '4px' }}>
    {[100, 85, 100, 70, 90, 60].map((w, i) => (
      <div key={i} className="skeleton" style={{ height: '14px', width: `${w}%` }} />
    ))}
    <div className="skeleton" style={{ height: '14px', width: '75%', marginTop: '8px' }} />
    {[100, 80, 95, 65].map((w, i) => (
      <div key={i} className="skeleton" style={{ height: '14px', width: `${w}%` }} />
    ))}
    <div className="skeleton" style={{ height: '80px', width: '100%', marginTop: '12px' }} />
  </div>
)

const ReviewResume = () => {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [fileName, setFileName] = useState('')
  const [copied, setCopied] = useState(false)

  const { getToken } = useAuth()

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setContent('')
      const formData = new FormData()
      formData.append('resume', input)
      const { data } = await axios.post('/api/ai/review-resume',
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
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>Resume Reviewer</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>AI-powered resume analysis</div>
          </div>
        </div>

        <form onSubmit={onSubmitHandler} style={{ display: 'flex', flexDirection: 'column', gap: '18px', flex: 1 }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              Upload Resume
            </label>
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '10px', padding: '28px 16px',
              border: `2px dashed ${fileName ? ACCENT_FROM : 'var(--border)'}`,
              borderRadius: '12px',
              background: fileName ? `${ACCENT_FROM}08` : 'var(--input-bg)',
              cursor: 'pointer', transition: 'all 0.2s',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: fileName ? `${ACCENT_FROM}20` : 'var(--card)',
                border: `1px solid ${fileName ? ACCENT_FROM + '40' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FiFileText style={{ width: '20px', height: '20px', color: fileName ? ACCENT_FROM : 'var(--text-muted)' }} />
              </div>
              {fileName
                ? <>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, color: ACCENT_FROM, textAlign: 'center' }}>{fileName}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>PDF ready to analyze</p>
                </>
                : <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Click to upload PDF</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '3px' }}>PDF format only</p>
                </div>
              }
              <input type="file" accept="application/pdf" onChange={handleFileChange} required style={{ display: 'none' }} />
            </label>
          </div>

          {/* What AI checks */}
          <div style={{
            padding: '14px', background: 'var(--card)',
            border: '1px solid var(--border)', borderRadius: '12px',
            display: 'flex', flexDirection: 'column', gap: '8px',
          }}>
            <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>What AI will analyze:</p>
            {['Overall structure & formatting', 'Skills & experience match', 'ATS keyword optimization', 'Actionable improvements'].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: ACCENT_FROM, flexShrink: 0 }} />
                {item}
              </div>
            ))}
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
            {loading ? <span className="spinner" /> : <FiFileText style={{ width: '15px' }} />}
            {loading ? 'Analyzing...' : 'Review Resume'}
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
              <FiFileText style={{ width: '15px', height: '15px', color: ACCENT_FROM }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>AI Analysis</div>
              {content && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Resume review complete</div>}
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
                <FiFileText style={{ width: '28px', height: '28px', color: ACCENT_FROM, opacity: 0.5 }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--text-secondary)' }}>No analysis yet</p>
                <p style={{ fontSize: '0.82rem' }}>Upload your resume and get AI feedback</p>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.8, overflowY: 'auto', flex: 1 }}>
              <div className="reset-tw"><Markdown>{content}</Markdown></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReviewResume
