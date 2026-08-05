import { createClient } from 'jsr:@supabase/supabase-js@2'

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

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false, autoRefreshToken: false } }
)

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

  const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const existing = users?.find(u => u.email?.toLowerCase() === email.toLowerCase())
  if (existing) {
    return json({
      error: 'This email already has an account. They can sign in directly, or use "Forgot password?" to reset.',
      alreadyExists: true
    }, 400)
  }
  if (listErr) {
    return json({ error: `Could not check existing users: ${listErr.message}` }, 500)
  }

  try {
    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email.toLowerCase().trim(),
      {
        data: {
          full_name: name ? name.trim() : undefined,
          team_group: teamGroup && teamGroup !== 'General' ? teamGroup : 'Regular Team'
        },
        redirectTo: `${APP_ORIGIN}/#/`
      }
    )

    if (error) {
      return json({ error: error.message }, 400)
    }

    return json({ email: email.toLowerCase().trim(), sent: true })
  } catch (err) {
    return json({ error: err?.message || 'Invite failed' }, 500)
  }
})