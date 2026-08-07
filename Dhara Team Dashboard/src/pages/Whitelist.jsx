import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const thStyle = { padding: '10px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.3, whiteSpace: 'nowrap' }
const tdStyle = { padding: '10px 16px', verticalAlign: 'middle' }

export default function Whitelist() {
  const [entries, setEntries] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ email: '', note: '' })
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [missingPeople, setMissingPeople] = useState([])
  const [highlightId, setHighlightId] = useState(null)

  useEffect(() => { loadWhitelist() }, [])

  const loadWhitelist = async () => {
    const { data } = await supabase.from('whitelist').select('*').order('email')
    setEntries(data || [])
    const { data: people } = await supabase.from('people').select('email')
    const wlEmails = new Set((data || []).map(w => (w.email || '').toLowerCase()))
    const missing = (people || [])
      .map(p => p.email)
      .filter(e => e && !wlEmails.has(e.toLowerCase()))
      .map(e => e.toLowerCase())
      .sort()
    setMissingPeople(missing)
  }

  const openNew = () => {
    setForm({ email: '', note: '' })
    setError('')
    setShowModal(true)
  }

  const save = async () => {
    setError('')
    const email = form.email.trim().toLowerCase()
    if (!email) { setError('Email is required'); return }
    const existing = entries.find(w => (w.email || '').toLowerCase() === email)
    if (existing) {
      setSearch(email)
      setHighlightId(existing.id)
      setTimeout(() => {
        document.getElementById(`wl-${existing.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
      setTimeout(() => setHighlightId(null), 2500)
      setShowModal(false)
      setSuccessMsg(`"${existing.email}" is already in the whitelist.`)
      setTimeout(() => setSuccessMsg(''), 5000)
      return
    }
    const { error } = await supabase.from('whitelist').insert({ email, note: form.note.trim(), created_by: (await supabase.auth.getUser()).data.user?.id || null })
    if (error) { setError(error.message); return }
    setShowModal(false)
    loadWhitelist()
    setSuccessMsg(`${email} added to the whitelist.`)
    setTimeout(() => setSuccessMsg(''), 5000)
  }

  const toggleActive = async (w) => {
    const { error } = await supabase.from('whitelist').update({ active: !w.active }).eq('id', w.id)
    if (error) { setError(error.message); return }
    loadWhitelist()
  }

  const remove = async (id) => {
    if (!confirm('Remove this email from the whitelist?')) return
    const { error } = await supabase.from('whitelist').delete().eq('id', id)
    if (error) { setError(error.message || 'Failed to remove'); return }
    loadWhitelist()
  }

  const addAllFromPeople = async () => {
    if (missingPeople.length === 0) { setSuccessMsg('Everyone on the People list is already whitelisted.'); setTimeout(() => setSuccessMsg(''), 5000); return }
    if (!confirm(`Add ${missingPeople.length} people email(s) to the whitelist?`)) return
    const rows = missingPeople.map(email => ({ email, note: 'added from People' }))
    const { error } = await supabase.from('whitelist').insert(rows)
    if (error) { setError(error.message); return }
    loadWhitelist()
    setSuccessMsg(`Added ${rows.length} email(s) from People.`)
    setTimeout(() => setSuccessMsg(''), 5000)
  }

  const filtered = entries.filter(w => {
    if (!search) return true
    const q = search.toLowerCase()
    return (w.email || '').toLowerCase().includes(q) || (w.note || '').toLowerCase().includes(q)
  })

  const activeCount = entries.filter(w => w.active).length

  return (
    <div>
      {successMsg && (
        <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 2000, padding: '14px 24px', borderRadius: 10, background: '#16a34a', color: 'white', fontSize: 14, fontWeight: 600, boxShadow: '0 8px 30px rgba(22,163,74,0.3)', display: 'flex', alignItems: 'center', gap: 10, animation: 'slideDown 0.3s ease' }}>
          {successMsg}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>Whitelist</h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 13 }}>{activeCount} active · only whitelisted emails can sign in / create an account</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-secondary" onClick={addAllFromPeople} title="Add emails from the People list that are not whitelisted yet">
            Add from People ({missingPeople.length})
          </button>
          <button className="btn-primary" onClick={openNew}>+ Add Email</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'center' }}>
        <input type="text" placeholder="Search by email or note..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, maxWidth: 320 }} />
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Disabling an entry revokes that person's access immediately.
        </span>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: 13 }}>{error}</div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Note</th>
              <th style={{ ...thStyle, width: 110 }}>Status</th>
              <th style={{ ...thStyle, width: 120 }}>Added</th>
              <th style={{ ...thStyle, width: 90 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(w => (
              <tr key={w.id} id={`wl-${w.id}`} style={{ borderBottom: '1px solid var(--border)', opacity: w.active ? 1 : 0.55, background: highlightId === w.id ? '#fffbeb' : (w.active ? 'transparent' : 'var(--bg-white)'), transition: 'background 0.3s' }}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{w.email}</div>
                </td>
                <td style={tdStyle}>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{w.note || '—'}</div>
                </td>
                <td style={tdStyle}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)' }}>
                    <input type="checkbox" checked={w.active} onChange={() => toggleActive(w)} />
                    {w.active ? 'Active' : 'Disabled'}
                  </label>
                </td>
                <td style={{ ...tdStyle, fontSize: 13, color: 'var(--text-secondary)' }}>{new Date(w.created_at).toLocaleDateString('en-US')}</td>
                <td style={tdStyle}>
                  <button onClick={() => remove(w.id)} className="btn-danger btn-sm">Remove</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 48 }}>
                  {entries.length === 0 ? 'No whitelist entries yet — add emails to let people sign in.' : 'No matches found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }} onClick={() => setShowModal(false)}>
          <div className="card" style={{ width: '100%', maxWidth: 460, padding: 32 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Add Email to Whitelist</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 0 }}>This person will be able to create an account and sign in.</p>
            {error && <div style={{ marginBottom: 16, padding: '8px 12px', borderRadius: 6, background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: 13 }}>{error}</div>}
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Email *</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ width: '100%' }} placeholder="email@company.com" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Note (optional)</label>
                <input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} style={{ width: '100%' }} placeholder="e.g. vendor, new hire" />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 28 }}>
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={save} disabled={!form.email.trim()}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
