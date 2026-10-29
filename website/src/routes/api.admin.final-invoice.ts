import { createFileRoute } from '@tanstack/react-router'
import { whopPost } from '../server/whop'

export const Route = createFileRoute('/api/admin/final-invoice')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const adminSecret = process.env.WHOP_INVOICE_ADMIN_SECRET
        if (!adminSecret || request.headers.get('authorization') !== `Bearer ${adminSecret}`) return Response.json({ error: 'Unauthorized.' }, { status: 401 })
        try {
          const { customerName, email, paymentMethodId, amount, autoCharge } = await request.json() as {
            customerName?: string; email?: string; paymentMethodId?: string; amount?: number; autoCharge?: boolean
          }
          if (!customerName || !email?.includes('@') || !Number.isSafeInteger(amount) || (amount || 0) < 1) return Response.json({ error: 'Customer name, email, and final balance in USD cents are required.' }, { status: 400 })
          if (autoCharge && !paymentMethodId?.startsWith('payt_')) return Response.json({ error: 'Auto-charge requires the payment method ID returned by the successful Whop setup intent.' }, { status: 400 })
          const invoice = await whopPost('/invoices', {
            customer_name: customerName,
            email_address: email,
            line_items: [{ label: 'Roofing project final balance', unit_price: (amount as number) / 100, quantity: 1 }],
            ...(autoCharge ? { payment_method_id: paymentMethodId } : {}),
            due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
          })
          return Response.json({ id: invoice.id, payOnlineUrl: invoice.pay_online_url })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unable to create Whop invoice.'
          return Response.json({ error: message }, { status: 502 })
        }
      },
    },
  },
})
