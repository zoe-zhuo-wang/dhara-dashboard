import { createHmac, timingSafeEqual } from 'node:crypto'

// JWT minting endpoint for the Dhara Team Dashboard.
//
// During a Supabase Auth (GoTrue) outage this lets the team sign in with a
// shared passphrase and get a *signed* JWT (role=authenticated, sub=<user id>)
// that the frontend feeds to the existing Supabase client via setSession().
// Retired as soon as GoTrue recovers — flip the flag below and remove the env.
//
// Env:
//   AUTH_PASSPHRASE       shared passcode team members type to sign in
//   SUPABASE_JWT_SECRET   Supabase project JWT secret (Settings > API)
//   SUPABASE_REF          project ref, defaults to nqygyktioiwabvyfziev
//   AUTH_SUB              user id to impersonate (defaults to wangzhuo18)
//   AUTH_TTL_SECS         token lifetime (default 3600*12)
//   ENABLE_AUTH_PROXY     must be "true" for this endpoint to answer

function b64url(buf) {
  return Buffer.from(buf).toString('base64url')
}

function signJwt(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const head = b64url(JSON.stringify(header))
  const body = b64url(JSON.stringify(payload))
  const sig = createHmac('sha256', secret).update(`${head}.${body}`).digest('base64url')
  return `${head}.${body}.${sig}`
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (process.env.ENABLE_AUTH_PROXY !== '1') {
    res.status(404).json({ error: 'Auth proxy is disabled.' })
    return
  }

  const secret = process.env.SUPABASE_JWT_SECRET
  const passphrase = process.env.AUTH_PASSPHRASE
  if (!secret || !passphrase) {
    res.status(500).json({ error: 'Auth proxy not configured (missing env).' })
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  let pass
  try {
    const body = JSON.parse(req.body || '{}')
    pass = typeof body.passphrase === 'string' ? body.passphrase : ''
  } catch {
    res.status(400).json({ error: 'Bad request body' })
    return
  }

  const a = Buffer.from(pass)
  const b = Buffer.from(passphrase)
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    res.status(401).json({ error: 'Invalid passcode' })
    return
  }

  const now = Math.floor(Date.now() / 1000)
  const ttl = Number(process.env.AUTH_TTL_SECS || 43200)
  const payload = {
    aud: 'authenticated',
    exp: now + ttl,
    iat: now,
    iss: process.env.SUPABASE_REF || 'nqygyktioiwabvyfziev',
    sub: process.env.AUTH_SUBJECT || 'ee911dbd-c2f8-4ccb-bec3-6be4a0ca8de3',
    email: process.env.AUTH_EMAIL || 'wangzhuo18@lenovo.com',
    role: 'authenticated',
  }

  res.json({ access_token: signJwt(payload, secret), expires_in: ttl })
}