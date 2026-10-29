import { createFileRoute } from '@tanstack/react-router'
import { whopPost } from '../server/whop'

export const Route = createFileRoute('/api/setup-intent')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { confirmationToken, email } = await request.json() as { confirmationToken?: string; email?: string }
          if (!confirmationToken?.startsWith('ctok_') || !email?.includes('@')) return Response.json({ error: 'A Whop confirmation token and customer email are required.' }, { status: 400 })
          const intent = await whopPost('/setup_intents', {
            confirmation_token: confirmationToken,
            email,
            return_url: new URL('/', request.url).toString(),
            metadata: { purpose: 'roofing_final_invoice' },
          })
          return Response.json({ id: intent.id, paymentMethodId: intent.payment_method?.id, status: intent.status })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unable to save payment method.'
          return Response.json({ error: message }, { status: 502 })
        }
      },
    },
  },
})
