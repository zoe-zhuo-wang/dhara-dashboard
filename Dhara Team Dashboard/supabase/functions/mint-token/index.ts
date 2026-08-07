// mint-token — signs a JWT (role=authenticated) for the Dhara Team Dashboard
// after verifying a shared team passcode.
//
// This is the GoTrue-outage workaround: it lets members sign in with a passcode
// instead of Supabase Auth while GoTrue is down. It lives as a Supabase Edge
// Function so it stays on the *.supabase.co domain (reachable from the office
// network where Vercel/workers.dev are blocked).
//
// Secrets come from the Edge Function runtime env vars (Deno.env), not the client.
//   MINT_PASSPHRASE      shared team passcode
//   SUPABASE_JWT_SECRET  project JWT secret (HS256) used to sign the token
//   MINT_SUBJECT         user id to impersonate (defaults to wangzhuo18)
//   MINT_EMAIL           email claim (defaults to wangzhuo18's)
//   MINT_TTL_SECS        token lifetime (default 43200)
//   ENABLE_MINT          must be "true" for this endpoint to answer

const SUPABASE_REF = 'nqygyktioiwabvyfziev'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, apikey, x-client-info, content-type',
  'Access-Control-Max-Age': '86400',
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  })
}

function b64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function signJwt(payload, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const head = b64url(new TextEncoder().encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })))
  const body = b64url(new TextEncoder().encode(JSON.stringify(payload)))
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${head}.${body}`))
  return `${head}.${body}.${b64url(sig)}`
}

function timingSafeEqualStr(a, b) {
  if (a.length !== b.length) return false
  let out = 0
  const ab = new TextEncoder().encode(a)
  const bb = new TextEncoder().encode(b)
  for (let i = 0; i < ab.length; i++) out |= ab[i] ^ bb[i]
  return out === 0
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }
  if (Deno.env.get('ENABLE_MINT') !== '1') {
    return json({ error: 'Minting is disabled.' }, 404)
  }

  const secret = Deno.env.get('SUPABASE_JWT_SECRET')
  const pass = Deno.env.get('MINT_AUTH_PASSPHRASE')
  if (!secret || !pass) {
    return json({ error: 'Mint function not configured (missing env).' }, 500)
  }

  let submitted = ''
  try {
    const body = await req.json()
    submitted = typeof body?.passphrase === 'string' ? body.passphrase : ''
  } catch {
    return json({ error: 'Bad request body' }, 400)
  }

  if (!timingSafeEqualStr(submitted, pass)) {
    return json({ error: 'Invalid passcode' }, 401)
  }

  const now = Math.floor(Date.now() / 1000)
  const ttl = Number(Deno.env.get('MINT_TTL_SECS') || 43200)
  const payload = {
    aud: 'authenticated',
    exp: now + ttl,
    iat: now,
    iss: SUPABASE_REF,
    sub: Deno.env.get('MINT_SUBJECT') || 'ee911dbd-c2f8-4ccb-bec3-6be4a0ca8de3',
    email: Deno.env.get('MINT_EMAIL') || 'wangzhuo18@lenovo.com',
    role: 'authenticated',
  }

  const access_token = await signJwt(payload, secret)
  return json({ access_token, expires_in: ttl })
})