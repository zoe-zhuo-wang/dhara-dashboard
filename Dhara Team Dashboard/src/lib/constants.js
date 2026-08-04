export const PHASE_OPTIONS = ['Budget Application', 'BSR / ISR', 'UAT', 'DEV', 'Golive']
export const BUDGET_STATUS_OPTIONS = ['Draft', 'Ongoing', 'Approved']
export const VETRA_OPTIONS = ['Yes', 'No']
export const OVERALL_STATUS_OPTIONS = ['On Track', 'Caution', 'Off Track', 'Finished', 'Not Started']
export const FUNDING_OPTIONS = ['R&D', 'R&D AI', 'Vendor Onboarding', 'BAU']
export const GROUPS = ['Regular Team', 'ISS Team']

export const phaseColor = (ph) => ({
  'Budget Application': { bg: '#dbeafe', text: '#1e40af' },
  'BSR / ISR': { bg: '#ede9fe', text: '#5b21b6' },
  'UAT': { bg: '#fef3c7', text: '#92400e' },
  'DEV': { bg: '#dcfce7', text: '#166534' },
  'Golive': { bg: '#d1fae5', text: '#065f46' },
}[ph] || { bg: '#f1f5f9', text: '#64748b' })

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
