import { useState } from 'react'
import { supabase } from '../lib/supabase'

const PROXY_URL = import.meta.env.VITE_AUTH_PROXY_URL || ''

export default function Login({ notice }) {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passcode, setPasscode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [signupSent, setSignupSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSignupSent(false)

    try {
      if (mode === 'passcode') {
        if (!PROXY_URL) throw new Error('Passcode sign-in is not configured (missing VITE_AUTH_PROXY_URL).')
        const res = await fetch(PROXY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passphrase: passcode }),
        })
        const data = await res.json()
        if (!res.ok || !data.access_token) throw new Error(data?.error || 'Passcode sign-in failed.')
        const payload = JSON.parse(atob(data.access_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
        // Put the minted JWT into the existing Supabase client so all data
        // calls keep going straight to PostgREST under the same RLS.
        await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: '',
          expires_in: data.expires_in || 43200,
          expires_at: payload.exp,
          token_type: 'bearer',
          user: {
            id: payload.sub,
            aud: 'authenticated',
            role: 'authenticated',
            email: payload.email,
            app_metadata: {},
            user_metadata: {},
            created_at: new Date(payload.iat * 1000).toISOString(),
            updated_at: new Date(payload.iat * 1000).toISOString(),
          },
        })
        return
      }

      if (mode === 'signup') {
        const { data: ok } = await supabase.rpc('is_whitelisted', { p_email: email })
        if (!ok) {
          setError('This email is not on the whitelist. Ask a team member to add you in People > Whitelist first.')
          return
        }
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSignupSent(true)
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    if (!email) { setError('Enter your email first, then request a reset.'); return }
    setResetLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    setResetLoading(false)
    if (error) { setError(error.message); return }
    setResetSent(true)
  }

  const switchMode = (m) => {
    setMode(m)
    setError('')
    setResetSent(false)
    setSignupSent(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #eff6ff 0%, #f1f5f9 100%)' }}>
      <div className="card" style={{ width: '100%', maxWidth: 440, margin: 20, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, background: 'var(--primary)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16, boxShadow: '0 4px 12px rgba(26,86,219,0.3)'
          }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: 28 }}>D</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 6px', color: 'var(--text)' }}>Dhara's Team Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 14 }}>Sign in to manage your projects</p>
        </div>

        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: 8, padding: 3, marginBottom: 24 }}>
          {[
            { key: 'signin', label: 'Sign In' },
            { key: 'passcode', label: 'Passcode' },
          ].map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => switchMode(t.key)}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 6, fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer',
                background: mode === t.key ? 'var(--primary)' : 'transparent',
                color: mode === t.key ? 'white' : 'var(--text-secondary)',
                transition: 'all 0.15s'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              disabled={mode === 'passcode'}
              style={{ width: '100%', opacity: mode === 'passcode' ? 0.5 : 1 }}
            />
          </div>

          {mode !== 'passcode' ? (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                style={{ width: '100%' }}
              />
            </div>
          ) : (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Team passcode</label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Shared team passcode"
                required
                autoComplete="current-password"
                style={{ width: '100%' }}
              />
            </div>
          )}

          {mode === 'passcode' && (
            <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Temporary sign-in while Supabase login is recovering. You'll use the shared team passcode.
            </p>
          )}

          {mode === 'signup' && (
            <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Only whitelisted emails can create an account. You'll be asked to confirm your email before you can sign in.
            </p>
          )}

          {error && (
            <div style={{
              marginBottom: 16,
              padding: '10px 14px',
              borderRadius: 8,
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              fontSize: 13
            }}>
              {error}
            </div>
          )}

          {!error && notice && (
            <div style={{
              marginBottom: 16,
              padding: '10px 14px',
              borderRadius: 8,
              background: '#fffbeb',
              border: '1px solid #fde68a',
              color: '#92400e',
              fontSize: 13,
              lineHeight: 1.6
            }}>
              {notice}
            </div>
          )}

          {signupSent && (
            <div style={{
              marginBottom: 16,
              padding: '10px 14px',
              borderRadius: 8,
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              fontSize: 13,
              lineHeight: 1.6
            }}>
              Account created. A confirmation email is on its way to <strong>{email}</strong>. Click the link, then sign in.
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '12px 0', fontSize: 15 }}
          >
            {loading ? 'Loading...' : mode === 'signup' ? 'Create Account' : mode === 'passcode' ? 'Sign In' : 'Sign In'}
          </button>
        </form>

        {mode === 'signin' && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            {resetSent ? (
              <p style={{ margin: 0, fontSize: 13, color: '#16a34a', lineHeight: 1.6 }}>
                If an account exists for <strong>{email}</strong>, a password reset link has been sent. Check your inbox.
              </p>
            ) : (
              <button
                type="button"
                onClick={handleReset}
                disabled={resetLoading}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 13, cursor: 'pointer', padding: 0 }}
              >
                {resetLoading ? 'Sending...' : 'Forgot password?'}
              </button>
            )}
          </div>
        )}

        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 12, marginTop: 24 }}>
          {mode === 'signup'
            ? 'Need access? Ask a team member to add your email to the whitelist (People → Whitelist).'
            : mode === 'passcode'
              ? 'Passcode sign-in is a temporary workaround while Supabase login recovers.'
              : 'Access is by whitelist. Ask a team member to add you if your email is not approved yet.'}
        </p>
      </div>
    </div>
  )
}
