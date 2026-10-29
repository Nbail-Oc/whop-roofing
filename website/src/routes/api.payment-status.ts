import { createFileRoute } from '@tanstack/react-router'
import { plans } from '../site-config'
import { whopGet } from '../server/whop'

export const Route = createFileRoute('/api/payment-status')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { paymentId } = await request.json() as { paymentId?: string }
          if (!paymentId || !/^pay_[a-zA-Z0-9]+$/.test(paymentId)) return Response.json({ error: 'A Whop payment ID is required.' }, { status: 400 })
          if (!plans.deposit.id) return Response.json({ error: 'Configure the Whop deposit plan before verifying deposits.' }, { status: 503 })
          const payment = await whopGet(`/payments/${paymentId}`)
          const planId = payment.plan?.id
          const status = payment.status === 'paid' && planId === plans.deposit.id ? 'paid' : payment.status === 'paid' ? 'not_project_deposit' : payment.status
          return Response.json({ status })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unable to verify the Whop payment.'
          return Response.json({ error: message }, { status: 502 })
        }
      },
    },
  },
})
