import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nqygyktioiwabvyfziev.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xeWd5a3Rpb2l3YWJ2eWZ6aWV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3NzQyMjYsImV4cCI6MjEwMDM1MDIyNn0.W-BQ2EfI7QIbTozgIqeOEMpbf8AolhahMBqBytFRWu8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
