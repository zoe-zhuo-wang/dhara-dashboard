import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { PHASE_OPTIONS, OVERALL_STATUS_OPTIONS, phaseColor, overallColor } from '../lib/constants'
import { sanitizeHtml } from '../lib/sanitize'
import { fetchPhaseOptions } from '../lib/phases'

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

export default function Presentation() {
  const [projects, setProjects] = useState([])
  const [people, setPeople] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [successMsg, setSuccessMsg] = useState('')
  const [phaseOptions, setPhaseOptions] = useState(PHASE_OPTIONS)

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
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
  const editorRef = useRef(null)
  const [showFontColor, setShowFontColor] = useState(false)
  const [showHighlight, setShowHighlight] = useState(false)
  const fontColorRef = useRef(null)
  const highlightRef = useRef(null)

  useEffect(() => {
    if (!showFontColor && !showHighlight) return
    const handleClick = (e) => {
      if (fontColorRef.current && !fontColorRef.current.contains(e.target)) setShowFontColor(false)
      if (highlightRef.current && !highlightRef.current.contains(e.target)) setShowHighlight(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showFontColor, showHighlight])

  useEffect(() => { setPhaseDraft(project.current_phase || '') }, [project.current_phase])
  useEffect(() => { setOverallDraft(project.overall_status || '') }, [project.overall_status])

  useEffect(() => {
    if (editingField === 'key' && editorRef.current) {
      editorRef.current.innerHTML = project.key_updates || ''
      editorRef.current.focus()
    }
  }, [editingField, project.key_updates])

  const execCmd = (cmd, val) => {
    document.execCommand(cmd, false, val)
  }

  const applyColor = (prop, color) => {
    const cmd = prop === 'color' ? 'foreColor' : 'hiliteColor'
    document.execCommand(cmd, false, color)
  }

  const saveField = async (field, value) => {
    setSaving(true)
    const { error } = await supabase.from('projects').update({ [field]: value }).eq('id', project.id)
    setSaving(false)
    if (!error) {
      onShowSuccess('Saved! Changes synced to Projects page')
      await onSaved()
    }
    setEditingField(null)
  }

  const saveKeyUpdates = () => {
    const html = editorRef.current?.innerHTML || ''
    saveField('key_updates', html)
  }

  const phase = project.current_phase
  const overall = project.overall_status
  const pc = phase ? phaseColor(phase) : null
  const oc = overall ? overallColor(overall) : null

  const hasRichText = project.key_updates && /<[a-z][\s\S]*>/i.test(project.key_updates)

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
        </div>

        {/* Badges row: Current Phase + Overall Status (editable) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {editingField === 'phase' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Current Phase：</span>
              {phaseDraft === '__custom__' ? (
                <input
                  value={customPhase}
                  onChange={e => setCustomPhase(e.target.value)}
                  autoFocus
                  placeholder="Enter a new phase..."
                  style={{ padding: '4px 8px', borderRadius: 6, border: '1.5px solid #93c5fd', fontSize: 14, background: '#fff', outline: 'none', width: 180 }}
                />
              ) : (
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
              )}
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
                onClick={() => setEditingField('key')}
                style={{ fontSize: 13, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: '4px 10px', borderRadius: 6 }}
                onMouseEnter={e => e.target.style.background = '#eff6ff'}
                onMouseLeave={e => e.target.style.background = 'none'}
              >
                Edit
              </button>
            )}
          </div>

          {editingField === 'key' ? (
            <div>
              {/* Toolbar */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 1, padding: '6px 10px',
                borderBottom: '1px solid #f1f5f9', background: '#f8fafc', flexWrap: 'wrap',
              }}>
                <TBtn label="B" title="Bold" style={{ fontWeight: 800 }} onClick={() => execCmd('bold')} />
                <TBtn label="I" title="Italic" style={{ fontStyle: 'italic' }} onClick={() => execCmd('italic')} />
                <TBtn label="U" title="Underline" style={{ textDecoration: 'underline' }} onClick={() => execCmd('underline')} />
                <Sep />
                {/* Font Color */}
                <div ref={fontColorRef} style={{ position: 'relative' }}>
                  <button
                    title="Font Color"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => { setShowFontColor(!showFontColor); setShowHighlight(false) }}
                    style={{
                      padding: '4px 6px', borderRadius: 4, border: 'none', background: 'transparent',
                      cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                      margin: 0, fontSize: 13, minWidth: 'auto', height: 'auto',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontWeight: 800, fontSize: 14, color: '#333', lineHeight: 1 }}>A</span>
                    <div style={{ width: 16, height: 3, borderRadius: 1, background: '#333' }} />
                  </button>
                  {showFontColor && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 100, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4 }}>
                      {['#000000','#c00000','#ffc000','#00b050','#0070c0','#7030a0'].map(c => (
                        <div
                          key={c}
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => { applyColor('color', c); setShowFontColor(false) }}
                          style={{ width: 22, height: 22, borderRadius: 3, background: c, border: '1px solid #d1d5db', cursor: 'pointer' }}
                          title={c}
                        />
                      ))}
                    </div>
                  )}
                </div>
                {/* Highlight */}
                <div ref={highlightRef} style={{ position: 'relative' }}>
                  <button
                    title="Highlight"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => { setShowHighlight(!showHighlight); setShowFontColor(false) }}
                    style={{
                      padding: '4px 6px', borderRadius: 4, border: 'none', background: 'transparent',
                      cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                      margin: 0, fontSize: 13, minWidth: 'auto', height: 'auto',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontWeight: 800, fontSize: 14, color: '#333', lineHeight: 1, background: '#ffff00', padding: '0 2px' }}>A</span>
                    <div style={{ width: 16, height: 3, borderRadius: 1, background: '#ffff00' }} />
                  </button>
                  {showHighlight && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 100, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4 }}>
                      {['#ffff00','#92d050','#00b0f0','#ff66cc','#ff9933','#ffffff'].map(c => (
                        <div
                          key={c}
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => { applyColor('backgroundColor', c); setShowHighlight(false) }}
                          style={{ width: 22, height: 22, borderRadius: 3, background: c, border: '1px solid #d1d5db', cursor: 'pointer' }}
                          title={c}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* Editor */}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                style={{
                  minHeight: 80, maxHeight: 300, overflowY: 'auto',
                  padding: '14px 16px', fontSize: 15, lineHeight: 1.8,
                  outline: 'none', color: '#334155',
                }}
              />
              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, padding: '10px 16px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  onClick={saveKeyUpdates}
                  disabled={saving}
                  style={{
                    padding: '8px 20px', borderRadius: 8,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                    color: '#fff', fontSize: 13, fontWeight: 600,
                    border: 'none', cursor: 'pointer', opacity: saving ? 0.6 : 1,
                    boxShadow: '0 2px 6px rgba(59,130,246,0.3)',
                  }}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setEditingField(null)}
                  style={{ padding: '8px 20px', borderRadius: 8, background: '#f1f5f9', color: '#475569', fontSize: 13, fontWeight: 600, border: '1px solid #e2e8f0', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: '16px 20px', minHeight: 28 }}>
              {project.key_updates ? (
                hasRichText ? (
                  <div style={{ fontSize: 15, color: '#334155', lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(project.key_updates) }} />
                ) : (
                  <div style={{ fontSize: 15, color: '#334155', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{project.key_updates}</div>
                )
              ) : (
                <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: 15 }}>No updates yet</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TBtn({ label, title, style, onClick }) {
  return (
    <button
      title={title}
      onMouseDown={e => e.preventDefault()}
      onClick={onClick}
      style={{
        minWidth: 28, height: 28, borderRadius: 4, border: 'none',
        background: 'transparent', color: '#334155', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
        padding: '2px 6px', margin: 0,
        transition: 'background 0.1s', ...style,
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {label}
    </button>
  )
}

function Sep() {
  return <div style={{ width: 1, height: 18, background: '#e2e8f0', margin: '0 3px' }} />
}
