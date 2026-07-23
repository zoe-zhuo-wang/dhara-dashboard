import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const PHASE_OPTIONS = ['Budget Application', 'BSR / ISR', 'UAT', 'DEV', 'Golive']
const BUDGET_STATUS_OPTIONS = ['Draft', 'Ongoing', 'Approved']
const VETRA_OPTIONS = ['Yes', 'No']
const OVERALL_STATUS_OPTIONS = ['On Track', 'Caution', 'Off Track', 'Finished', 'Not Started']
const FUNDING_OPTIONS = ['R&D', 'R&D AI', 'Vendor Onboarding', 'BAU']

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [people, setPeople] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showAddPerson, setShowAddPerson] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState('')
  const emptyForm = { name: '', description: '', current_phase: '', key_updates: '', budget_status: '', biz_case: '', vetra_adopted: '', overall_status: '', budget: '', start_date: '', end_date: '', dt_focal_id: '', funding_type: '' }
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    const [projRes, peopleRes] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('people').select('id, name, email').order('name')
    ])
    setProjects(projRes.data || [])
    setPeople(peopleRes.data || [])
  }

  const openNew = () => {
    setEditing(null)
    setForm({ ...emptyForm, funding_type: '' })
    setShowModal(true)
  }

  const openEdit = (p) => {
    setEditing(p)
    setForm({
      name: p.name, description: p.description || '',
      current_phase: p.current_phase || '', key_updates: p.key_updates || '',
      budget_status: p.budget_status || '', biz_case: p.biz_case || '',
      vetra_adopted: p.vetra_adopted || '', overall_status: p.overall_status || '',
      budget: p.budget || '', start_date: p.start_date || '', end_date: p.end_date || '',
      dt_focal_id: p.dt_focal_id || '', funding_type: p.funding_type || ''
    })
    setShowModal(true)
  }

  const save = async () => {
    setError('')
    if (!form.funding_type) {
      setError('Funding Type is required')
      return
    }
    const payload = {
      name: form.name, description: form.description,
      current_phase: form.current_phase, key_updates: form.key_updates,
      budget_status: form.budget_status, biz_case: form.biz_case,
      vetra_adopted: form.vetra_adopted, overall_status: form.overall_status,
      budget: parseFloat(form.budget) || 0, start_date: form.start_date || null,
      end_date: form.end_date || null, dt_focal_id: form.dt_focal_id || null,
      funding_type: form.funding_type
    }
    try {
      let result
      if (editing) {
        result = await supabase.from('projects').update(payload).eq('id', editing.id)
      } else {
        result = await supabase.from('projects').insert(payload)
      }
      if (result.error) {
        console.error('Save error:', result.error)
        setError(result.error.message || JSON.stringify(result.error))
        return
      }
      setShowModal(false)
      loadAll()
    } catch (err) {
      console.error('Save exception:', err)
      setError(err.message)
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this project?')) return
    await supabase.from('projects').delete().eq('id', id)
    loadAll()
  }

  const getPersonName = (id) => people.find(p => p.id === id)?.name || '-'

  const filtered = projects.filter(p => {
    if (filter !== 'all' && p.overall_status !== filter) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const formatMoney = (n) => '$' + (n || 0).toLocaleString()

  const fundingStyle = (f) => ({
    'R&D': { bg: '#dbeafe', text: '#1e40af' },
    'R&D AI': { bg: '#ede9fe', text: '#5b21b6' },
    'Vendor Onboarding': { bg: '#fef3c7', text: '#92400e' },
    'BAU': { bg: '#dcfce7', text: '#166534' },
  }[f] || { bg: '#f1f5f9', text: '#64748b' })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>Projects</h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 13 }}>{filtered.length} projects</p>
        </div>
        <button className="btn-primary" onClick={openNew}>+ New Project</button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input type="text" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, maxWidth: 320 }} />
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Status</option>
          {OVERALL_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Name', 'DT Focal', 'Funding Type', 'Phase', 'Overall Status', 'Budget Status', 'Budget', 'Actions'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const phaseColor = (ph) => ({
                'Budget Application': { bg: '#dbeafe', text: '#1e40af' },
                'BSR / ISR': { bg: '#ede9fe', text: '#5b21b6' },
                'UAT': { bg: '#fef3c7', text: '#92400e' },
                'DEV': { bg: '#dcfce7', text: '#166534' },
                'Golive': { bg: '#d1fae5', text: '#065f46' },
              }[ph] || { bg: '#f1f5f9', text: '#64748b' })

              const overallColor = (os) => ({
                'On Track': { bg: '#dcfce7', text: '#166534' },
                'Caution': { bg: '#fef3c7', text: '#92400e' },
                'Off Track': { bg: '#fef2f2', text: '#991b1b' },
                'Finished': { bg: '#dbeafe', text: '#1e40af' },
                'Not Started': { bg: '#f1f5f9', text: '#64748b' },
              }[os] || { bg: '#f1f5f9', text: '#64748b' })

              const budgetStatusColor = (bs) => ({
                'Draft': { bg: '#f1f5f9', text: '#64748b' },
                'Ongoing': { bg: '#fef3c7', text: '#92400e' },
                'Approved': { bg: '#dcfce7', text: '#166534' },
              }[bs] || { bg: '#f1f5f9', text: '#64748b' })

              const pc = phaseColor(p.current_phase)
              const oc = overallColor(p.overall_status)
              const bc = budgetStatusColor(p.budget_status)
              const fc = fundingStyle(p.funding_type)
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{p.description?.slice(0, 40)}</div>
                  </td>
                  <td style={tdStyle}>{getPersonName(p.dt_focal_id)}</td>
                  <td style={tdStyle}>{p.funding_type ? <Badge bg={fc.bg} text={fc.text}>{p.funding_type}</Badge> : '-'}</td>
                  <td style={tdStyle}>{p.current_phase ? <Badge bg={pc.bg} text={pc.text}>{p.current_phase}</Badge> : '-'}</td>
                  <td style={tdStyle}>{p.overall_status ? <Badge bg={oc.bg} text={oc.text}>{p.overall_status}</Badge> : '-'}</td>
                  <td style={tdStyle}>{p.budget_status ? <Badge bg={bc.bg} text={bc.text}>{p.budget_status}</Badge> : '-'}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{formatMoney(p.budget)}</td>
                  <td style={tdStyle}>
                    <button onClick={() => openEdit(p)} className="btn-secondary btn-sm" style={{ marginRight: 6 }}>Edit</button>
                    <button onClick={() => remove(p.id)} className="btn-danger btn-sm">Delete</button>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-secondary)', padding: 48 }}>No projects found. Create one to get started.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={modalOverlay} onClick={() => setShowModal(false)}>
          <div className="card" style={{ width: '100%', maxWidth: 540, maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, padding: '24px 32px 16px', margin: 0, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>{editing ? 'Edit Project' : 'New Project'}</h3>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 32px' }}>
              <div style={{ display: 'grid', gap: 16 }}>
                <Field label="Project Name *">
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%' }} placeholder="Enter project name" />
                </Field>
                <Field label="DT Focal *">
                  <div style={{ display: 'flex', gap: 8 }}>
                    <select value={form.dt_focal_id} onChange={e => setForm({ ...form, dt_focal_id: e.target.value })} style={{ flex: 1 }}>
                      <option value="">-- Select --</option>
                      {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <button type="button" onClick={() => setShowAddPerson(true)} style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>+ Add</button>
                  </div>
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="Start Date">
                    <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} style={{ width: '100%' }} />
                  </Field>
                  <Field label="End Date">
                    <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} style={{ width: '100%' }} />
                  </Field>
                </div>
                <Field label="Description">
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ width: '100%', height: 80, resize: 'none' }} placeholder="Brief description" />
                </Field>
                <Field label="Biz Case">
                  <textarea value={form.biz_case} onChange={e => setForm({ ...form, biz_case: e.target.value })} rows={3} style={{ width: '100%', height: 80, resize: 'none' }} placeholder="Reference or description" />
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="Funding Type *">
                    <select value={form.funding_type} onChange={e => setForm({ ...form, funding_type: e.target.value })} style={{ width: '100%' }}>
                      <option value="">-- Select Funding Type --</option>
                      {FUNDING_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </Field>
                  <Field label="Budget ($)">
                    <input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} style={{ width: '100%' }} placeholder="0" />
                  </Field>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="Budget Status">
                    <select value={form.budget_status} onChange={e => setForm({ ...form, budget_status: e.target.value })} style={{ width: '100%' }}>
                      <option value="">-- Select --</option>
                      {BUDGET_STATUS_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </Field>
                  <Field label="Vetra Adopted">
                    <select value={form.vetra_adopted} onChange={e => setForm({ ...form, vetra_adopted: e.target.value })} style={{ width: '100%' }}>
                      <option value="">-- Select --</option>
                      {VETRA_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Key Updates">
                  <textarea value={form.key_updates} onChange={e => setForm({ ...form, key_updates: e.target.value })} rows={3} style={{ width: '100%', height: 80, resize: 'none' }} placeholder="Latest updates" />
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="Current Phase">
                    <select value={form.current_phase} onChange={e => setForm({ ...form, current_phase: e.target.value })} style={{ width: '100%' }}>
                      <option value="">-- Select Phase --</option>
                      {PHASE_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </Field>
                  <Field label="Overall Status">
                    <select value={form.overall_status} onChange={e => setForm({ ...form, overall_status: e.target.value })} style={{ width: '100%' }}>
                      <option value="">-- Select Status --</option>
                      {OVERALL_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                </div>
              </div>
            </div>
            {error && (
              <div style={{ margin: '0 32px', padding: '10px 14px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: 13 }}>
                {error}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 32px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={save} disabled={!form.name.trim() || !form.funding_type}>{editing ? 'Update Project' : 'Create Project'}</button>
            </div>
          </div>
        </div>
      )}

      {showAddPerson && (
        <AddPersonModal
          onClose={() => setShowAddPerson(false)}
          onAdded={(newPerson) => {
            setPeople(prev => [...prev, newPerson].sort((a, b) => a.name.localeCompare(b.name)))
            setForm(prev => ({ ...prev, dt_focal_id: newPerson.id }))
            setShowAddPerson(false)
          }}
        />
      )}
    </div>
  )
}

function AddPersonModal({ onClose, onAdded }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [team, setTeam] = useState('Regular Team')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const save = async () => {
    if (!name.trim() || !email.trim()) return
    setSaving(true)
    setError('')
    try {
      const { data, error: err } = await supabase.from('people').insert({
        name: name.trim(),
        email: email.trim(),
        role: 'Other',
        team_group: team,
        is_active: true
      }).select('id, name, email').single()
      if (err) throw err
      onAdded(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div className="card" style={{ width: '100%', maxWidth: 400, padding: 28 }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Quick Add Person</h3>
        <div style={{ display: 'grid', gap: 14 }}>
          <Field label="Name *">
            <input value={name} onChange={e => setName(e.target.value)} style={{ width: '100%' }} placeholder="Full name" autoFocus />
          </Field>
          <Field label="Email *">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%' }} placeholder="email@company.com" />
          </Field>
          <Field label="Team *">
            <select value={team} onChange={e => setTeam(e.target.value)} style={{ width: '100%' }}>
              <option value="Regular Team">Regular Team</option>
              <option value="ISS Team">ISS Team</option>
            </select>
          </Field>
        </div>
        {error && (
          <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 6, background: '#fef2f2', color: '#991b1b', fontSize: 12 }}>{error}</div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
          <button className="btn-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn-primary btn-sm" onClick={save} disabled={!name.trim() || !email.trim() || saving}>
            {saving ? 'Saving...' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return <div><label style={labelStyle}>{label}</label>{children}</div>
}

function Badge({ bg, text, children }) {
  return <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: bg, color: text }}>{children}</span>
}

const thStyle = { padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', background: 'var(--bg)' }
const tdStyle = { padding: '14px 16px', fontSize: 14 }
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }
const labelStyle = { display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }
