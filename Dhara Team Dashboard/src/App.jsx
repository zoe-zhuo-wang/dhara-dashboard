import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import People from './pages/People'
import Whitelist from './pages/Whitelist'
import BMS from './pages/BMS'
import Guide from './pages/Guide'
import Layout from './components/Layout'
import './index.css'

const DEMO_MODE = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === '1'

function App() {
  const [user, setUser] = useState(DEMO_MODE ? { id: 'demo', email: 'demo@lenovo.com' } : null)
  const [profile, setProfile] = useState(DEMO_MODE ? { full_name: 'Demo Mode', email: 'demo@lenovo.com', role: 'member' } : null)
  const [loading, setLoading] = useState(!DEMO_MODE)
  const [recovery, setRecovery] = useState(false)
  const [blockedMsg, setBlockedMsg] = useState('')

  useEffect(() => {
    if (DEMO_MODE) return
    const settle = (session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    }
    const timeout = setTimeout(() => settle(null), 5000)
    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeout)
      settle(session)
    }).catch(() => {
      clearTimeout(timeout)
      settle(null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (event === 'PASSWORD_RECOVERY') setRecovery(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (DEMO_MODE || !user) return
    let cancelled = false
    supabase.from('whitelist').select('active').ilike('email', user.email).maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return
        if (!error && (!data || !data.active)) {
          setBlockedMsg('Your email is not on the active whitelist. Ask a team member to add or enable it in People → Whitelist.')
          supabase.auth.signOut()
          return
        }
        setBlockedMsg('')
        supabase.from('profiles').select('*').eq('id', user.id).single()
          .then(({ data }) => {
            setProfile(data)
            if (data) syncPerson(data)
          })
      })
    return () => { cancelled = true }
  }, [user])

  const syncPerson = async (profile) => {
    const { data: matches } = await supabase
      .from('people')
      .select('id, user_id')
      .or(`user_id.eq.${profile.id},email.ilike.${profile.email}`)
      .limit(5)
    if (!matches || matches.length === 0) {
      await supabase.from('people').insert({
        user_id: profile.id,
        name: profile.full_name || profile.email.split('@')[0],
        email: profile.email,
        team_group: 'General'
      })
      return
    }
    const linked = matches.find(m => m.user_id === profile.id) || matches[0]
    if (!linked.user_id) {
      await supabase.from('people').update({ user_id: profile.id }).eq('id', linked.id)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Loading...</div>
      </div>
    )
  }

  if (recovery && !DEMO_MODE) {
    return <ResetPassword onDone={() => setRecovery(false)} />
  }

  if (!user && !DEMO_MODE) {
    return <Login notice={blockedMsg} />
  }

  return (
    <HashRouter>
      <Layout user={profile}>
        <Routes>
          <Route path="/guide" element={<Guide />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/people" element={<People />} />
          <Route path="/whitelist" element={<Whitelist />} />
          <Route path="/bms" element={<BMS />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </HashRouter>
  )
}

export default App
