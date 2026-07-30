import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const navItems = [
  { path: '/guide', label: 'Guide', icon: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/><path d="M9 9h1v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="10" cy="6.5" r=".75" fill="currentColor"/></svg>
  )},
  { path: '/', label: 'Dashboard', icon: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="7" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="11" y="2" width="7" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="2" y="12" width="7" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="11" y="9" width="7" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/></svg>
  )},
  { path: '/projects', label: 'Projects', icon: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5.5A1.5 1.5 0 014.5 4h2.379a1.5 1.5 0 011.06.44l.872.87a1.5 1.5 0 001.06.44H15.5A1.5 1.5 0 0117 7.24V14.5a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 013 14.5V5.5z" stroke="currentColor" strokeWidth="1.5"/></svg>
  )},
  { path: '/people', label: 'People', icon: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="14" cy="7" r="2" stroke="currentColor" strokeWidth="1.5"/><path d="M2.5 16.5c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" stroke="currentColor" strokeWidth="1.5"/><path d="M12 12c1.66 0 3 1.34 3 3v1.5" stroke="currentColor" strokeWidth="1.5"/></svg>
  )},
  { path: '/bms', label: 'BMS', icon: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2.5" y="3" width="15" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M7.5 17h5M10 14v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
  )},
]

export default function Layout({ children, user }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 240 : 64,
        background: 'var(--bg-white)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        overflow: 'hidden',
        flexShrink: 0,
        position: 'relative',
        zIndex: 10
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: 14 }}>DT</span>
          </div>
          {sidebarOpen && <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', whiteSpace: 'nowrap' }}>Dhara's Team</span>}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 8,
                marginBottom: 2,
                textDecoration: 'none',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                background: isActive ? '#eff6ff' : 'transparent',
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s'
              })}
            >
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
          {sidebarOpen && (
            <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%', background: '#eff6ff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 600, fontSize: 13, color: 'var(--primary)', flexShrink: 0
              }}>
                {(user?.full_name || user?.email || '?')[0].toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.full_name || 'User'}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.role || 'member'}</div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="btn-secondary"
            style={{ width: '100%', fontSize: 13, padding: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            {sidebarOpen ? 'Sign Out' : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 14H3.33A1.33 1.33 0 012 12.67V3.33A1.33 1.33 0 013.33 2H6M10.67 11.33L14 8l-3.33-3.33M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <header style={{
          height: 56, background: 'var(--bg-white)', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', flexShrink: 0
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', color: 'var(--text-secondary)', padding: 6, borderRadius: 6, display: 'flex', alignItems: 'center' }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
          <button
            className="btn-primary btn-sm"
            onClick={() => setShowInvite(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 2v12M4 8h12" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
            Invite
          </button>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflow: 'auto', padding: 28 }}>
          {children}
        </main>
      </div>

      {/* Invite Modal */}
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
    </div>
  )
}

function InviteModal({ onClose }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleInvite = async () => {
    if (!email.trim()) return
    setError('')
    try {
      const { data: settings } = await supabase.from('settings').select('value').eq('key', 'team_name').single()
      const teamName = settings?.value || "Dhara's Team"

      const { data: existingUser } = await supabase.from('profiles').select('id').eq('email', email).single()

      if (existingUser) {
        setSent(true)
        return
      }

      const { error: signupError } = await supabase.auth.signUp({
        email,
        password: crypto.randomUUID().slice(0, 12) + 'A1!',
        options: {
          data: { full_name: email.split('@')[0], role },
          emailRedirectTo: window.location.origin
        }
      })

      if (signupError && !signupError.message.includes('already')) {
        setError(signupError.message)
        return
      }

      setSent(true)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div className="card" style={{ width: '100%', maxWidth: 440, padding: 32 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Invite Team Member</h3>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text-secondary)', padding: 4 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: '#f0fdf4',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h4 style={{ margin: '0 0 8px', fontSize: 16 }}>Invitation Sent!</h4>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 13 }}>
              {email} will receive an email to join the team.
            </p>
            <button className="btn-primary" onClick={onClose} style={{ marginTop: 20, padding: '10px 32px' }}>Done</button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                style={{ width: '100%' }}
                autoFocus
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Role</label>
              <select value={role} onChange={e => setRole(e.target.value)} style={{ width: '100%' }}>
                <option value="member">Member — Can view and edit</option>
                <option value="admin">Admin — Full access</option>
              </select>
            </div>
            {error && (
              <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: 13 }}>
                {error}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn-secondary" onClick={onClose}>Cancel</button>
              <button className="btn-primary" onClick={handleInvite} disabled={!email.trim()}>
                Send Invite
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }
