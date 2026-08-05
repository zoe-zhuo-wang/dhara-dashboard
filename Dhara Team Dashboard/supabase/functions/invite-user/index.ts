function decodeJwtRole(token: string): string | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(b64))
    return payload?.role ?? null
  } catch {
    return null
  }
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const APP_ORIGIN = 'https://zoe-zhuo-wang.github.io/dhara-dashboard'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, apikey, x-client-info, content-type',
  'Access-Control-Max-Age': '86400'
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  const authHeader = req.headers.get('Authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader
  const role = decodeJwtRole(token)
  if (role !== 'authenticated') {
    return json({ error: 'Unauthorized', role: role || 'none' }, 401)
  }

  let email: string | undefined
  let name: string | undefined
  let teamGroup: string | undefined
  try {
    const body = await req.json()
    email = body?.email
    name = body?.name
    teamGroup = body?.team_group
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ error: 'A valid email is required' }, 400)
  }

  const res = await fetch(
    `${SUPABASE_URL}/auth/v1/admin/invite?redirect_to=${encodeURIComponent(`${APP_ORIGIN}/#/`)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'X-Supabase-Api-Version': '2024-01-01'
      },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        data: {
          full_name: name ? name.trim() : undefined,
          team_group: teamGroup && teamGroup !== 'General' ? teamGroup : 'Regular Team'
        }
      })
    }
  )

  if (!res.ok) {
    let msg = `Invite request failed (${res.status})`
    try {
      const body = await res.json()
      if (body?.msg || body?.message) {
        msg = body.msg || body.message
      } else if (body && typeof body === 'object' && Object.keys(body).length === 0) {
        msg = 'Supabase auth service is temporarily unavailable. Please try again in a few minutes.'
      }
    } catch {
      /* keep default */
    }
    if (/already (registered|exist)/i.test(msg) || /email.*(exist|taken)/i.test(msg)) {
      return json({
        error: 'This email already has an account. They can sign in directly, or use "Forgot password?" to reset.',
        alreadyExists: true
      }, 400)
    }
    return json({ error: msg }, res.status >= 500 ? 503 : res.status)
  }

  const data = await res.json()
  const actionLink = data?.properties?.action_link || ''

  return json({ email: email.toLowerCase().trim(), sent: true, inviteLink: actionLink })
})