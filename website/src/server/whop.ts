import { site } from '../site-config'

const baseUrl = `${(process.env.WHOP_API_ORIGIN || 'https://api.whop.com').replace(/\/+$/, '')}/api/v1`

export function whopAccountId() {
  return process.env.WHOP_ACCOUNT_ID || site.accountId
}

async function whopRequest(path: string, init: RequestInit = {}) {
  const apiKey = process.env.WHOP_API_KEY
  const accountId = whopAccountId()
  if (!accountId) throw new Error('Set the public business ID in site-config.ts; Whop also injects WHOP_ACCOUNT_ID in its server runtime.')
  if (!apiKey && !process.env.WHOP_API_ORIGIN) throw new Error('Whop API credentials are unavailable. Run this through `whop apps dev` or configure local credentials.')
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (apiKey) headers.set('Authorization', `Bearer ${apiKey}`)
  const response = await fetch(`${baseUrl}${path}`, { ...init, headers })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = result?.error?.message || result?.message || `Whop API returned ${response.status}`
    throw new Error(message)
  }
  return result
}

export function whopPost(path: string, body: Record<string, unknown>, idempotencyKey?: string) {
  return whopRequest(path, {
    method: 'POST',
    headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
    body: JSON.stringify({ ...body, account_id: whopAccountId() }),
  })
}

export function whopGet(path: string) {
  return whopRequest(path, { method: 'GET' })
}
