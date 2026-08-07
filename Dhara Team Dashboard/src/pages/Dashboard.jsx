import { useState, useEffect, useRef, useCallback } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { supabase } from '../lib/supabase'
import { demoProjects, demoRead } from '../lib/demoData'
import { PHASE_CHART_COLORS, CUSTOM_COLORS, phaseChartColor } from '../lib/constants'

const FUNDING_COLORS = {
  'R&D': '#3b82f6',
  'R&D AI': '#8b5cf6',
  'Vendor Onboarding': '#f59e0b',
  'BAU': '#22c55e',
  'Unknown': '#94a3b8',
}
const BUDGET_STATUS_COLORS = {
  'Draft': '#94a3b8',
  'Ongoing': '#f59e0b',
  'Approved': '#10b981',
  'Unknown': '#cbd5e1',
}

// Known phases keep their defined color; custom phases get a deterministic
// hash color that never collides with a preset or another custom phase.
function buildPhaseFill(names) {
  const map = {}
  const used = new Set(Object.values(PHASE_CHART_COLORS))
  names.forEach((name) => {
    if (PHASE_CHART_COLORS[name]) {
      map[name] = PHASE_CHART_COLORS[name]
      return
    }
    let color = phaseChartColor(name)
    if (used.has(color)) {
      const free = CUSTOM_COLORS.find(c => !used.has(c))
      color = free || `hsl(${((Object.keys(map).length + 1) * 137.508) % 360}, 70%, 55%)`
    }
    map[name] = color
    used.add(color)
  })
  return (name) => map[name]
}

