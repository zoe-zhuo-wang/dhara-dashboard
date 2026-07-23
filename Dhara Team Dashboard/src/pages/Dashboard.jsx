import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { supabase } from '../lib/supabase'

const COLORS = ['#1a56db', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0891b2']
const OVERALL_STATUS_COLORS = { 'On Track': '#16a34a', 'Caution': '#d97706', 'Off Track': '#dc2626', 'Finished': '#1a56db', 'Not Started': '#94a3b8' }

const defaultWidgets = [
  { id: 'kpi', title: 'Overview' },
  { id: 'monthly', title: 'Monthly Man-Day Trend' },
  { id: 'status', title: 'Project Status' },
  { id: 'usage', title: 'Budget Usage' },
  { id: 'recent', title: 'Recent Projects' },
]

export default function Dashboard() {
  const [widgets, setWidgets] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dhara-widgets')) || defaultWidgets }
    catch { return defaultWidgets }
  })
  const [stats, setStats] = useState({ projects: 0, people: 0, totalBudget: 0, totalSpent: 0 })
  const [statusData, setStatusData] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [recentProjects, setRecentProjects] = useState([])
  const [people, setPeople] = useState([])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  useEffect(() => { loadDashboard() }, [])
  useEffect(() => { localStorage.setItem('dhara-widgets', JSON.stringify(widgets)) }, [widgets])

  const loadDashboard = async () => {
    const [projectsRes, peopleRes, allocationsRes] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('people').select('*'),
      supabase.from('allocations').select('*')
    ])

    const projects = projectsRes.data || []
    const people = peopleRes.data || []
    const allocations = allocationsRes.data || []

    setStats({
      projects: projects.length,
      people: people.filter(p => p.is_active).length,
      totalBudget: projects.reduce((s, p) => s + (p.budget || 0), 0),
      totalSpent: projects.reduce((s, p) => s + (p.spent || 0), 0)
    })

    const statusCounts = {}
    projects.forEach(p => { statusCounts[p.overall_status] = (statusCounts[p.overall_status] || 0) + 1 })
    setStatusData(Object.entries(statusCounts).map(([name, value]) => ({ name, value })))

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentYear = new Date().getFullYear()
    setMonthlyData(monthNames.map((name, i) => {
      const m = allocations.filter(a => a.year === currentYear && a.month === i + 1)
      return { name, planned: m.reduce((s, a) => s + (a.planned_md || 0), 0), actual: m.reduce((s, a) => s + (a.actual_md || 0), 0) }
    }))

    setRecentProjects(projects.slice(0, 5))
    setPeople(people)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      setWidgets(items => {
        const oldIndex = items.findIndex(i => i.id === active.id)
        const newIndex = items.findIndex(i => i.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const formatMoney = (n) => '$' + (n || 0).toLocaleString()
  const usagePct = stats.totalBudget > 0 ? ((stats.totalSpent / stats.totalBudget) * 100).toFixed(1) : 0

  const renderWidget = (widget) => {
    switch (widget.id) {
      case 'kpi': return <KPIWidget stats={stats} formatMoney={formatMoney} />
      case 'monthly': return <MonthlyWidget data={monthlyData} />
      case 'status': return <StatusWidget data={statusData} />
      case 'usage': return <UsageWidget pct={usagePct} spent={stats.totalSpent} budget={stats.totalBudget} formatMoney={formatMoney} />
      case 'recent': return <RecentWidget projects={recentProjects} people={people} formatMoney={formatMoney} />
      default: return null
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>Dashboard</h2>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 14 }}>Overview of your team's projects and resources</p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={widgets.map(w => w.id)} strategy={rectSortingStrategy}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20 }}>
            {widgets.map(widget => (
              <SortableWidget key={widget.id} id={widget.id}>
                <WidgetCard title={widget.title}>
                  {renderWidget(widget)}
                </WidgetCard>
              </SortableWidget>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

function SortableWidget({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  }
  return (
    <div ref={setNodeRef} style={style}>
      <div {...attributes} {...listeners} style={{ position: 'absolute', top: 12, right: 12, cursor: 'grab', color: 'var(--text-secondary)', opacity: 0.4, zIndex: 1 }}
        onMouseEnter={e => e.currentTarget.style.opacity = 1}
        onMouseLeave={e => e.currentTarget.style.opacity = 0.4}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="5" cy="4" r="1.2" fill="currentColor"/><circle cx="11" cy="4" r="1.2" fill="currentColor"/><circle cx="5" cy="8" r="1.2" fill="currentColor"/><circle cx="11" cy="8" r="1.2" fill="currentColor"/><circle cx="5" cy="12" r="1.2" fill="currentColor"/><circle cx="11" cy="12" r="1.2" fill="currentColor"/></svg>
      </div>
      {children}
    </div>
  )
}

function WidgetCard({ title, children }) {
  return (
    <div className="card" style={{ position: 'relative', height: '100%' }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{title}</h3>
      {children}
    </div>
  )
}

function KPIWidget({ stats, formatMoney }) {
  const items = [
    { label: 'Total Projects', value: stats.projects, icon: '📁', color: '#1a56db' },
    { label: 'Team Members', value: stats.people, icon: '👥', color: '#16a34a' },
    { label: 'Total Budget', value: formatMoney(stats.totalBudget), icon: '💰', color: '#d97706' },
    { label: 'Budget Used', value: formatMoney(stats.totalSpent), icon: '📈', color: '#7c3aed' },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {items.map((item, i) => (
        <div key={i} style={{ padding: '16px', borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{
              width: 32, height: 32, borderRadius: 8, background: item.color + '15',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
            }}>{item.icon}</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>{item.value}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{item.label}</div>
        </div>
      ))}
    </div>
  )
}

function MonthlyWidget({ data }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
        <YAxis stroke="#94a3b8" fontSize={11} />
        <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 4px 6px rgba(0,0,0,0.07)' }} />
        <Line type="monotone" dataKey="planned" stroke="#1a56db" strokeWidth={2} dot={{ r: 3 }} name="Planned MD" />
        <Line type="monotone" dataKey="actual" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} name="Actual MD" />
      </LineChart>
    </ResponsiveContainer>
  )
}

function StatusWidget({ data }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <ResponsiveContainer width="50%" height={200}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45} strokeWidth={0}>
            {data.map((entry, i) => <Cell key={i} fill={OVERALL_STATUS_COLORS[entry.name] || COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 4px 6px rgba(0,0,0,0.07)' }} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ flex: 1 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: OVERALL_STATUS_COLORS[d.name] || COLORS[i % COLORS.length], flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 13 }}>{d.name}</span>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function UsageWidget({ pct, spent, budget, formatMoney }) {
  const color = pct > 90 ? '#dc2626' : pct > 70 ? '#d97706' : '#16a34a'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200 }}>
      <div style={{ position: 'relative', width: 140, height: 140 }}>
        <svg viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="70" cy="70" r="60" fill="none" stroke="#e2e8f0" strokeWidth="10" />
          <circle cx="70" cy="70" r="60" fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={`${Math.min(pct, 100) * 3.77} 377`} strokeLinecap="round" />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ fontSize: 28, fontWeight: 800, color }}>{pct}%</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>used</div>
        </div>
      </div>
      <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
        {formatMoney(spent)} / {formatMoney(budget)}
      </div>
    </div>
  )
}

function RecentWidget({ projects, people, formatMoney }) {
  const overallStatusColor = (os) => ({
    'On Track': { bg: '#dcfce7', text: '#166534' },
    'Caution': { bg: '#fef3c7', text: '#92400e' },
    'Off Track': { bg: '#fef2f2', text: '#991b1b' },
    'Finished': { bg: '#dbeafe', text: '#1e40af' },
    'Not Started': { bg: '#f1f5f9', text: '#64748b' },
  }[os] || { bg: '#f1f5f9', text: '#64748b' })

  const fundingColor = (f) => ({
    'R&D': { bg: '#dbeafe', text: '#1e40af' },
    'R&D AI': { bg: '#ede9fe', text: '#5b21b6' },
    'Vendor Onboarding': { bg: '#fef3c7', text: '#92400e' },
    'BAU': { bg: '#dcfce7', text: '#166534' },
  }[f] || { bg: '#f1f5f9', text: '#64748b' })

  const getPersonName = (id) => people.find(p => p.id === id)?.name || '-'

  return (
    <div>
      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 30, fontSize: 13 }}>No projects yet</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {projects.map(p => {
            const oc = overallStatusColor(p.overall_status)
            const fc = fundingColor(p.funding_type)
            return (
              <div key={p.id} style={{
                padding: '12px 14px', borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  {p.overall_status && <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: oc.bg, color: oc.text, flexShrink: 0, marginLeft: 8 }}>{p.overall_status}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Focal: <strong style={{ color: 'var(--text)' }}>{getPersonName(p.dt_focal_id)}</strong></span>
                  {p.funding_type && <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: fc.bg, color: fc.text }}>{p.funding_type}</span>}
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginLeft: 'auto' }}>{formatMoney(p.budget)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
