import { createFileRoute } from '@tanstack/react-router'
import { createHash, randomBytes } from 'node:crypto'

export const Route = createFileRoute('/api/estimate/oauth/start')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const state = randomBytes(24).toString('base64url')
        const nonce = randomBytes(24).toString('base64url')
        const verifier = randomBytes(32).toString('base64url')
        const challenge = createHash('sha256').update(verifier).digest('base64url')
        const redirectUri = new URL('/api/estimate/oauth/callback', request.url).toString()
        const params = new URLSearchParams({
          response_type: 'code',
          client_id: process.env.APP_ID || 'app_8YZgDz7emvrsE0',
          redirect_uri: redirectUri,
          scope: 'openid',
          state,
          nonce,
          code_challenge: challenge,
          code_challenge_method: 'S256',
        })
        const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : ''
        const headers = new Headers({ Location: `https://api.whop.com/oauth/authorize?${params}` })
        headers.append('Set-Cookie', `whop_oauth_state=${state}; Path=/api/estimate/oauth; HttpOnly; SameSite=Lax; Max-Age=600${secure}`)
        headers.append('Set-Cookie', `whop_oauth_nonce=${nonce}; Path=/api/estimate/oauth; HttpOnly; SameSite=Lax; Max-Age=600${secure}`)
        headers.append('Set-Cookie', `whop_oauth_verifier=${verifier}; Path=/api/estimate/oauth; HttpOnly; SameSite=Lax; Max-Age=600${secure}`)
        return new Response(null, { status: 302, headers })
      },
    },
  },
})
