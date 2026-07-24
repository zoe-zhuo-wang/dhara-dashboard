import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import People from './pages/People'
import Allocations from './pages/Allocations'
import Layout from './components/Layout'
import './index.css'

function App() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('*').eq('id', user.id).single()
        .then(({ data }) => {
          setProfile(data)
          if (data) syncPerson(data)
        })
    }
  }, [user])

  const syncPerson = async (profile) => {
    const { data: existing } = await supabase.from('people').select('id').eq('user_id', profile.id).single()
    if (!existing) {
      await supabase.from('people').insert({
        user_id: profile.id,
        name: profile.full_name || profile.email.split('@')[0],
        email: profile.email,
        role: 'Other',
        team_group: 'General',
        is_active: true
      })
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <HashRouter>
      <Layout user={profile}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/people" element={<People />} />
          <Route path="/allocations" element={<Allocations />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </HashRouter>
  )
}

export default App
