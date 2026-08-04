import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { PHASE_OPTIONS, BUDGET_STATUS_OPTIONS, VETRA_OPTIONS, OVERALL_STATUS_OPTIONS, FUNDING_OPTIONS, phaseColor, overallColor, fundingStyle, budgetStatusColor } from '../lib/constants'

const ALL_COLUMNS = [
  { key: 'name', label: 'Project Name', default: true, width: 200 },
  { key: 'dt_focal_id', label: 'DT Focal', default: true, width: 200 },
  { key: 'funding_type', label: 'Funding Type', default: true, width: 140, options: FUNDING_OPTIONS },
  { key: 'current_phase', label: 'Current Phase', default: true, width: 140, options: PHASE_OPTIONS },
  { key: 'overall_status', label: 'Overall Status', default: true, width: 140, options: OVERALL_STATUS_OPTIONS },
  { key: 'budget_status', label: 'Budget Status', default: true, width: 140, options: BUDGET_STATUS_OPTIONS },
  { key: 'budget', label: 'Budget', default: true, width: 120 },
  { key: 'description', label: 'Description', default: false, width: 280 },
  { key: 'start_date', label: 'Start Date', default: false, width: 120 },
  { key: 'end_date', label: 'End Date', default: false, width: 120 },
  { key: 'key_updates', label: 'Key Updates', default: false, width: 280 },
  { key: 'biz_case', label: 'Biz Case', default: false, width: 280 },
  { key: 'vetra_adopted', label: 'Vetra Adopted', default: false, width: 120, options: VETRA_OPTIONS },
]

