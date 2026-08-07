import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { PHASE_OPTIONS, OVERALL_STATUS_OPTIONS, phaseColor, overallColor } from '../lib/constants'
import { fetchPhaseOptions } from '../lib/phases'
import { updatesRows } from '../lib/keyUpdates'
import RichEditor from '../components/RichEditor'
import KeyUpdatesTable from '../components/KeyUpdatesTable'
import { isDemo, demoProjects, demoPeople, demoPhaseOptions } from '../lib/demoData'

function Badge({ bg, text, children }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: bg, color: text,
      borderRadius: 20, padding: '4px 12px', fontSize: 13, fontWeight: 600,
      lineHeight: 1.5, whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}

export default function BMS() {
  const [projects, setProjects] = useState([])
  const [people, setPeople] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [successMsg, setSuccessMsg] = useState('')
  const [phaseOptions, setPhaseOptions] = useState(PHASE_OPTIONS)

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    if (isDemo) {
      setProjects(demoProjects)
      setPeople(demoPeople)
      setPhaseOptions(demoPhaseOptions())
      setLoading(false)
      return
    }
    const [projRes, peopleRes, phaseOpts] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('people').select('id, name'),
      fetchPhaseOptions(),
    ])
    setProjects(projRes.data || [])
    setPeople(peopleRes.data || [])
    setPhaseOptions(phaseOpts)
    setLoading(false)
  }

  const getPersonNames = (ids) => (ids || '').split(',').filter(Boolean).map(id => people.find(p => p.id === id)?.name).filter(Boolean).join(', ') || 'Unassigned'

  const focalIds = [...new Set(projects.flatMap(p => (p.dt_focal_id || '').split(',').filter(Boolean)))]
  const focalOptions = focalIds.map(id => ({ id, name: people.find(p => p.id === id)?.name || 'Unassigned' }))

  const filtered = filter === 'all'
    ? projects
    : projects.filter(p => (p.dt_focal_id || '').split(',').includes(filter))

  const showSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  return (
    <div style={{ minHeight: '100%' }}>
      {successMsg && (
        <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 2000, padding: '14px 24px', borderRadius: 10, background: '#16a34a', color: 'white', fontSize: 14, fontWeight: 600, boxShadow: '0 8px 30px rgba(22,163,74,0.3)', display: 'flex', alignItems: 'center', gap: 10, animation: 'slideDown 0.3s ease' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" fill="white" fillOpacity="0.2"/><path d="M6 10l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {successMsg}
        </div>
      )}
      <div style={{
        marginBottom: 32, paddingBottom: 20, borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px', color: '#0f172a', letterSpacing: '-0.01em' }}>BMS</h2>
          <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>Project progress overview for weekly meeting</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f8fafc', padding: '10px 16px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="7" cy="7" r="4.5" stroke="#64748b" strokeWidth="1.5"/><path d="M15.5 15.5l-3.5-3.5" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ border: 'none', background: 'transparent', fontSize: 14, fontWeight: 500, color: '#334155', outline: 'none', cursor: 'pointer', paddingRight: 4 }}
          >
            <option value="all">All DT Focal</option>
            {focalOptions.map(o => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: 80 }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: 80, fontSize: 14 }}>No projects found</div>
      ) : (
        <div style={{ display: 'grid', gap: 24 }}>
          {filtered.map((p, idx) => (
            <BMSCard key={p.id} project={p} focalName={getPersonNames(p.dt_focal_id)} index={idx} onSaved={loadAll} onShowSuccess={showSuccess} phaseOptions={phaseOptions} />
          ))}
        </div>
      )}
    </div>
  )
}

