import { updatesRows, richToBold } from '../lib/keyUpdates'
import { sanitizeHtml } from '../lib/sanitize'

const thStyle = {
  padding: '8px 10px', fontSize: 11, fontWeight: 700, color: '#64748b',
  textAlign: 'left', whiteSpace: 'nowrap', letterSpacing: '0.03em',
}

const tdStyle = {
  padding: '10px', fontSize: 13, verticalAlign: 'top', borderTop: '1px solid #f1f5f9',
  color: '#334155', lineHeight: 1.55,
}

function RichCell({ html, boldOnly }) {
  const has = (html || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
  if (!has) return <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>—</span>
  if (!/<[a-z][\s\S]*>/i.test(html)) return <span style={{ whiteSpace: 'pre-wrap' }}>{html}</span>
  return <span dangerouslySetInnerHTML={{ __html: boldOnly ? richToBold(html) : sanitizeHtml(html) }} />
}

const fmtDate = (d) => {
  if (!d) return '—'
  const dt = new Date(d)
  if (isNaN(dt)) return d
  return dt.toISOString().slice(0, 10)
}

const fmtDateTime = (ts) => {
  if (!ts) return '—'
  const dt = new Date(ts)
  if (isNaN(dt)) return ts
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' · ' + dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export default function KeyUpdatesTable({ project, boldOnly = false, mutedPrev = true }) {
  const rows = updatesRows(project)
  if (!rows.length) return null
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            <th style={thStyle}>#</th>
            <th style={{ ...thStyle, width: '27%' }}>Progress</th>
            <th style={{ ...thStyle, width: '22%' }}>Next Steps</th>
            <th style={{ ...thStyle, width: '20%' }}>Blockers / Risks</th>
            <th style={thStyle}>ETA</th>
            <th style={thStyle}>Owner</th>
            <th style={thStyle}>Update Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.seq} style={{ opacity: row.isPrev && mutedPrev ? 0.72 : 1 }}>
              <td style={{ ...tdStyle, width: 28, textAlign: 'center', color: row.isPrev ? '#64748b' : '#334155', fontWeight: 600 }}>{row.seq}</td>
              <td style={tdStyle}><RichCell html={row.progress} boldOnly={boldOnly} /></td>
              <td style={tdStyle}><RichCell html={row.next_steps} boldOnly={boldOnly} /></td>
              <td style={tdStyle}><RichCell html={row.blockers} boldOnly={boldOnly} /></td>
              <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{row.eta ? fmtDate(row.eta) : '—'}</td>
              <td style={tdStyle}>{row.owner || '—'}</td>
              <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{fmtDateTime(row.updated_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
