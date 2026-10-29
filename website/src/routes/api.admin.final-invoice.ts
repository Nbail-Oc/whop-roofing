import { createFileRoute } from '@tanstack/react-router'
import { createHash } from 'node:crypto'
import { plans, site } from '../site-config'
import { whopGet, whopPost } from '../server/whop'

export const Route = createFileRoute('/api/admin/final-invoice')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const adminSecret = process.env.WHOP_INVOICE_ADMIN_SECRET
        if (!adminSecret || request.headers.get('authorization') !== `Bearer ${adminSecret}`) return Response.json({ error: 'Unauthorized.' }, { status: 401 })
        try {
          const { customerName, email, depositPaymentId, amount } = await request.json() as {
            customerName?: string; email?: string; depositPaymentId?: string; amount?: number
          }
          if (!customerName?.trim() || !email?.includes('@') || !depositPaymentId || !/^pay_[a-zA-Z0-9]+$/.test(depositPaymentId) || !Number.isSafeInteger(amount) || (amount || 0) < 1) return Response.json({ error: 'Customer name, email, deposit payment ID, and final balance in USD cents are required.' }, { status: 400 })
          if (!plans.deposit.id) return Response.json({ error: 'Configure the Whop deposit plan before creating final invoices.' }, { status: 503 })
          const deposit = await whopGet(`/payments/${depositPaymentId}`)
          if (deposit.status !== 'paid' || deposit.plan?.id !== plans.deposit.id || deposit.company?.id !== (process.env.WHOP_ACCOUNT_ID || site.accountId)) return Response.json({ error: 'The invoice must reference a completed project deposit from this Whop business.' }, { status: 409 })
          if (!deposit.user?.email || deposit.user.email.toLowerCase() !== email.trim().toLowerCase()) return Response.json({ error: 'Invoice email must match the customer email on the deposit payment.' }, { status: 409 })
          const finalBalance = (amount as number) / 100
          const invoiceBody = {
            collection_method: 'send_invoice',
            charge_buyer_fee: false,
            customer_name: customerName,
            email_address: email,
            plan: {
              title: 'Roofing project final balance',
              plan_type: 'one_time',
              initial_price: finalBalance,
              currency: 'usd',
              release_method: 'buy_now',
              visibility: 'hidden',
            },
            ...(site.invoiceProductId ? { product_id: site.invoiceProductId } : { product: { title: 'Roofing project final balance' } }),
            line_items: [{ label: 'Roofing project final balance', unit_price: finalBalance, quantity: 1 }],
            due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
          }
          const idempotencyKey = `roof-final-${createHash('sha256').update(`${depositPaymentId}:${email.trim().toLowerCase()}:${amount}`).digest('hex')}`
          const invoice = await whopPost('/invoices', invoiceBody, idempotencyKey)
          return Response.json({ id: invoice.id, payOnlineUrl: invoice.pay_online_url, collectionMethod: invoice.collection_method })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unable to create Whop invoice.'
          return Response.json({ error: message }, { status: 502 })
        }
      },
    },
  },
})
