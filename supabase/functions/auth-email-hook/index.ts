// Auth Email Hook: intercepte les emails d'authentification Supabase
// et les envoie depuis vetoapp23@gmail.com via le connecteur Gmail.
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/google_mail/gmail/v1'
const FROM_NAME = 'VetoCrm'
const FROM_EMAIL = 'vetoapp23@gmail.com'

function b64url(input: string): string {
  const bytes = new TextEncoder().encode(input)
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function buildRawMessage(to: string, subject: string, html: string): string {
  const headers = [
    `From: ${FROM_NAME} <${FROM_EMAIL}>`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
  ]
  return headers.join('\r\n') + '\r\n\r\n' + html
}

function renderEmail(opts: {
  action: string
  user_email: string
  confirmation_url: string
  token?: string
  email_action_type: string
}): { subject: string; html: string } {
  const { email_action_type, confirmation_url, token } = opts

  const titles: Record<string, string> = {
    signup: 'Confirmez votre inscription',
    recovery: 'Réinitialisation de votre mot de passe',
    invite: 'Vous êtes invité(e)',
    magiclink: 'Votre lien de connexion',
    email_change: 'Confirmez votre nouvelle adresse email',
    email_change_current: 'Confirmez le changement d\'email',
    email_change_new: 'Confirmez votre nouvelle adresse email',
    reauthentication: 'Code de vérification',
  }
  const ctas: Record<string, string> = {
    signup: 'Confirmer mon email',
    recovery: 'Réinitialiser mon mot de passe',
    invite: 'Accepter l\'invitation',
    magiclink: 'Se connecter',
    email_change: 'Confirmer le changement',
    email_change_current: 'Confirmer',
    email_change_new: 'Confirmer la nouvelle adresse',
    reauthentication: 'Code de vérification',
  }

  const subject = titles[email_action_type] || 'Notification'
  const cta = ctas[email_action_type] || 'Continuer'

  const body =
    email_action_type === 'reauthentication'
      ? `<p style="font-size:24px;letter-spacing:4px;font-weight:bold;text-align:center;background:#f3f4f6;padding:16px;border-radius:8px;">${token || ''}</p>`
      : `<p style="text-align:center;margin:32px 0;">
           <a href="${confirmation_url}"
              style="background:#111827;color:#ffffff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">
             ${cta}
           </a>
         </p>
         <p style="color:#6b7280;font-size:13px;">Si le bouton ne fonctionne pas, copiez ce lien :<br>
           <a href="${confirmation_url}" style="color:#2563eb;word-break:break-all;">${confirmation_url}</a>
         </p>`

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#111827;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <h1 style="font-size:22px;margin:0 0 24px;">${subject}</h1>
    <p style="font-size:15px;line-height:1.6;color:#374151;">Bonjour,</p>
    <p style="font-size:15px;line-height:1.6;color:#374151;">
      ${
        email_action_type === 'signup'
          ? 'Merci de vous être inscrit sur VetoCrm. Veuillez confirmer votre adresse email.'
          : email_action_type === 'recovery'
          ? 'Vous avez demandé à réinitialiser votre mot de passe.'
          : email_action_type === 'reauthentication'
          ? 'Voici votre code de vérification :'
          : 'Cliquez sur le bouton ci-dessous pour continuer.'
      }
    </p>
    ${body}
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;">
    <p style="font-size:12px;color:#9ca3af;">
      Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.<br>
      — L'équipe VetoCrm
    </p>
  </div>
</body></html>`

  return { subject, html }
}

Deno.serve(async (req) => {
  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    const GOOGLE_MAIL_API_KEY = Deno.env.get('GOOGLE_MAIL_API_KEY')
    const HOOK_SECRET = Deno.env.get('SEND_EMAIL_HOOK_SECRET')

    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY missing')
    if (!GOOGLE_MAIL_API_KEY) throw new Error('GOOGLE_MAIL_API_KEY missing — Gmail not connected')
    if (!HOOK_SECRET) throw new Error('SEND_EMAIL_HOOK_SECRET missing')

    const payload = await req.text()
    const headers = Object.fromEntries(req.headers)

    // Vérification de la signature du webhook Supabase
    const secret = HOOK_SECRET.replace(/^v1,whsec_/, '')
    const wh = new Webhook(secret)
    const data = wh.verify(payload, headers) as {
      user: { email: string }
      email_data: {
        token: string
        token_hash: string
        redirect_to: string
        email_action_type: string
        site_url: string
        token_new?: string
        token_hash_new?: string
      }
    }

    const { user, email_data } = data

    // Force la redirection post-vérification vers l'URL publique du projet
    // (sinon Supabase renvoie sur lovable.dev/auth-bridge qui exige un login Lovable
    // lorsque le lien est ouvert dans un navigateur externe).
    const PUBLIC_APP_URL = 'https://cuddle-care-cloud.lovable.app'
    const incoming_redirect = email_data.redirect_to || ''
    const safe_redirect = incoming_redirect && !/lovable\.(dev|app)\/(login|auth-bridge)/.test(incoming_redirect)
      ? incoming_redirect
      : PUBLIC_APP_URL

    const confirmation_url = `${email_data.site_url}/auth/v1/verify?token=${email_data.token_hash}&type=${email_data.email_action_type}&redirect_to=${encodeURIComponent(safe_redirect)}`

    const { subject, html } = renderEmail({
      action: email_data.email_action_type,
      user_email: user.email,
      confirmation_url,
      token: email_data.token,
      email_action_type: email_data.email_action_type,
    })

    const raw = b64url(buildRawMessage(user.email, subject, html))

    const resp = await fetch(`${GATEWAY_URL}/users/me/messages/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': GOOGLE_MAIL_API_KEY,
      },
      body: JSON.stringify({ raw }),
    })

    if (!resp.ok) {
      const errText = await resp.text()
      console.error('Gmail send failed', resp.status, errText)
      return new Response(
        JSON.stringify({ error: { http_code: 502, message: `Gmail send failed: ${errText}` } }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      )
    }

    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('auth-email-hook error', e)
    return new Response(
      JSON.stringify({ error: { http_code: 401, message: String((e as Error).message || e) } }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    )
  }
})
