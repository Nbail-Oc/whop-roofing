import { createFileRoute } from '@tanstack/react-router'

function cookieValue(request: Request, name: string) {
  return request.headers.get('cookie')?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1)
}

export const Route = createFileRoute('/api/estimate/oauth/callback')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const state = cookieValue(request, 'whop_oauth_state')
        const nonce = cookieValue(request, 'whop_oauth_nonce')
        const verifier = cookieValue(request, 'whop_oauth_verifier')
        const code = url.searchParams.get('code')
        const returnedState = url.searchParams.get('state')
        const secure = url.protocol === 'https:' ? '; Secure' : ''
        const clear = `; Path=/api/estimate/oauth; HttpOnly; SameSite=Lax; Max-Age=0${secure}`
        const headers = new Headers({ Location: `${url.origin}/#contact` })
        headers.append('Set-Cookie', `whop_oauth_state=;${clear}`)
        headers.append('Set-Cookie', `whop_oauth_nonce=;${clear}`)
        headers.append('Set-Cookie', `whop_oauth_verifier=;${clear}`)
        if (!state || !nonce || !verifier || !code || returnedState !== state || url.searchParams.has('error')) {
          headers.set('Location', `${url.origin}/?estimate_auth=failed#contact`)
          return new Response(null, { status: 302, headers })
        }
        try {
          const redirectUri = new URL('/api/estimate/oauth/callback', url.origin).toString()
          const tokenResponse = await fetch('https://api.whop.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ grant_type: 'authorization_code', code, redirect_uri: redirectUri, client_id: process.env.APP_ID || 'app_8YZgDz7emvrsE0', code_verifier: verifier }),
          })
          const tokens = await tokenResponse.json().catch(() => ({})) as { access_token?: string; id_token?: string; expires_in?: number }
          if (!tokenResponse.ok || !tokens.access_token || !tokens.id_token) throw new Error('Token exchange failed')
          const idTokenPayload = tokens.id_token.split('.')[1]
          if (!idTokenPayload || JSON.parse(Buffer.from(idTokenPayload, 'base64url').toString()).nonce !== nonce) throw new Error('OAuth nonce validation failed')
          const who = await fetch('https://api.whop.com/oauth/userinfo', { headers: { Authorization: `Bearer ${tokens.access_token}` } })
          const identity = await who.json().catch(() => ({})) as { sub?: string }
          if (!who.ok || !identity.sub?.startsWith('user_')) throw new Error('User identity unavailable')
          headers.set('Location', `${url.origin}/?estimate_auth=connected#contact`)
          headers.append('Set-Cookie', `whop_visitor_token=${encodeURIComponent(tokens.access_token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.max(60, Math.min(tokens.expires_in || 3600, 3600))}${secure}`)
        } catch {
          headers.set('Location', `${url.origin}/?estimate_auth=failed#contact`)
        }
        return new Response(null, { status: 302, headers })
      },
    },
  },
})
