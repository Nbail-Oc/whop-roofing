import { createFileRoute } from '@tanstack/react-router'
import { whopGet } from '../server/whop'

export const Route = createFileRoute('/api/setup-intent/status')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const id = new URL(request.url).searchParams.get('id')
          if (!id || !/^sint_[a-zA-Z0-9]+$/.test(id)) return Response.json({ error: 'A Whop setup intent ID is required.' }, { status: 400 })
          const intent = await whopGet(`/setup_intents/${id}`)
          return Response.json({ status: intent.status })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unable to verify the saved payment method.'
          return Response.json({ error: message }, { status: 502 })
        }
      },
    },
  },
})
