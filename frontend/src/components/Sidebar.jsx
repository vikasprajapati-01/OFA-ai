import React from 'react'
import { useClerk, useUser } from '@clerk/react'
import { NavLink } from 'react-router-dom'

import { MdHome } from 'react-icons/md'
import { LuNotebookPen } from 'react-icons/lu'
import { MdTitle } from 'react-icons/md'
import { RiImage2Line } from 'react-icons/ri'
import { FaEraser } from 'react-icons/fa6'
import { CiSquareRemove } from 'react-icons/ci'
import { VscPreview } from 'react-icons/vsc'
import { IoLogOutOutline } from 'react-icons/io5'

const navItems = [
  { to: '/ai', label: 'Dashboard', Icon: MdHome },
  { to: '/ai/generate-image', label: 'Generate Image', Icon: RiImage2Line },
  { to: '/ai/generate-article', label: 'Generate Article', Icon: LuNotebookPen },
  { to: '/ai/blog-title', label: 'Blog Title', Icon: MdTitle },
  { to: '/ai/remove-bg', label: 'Remove Background', Icon: FaEraser },
  { to: '/ai/remove-object', label: 'Remove Object', Icon: CiSquareRemove },
  { to: '/ai/review-resume', label: 'Review Resume', Icon: VscPreview },
]

const Sidebar = ({ sidebar, setSidebar }) => {
  const { user } = useUser()
  const { signOut, openUserProfile } = useClerk()

  return (
    <>
      {/* Overlay for mobile */}
      {sidebar && (
        <div
          onClick={() => setSidebar(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 9,
            display: 'none',
          }}
          className="sidebar-overlay"
        />
      )}

      <aside style={{
        width: '240px',
        minWidth: '240px',
        height: '100%',
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10,
        flexShrink: 0,
      }}
      className={`sidebar-panel ${sidebar ? 'sidebar-open' : ''}`}
      >
        {/* User profile */}
        <div style={{
          padding: '24px 16px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
        }}>
          <div style={{ position: 'relative' }}>
            <img
              src={user.imageUrl}
              alt={user.fullName}
              style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent)' }}
            />
            <span style={{
              position: 'absolute', bottom: 2, right: 2,
              width: '10px', height: '10px',
              background: '#10b981',
              borderRadius: '50%',
              border: '2px solid var(--sidebar-bg)',
            }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>{user.fullName}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Active</div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 8px 10px', marginTop: '4px' }}>
            Navigation
          </div>
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/ai'}
              onClick={() => setSidebar(false)}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={{ marginBottom: '4px', display: 'flex' }}
            >
              {({ isActive }) => (
                <>
                  <Icon style={{ width: '17px', height: '17px', flexShrink: 0, color: isActive ? '#fff' : 'var(--text-secondary)' }} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: user + logout */}
        <div style={{
          padding: '12px 14px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1, minWidth: 0 }}
            onClick={openUserProfile}
          >
            <img
              src={user.imageUrl}
              alt={user.fullName}
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.fullName}
              </div>
            </div>
          </div>
          <button
            onClick={signOut}
            title="Sign out"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '6px',
              borderRadius: '8px',
              transition: 'color 0.2s, background 0.2s',
              display: 'flex',
              alignItems: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
          >
            <IoLogOutOutline style={{ width: '18px', height: '18px' }} />
          </button>
        </div>
      </aside>

      <style>{`
        @media (max-width: 640px) {
          .sidebar-panel {
            position: absolute;
            top: 0; left: 0; bottom: 0;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }
          .sidebar-panel.sidebar-open {
            transform: translateX(0);
          }
          .sidebar-overlay {
            display: block !important;
          }
        }
      `}</style>
    </>
  )
}

export default Sidebar