const DEFAULT_VISIBLE = ALL_COLUMNS.filter(c => c.default).map(c => c.key)

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [people, setPeople] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showAddPerson, setShowAddPerson] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [visibleCols, setVisibleCols] = useState(DEFAULT_VISIBLE)
  const [colFilters, setColFilters] = useState({})
  const [showColPicker, setShowColPicker] = useState(false)
  const [viewingProject, setViewingProject] = useState(null)
  const [showErrors, setShowErrors] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const firstErrorRef = useRef(null)
  const colPickerRef = useRef(null)
  const emptyForm = { name: '', description: '', current_phase: '', key_updates: '', budget_status: '', biz_case: '', vetra_adopted: '', overall_status: '', budget: '', start_date: '', end_date: '', dt_focal_id: '', funding_type: '' }
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { loadAll() }, [])

  useEffect(() => {
    if (!showColPicker) return
    const handleClick = (e) => {
      if (colPickerRef.current && !colPickerRef.current.contains(e.target)) {
        setShowColPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showColPicker])

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
    setShowErrors(false)
    setError('')
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
    setShowErrors(false)
    setError('')
    setShowModal(true)
  }

  const requiredFields = [
    { key: 'name', label: 'Project Name' },
    { key: 'dt_focal_id', label: 'DT Focal' },
    { key: 'start_date', label: 'Start Date' },
    { key: 'end_date', label: 'End Date' },
    { key: 'description', label: 'Description' },
    { key: 'biz_case', label: 'Biz Case' },
    { key: 'funding_type', label: 'Funding Type' },
    { key: 'budget', label: 'Budget' },
    { key: 'budget_status', label: 'Budget Status' },
    { key: 'vetra_adopted', label: 'Vetra Adopted' },
    { key: 'key_updates', label: 'Key Updates' },
    { key: 'current_phase', label: 'Current Phase' },
    { key: 'overall_status', label: 'Overall Status' },
  ]

  const isFieldEmpty = (key) => {
    const v = form[key]
    return v === undefined || v === null || String(v).trim() === ''
  }

  const save = async () => {
    setError('')
    const isEditing = !!editing
    const missing = requiredFields.filter(f => isFieldEmpty(f.key))
    if (missing.length > 0) {
      setShowErrors(true)
      const errMsg = isEditing ? 'Please fill in all required fields before updating the project.' : 'Please fill in all required fields before creating the project.'
      setError(errMsg)
      alert(errMsg)
      setTimeout(() => {
        if (firstErrorRef.current) {
          firstErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
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
      if (isEditing) {
        result = await supabase.from('projects').update(payload).eq('id', editing.id)
      } else {
        result = await supabase.from('projects').insert(payload)
      }
      if (result.error) {
        console.error('Save error:', result.error)
        setError(result.error.message || JSON.stringify(result.error))
        return
      }
      const msg = isEditing ? 'Project updated successfully!' : 'Project created successfully!'
      setShowModal(false)
      setSuccessMsg(msg)
      setTimeout(() => setSuccessMsg(''), 5000)
      loadAll()
    } catch (err) {
      console.error('Save exception:', err)
      setError(err.message)
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this project?')) return
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) {
      console.error('Delete error:', error)
      setError(error.message || 'Failed to delete project')
      return
    }
    loadAll()
  }

  const getPersonNames = (ids) => (ids || '').split(',').filter(Boolean).map(id => people.find(p => p.id === id)?.name).filter(Boolean).join(', ') || '-'

  const toggleFocal = (id) => {
    const current = (form.dt_focal_id || '').split(',').filter(Boolean)
    const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id]
    setForm({ ...form, dt_focal_id: next.join(',') })
  }

  const toggleCol = (key) => {
    setVisibleCols(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  const setFilter = (key, val) => {
    setColFilters(prev => {
      const next = { ...prev }
      if (!val || val === 'all') delete next[key]
      else next[key] = val
      return next
    })
  }

  const filtered = projects.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    for (const [key, val] of Object.entries(colFilters)) {
      if (key === 'dt_focal_id') {
        if (!val) continue
        const projectNames = (p[key] || '').split(',').filter(Boolean).map(id => people.find(pr => pr.id === id)?.name).filter(Boolean)
        if (!projectNames.includes(val)) return false
        continue
      }
      const cellVal = (p[key] || '')
      if (cellVal !== val) return false
    }
    return true
  })

  const stripHtml = (html) => {
    if (!html) return ''
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent || div.innerText || ''
  }

  const formatMoney = (n) => '$' + (n || 0).toLocaleString()

  const cellTextStyle = { fontSize: 13, lineHeight: 1.4, maxHeight: 80, overflowY: 'auto', wordBreak: 'break-word' }

  const renderCell = (col, p) => {
    switch (col.key) {
      case 'name':
        return <span style={{ fontWeight: 600, color: 'var(--text)' }}>{p.name}</span>
      case 'description':
        return <div style={cellTextStyle}>{p.description || '-'}</div>
      case 'dt_focal_id':
        return getPersonNames(p.dt_focal_id)
      case 'funding_type':
        return p.funding_type ? <Badge bg={fundingStyle(p.funding_type).bg} text={fundingStyle(p.funding_type).text}>{p.funding_type}</Badge> : '-'
      case 'current_phase':
        return p.current_phase ? <Badge bg={phaseColor(p.current_phase).bg} text={phaseColor(p.current_phase).text}>{p.current_phase}</Badge> : '-'
      case 'overall_status':
        return p.overall_status ? <Badge bg={overallColor(p.overall_status).bg} text={overallColor(p.overall_status).text}>{p.overall_status}</Badge> : '-'
      case 'budget_status':
        return p.budget_status ? <Badge bg={budgetStatusColor(p.budget_status).bg} text={budgetStatusColor(p.budget_status).text}>{p.budget_status}</Badge> : '-'
      case 'budget':
        return <span style={{ fontWeight: 600 }}>{formatMoney(p.budget)}</span>
      case 'start_date':
        return p.start_date || '-'
      case 'end_date':
        return p.end_date || '-'
      case 'key_updates':
        return <div style={cellTextStyle}>{stripHtml(p.key_updates) || '-'}</div>
      case 'biz_case':
        return <div style={cellTextStyle}>{p.biz_case || '-'}</div>
      case 'vetra_adopted':
        return p.vetra_adopted || '-'
      default:
        return p[col.key] || '-'
    }
  }

  const getFilterValues = (col) => {
    if (col.options) return col.options
    if (col.key === 'dt_focal_id') return people.map(p => p.name).sort()
    return null
  }

  const exportExcel = async () => {
    const XLSX = await import('xlsx')
    const rows = filtered.map(p => {
      const row = {}
      ALL_COLUMNS.forEach(c => { row[c.label] = c.key === 'dt_focal_id' ? getPersonNames(p[c.key]) : p[c.key] ?? '' })
      return row
    })
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Projects')
    const now = new Date()
    const ts = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`
    XLSX.writeFile(wb, `projects_${ts}.xlsx`)
  }

  return (
    <div>
      {successMsg && (
        <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 2000, padding: '14px 24px', borderRadius: 10, background: '#16a34a', color: 'white', fontSize: 14, fontWeight: 600, boxShadow: '0 8px 30px rgba(22,163,74,0.3)', display: 'flex', alignItems: 'center', gap: 10, animation: 'slideDown 0.3s ease' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" fill="white" fillOpacity="0.2"/><path d="M6 10l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {successMsg}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>Projects</h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 13 }}>{filtered.length} projects</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={exportExcel} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 10v2a1 1 0 001 1h8a1 1 0 001-1v-2M7 2v8M4 7l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Export Excel
          </button>
          <button className="btn-primary" onClick={openNew}>+ New Project</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
        <input type="text" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, maxWidth: 320 }} />
        <div style={{ position: 'relative' }} ref={colPickerRef}>
          <button className="btn-secondary btn-sm" onClick={() => setShowColPicker(!showColPicker)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="9" y="1" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="1" y="9" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="9" y="9" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.2"/></svg>
            Columns
          </button>
          {showColPicker && (
            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 6, background: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, zIndex: 100, minWidth: 220, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Toggle Columns</div>
              {ALL_COLUMNS.map(col => (
                <label key={col.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 4px', cursor: 'pointer', fontSize: 13, borderRadius: 4, color: 'var(--text)' }}>
                  <input
                    type="checkbox"
                    checked={visibleCols.includes(col.key)}
                    onChange={() => toggleCol(col.key)}
                    style={{ width: 15, height: 15, accentColor: 'var(--primary)' }}
                  />
                  {col.label}
                </label>
              ))}
              <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8, display: 'flex', gap: 6 }}>
                <button className="btn-secondary btn-sm" style={{ flex: 1, fontSize: 11, padding: '4px 0' }} onClick={() => setVisibleCols(ALL_COLUMNS.map(c => c.key))}>All</button>
                <button className="btn-secondary btn-sm" style={{ flex: 1, fontSize: 11, padding: '4px 0' }} onClick={() => setVisibleCols(DEFAULT_VISIBLE)}>Reset</button>
                <button className="btn-secondary btn-sm" style={{ flex: 1, fontSize: 11, padding: '4px 0' }} onClick={() => setVisibleCols([])}>None</button>
              </div>
              <button className="btn-primary btn-sm" style={{ width: '100%', marginTop: 8, fontSize: 12, padding: '6px 0' }} onClick={() => setShowColPicker(false)}>Done</button>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'visible' }}>
        <div className="table-scroll">
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <colgroup>
              {ALL_COLUMNS.map(col => (
                <col key={col.key} style={{ width: visibleCols.includes(col.key) ? col.width : 0 }} />
              ))}
              <col style={{ width: 180 }} />
            </colgroup>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {ALL_COLUMNS.map(col => {
                  const isVisible = visibleCols.includes(col.key)
                  if (!isVisible) return <th key={col.key} style={{ ...thStyle, padding: 0, border: 'none' }}></th>
                  const filterVals = getFilterValues(col)
                  const currentFilter = colFilters[col.key] || 'all'
                  return <th key={col.key} style={{ ...thStyle, minWidth: col.width, width: col.width }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span>{col.label}</span>
                        {filterVals && (
                          <select
                            value={currentFilter}
                            onChange={e => setFilter(col.key, e.target.value)}
                            onClick={e => e.stopPropagation()}
                            style={{ fontSize: 11, padding: '2px 4px', borderRadius: 4, border: '1px solid var(--border)', background: currentFilter !== 'all' ? '#eff6ff' : 'var(--bg-white)', color: currentFilter !== 'all' ? 'var(--primary)' : 'var(--text-secondary)', maxWidth: 120, cursor: 'pointer' }}
                          >
                            <option value="all">All</option>
                            {filterVals.map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                        )}
                      </div>
                    </th>
                })}
                <th style={{ ...thStyle, position: 'sticky', right: 0, background: 'var(--bg)', zIndex: 3, textAlign: 'center', minWidth: 180, borderLeft: '1px solid var(--border)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #e8ecf1' }}>
                  {ALL_COLUMNS.map(col => {
                    const isVisible = visibleCols.includes(col.key)
                    if (!isVisible) return <td key={col.key} style={{ padding: 0, border: 'none' }}></td>
                    return <td key={col.key} style={tdStyle}>{renderCell(col, p)}</td>
                  })}
                  <td style={{ ...tdStyle, position: 'sticky', right: 0, background: 'var(--bg-card)', zIndex: 2, whiteSpace: 'nowrap', textAlign: 'center', borderLeft: '1px solid var(--border)' }}>
                    <button onClick={() => setViewingProject(p)} className="btn-secondary btn-sm" style={{ marginRight: 4 }}>View</button>
                    <button onClick={() => openEdit(p)} className="btn-secondary btn-sm" style={{ marginRight: 4 }}>Edit</button>
                    <button onClick={() => remove(p.id)} className="btn-danger btn-sm">Delete</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={ALL_COLUMNS.length + 1} style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-secondary)', padding: 48 }}>No projects found. Create one to get started.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={modalOverlay} onClick={() => setShowModal(false)}>
          <div className="card" style={{ width: '100%', maxWidth: 540, maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, padding: '24px 32px 16px', margin: 0, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>{editing ? 'Edit Project' : 'New Project'}</h3>
            {error && (
              <div style={{ margin: '0 32px', marginTop: 16, padding: '10px 14px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: 13, flexShrink: 0 }}>
                {error}
              </div>
            )}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 32px' }}>
              <div style={{ display: 'grid', gap: 16 }}>
                {(() => {
                  let firstErr = true
                  const refIfFirst = (key) => {
                    if (showErrors && isFieldEmpty(key) && firstErr) { firstErr = false; return firstErrorRef }
                    return undefined
                  }
                  const errIfEmpty = (key) => showErrors && isFieldEmpty(key)
                  return <>
                    <Field label="Project Name *" error={errIfEmpty('name')}><div ref={refIfFirst('name')}><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%' }} placeholder="Enter project name" /></div></Field>
                    <Field label="DT Focal *" error={errIfEmpty('dt_focal_id')}><div><div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}><span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Select one or more:</span><button type="button" onClick={() => setShowAddPerson(true)} style={{ padding: '3px 10px', borderRadius: 6, background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>+ Add Person</button></div><div ref={refIfFirst('dt_focal_id')} style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 140, overflowY: 'auto', padding: '4px 0' }}>{people.map(p => { const sel = (form.dt_focal_id || '').split(',').includes(p.id); return <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, fontSize: 12, cursor: 'pointer', background: sel ? '#dbeafe' : '#f1f5f9', border: sel ? '1px solid #93c5fd' : '1px solid transparent', color: sel ? '#1e40af' : 'var(--text)', userSelect: 'none' }}><input type="checkbox" checked={sel} onChange={() => toggleFocal(p.id)} style={{ width: 14, height: 14, accentColor: 'var(--primary)', margin: 0 }} />{p.name}</label> })}</div></div></Field>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <Field label="Start Date *" error={errIfEmpty('start_date')}><div ref={refIfFirst('start_date')}><input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} style={{ width: '100%' }} /></div></Field>
                      <Field label="End Date *" error={errIfEmpty('end_date')}><div ref={refIfFirst('end_date')}><input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} style={{ width: '100%' }} /></div></Field>
                    </div>
                    <Field label="Description *" error={errIfEmpty('description')}><div ref={refIfFirst('description')}><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ width: '100%', height: 80, resize: 'none' }} placeholder="Brief description" /></div></Field>
                    <Field label="Biz Case *" error={errIfEmpty('biz_case')}><div ref={refIfFirst('biz_case')}><textarea value={form.biz_case} onChange={e => setForm({ ...form, biz_case: e.target.value })} rows={3} style={{ width: '100%', height: 80, resize: 'none' }} placeholder="Reference or description" /></div></Field>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <Field label="Funding Type *" error={errIfEmpty('funding_type')}><div ref={refIfFirst('funding_type')}><select value={form.funding_type} onChange={e => setForm({ ...form, funding_type: e.target.value })} style={{ width: '100%' }}><option value="">-- Select Funding Type --</option>{FUNDING_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}</select></div></Field>
                      <Field label="Budget ($) *" error={errIfEmpty('budget')}><div ref={refIfFirst('budget')}><input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} style={{ width: '100%' }} placeholder="0" /></div></Field>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <Field label="Budget Status *" error={errIfEmpty('budget_status')}><div ref={refIfFirst('budget_status')}><select value={form.budget_status} onChange={e => setForm({ ...form, budget_status: e.target.value })} style={{ width: '100%' }}><option value="">-- Select --</option>{BUDGET_STATUS_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}</select></div></Field>
                      <Field label="Vetra Adopted *" error={errIfEmpty('vetra_adopted')}><div ref={refIfFirst('vetra_adopted')}><select value={form.vetra_adopted} onChange={e => setForm({ ...form, vetra_adopted: e.target.value })} style={{ width: '100%' }}><option value="">-- Select --</option>{VETRA_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}</select></div></Field>
                    </div>
                    <Field label="Key Updates *" error={errIfEmpty('key_updates')}><div ref={refIfFirst('key_updates')}><textarea value={form.key_updates} onChange={e => setForm({ ...form, key_updates: e.target.value })} rows={3} style={{ width: '100%', height: 80, resize: 'none' }} placeholder="Latest updates" /></div></Field>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <Field label="Current Phase *" error={errIfEmpty('current_phase')}><div ref={refIfFirst('current_phase')}><select value={form.current_phase} onChange={e => setForm({ ...form, current_phase: e.target.value })} style={{ width: '100%' }}><option value="">-- Select Phase --</option>{PHASE_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}</select></div></Field>
                      <Field label="Overall Status *" error={errIfEmpty('overall_status')}><div ref={refIfFirst('overall_status')}><select value={form.overall_status} onChange={e => setForm({ ...form, overall_status: e.target.value })} style={{ width: '100%' }}><option value="">-- Select Status --</option>{OVERALL_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select></div></Field>
                    </div>
                  </>
                })()}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 32px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={save}>{editing ? 'Update Project' : 'Create Project'}</button>
            </div>
          </div>
        </div>
      )}

      {showAddPerson && (
        <AddPersonModal
          onClose={() => setShowAddPerson(false)}
          onAdded={(newPerson) => {
            setPeople(prev => [...prev, newPerson].sort((a, b) => a.name.localeCompare(b.name)))
            setForm(prev => ({ ...prev, dt_focal_id: (prev.dt_focal_id ? prev.dt_focal_id + ',' : '') + newPerson.id }))
            setShowAddPerson(false)
          }}
        />
      )}

      {viewingProject && (
        <ProjectViewModal project={viewingProject} people={people} onClose={() => setViewingProject(null)} />
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
      const { data: existing } = await supabase.from('people').select('id, name').ilike('email', email.trim().toLowerCase())
      if (existing && existing.length > 0) {
        setError(`Email already used by ${existing.map(e => e.name).join(', ')}`)
        setSaving(false)
        return
      }
      const { data, error: err } = await supabase.from('people').insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
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

function ProjectViewModal({ project, people, onClose }) {
  const getPersonNames = (ids) => (ids || '').split(',').filter(Boolean).map(id => people.find(p => p.id === id)?.name).filter(Boolean).join(', ') || '-'
  const formatMoney = (n) => '$' + (n || 0).toLocaleString()
  const stripHtml = (html) => {
    if (!html) return ''
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent || div.innerText || ''
  }

  const fieldMap = {
    name: { label: 'Project Name', value: project.name },
    dt_focal_id: { label: 'DT Focal', value: getPersonNames(project.dt_focal_id) },
    funding_type: { label: 'Funding Type', value: project.funding_type || '-' },
    current_phase: { label: 'Current Phase', value: project.current_phase || '-' },
    overall_status: { label: 'Overall Status', value: project.overall_status || '-' },
    budget_status: { label: 'Budget Status', value: project.budget_status || '-' },
    budget: { label: 'Budget', value: formatMoney(project.budget) },
    description: { label: 'Description', value: project.description || '-', long: true },
    start_date: { label: 'Start Date', value: project.start_date || '-' },
    end_date: { label: 'End Date', value: project.end_date || '-' },
    key_updates: { label: 'Key Updates', value: stripHtml(project.key_updates) || '-', long: true },
    biz_case: { label: 'Biz Case', value: project.biz_case || '-', long: true },
    vetra_adopted: { label: 'Vetra Adopted', value: project.vetra_adopted || '-' },
  }

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div className="card" style={{ width: '100%', maxWidth: 600, maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: 0 }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{project.name}</h3>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text-secondary)', padding: 4 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
          <div style={{ display: 'grid', gap: 0 }}>
            {ALL_COLUMNS.map(col => {
              const field = fieldMap[col.key]
              if (!field) return null
              return (
                <div key={col.key} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{field.label}</div>
                  {field.long ? (
                    <div style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{field.value}</div>
                  ) : (
                    <div style={{ fontSize: 14 }}>{field.value}</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        <div style={{ padding: '14px 28px', borderTop: '1px solid var(--border)', flexShrink: 0, textAlign: 'right' }}>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children, error }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {error ? (
        <div style={{ border: '1.5px solid #ef4444', borderRadius: 8, padding: 2 }}>
          {children}
        </div>
      ) : children}
      {error && <span style={{ display: 'block', marginTop: 4, fontSize: 12, color: '#ef4444', fontWeight: 500 }}>This field is required</span>}
    </div>
  )
}

function Badge({ bg, text, children }) {
  return <span style={{ display: 'inline-block', minWidth: 90, padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: bg, color: text, textAlign: 'center', whiteSpace: 'nowrap' }}>{children}</span>
}

const thStyle = { padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', background: 'var(--bg)', whiteSpace: 'nowrap' }
const tdStyle = { padding: '14px 16px', fontSize: 14, verticalAlign: 'top', height: 60 }
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }
const labelStyle = { display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }
