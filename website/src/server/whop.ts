import { site } from '../site-config'

const baseUrl = 'https://api.whop.com/api/v1'

export function whopAccountId() {
  return process.env.WHOP_ACCOUNT_ID || site.accountId
}

export async function whopPost(path: string, body: Record<string, unknown>) {
  const apiKey = process.env.WHOP_API_KEY
  const accountId = whopAccountId()
  if (!apiKey || !accountId) throw new Error('Whop is not connected. Set WHOP_API_KEY and WHOP_ACCOUNT_ID in the Whop app secrets.')
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ account_id: accountId, ...body }),
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = result?.error?.message || result?.message || `Whop API returned ${response.status}`
    throw new Error(message)
  }
  return result
}