function BMSCard({ project, focalName, index, onSaved, onShowSuccess, phaseOptions }) {
  const [editingField, setEditingField] = useState(null)
  const [phaseDraft, setPhaseDraft] = useState(project.current_phase || '')
  const [customPhase, setCustomPhase] = useState('')
  const [overallDraft, setOverallDraft] = useState(project.overall_status || '')
  const [saving, setSaving] = useState(false)
  const [savingError, setSavingError] = useState('')
  const [updDraft, setUpdDraft] = useState({ progress: '', next_steps: '', blockers: '', eta: '', owner: '' })

  useEffect(() => { setPhaseDraft(project.current_phase || '') }, [project.current_phase])
  useEffect(() => { setOverallDraft(project.overall_status || '') }, [project.overall_status])

  const saveField = async (field, value) => {
    if (isDemo) {
      const idx = demoProjects.findIndex(p => p.id === project.id)
      if (idx >= 0) demoProjects[idx] = { ...demoProjects[idx], [field]: value }
      onShowSuccess('Saved! Changes synced to Projects page')
      setEditingField(null)
      await onSaved()
      return
    }
    setSaving(true)
    const { error } = await supabase.from('projects').update({ [field]: value }).eq('id', project.id)
    setSaving(false)
    if (!error) {
      onShowSuccess('Saved! Changes synced to Projects page')
      await onSaved()
    }
    setEditingField(null)
  }

  const startEditUpdates = () => {
    setUpdDraft({
      progress: project.progress || '',
      next_steps: project.next_steps || '',
      blockers: project.blockers || '',
      eta: project.eta || '',
      owner: project.owner || '',
    })
    setSavingError('')
    setEditingField('key')
  }

  const strip = (html) => (html || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim()

  const saveUpdates = async () => {
    const progress = (updDraft.progress || '').trim()
    const next_steps = (updDraft.next_steps || '').trim()
    const blockers = (updDraft.blockers || '').trim()
    const eta = (updDraft.eta || '').trim()
    const owner = (updDraft.owner || '').trim()
    if (!strip(progress)) {
      setSavingError('Progress is required.')
      return
    }
    setSaving(true)
    if (isDemo) {
      const idx = demoProjects.findIndex(p => p.id === project.id)
      if (idx >= 0) {
        const prev = { ...demoProjects[idx] }
        demoProjects[idx] = {
          ...prev,
          progress: progress || null,
          next_steps: next_steps || null,
          blockers: blockers || null,
          eta: eta || null,
          owner: owner || null,
          last_update: {
            progress: prev.progress || null,
            next_steps: prev.next_steps || null,
            blockers: prev.blockers || null,
            eta: prev.eta || null,
            owner: prev.owner || null,
            updated_at: prev.updates_updated_at || null,
          },
          updates_updated_at: new Date().toISOString(),
        }
      }
      setSaving(false)
      onShowSuccess('Saved! Changes synced to Projects page')
      setEditingField(null)
      await onSaved()
      return
    }
    const { error } = await supabase.from('projects').update({
      progress: progress || null,
      next_steps: next_steps || null,
      blockers: blockers || null,
      eta: eta || null,
      owner: owner || null,
      last_update: {
        progress: project.progress || null,
        next_steps: project.next_steps || null,
        blockers: project.blockers || null,
        eta: project.eta || null,
        owner: project.owner || null,
        updated_at: project.updates_updated_at || null,
      },
      updates_updated_at: new Date().toISOString(),
    }).eq('id', project.id)
    setSaving(false)
    if (error) {
      setSavingError(error.message || 'Failed to save updates')
      return
    }
    onShowSuccess('Saved! Changes synced to Projects page')
    setEditingField(null)
    await onSaved()
  }

  const phase = project.current_phase
  const overall = project.overall_status
  const pc = phase ? phaseColor(phase) : null
  const oc = overall ? overallColor(overall) : null

  const updRows = updatesRows(project)

  return (
    <div style={{
      background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
      borderRadius: 16, border: '1px solid #e2e8f0',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)',
      overflow: 'hidden',
    }}>
      {/* Top accent bar */}
      <div style={{
        height: 4,
        background: oc
          ? `linear-gradient(90deg, ${oc.text === '#166534' ? '#22c55e' : oc.text === '#92400e' ? '#f59e0b' : oc.text === '#991b1b' ? '#ef4444' : oc.text === '#1e40af' ? '#3b82f6' : '#94a3b8'}, ${oc.text === '#166534' ? '#86efac' : oc.text === '#92400e' ? '#fcd34d' : oc.text === '#991b1b' ? '#fca5a5' : oc.text === '#1e40af' ? '#93c5fd' : '#cbd5e1'})`
          : 'linear-gradient(90deg, #94a3b8, #cbd5e1)',
      }} />

      <div style={{ padding: '28px 32px 26px' }}>
        {/* Row 1: Number + Project Name (left) | DT Focal (right) */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
              color: '#fff', fontWeight: 800, fontSize: 15,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {index + 1}
            </div>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#0f172a', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {project.name}
              </h3>
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', borderRadius: 10,
            background: '#f8fafc', border: '1px solid #f1f5f9',
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="3" stroke="#64748b" strokeWidth="1.3"/><path d="M3 14.5c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="#64748b" strokeWidth="1.3"/></svg>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>DT Focal</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>{focalName}</span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', borderRadius: 10,
            background: '#f8fafc', border: '1px solid #f1f5f9',
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="3" width="10" height="10" rx="1.5" stroke="#64748b" strokeWidth="1.3"/></svg>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>Biz Focal</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>{project.biz_focal || '—'}</span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', borderRadius: 10,
            background: '#f8fafc', border: '1px solid #f1f5f9',
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" stroke="#64748b" strokeWidth="1.3"/></svg>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>IT Focal</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>{project.it_focal || '—'}</span>
          </div>
        </div>

        {/* Badges row: Current Phase + Overall Status (editable) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {editingField === 'phase' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Current Phase：</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <select
                  value={phaseDraft}
                  onChange={e => setPhaseDraft(e.target.value)}
                  autoFocus
                  style={{ padding: '4px 8px', borderRadius: 6, border: '1.5px solid #93c5fd', fontSize: 14, background: '#fff', outline: 'none' }}
                >
                  <option value="">--</option>
                  {phaseOptions.map(o => <option key={o} value={o}>{o}</option>)}
                  <option value="__custom__">＋ Custom Phase…</option>
                </select>
                {phaseDraft === '__custom__' && (
                  <input
                    value={customPhase}
                    onChange={e => setCustomPhase(e.target.value)}
                    placeholder="Enter a new phase..."
                    style={{ padding: '4px 8px', borderRadius: 6, border: '1.5px solid #93c5fd', fontSize: 14, background: '#fff', outline: 'none', width: 180 }}
                  />
                )}
              </div>
              <button onClick={() => {
                const val = phaseDraft === '__custom__' ? customPhase.trim() : phaseDraft
                if (!val) return
                saveField('current_phase', val)
              }} disabled={saving} style={{ fontSize: 13, color: '#fff', background: '#3b82f6', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontWeight: 600 }}>
                {saving ? '...' : 'OK'}
              </button>
              <button onClick={() => { setPhaseDraft(project.current_phase || ''); setCustomPhase(''); setEditingField(null) }} style={{ fontSize: 13, color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          ) : (
            <div
              onClick={() => { setEditingField('phase'); setPhaseDraft(project.current_phase || ''); setCustomPhase('') }}
              style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'transform 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Current Phase：</span>
              {phase ? (
                <Badge bg={pc.bg} text={pc.text}>{phase}</Badge>
              ) : (
                <span style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>Not set</span>
              )}
            </div>
          )}

          {editingField === 'overall' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Overall Status：</span>
              <select
                value={overallDraft}
                onChange={e => setOverallDraft(e.target.value)}
                autoFocus
                style={{ padding: '4px 8px', borderRadius: 6, border: '1.5px solid #93c5fd', fontSize: 14, background: '#fff', outline: 'none' }}
              >
                <option value="">--</option>
                {OVERALL_STATUS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <button onClick={() => saveField('overall_status', overallDraft)} disabled={saving} style={{ fontSize: 13, color: '#fff', background: '#3b82f6', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontWeight: 600 }}>
                {saving ? '...' : 'OK'}
              </button>
              <button onClick={() => { setOverallDraft(project.overall_status || ''); setEditingField(null) }} style={{ fontSize: 13, color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          ) : (
            <div
              onClick={() => { setEditingField('overall'); setOverallDraft(project.overall_status || '') }}
              style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'transform 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Overall Status：</span>
              {overall ? (
                <Badge bg={oc.bg} text={oc.text}>{overall}</Badge>
              ) : (
                <span style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>Not set</span>
              )}
            </div>
          )}
        </div>

        {/* Key Updates section */}
        <div style={{
          borderRadius: 12, border: '1px solid #f1f5f9', background: '#fff', overflow: 'hidden',
        }}>
          <div style={{
            padding: '12px 16px', borderBottom: editingField === 'key' ? '1px solid #f1f5f9' : 'none', background: '#fafbfc',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2.5 4h11M2.5 8h11M2.5 12h7" stroke="#64748b" strokeWidth="1.3" strokeLinecap="round"/></svg>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#334155' }}>Key Updates</span>
            </div>
            {editingField !== 'key' && (
              <button
                onClick={startEditUpdates}
                style={{ fontSize: 13, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: '4px 10px', borderRadius: 6 }}
                onMouseEnter={e => e.target.style.background = '#eff6ff'}
                onMouseLeave={e => e.target.style.background = 'none'}
              >
                Edit
              </button>
            )}
          </div>

          {editingField === 'key' ? (
            <div style={{ padding: '16px 20px', display: 'grid', gap: 14 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Progress <span style={{ color: '#ef4444' }}>*</span> <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: 12 }}>— what's been done since the last meeting</span></div>
                <RichEditor initialValue={updDraft.progress} onChange={html => setUpdDraft(d => ({ ...d, progress: html }))} minHeight={70} placeholder="What did the team complete since the last meeting?" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Next Steps <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: 12 }}>— what's planned before the next meeting</span></div>
                <RichEditor initialValue={updDraft.next_steps} onChange={html => setUpdDraft(d => ({ ...d, next_steps: html }))} minHeight={60} placeholder="What happens next?" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Blockers / Risks</div>
                <RichEditor initialValue={updDraft.blockers} onChange={html => setUpdDraft(d => ({ ...d, blockers: html }))} minHeight={60} placeholder="Anything blocking progress, or who needs help?" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>ETA</div>
                  <input type="date" lang="en" value={updDraft.eta} onChange={e => setUpdDraft(d => ({ ...d, eta: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff' }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Owner</div>
                  <input value={updDraft.owner} onChange={e => setUpdDraft(d => ({ ...d, owner: e.target.value }))} placeholder="Who reported this update" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff' }} />
                </div>
              </div>
              {savingError && (
                <div style={{ padding: '8px 12px', borderRadius: 6, background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: 12 }}>{savingError}</div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={saveUpdates} disabled={saving} style={{
                  padding: '8px 20px', borderRadius: 8,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                  color: '#fff', fontSize: 13, fontWeight: 600,
                  border: 'none', cursor: 'pointer', opacity: saving ? 0.6 : 1,
                  boxShadow: '0 2px 6px rgba(59,130,246,0.3)',
                }}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => setEditingField(null)} style={{ padding: '8px 20px', borderRadius: 8, background: '#f1f5f9', color: '#475569', fontSize: 13, fontWeight: 600, border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : updRows.length ? (
            <div style={{ padding: '16px 20px' }}>
              <KeyUpdatesTable project={project} />
            </div>
          ) : (
            <div style={{ padding: '16px 20px', minHeight: 28 }}>
              <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: 15 }}>No updates yet</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