export default function Dashboard() {
  const [projects, setProjects] = useState([])

  useEffect(() => { loadProjects() }, [])

  const loadProjects = async () => {
    const data = await demoRead(
      () => supabase.from('projects').select('*').order('created_at', { ascending: false }),
      demoProjects
    )
    setProjects(data || [])
  }

  const totalProjects = projects.length
  const vetraYesCount = projects.filter(p => p.vetra_adopted === 'Yes').length
  const vetraRate = totalProjects > 0 ? ((vetraYesCount / totalProjects) * 100).toFixed(0) : '0'
  const totalBudget = projects.reduce((s, p) => s + (p.budget || 0), 0)
  const formatMoney = (n) => '$' + (n || 0).toLocaleString()

  const phaseCounts = {}
  projects.forEach(p => {
    const phase = p.current_phase || 'Unknown'
    phaseCounts[phase] = (phaseCounts[phase] || 0) + 1
  })
  const phaseData = Object.entries(phaseCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
  const phaseMax = Math.max(...phaseData.map(d => d.value), 0)
  const phaseDomain = [0, Math.max(phaseMax + Math.ceil(phaseMax / 10) + 1, 10)]
  const phaseFill = buildPhaseFill(phaseData.map(d => d.name))

  const fundingBudgets = {}
  projects.forEach(p => {
    const ft = p.funding_type || 'Unknown'
    fundingBudgets[ft] = (fundingBudgets[ft] || 0) + (p.budget || 0)
  })
  const fundingData = Object.entries(fundingBudgets)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const budgetStatusMap = {}
  projects.forEach(p => {
    const bs = p.budget_status || 'Unknown'
    budgetStatusMap[bs] = (budgetStatusMap[bs] || 0) + (p.budget || 0)
  })
  const budgetStatusData = Object.entries(budgetStatusMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const cardBg = ['#eff6ff', '#f0fdf4', '#fffbeb']
  const cardAccent = ['#3b82f6', '#22c55e', '#f59e0b']

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Dashboard</h2>
      </div>

      {/* Section 1: Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 28 }}>
        <OverviewCard label="Total Projects" value={totalProjects} bg={cardBg[0]} accent={cardAccent[0]} icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M2 8h16" stroke="currentColor" strokeWidth="1.5"/></svg>} />
        <OverviewCard label="Vetra Adoption Rate" value={`${vetraRate}%`} bg={cardBg[1]} accent={cardAccent[1]} sub={`${vetraYesCount} of ${totalProjects} projects`} icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2l2.5 5 5.5.8-4 3.9.9 5.3L10 14.5 5.1 17l.9-5.3-4-3.9 5.5-.8L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>} />
        <OverviewCard label="Total Budget" value={formatMoney(totalBudget)} bg={cardBg[2]} accent={cardAccent[2]} icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5"/><path d="M10 5.5v9M8 7.5c0-1 1-1.5 2-1.5s2 .5 2 1.5-1 1.5-2 1.5-2 .5-2 1.5 1 1.5 2 1.5 2-.5 2-1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>} />
      </div>

      {/* Section 2: Project Status */}
      <div style={sectionStyle}>
        <div style={titleRow}>
          <div style={{ width: 4, height: 18, borderRadius: 2, background: '#3b82f6', flexShrink: 0 }} />
          <h3 style={sectionTitle}>Project Status</h3>
        </div>
        <div style={{ borderTop: '1px solid #f1f5f9', margin: '0 -28px 20px', paddingTop: 16, paddingLeft: 28, paddingRight: 28 }}>
          {phaseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(220, phaseData.length * 48 + 30)}>
              <BarChart data={phaseData} layout="vertical" margin={{ left: 10, right: 50, top: 5, bottom: 5 }}>
                <XAxis type="number" stroke="#e2e8f0" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} domain={phaseDomain} />
                <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} width={140} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 13 }}
                  cursor={{ fill: 'rgba(59,130,246,0.05)' }}
                  formatter={(value) => [`${value} project${value !== 1 ? 's' : ''}`, '']}
                  labelStyle={{ fontWeight: 600, color: '#0f172a' }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={26} label={{ position: 'right', fill: '#64748b', fontSize: 12, fontWeight: 600 }}>
                  {phaseData.map((entry) => (
                    <Cell key={entry.name} fill={phaseFill(entry.name)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      {/* Section 3: Budget Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={sectionStyle}>
          <div style={titleRow}>
            <div style={{ width: 4, height: 18, borderRadius: 2, background: '#8b5cf6', flexShrink: 0 }} />
            <h3 style={sectionTitle}>Budget Distribution by Funding Type</h3>
          </div>
          <div style={{ borderTop: '1px solid #f1f5f9', margin: '0 -28px 20px', paddingTop: 16, paddingLeft: 28, paddingRight: 28 }}>
            {fundingData.length > 0 ? (
              <DonutChart data={fundingData} colors={FUNDING_COLORS} formatMoney={formatMoney} />
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
        <div style={sectionStyle}>
          <div style={titleRow}>
            <div style={{ width: 4, height: 18, borderRadius: 2, background: '#f59e0b', flexShrink: 0 }} />
            <h3 style={sectionTitle}>Budget Distribution by Budget Status</h3>
          </div>
          <div style={{ borderTop: '1px solid #f1f5f9', margin: '0 -28px 20px', paddingTop: 16, paddingLeft: 28, paddingRight: 28 }}>
            {budgetStatusData.length > 0 ? (
              <DonutChart data={budgetStatusData} colors={BUDGET_STATUS_COLORS} formatMoney={formatMoney} />
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function OverviewCard({ label, value, bg, accent, sub, icon }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      style={{
        background: bg,
        borderRadius: 14,
        padding: 0,
        boxShadow: hover ? '0 6px 20px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'all 0.2s',
        transform: hover ? 'translateY(-2px)' : 'none',
        overflow: 'hidden',
        position: 'relative',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={{ height: 4, background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />
      <div style={{ padding: '20px 24px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: accent + '18', color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </div>
        </div>
        <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  )
}

function DonutChart({ data, colors, formatMoney }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const getColor = (name, i) => colors[name] || CUSTOM_COLORS[i % CUSTOM_COLORS.length]
  const RADIAN = Math.PI / 180
  const LABEL_BLOCK_H = 38
  const SIDE_PAD = 38

  const cachedPositions = useRef(null)
  const cachedKey = useRef(null)

  const computePositions = useCallback((cx, cy, R, chartH) => {
    const key = `${cx}-${cy}-${R}-${chartH}-${data.length}-${data.map(d => d.value).join(',')}`
    if (cachedKey.current === key && cachedPositions.current) return cachedPositions.current

    const raw = data.map((d, i) => {
      let cumAngle = 0
      for (let j = 0; j <= i; j++) cumAngle += (data[j].value / total) * 360
      const sliceAngle = (d.value / total) * 360
      const midDeg = cumAngle - sliceAngle / 2
      const midRad = -midDeg * RADIAN
      const cos = Math.cos(midRad)
      const sin = Math.sin(midRad)
      const isRight = cos >= 0
      return { cos, sin, isRight, idx: i, origY: cy + R * sin }
    })

    const lefts = raw.filter(p => !p.isRight).sort((a, b) => a.origY - b.origY)
    const rights = raw.filter(p => p.isRight).sort((a, b) => a.origY - b.origY)

    const spread = (list) => {
      if (!list.length) return
      list.forEach(p => { p.ey = p.origY })
      for (let i = 1; i < list.length; i++) {
        if (list[i].ey - list[i - 1].ey < LABEL_BLOCK_H) {
          list[i].ey = list[i - 1].ey + LABEL_BLOCK_H
        }
      }
      const topBound = 10
      const bottomBound = chartH - 40
      if (list[list.length - 1].ey > bottomBound) {
        list[list.length - 1].ey = bottomBound
        for (let i = list.length - 2; i >= 0; i--) {
          if (list[i].ey > list[i + 1].ey - LABEL_BLOCK_H) {
            list[i].ey = list[i + 1].ey - LABEL_BLOCK_H
          }
        }
      }
      if (list[0].ey < topBound) {
        list[0].ey = topBound
        for (let i = 1; i < list.length; i++) {
          if (list[i].ey < list[i - 1].ey + LABEL_BLOCK_H) {
            list[i].ey = list[i - 1].ey + LABEL_BLOCK_H
          }
        }
      }
    }

    spread(lefts)
    spread(rights)

    const result = new Array(data.length)
    lefts.forEach(p => { result[p.idx] = p })
    rights.forEach(p => { result[p.idx] = p })

    cachedKey.current = key
    cachedPositions.current = result
    return result
  }, [data, total, RADIAN])

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const d = payload[0]
    const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : 0
    return (
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2, color: '#0f172a' }}>{d.name}</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>{formatMoney(d.value)} ({pct}%)</div>
      </div>
    )
  }

  const renderLabel = ({ cx, cy, outerRadius, index }) => {
    const d = data[index]
    const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : 0

    const positions = computePositions(cx, cy, outerRadius, 420)
    const p = positions[index]
    if (!p) return null

    const sx = cx + outerRadius * p.cos
    const sy = cy + outerRadius * p.sin
    const isR = p.isRight
    const elbowX = sx + (isR ? SIDE_PAD : -SIDE_PAD)
    const endX = elbowX
    const endY = p.ey

    const textX = endX + (isR ? 8 : -8)
    const anchor = isR ? 'start' : 'end'

    return (
      <g>
        <polyline
          points={`${sx},${sy} ${elbowX},${sy} ${endX},${endY}`}
          stroke="#b0b8c4"
          fill="none"
          strokeWidth={1}
        />
        <circle cx={endX} cy={endY} r={2.5} fill="#b0b8c4" />
        <text x={textX} y={endY} textAnchor={anchor} fill="#334155" fontSize={13} fontWeight={600} dominantBaseline="central">
          {d.name}
        </text>
        <text x={textX} y={endY + 20} textAnchor={anchor} fill="#94a3b8" fontSize={12}>
          {pct}% ({formatMoney(d.value)})
        </text>
      </g>
    )
  }

  const CustomLegend = ({ payload }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px 16px', marginTop: 8 }}>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: entry.color, flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#475569' }}>{entry.value}</span>
        </div>
      ))}
    </div>
  )

  return (
    <div>
      <ResponsiveContainer width="100%" height={420}>
        <PieChart margin={{ top: 10, right: 50, bottom: 10, left: 50 }}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="43%"
            outerRadius="52%"
            innerRadius="30%"
            strokeWidth={3}
            stroke="#fff"
            label={renderLabel}
            labelLine={false}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={getColor(entry.name, i)} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', color: '#94a3b8', padding: 48, fontSize: 13 }}>
      No project data available yet
    </div>
  )
}

const sectionStyle = {
  background: '#fff',
  borderRadius: 14,
  padding: '24px 28px',
  marginBottom: 20,
  boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  border: '1px solid #e2e8f0',
}

const sectionTitle = {
  fontSize: 13,
  fontWeight: 600,
  color: '#64748b',
  margin: 0,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const titleRow = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  marginBottom: 16,
}
