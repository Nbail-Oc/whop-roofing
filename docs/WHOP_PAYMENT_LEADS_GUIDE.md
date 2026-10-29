# Whop payments, invoices, and estimate Leads

Checked against Whop's current documentation on 2026-10-29.

## Lead form: email is not user ID

The estimate form's **Email** field is the customer's contact address. Whop's Leads API `user_id` identifies a Whop account and has the form `user_…`; it cannot be replaced with an email address. The API reference currently marks `user_id` nullable and says an authenticated user's identity is used automatically. In this app, an anonymous request with a null ID returned `user_id is required`, so the form uses Whop OAuth/OIDC (`openid`) with PKCE and passes the verified `sub` claim as `user_id`. Contact details stay in Lead metadata. A homeowner needs a Whop account and must authorize this identity flow. Do not use the roofing company's owner ID as the homeowner ID.

The app callback URL is configured as:

```text
https://boomerang-roofing.whop.site/api/estimate/oauth/callback
```

The OAuth app uses the public client type, PKCE, state, and nonce; the login access token stays in a Secure, HttpOnly, SameSite cookie. The OAuth login and a submitted Lead still need a live account verification. If the company does not want its customers to sign in to Whop, the public Leads API flow is not a fit for anonymous estimates; use an email/CRM lead intake for the form instead, while keeping Whop checkout for payment.

## Checkout and sandbox

Each service plan mounts Whop's `CheckoutElement` or `ExpressCheckoutElement` inside the Whop provider. Payment fields are hosted by Whop. Apple Pay and Google Pay appear only when Whop, the merchant, the plan, device, and verified domain allow them. Financing options are conditional on merchant/provider approval and buyer eligibility.

The current live site uses the **production** Whop environment and real plans. The installed Elements SDK accepts `environment: "sandbox"` and describes it as test data with no real money movement, but its current type documentation says sandbox is not generally available. Sandbox requires Whop to enable access and matching sandbox plans/API access. Do not enter a real card to test this live site; no sandbox checkout is claimed complete until Whop enables it and a test payment succeeds.

## Deposit, save method, final invoice

1. The customer pays the $500 project deposit through Whop checkout.
2. The server retrieves the payment and checks paid status and the configured deposit plan.
3. With explicit consent, the customer may use Whop `PaymentElement` plus `BrandingElement` in setup mode to save a method. Setup mode saves a method and charges nothing.
4. The contractor completes the work, calculates the agreed final balance, and uses `/admin/invoices` to create a Whop invoice.
5. This template uses `collection_method: "send_invoice"`: Whop sends the customer an invoice email and payment link. The endpoint requires a completed deposit from this company and requires invoice email to match the deposit buyer.

The saved method is not automatically charged by this manual invoice. Whop's Invoices API supports `charge_automatically`, but it requires a stored `payment_method_id` and a `payment_token_id`; the template does not implement that path. The invoice tool's key is stored as an encrypted Whop app secret named `WHOP_INVOICE_ADMIN_SECRET`; enter that key on the contractor-only invoice page. Never put it in source code or a browser bundle.

## Official references

- [Create Lead](https://docs.whop.com/api-reference/leads/create-lead)
- [Whop OAuth](https://docs.whop.com/developer/guides/oauth)
- [Payment Elements overview](https://docs.whop.com/elements/latest/payments/overview)
- [Create setup intent](https://docs.whop.com/api-reference/setup-intents/create-setup-intent)
- [Create invoice](https://docs.whop.com/api-reference/invoices/create-invoice)
- [Whop Website hosting and secrets](https://docs.whop.com/developer/websites/hosting)
