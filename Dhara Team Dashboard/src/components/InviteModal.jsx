import { useState } from 'react'
import { supabase, EDGE_FUNC_URL, ANON_KEY } from '../lib/supabase'

export default function InviteModal({ onClose }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [teamGroup, setTeamGroup] = useState('Regular Team')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sentEmail, setSentEmail] = useState('')
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)

  const invite = async () => {
    if (!email) { setError('Email is required'); return }
    setLoading(true)
    setError('')
    setSentEmail('')
    setInviteLink('')
    setCopied(false)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`${EDGE_FUNC_URL}/invite-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
          apikey: ANON_KEY
        },
        body: JSON.stringify({ email, name, team_group: teamGroup })
      })
      let data = {}
      try {
        data = await res.json()
      } catch {
        data = { error: (await res.text()) || 'Empty response' }
      }
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
      setSentEmail(data.email || email)
      setInviteLink(data.inviteLink || '')
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

        {sentEmail ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: '#f0fdf4',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h4 style={{ margin: '0 0 8px', fontSize: 16 }}>Invitation Sent!</h4>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 13 }}>
              {sentEmail} will receive an email with a link to set their password.
            </p>
            {inviteLink && (
              <div style={{ textAlign: 'left', marginTop: 20 }}>
                <label style={labelStyle}>Backup invite link (share if the email doesn't arrive)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input readOnly value={inviteLink} style={{ flex: 1, fontSize: 12 }} onFocus={e => e.target.select()} />
                  <button className="btn-secondary" onClick={copy} style={{ flexShrink: 0 }}>
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            )}
            <button className="btn-primary" onClick={onClose} style={{ marginTop: 20, padding: '10px 32px' }}>Done</button>
          </div>
        ) : (
          <></>
        )}

        {!sentEmail && (
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