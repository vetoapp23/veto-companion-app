// Edge function: envoie un email via Gmail (vetoapp23@gmail.com) en utilisant le connector Lovable
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/google_mail/gmail/v1'

interface SendEmailBody {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  cc?: string | string[]
  bcc?: string | string[]
  from_name?: string
}

function b64url(input: string): string {
  // UTF-8 safe base64url
  const bytes = new TextEncoder().encode(input)
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function buildRaw(opts: SendEmailBody): string {
  const toList = Array.isArray(opts.to) ? opts.to.join(', ') : opts.to
  const ccList = opts.cc ? (Array.isArray(opts.cc) ? opts.cc.join(', ') : opts.cc) : ''
  const bccList = opts.bcc ? (Array.isArray(opts.bcc) ? opts.bcc.join(', ') : opts.bcc) : ''
  const fromName = opts.from_name || 'VetoApp'
  const from = `${fromName} <vetoapp23@gmail.com>`

  const headers = [
    `From: ${from}`,
    `To: ${toList}`,
    ccList ? `Cc: ${ccList}` : '',
    bccList ? `Bcc: ${bccList}` : '',
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(opts.subject)))}?=`,
    'MIME-Version: 1.0',
    opts.html
      ? 'Content-Type: text/html; charset="UTF-8"'
      : 'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
  ].filter(Boolean)

  const body = opts.html || opts.text || ''
  return headers.join('\r\n') + '\r\n\r\n' + body
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    const GOOGLE_MAIL_API_KEY = Deno.env.get('GOOGLE_MAIL_API_KEY')
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY missing')
    if (!GOOGLE_MAIL_API_KEY) throw new Error('GOOGLE_MAIL_API_KEY missing (Gmail not connected)')

    const body = (await req.json()) as SendEmailBody
    if (!body?.to || !body?.subject || (!body.html && !body.text)) {
      return new Response(
        JSON.stringify({ error: 'Champs requis: to, subject, et html ou text' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const raw = b64url(buildRaw(body))

    const resp = await fetch(`${GATEWAY_URL}/users/me/messages/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': GOOGLE_MAIL_API_KEY,
      },
      body: JSON.stringify({ raw }),
    })

    const data = await resp.json()
    if (!resp.ok) {
      console.error('Gmail send error', resp.status, data)
      return new Response(JSON.stringify({ error: 'Gmail send failed', status: resp.status, data }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (e) {
    console.error(e)
    return new Response(JSON.stringify({ error: String((e as Error).message || e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
