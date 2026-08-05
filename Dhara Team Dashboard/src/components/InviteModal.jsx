import { useState } from 'react'
import { supabase, EDGE_FUNC_URL } from '../lib/supabase'

export default function InviteModal({ onClose }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [teamGroup, setTeamGroup] = useState('Regular Team')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)

  const invite = async () => {
    if (!email) { setError('Email is required'); return }
    setLoading(true)
    setError('')
    setInviteLink('')
    setCopied(false)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`${EDGE_FUNC_URL}/invite-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ email, name, team_group: teamGroup })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send invite')
      setEmail('')
      setName('')
      if (data.inviteLink) {
        setInviteLink(data.inviteLink)
      } else {
        setError('Invite created. It will be emailed shortly, or the person can log in directly.')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const copy = async () => {
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div className="card" style={{ width: '100%', maxWidth: 440, padding: 32 }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>Invite a Team Member</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '0 0 20px' }}>
          They will receive an invite link to set their own password.
        </p>

        {error && <div style={{ marginBottom: 16, padding: '8px 12px', borderRadius: 6, background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: 13 }}>{error}</div>}

        {inviteLink ? (
          <div>
            <label style={labelStyle}>Share this invite link with the person</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <input readOnly value={inviteLink} style={{ flex: 1, fontSize: 12 }} onFocus={e => e.target.select()} />
              <button className="btn-primary" onClick={copy} style={{ flexShrink: 0 }}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <label style={labelStyle}>Email *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@company.com" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={labelStyle}>Name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={labelStyle}>Team</label>
                <select value={teamGroup} onChange={e => setTeamGroup(e.target.value)} style={{ width: '100%' }}>
                  <option value="Regular Team">Regular Team</option>
                  <option value="ISS Team">ISS Team</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 28 }}>
              <button className="btn-secondary" onClick={onClose}>Cancel</button>
              <button className="btn-primary" onClick={invite} disabled={loading || !email.trim()}>
                {loading ? 'Sending...' : 'Send Invite'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }
const labelStyle = { display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }