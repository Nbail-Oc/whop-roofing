import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/admin/invoices')({ component: InvoiceAdmin })

function InvoiceAdmin() {
  const [adminKey, setAdminKey] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [email, setEmail] = useState('')
  const [depositPaymentId, setDepositPaymentId] = useState('')
  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [invoice, setInvoice] = useState<{ id: string; payOnlineUrl?: string } | null>(null)

  async function createInvoice(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setInvoice(null)
    try {
      const amountCents = Math.round(Number(amount) * 100)
      if (!Number.isSafeInteger(amountCents) || amountCents < 1) throw new Error('Enter a final balance greater than $0.00.')
      const response = await fetch('/api/admin/final-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminKey}` },
        body: JSON.stringify({ customerName, email, depositPaymentId, amount: amountCents }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Whop could not create the invoice.')
      setInvoice(result)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Whop could not create the invoice.')
    } finally {
      setBusy(false)
    }
  }

  return <main className="min-h-screen bg-white px-5 py-16 text-ink sm:px-10">
    <div className="mx-auto max-w-2xl">
      <p className="micro">CONTRACTOR TOOL · WHOP INVOICES</p>
      <h1 className="mt-4 font-serif text-4xl tracking-tight sm:text-5xl">Send the final balance.</h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink/65">After the work is complete, send the remaining approved balance as a Whop invoice. Whop emails the customer a secure payment link. Use the customer details from their paid $500 deposit checkout; the final balance is the agreed job total minus the deposit.</p>
      <form className="mt-10 grid gap-5" onSubmit={createInvoice}>
        <label className="field-label">Invoice admin key<input className="field" type="password" autoComplete="current-password" required value={adminKey} onChange={(event) => setAdminKey(event.target.value)} /></label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="field-label">Customer name<input className="field" required value={customerName} onChange={(event) => setCustomerName(event.target.value)} /></label>
          <label className="field-label">Customer email<input className="field" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        </div>
        <label className="field-label">Deposit payment ID<input className="field" required placeholder="pay_…" value={depositPaymentId} onChange={(event) => setDepositPaymentId(event.target.value)} /><span className="font-normal text-ink/50">Use the `pay_…` ID for the completed $500 project deposit from Whop → Payments. This is the payment ID, not the deposit plan ID. An unpaid or sandbox payment cannot validate a production invoice.</span></label>
        <label className="field-label">Final balance (USD)<input className="field" type="number" min="0.01" step="0.01" inputMode="decimal" required value={amount} onChange={(event) => setAmount(event.target.value)} /><span className="font-normal text-ink/50">Enter the remaining amount after subtracting the $500 deposit from the approved project total.</span></label>
        <button disabled={busy} className="w-fit rounded-lg bg-ink px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-ink/90 disabled:opacity-50">{busy ? 'Creating invoice…' : 'Create and email invoice'}</button>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {invoice && <div role="status" className="border border-ink/10 bg-[#F4F3F3] p-5 text-sm"><p className="font-medium">Whop invoice {invoice.id} created and sent.</p>{invoice.payOnlineUrl && <a className="mt-3 inline-block underline" href={invoice.payOnlineUrl} target="_blank" rel="noreferrer">Open customer payment page</a>}</div>}
      </form>
    </div>
  </main>
}
