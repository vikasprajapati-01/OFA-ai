import React, { useEffect, useState } from 'react'
import { IoSparkles } from 'react-icons/io5'
import { FaGem } from 'react-icons/fa6'
import { HiChevronDown, HiChevronUp } from 'react-icons/hi2'
import ItemCreation from '../components/ItemCreation'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useAuth, useUser } from '@clerk/react'

const Dashboard = () => {
  const [creations, setCreations] = useState([])
  const [loading, setLoading] = useState(true)

  const { getToken } = useAuth()
  const { user } = useUser()
  const isPremium = user && user.publicMetadata?.free_usage === undefined

  const getDashboardData = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/user/get-user-creations', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) setCreations(data.creations)
      else toast.error(data.message)
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }

  useEffect(() => { getDashboardData() }, [])

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '28px' }}>
      {/* Page header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Welcome back, {user?.firstName || 'User'}</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
        {/* Total Creations */}
        <div className="glass-card" style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          minWidth: '220px',
        }}>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Total Creations</p>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)' }}>{creations.length}</h2>
          </div>
          <div style={{
            width: '46px', height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #3588F2, #0BB0D7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(53,136,242,0.35)',
          }}>
            <IoSparkles style={{ width: '22px', height: '22px', color: '#fff' }} />
          </div>
        </div>

        {/* Active Plan */}
        <div className="glass-card" style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          minWidth: '220px',
        }}>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Active Plan</p>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)' }}>
              {isPremium ? 'Premium' : 'Free'}
            </h2>
          </div>
          <div style={{
            width: '46px', height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #FF61C5, #9E53EE)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(158,83,238,0.35)',
          }}>
            <FaGem style={{ width: '20px', height: '20px', color: '#fff' }} />
          </div>
        </div>
      </div>

      {/* Creations list */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <div className="spinner" style={{ width: '36px', height: '36px', borderWidth: '3px' }} />
        </div>
      ) : (
        <div>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Recent Creations
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {creations.length === 0
              ? (
                <div style={{
                  textAlign: 'center', padding: '48px',
                  color: 'var(--text-muted)', fontSize: '0.875rem',
                  background: 'var(--card)', border: '1px solid var(--border)',
                  borderRadius: '14px',
                }}>
                  No creations yet. Head to a tool to get started!
                </div>
              )
              : creations.map(item => <ItemCreation key={item.id} item={item} />)
            }
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
