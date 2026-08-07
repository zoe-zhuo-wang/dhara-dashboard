import { useEffect, useRef, useState } from 'react'

export default function RichEditor({ initialValue, onChange, minHeight = 80, placeholder }) {
  const editorRef = useRef(null)
  const fontColorRef = useRef(null)
  const highlightRef = useRef(null)
  const initializedRef = useRef(false)
  const [showFontColor, setShowFontColor] = useState(false)
  const [showHighlight, setShowHighlight] = useState(false)

  useEffect(() => {
    if (editorRef.current && !initializedRef.current) {
      editorRef.current.innerHTML = initialValue || ''
      initializedRef.current = true
    }
  }, [initialValue])

  useEffect(() => {
    if (!showFontColor && !showHighlight) return
    const handleClick = (e) => {
      if (fontColorRef.current && !fontColorRef.current.contains(e.target)) setShowFontColor(false)
      if (highlightRef.current && !highlightRef.current.contains(e.target)) setShowHighlight(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showFontColor, showHighlight])

  const execCmd = (cmd, val) => document.execCommand(cmd, false, val)
  const applyColor = (prop, color) => document.execCommand(prop === 'color' ? 'foreColor' : 'hiliteColor', false, color)

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', overflow: 'hidden' }}>
      <style>{`.richeditor-empty:empty::before { content: attr(data-placeholder); color: #94a3b8; font-style: italic; }`}</style>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 1, padding: '6px 10px',
        borderBottom: '1px solid #f1f5f9', background: '#f8fafc', flexWrap: 'wrap',
      }}>
        <TBtn label="B" title="Bold" style={{ fontWeight: 800 }} onClick={() => execCmd('bold')} />
        <TBtn label="I" title="Italic" style={{ fontStyle: 'italic' }} onClick={() => execCmd('italic')} />
        <TBtn label="U" title="Underline" style={{ textDecoration: 'underline' }} onClick={() => execCmd('underline')} />
        <Sep />
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
      <div
        ref={editorRef}
        className="richeditor-empty"
        data-placeholder={placeholder || ''}
        contentEditable
        suppressContentEditableWarning
        onInput={e => onChange && onChange(e.currentTarget.innerHTML)}
        style={{
          minHeight, maxHeight: 300, overflowY: 'auto',
          padding: '10px 14px', fontSize: 15, lineHeight: 1.7,
          outline: 'none', color: '#334155',
        }}
      />
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
