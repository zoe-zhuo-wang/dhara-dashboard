import { supabase } from './supabase'
import { PHASE_OPTIONS } from './constants'

// Phase dropdown options = defaults + any custom phase values already saved on projects.
// This makes a custom phase entered on one tab appear in every other tab's dropdowns.
export async function fetchPhaseOptions() {
  const { data, error } = await supabase.from('projects').select('current_phase')
  if (error) return PHASE_OPTIONS
  const custom = [...new Set((data || []).map(p => p.current_phase).filter(Boolean))]
    .filter(p => !PHASE_OPTIONS.includes(p))
  return [...PHASE_OPTIONS, ...custom]
}
