import { createClient } from 'jsr:@supabase/supabase-js@2'

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
  const { data: auth, error: authError } = await supabaseAdmin.auth.getUser(authHeader)
  if (authError || !auth.user) {
    return json({ error: 'Unauthorized' }, 401)
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

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'invite',
    email: email.toLowerCase().trim(),
    data: {
      full_name: name ? name.trim() : undefined,
      team_group: teamGroup && teamGroup !== 'General' ? teamGroup : 'Regular Team'
    },
    redirectTo: `${APP_ORIGIN}/#/`
  })

  if (error) {
    return json({ error: error.message }, 400)
  }

  const inviteLink = (data.properties as { action_link?: string } | undefined)?.action_link || ''

  return json({ email: email.toLowerCase().trim(), inviteLink })
})