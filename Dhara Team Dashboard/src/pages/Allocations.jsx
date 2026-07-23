import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function Allocations() {
  const [projects, setProjects] = useState([])
  const [people, setPeople] = useState([])
  const [allocations, setAllocations] = useState([])
  const [year, setYear] = useState(new Date().getFullYear())
  const [selectedProject, setSelectedProject] = useState('all')
  const [editingCell, setEditingCell] = useState(null)
  const [editValue, setEditValue] = useState({ planned: '', actual: '' })

  useEffect(() => { loadData() }, [year])

  const loadData = async () => {
    const [projRes, peopleRes, allocRes] = await Promise.all([
      supabase.from('projects').select('id, name').order('name'),
      supabase.from('people').select('id, name').eq('is_active', true).order('name'),
      supabase.from('allocations').select('*').eq('year', year)
    ])
    setProjects(projRes.data || [])
    setPeople(peopleRes.data || [])
    setAllocations(allocRes.data || [])
  }

  const getAlloc = (personId, month) => {
    return allocations.find(a => a.person_id === personId && a.month === month) || { planned_md: 0, actual_md: 0 }
  }

  const startEdit = (personId, month) => {
    const alloc = getAlloc(personId, month)
    setEditingCell({ personId, month })
    setEditValue({ planned: alloc.planned_md || 0, actual: alloc.actual_md || 0 })
  }

  const saveEdit = async () => {
    if (!editingCell) return
    const { personId, month } = editingCell
    const payload = {
      project_id: selectedProject !== 'all' ? selectedProject : projects[0]?.id,
      person_id: personId,
      year, month,
      planned_md: parseFloat(editValue.planned) || 0,
      actual_md: parseFloat(editValue.actual) || 0
    }

    const existing = allocations.find(a => a.person_id === personId && a.month === month)
    if (existing) {
      await supabase.from('allocations').update({ planned_md: payload.planned_md, actual_md: payload.actual_md }).eq('id', existing.id)
    } else {
      await supabase.from('allocations').insert(payload)
    }
    setEditingCell(null)
    loadData()
  }

  const filteredPeople = selectedProject !== 'all'
    ? people.filter(p => allocations.some(a => a.person_id === p.id && a.project_id === selectedProject))
    : people

  const totalPlanned = MONTHS.reduce((s, _, i) => s + (getAlloc(filteredPeople[0]?.id, i + 1).planned_md || 0), 0)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Resource Allocations (MD)</h2>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}>
            <option value="all">All Projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={year} onChange={e => setYear(parseInt(e.target.value))}>
            {[year - 1, year, year + 1].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ ...thStyle, minWidth: 140, position: 'sticky', left: 0, background: 'var(--bg-card)', zIndex: 1 }}>Person</th>
              {MONTHS.map((m, i) => (
                <th key={i} style={{ ...thStyle, textAlign: 'center', minWidth: 70 }}>{m}</th>
              ))}
              <th style={{ ...thStyle, textAlign: 'center' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {filteredPeople.map(p => {
              const rowTotal = MONTHS.reduce((s, _, i) => s + (getAlloc(p.id, i + 1).planned_md || 0), 0)
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ ...tdStyle, fontWeight: 600, position: 'sticky', left: 0, background: 'var(--bg-card)', zIndex: 1 }}>{p.name}</td>
                  {MONTHS.map((_, i) => {
                    const month = i + 1
                    const alloc = getAlloc(p.id, month)
                    const isEditing = editingCell?.personId === p.id && editingCell?.month === month
                    return (
                      <td key={i} style={{ ...tdStyle, textAlign: 'center', cursor: 'pointer', padding: 4 }}
                        onClick={() => !isEditing && startEdit(p.id, month)}>
                        {isEditing ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <input
                              type="number" value={editValue.planned}
                              onChange={e => setEditValue({ ...editValue, planned: e.target.value })}
                              onBlur={saveEdit}
                              onKeyDown={e => e.key === 'Enter' && saveEdit()}
                              style={{ width: 50, padding: '2px 4px', fontSize: 12, textAlign: 'center' }}
                              autoFocus
                              placeholder="P"
                            />
                            <input
                              type="number" value={editValue.actual}
                              onChange={e => setEditValue({ ...editValue, actual: e.target.value })}
                              onBlur={saveEdit}
                              onKeyDown={e => e.key === 'Enter' && saveEdit()}
                              style={{ width: 50, padding: '2px 4px', fontSize: 12, textAlign: 'center' }}
                              placeholder="A"
                            />
                          </div>
                        ) : (
                          <div style={{ fontSize: 12 }}>
                            <div style={{ color: 'var(--info)' }}>{alloc.planned_md || '-'}</div>
                            <div style={{ color: 'var(--success)' }}>{alloc.actual_md || '-'}</div>
                          </div>
                        )}
                      </td>
                    )
                  })}
                  <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700 }}>{rowTotal}</td>
                </tr>
              )
            })}
            {filteredPeople.length === 0 && (
              <tr><td colSpan={14} style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-secondary)', padding: 40 }}>No data. Add people and projects first.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 16 }}>
        <span><span style={{ color: 'var(--info)' }}>Blue</span> = Planned MD</span>
        <span><span style={{ color: 'var(--success)' }}>Green</span> = Actual MD</span>
        <span>Click a cell to edit</span>
      </div>
    </div>
  )
}

const thStyle = { padding: '12px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }
const tdStyle = { padding: '10px 14px', fontSize: 14 }
