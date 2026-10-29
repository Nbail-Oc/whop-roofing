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
          const idempotencyKey = `roof-final-${createHash('sha256').update(`${depositPaymentId}:${email.trim().toLowerCase()}:${amount}`).digest('hex')}`
          const invoice = await whopPost('/invoices', {
            customer_name: customerName.trim(),
            email_address: email.trim().toLowerCase(),
            due_at: new Date(Date.now() + 7 * 86400000).toISOString(),
            metadata: { deposit_payment_id: depositPaymentId, invoice_kind: 'roofing_project_final_balance' },
            items: [{
              quantity: 1,
              variant: {
                billing_type: 'one_time',
                currency: 'usd',
                initial_price: finalBalance,
                title: 'Roofing project final balance',
                ...(site.invoiceProductId ? { product_id: site.invoiceProductId } : {
                  product: { external_identifier: 'boomerang-roofing-final-balance', title: 'Roofing project final balance', visibility: 'hidden' },
                }),
              },
            }],
          }, idempotencyKey, '2026-10-27-3')

          try {
            const sent = await whopPost(`/invoices/${encodeURIComponent(invoice.id)}/send`, {}, `${idempotencyKey}-send`, '2026-10-27-3', false)
            return Response.json({ id: sent.id, checkoutLink: sent.checkout_link, status: sent.status, sent: true })
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Whop could not email the invoice.'
            return Response.json({ id: invoice.id, status: invoice.status, sent: false, error: `Invoice ${invoice.id} was created, but Whop could not email it: ${message}` })
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unable to create Whop invoice.'
          return Response.json({ error: message }, { status: 502 })
        }
      },
    },
  },
})
