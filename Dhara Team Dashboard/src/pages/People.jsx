import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const GROUPS = ['Regular Team', 'ISS Team']

export default function People() {
  const [people, setPeople] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name: '', email: '', role: 'Developer', team_group: 'Regular Team', daily_rate: '', is_active: true, skills: '' })

  useEffect(() => { loadPeople() }, [])

  const loadPeople = async () => {
    const { data } = await supabase.from('people').select('*').order('name')
    setPeople(data || [])
  }

  const openNew = () => {
    setEditing(null)
    setForm({ name: '', email: '', role: 'Developer', team_group: 'Regular Team', daily_rate: '', is_active: true, skills: '' })
    setShowModal(true)
  }

  const openEdit = (p) => {
    setEditing(p)
    setForm({
      name: p.name, email: p.email || '', role: p.role, team_group: p.team_group,
      daily_rate: p.daily_rate || '', is_active: p.is_active, skills: (p.skills || []).join(', ')
    })
    setShowModal(true)
  }

  const save = async () => {
    const payload = {
      ...form,
      daily_rate: parseFloat(form.daily_rate) || 0,
      skills: form.skills.split(',').map(s => s.trim()).filter(Boolean)
    }
    if (editing) {
      await supabase.from('people').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('people').insert(payload)
    }
    setShowModal(false)
    loadPeople()
  }

  const remove = async (id) => {
    if (!confirm('Remove this person?')) return
    await supabase.from('people').delete().eq('id', id)
    loadPeople()
  }

  const filtered = people.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !(p.email || '').toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const activeCount = people.filter(p => p.is_active).length
  const groupColors = { 'Regular Team': '#1a56db', 'ISS Team': '#7c3aed' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>People</h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 13 }}>{activeCount} active members</p>
        </div>
        <button className="btn-primary" onClick={openNew}>+ Add Person</button>
      </div>

      <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 20, maxWidth: 400 }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {filtered.map(p => {
          const gc = groupColors[p.team_group] || '#64748b'
          return (
            <div key={p.id} className="card" style={{ position: 'relative', opacity: p.is_active ? 1 : 0.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, background: '#eff6ff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 16, color: 'var(--primary)', flexShrink: 0
                  }}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.email || 'No email'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => openEdit(p)} className="btn-secondary btn-sm">Edit</button>
                  <button onClick={() => remove(p.id)} className="btn-danger btn-sm">Delete</button>
                </div>
              </div>
              <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <Badge bg={gc + '18'} text={gc}>{p.team_group}</Badge>
              </div>
              {!p.is_active && <span style={{ position: 'absolute', top: 12, right: 12, fontSize: 11, color: '#dc2626', fontWeight: 500 }}>Inactive</span>}
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-secondary)', padding: 48 }}>No team members found</div>
        )}
      </div>

      {showModal && (
        <div style={modalOverlay} onClick={() => setShowModal(false)}>
          <div className="card" style={{ width: '100%', maxWidth: 480, padding: 32 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>{editing ? 'Edit Person' : 'Add Person'}</h3>
            <div style={{ display: 'grid', gap: 16 }}>
              <Field label="Name *">
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%' }} placeholder="Full name" />
              </Field>
              <Field label="Email">
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ width: '100%' }} placeholder="email@company.com" />
              </Field>
              <Field label="Team">
                <select value={form.team_group} onChange={e => setForm({ ...form, team_group: e.target.value })} style={{ width: '100%' }}>
                  {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </Field>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} style={{ width: 16, height: 16, accentColor: 'var(--primary)' }} />
                Active team member
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 28 }}>
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={save} disabled={!form.name.trim()}>{editing ? 'Update' : 'Add Person'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }) {
  return <div><label style={labelStyle}>{label}</label>{children}</div>
}

function Badge({ bg, text, children }) {
  return <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: bg, color: text }}>{children}</span>
}

const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }
const labelStyle = { display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }
