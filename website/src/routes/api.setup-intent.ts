import { createFileRoute } from '@tanstack/react-router'
import { plans } from '../site-config'
import { whopAccountId, whopGet, whopPost } from '../server/whop'

export const Route = createFileRoute('/api/setup-intent')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { confirmationToken, email, depositPaymentId, cardOnFileConsent } = await request.json() as { confirmationToken?: string; email?: string; depositPaymentId?: string; cardOnFileConsent?: boolean }
          if (!confirmationToken?.startsWith('ctok_') || !email?.includes('@') || !depositPaymentId?.startsWith('pay_') || cardOnFileConsent !== true) return Response.json({ error: 'A Whop confirmation token, customer email, completed deposit, and card-on-file consent are required.' }, { status: 400 })
          if (!plans.deposit.id) return Response.json({ error: 'Configure the Whop deposit plan before saving payment methods.' }, { status: 503 })
          const deposit = await whopGet(`/payments/${depositPaymentId}`)
          if (deposit.status !== 'paid' || deposit.plan?.id !== plans.deposit.id || deposit.company?.id !== whopAccountId()) return Response.json({ error: 'A completed project deposit from this Whop business is required before saving a payment method.' }, { status: 409 })
          if (!deposit.user?.email || deposit.user.email.toLowerCase() !== email.trim().toLowerCase()) return Response.json({ error: 'Use the same email address that was used for the project deposit.' }, { status: 409 })
          const intent = await whopPost('/setup_intents', {
            confirmation_token: confirmationToken,
            email,
            return_url: new URL('/', request.url).toString(),
            metadata: { purpose: 'roofing_final_invoice', deposit_payment_id: depositPaymentId, card_on_file_consent: 'true', consent_text_version: 'v1' },
          })
          return Response.json({ id: intent.id, clientSecret: intent.client_secret, status: intent.status })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unable to save payment method.'
          return Response.json({ error: message }, { status: 502 })
        }
      },
    },
  },
})
