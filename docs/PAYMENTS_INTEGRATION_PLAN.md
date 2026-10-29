# Whop payments and invoicing implementation plan

Reviewed against `instructions.md`, the existing website source, the installed Whop Elements types, and Whop's official documentation on 2026-10-29.

## What the checkout warning meant

The checkout modal showed that warning because all three Whop plan IDs were blank in `website/src/site-config.ts`. The three one-time variants are now created and configured. The estimate API documentation marks `user_id` nullable, but the live request with `user_id: null` returned `user_id is required`. The demo route now sends the signed-in business owner's ID as a temporary fallback. This will attribute every request to the owner, not the visitor; replace it with visitor OAuth or a Whop-supported guest Lead flow before accepting real prospects.

## Implementation status

The source is deployed to the connected Whop Website, and the business, product, and three plan IDs are configured. The Leads route has a temporary hardcoded owner identity; a successful Lead submission has not yet been verified. Checkout and the complete payment/invoice sequence are not yet account-verified.

- The plan checkout uses Whop's hosted `CheckoutElement` or `ExpressCheckoutElement` path. The installed Elements API documents these as an exclusive checkout entry slot, so the modal switches between standard checkout and Apple Pay/Google Pay. PayPal is disabled. `BrandingElement` is mounted with the setup-mode `PaymentElement`; Whop's full checkout surface owns its own payment/terms rendering.
- After Whop reports checkout completion, the server retrieves the payment and requires the configured $500 deposit plan and a `paid` state before the modal opens card setup.
- The homeowner explicitly consents to save a payment method. The site creates a Whop setup intent, handles a required next action, and checks setup status. The setup intent metadata records the deposit payment ID; the method ID is not returned to browser code.
- `/admin/invoices` is the contractor tool. The server validates the paid deposit again, validates the positive final balance in USD cents, and creates a `send_invoice` invoice with the required collection method, plan/product, line item, and due date. Whop emails the customer and the tool returns its payment URL. This version intentionally uses manual payment rather than auto-charge.
- If `site.invoiceProductId` is set, invoices reuse that product. Otherwise the API creates an inline invoice product.
- Financing still depends on Whop merchant approval and buyer/purchase eligibility. The code cannot enable or promise a provider.

## Implementation sequence

### 1. Connect the real Whop business

Before real customer payments, finish business and payout onboarding and confirm the account can accept the intended payments. The demo plans ($149 inspection, $500 deposit, $299 flat-rate leak repair) and product are created on the connected business, and their IDs are in `website/src/site-config.ts`. When adapting the template, replace these with IDs from the target business. Whop injects `WHOP_ACCOUNT_ID` and API authentication into the hosted runtime; do not create app secrets with reserved names. Keep additional credentials such as the invoice admin secret in protected app secrets, never client code. Verify the actual domain and wallet domain requirements.

**Exit condition: done.** The connected product has three visible one-time USD plans at the expected prices. Complete payment onboarding and test actual checkout before treating these plans as ready for customer use.

### 2. Finish the Whop checkout surface

Use Whop's prebuilt Elements only. The source already provides the plan checkout with a choice between the standard checkout and express wallet element, keeping PayPal disabled. The installed Elements API documents the standard and express checkout elements as mutually exclusive in their entry slot. The setup-mode `PaymentElement` includes the required `BrandingElement`.

Keep the card data entirely in Whop Elements. Route plan selection from the configured plan IDs; do not accept a price from the browser. Handle success, cancellation, decline, and any required next action distinctly. Do not treat a client-side completion callback alone as durable proof of a payment; reconcile completion through Whop's supported server confirmation/webhook path before marking a job paid.

**Code condition: done. Account exit condition:** all three real plans open Whop Elements; wallet options render where Whop and the browser/domain allow them; successful and failed outcomes are verified on the connected account.

### 3. Save a payment method as part of the deposit flow

The source implements a separate setup-mode `PaymentElement` immediately after Whop confirms the $500 deposit. It asks for clear consent, creates the setup intent server-side, handles any next action, and verifies success through Whop. The returned setup intent carries the deposit payment ID in Whop metadata; the customer sees the deposit payment reference for contractor follow-up. The current release does not auto-charge the stored method.

**Code condition: done. Account exit condition:** verify a real deposit followed by a successful setup intent on the connected business, including any required authentication step.

### 4. Correct the final-balance invoice flow

The source implements contractor-only invoice creation at `/api/admin/final-invoice`, with the `/admin/invoices` form as its interface. It validates the deposit, final balance, customer details, and uses `send_invoice`; auto-charge is not implemented. `WHOP_INVOICE_ADMIN_SECRET` is entered at runtime and is not committed or stored in the browser.

**Code condition: done. Account exit condition:** create an invoice on the connected Whop business and verify the email and Whop payment URL. Add auto-charge only if the business specifically needs it and the account flow provides all required stored-method/token values.

### 5. Financing, tracking, and proof

Apply for financing in the Whop dashboard. Whop documents financing as appearing automatically at checkout after merchant approval when the method and buyer are eligible; no front-end flag can force it on. Verify eligible options on the actual merchant account and the actual checkout amounts. Keep site wording conditional and avoid promising a particular lender or approval.

Verify `estimate_requested`, `service_viewed`, and `deposit_started` in the Whop pixel dashboard; preserve the existing custom event names. `estimate_requested` only fires after the Leads API succeeds. Whop-hosted sites install the pixel and track page views/checkout activity automatically.

**Exit condition:** financing approval state and actual eligible checkout methods are recorded; custom events are visible in Whop tracking; prepare the requested short screen recording only after the real flow passes.

## Test gates and order

1. Local typecheck/build after implementation.
2. Whop preview deployment, then verify the hosted runtime has account context and protected secrets.
3. Complete a Whop sandbox/test checkout using Elements and BrandingElement if sandbox access is enabled for the business. If it is not enabled, stop before charging a real customer; request Whop sandbox access or use a clearly authorized internal test transaction.
4. Verify the successful deposit, saved method/setup intent, and final invoice in the business dashboard/API.
5. Verify the lead and custom pixel events, then record the 3–5 minute demo.

## Documentation reviewed

- [Website quickstart](https://docs.whop.com/developer/websites/quickstart) and [hosting/runtime](https://docs.whop.com/developer/websites/hosting)
- [Website tracking](https://docs.whop.com/developer/websites/tracking)
- [Elements Payments overview](https://docs.whop.com/elements/latest/payments/overview) and the installed `@whop/elements` / `@whop/elements-react` 1.9.0 type definitions (including checkout, express checkout, setup mode, `setupFutureUsage`, and BrandingElement requirements)
- [Create setup intent API](https://docs.whop.com/api-reference/setup-intents/create-setup-intent)
- [Create invoice API](https://docs.whop.com/api-reference/invoices/create-invoice)
- [Create lead API](https://docs.whop.com/api-reference/leads/create-lead)
- [Financing options](https://docs.whop.com/payments-and-billing/financing/all-bnpl-options) and [financing application](https://docs.whop.com/payments-and-billing/financing/apply)

## Not included in this plan

The user ID correction for the estimate Leads API needs its own decision/implementation. Do not ask public homeowners to guess a Whop ID; first verify a guest-compatible lead flow or implement a proper supported Whop visitor OAuth flow. It is independent of the deposit, checkout, and invoice implementation.
