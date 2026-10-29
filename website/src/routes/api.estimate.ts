import { createFileRoute } from '@tanstack/react-router'
import { site } from '../site-config'
import { whopPost } from '../server/whop'

function cookieValue(request: Request, name: string) {
  return request.headers.get('cookie')?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1)
}

export const Route = createFileRoute('/api/estimate')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const visitorToken = cookieValue(request, 'whop_visitor_token')
          if (!visitorToken) return Response.json({ error: 'Sign in with Whop before sending this estimate. Your email is contact information, not a Whop user ID.' }, { status: 401 })
          const identityResponse = await fetch('https://api.whop.com/oauth/userinfo', { headers: { Authorization: `Bearer ${decodeURIComponent(visitorToken)}` } })
          const identity = await identityResponse.json().catch(() => ({})) as { sub?: string }
          if (!identityResponse.ok || !identity.sub?.startsWith('user_')) return Response.json({ error: 'Your Whop sign-in expired. Sign in again, then resend your estimate.' }, { status: 401 })
          const body = await request.json() as Record<string, unknown>
          const name = String(body.name || '').trim().slice(0, 120)
          const email = String(body.email || '').trim().slice(0, 254)
          const service = String(body.service || '').trim().slice(0, 80)
          const postalCode = String(body.postalCode || '').trim().slice(0, 20)
          if (!name || !email || !service || !postalCode) return Response.json({ error: 'Name, email, service, and ZIP code are required.' }, { status: 400 })
          const lead = await whopPost('/leads', {
            user_id: identity.sub,
            product_id: site.leadProductId || null,
            referrer: request.headers.get('referer') || '',
            metadata: {
              name,
              email,
              phone: String(body.phone || '').slice(0, 40),
              service,
              postal_code: postalCode,
              details: String(body.details || '').slice(0, 1000),
              consent: 'estimate_contact',
            },
          })
          return Response.json({ id: lead.id })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unable to create Whop lead.'
          return Response.json({ error: message }, { status: 502 })
        }
      },
    },
  },
})
