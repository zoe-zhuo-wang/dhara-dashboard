const stripHtml = (html) => (html || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim()

export function hasUpdateContent(u) {
  return stripHtml(u.progress) || stripHtml(u.next_steps) || stripHtml(u.blockers) ||
    (u.eta || '').trim() || (u.owner || '').trim()
}

// Key Updates as an ordered two-row table: seq 1 = previous version,
// seq 2 = current (latest). Only rows with content are returned.
export function updatesRows(project) {
  const cur = {
    progress: project.progress || '',
    next_steps: project.next_steps || '',
    blockers: project.blockers || '',
    eta: project.eta || '',
    owner: project.owner || '',
    updated_at: project.updates_updated_at || null,
  }
  const prev = project.last_update || null
  const prevHas = prev ? hasUpdateContent(prev) : false
  const curHas = hasUpdateContent(cur)
  const rows = []
  if (prevHas) rows.push({ seq: 1, isPrev: true, ...prev })
  if (curHas) rows.push({ seq: prevHas ? 2 : 1, isPrev: false, ...cur })
  return rows
}

const fmtDate = (d) => {
  const dt = new Date(d)
  if (isNaN(dt)) return d
  return dt.toISOString().slice(0, 10)
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Strip rich text down to bold-only (drops colors, highlights, spans/divs).
export function richToBold(html) {
  if (!html) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const keep = new Set(['B', 'STRONG'])
  const els = [...doc.querySelectorAll('body *')]
  els.forEach(el => {
    if (keep.has(el.tagName)) {
      el.removeAttribute('style')
    } else {
      el.replaceWith(...el.childNodes)
    }
  })
  return doc.body.innerHTML
}

// Merged plain-text form for Excel export, e.g.
// "1. Progress: xxx; Next Step: yyy (2026-07-30)" per row.
export function updatesToText(project) {
  return updatesRows(project).map(row => {
    const parts = []
    if (stripHtml(row.progress)) parts.push(`Progress: ${stripHtml(row.progress)}`)
    if (stripHtml(row.next_steps)) parts.push(`Next Step: ${stripHtml(row.next_steps)}`)
    if (stripHtml(row.blockers)) parts.push(`Blockers: ${stripHtml(row.blockers)}`)
    if (row.eta) parts.push(`ETA: ${fmtDate(row.eta)}`)
    if (row.owner) parts.push(`Owner: ${row.owner}`)
    if (row.updated_at) parts.push(`Update: ${fmtDate(row.updated_at)}`)
    return `${row.seq}. ${parts.join('; ')}`
  }).join('\n')
}

// Merged markup for the closed Projects cell: bold key titles, each row as a
// <div> so the points stack vertically.
export function updatesToMarkup(project) {
  return updatesRows(project).map(row => {
    const parts = []
    if (stripHtml(row.progress)) parts.push(`<b>Progress:</b> ${esc(stripHtml(row.progress))}`)
    if (stripHtml(row.next_steps)) parts.push(`<b>Next Step:</b> ${esc(stripHtml(row.next_steps))}`)
    if (stripHtml(row.blockers)) parts.push(`<b>Blockers:</b> ${esc(stripHtml(row.blockers))}`)
    if (row.eta) parts.push(`<b>ETA:</b> ${fmtDate(row.eta)}`)
    if (row.owner) parts.push(`<b>Owner:</b> ${esc(row.owner)}`)
    if (row.updated_at) parts.push(`<b>Update:</b> ${fmtDate(row.updated_at)}`)
    return `<div>${row.seq}. ${parts.join('; ')}</div>`
  }).join('')
}
