export const PHASE_OPTIONS = ['Concept', 'Budget Application', 'BSR', 'ISR', 'DEV', 'SIT/UAT/MTP', 'Pre-Go-live', 'Go-live', 'Post-Go-live / Closure']
export const BUDGET_STATUS_OPTIONS = ['Draft', 'Ongoing', 'Approved']
export const VETRA_OPTIONS = ['Yes', 'No']
export const OVERALL_STATUS_OPTIONS = ['On Track', 'Caution', 'Off Track', 'Finished', 'Not Started']
export const FUNDING_OPTIONS = ['R&D', 'R&D AI', 'Vendor Onboarding', 'BAU']
export const GROUPS = ['Regular Team', 'ISS Team']
export const BIZ_GROUP_OPTIONS = ['IDG', 'ISG', 'SSG']

export const PHASE_CHART_COLORS = {
  'Concept': '#38bdf8',
  'Budget Application': '#3b82f6',
  'BSR': '#8b5cf6',
  'ISR': '#a855f7',
  'DEV': '#22c55e',
  'SIT/UAT/MTP': '#f59e0b',
  'Pre-Go-live': '#06b6d4',
  'Go-live': '#10b981',
  'Post-Go-live / Closure': '#64748b',
}

export const CUSTOM_COLORS = [
  '#dc2626', '#db2777', '#ea580c', '#65a30d', '#0891b2',
  '#7c3aed', '#c026d3', '#059669', '#4f46e5', '#d97706',
  '#0f766e', '#16a34a', '#f43f5e', '#9333ea', '#e11d48',
]

const hashStr = (s) => {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0
  return h
}

export const customColor = (key) =>
  CUSTOM_COLORS[Math.abs(hashStr(String(key || ''))) % CUSTOM_COLORS.length]

export const phaseChartColor = (ph) =>
  PHASE_CHART_COLORS[ph] || customColor(ph)

export const phaseColor = (ph) => ({
  'Concept': { bg: '#e0f2fe', text: '#075985' },
  'Budget Application': { bg: '#dbeafe', text: '#1e40af' },
  'BSR': { bg: '#ede9fe', text: '#5b21b6' },
  'ISR': { bg: '#f3e8ff', text: '#7e22ce' },
  'DEV': { bg: '#dcfce7', text: '#166534' },
  'SIT/UAT/MTP': { bg: '#fef3c7', text: '#92400e' },
  'Pre-Go-live': { bg: '#cffafe', text: '#155e75' },
  'Go-live': { bg: '#d1fae5', text: '#065f46' },
  'Post-Go-live / Closure': { bg: '#f1f5f9', text: '#334155' },
}[ph] || (ph ? { bg: customColor(ph), text: '#ffffff' } : { bg: '#f1f5f9', text: '#64748b' }))

export const overallColor = (os) => ({
  'On Track': { bg: '#dcfce7', text: '#166534' },
  'Caution': { bg: '#fef3c7', text: '#92400e' },
  'Off Track': { bg: '#fef2f2', text: '#991b1b' },
  'Finished': { bg: '#dbeafe', text: '#1e40af' },
  'Not Started': { bg: '#f1f5f9', text: '#64748b' },
}[os] || { bg: '#f1f5f9', text: '#64748b' })

export const fundingStyle = (f) => ({
  'R&D': { bg: '#dbeafe', text: '#1e40af' },
  'R&D AI': { bg: '#ede9fe', text: '#5b21b6' },
  'Vendor Onboarding': { bg: '#fef3c7', text: '#92400e' },
  'BAU': { bg: '#dcfce7', text: '#166534' },
}[f] || { bg: '#f1f5f9', text: '#64748b' })

export const budgetStatusColor = (bs) => ({
  'Draft': { bg: '#f1f5f9', text: '#64748b' },
  'Ongoing': { bg: '#fef3c7', text: '#92400e' },
  'Approved': { bg: '#dcfce7', text: '#166534' },
}[bs] || { bg: '#f1f5f9', text: '#64748b' })
