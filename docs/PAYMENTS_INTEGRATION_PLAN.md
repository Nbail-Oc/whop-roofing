# Whop payments and invoicing implementation plan

Reviewed against `instructions.md`, the existing website source, the installed Whop Elements types, and Whop's official documentation on 2026-10-29.

## What the screenshot field means

The `Whop user ID` field is **not** an environment variable and it is not the roofing business's Whop ID. It asks for the individual homeowner's Whop user ID so the Leads API can attach a lead to that person. A homeowner will not normally know this value. Do not put the business ID, a made-up ID, or one shared ID in this field. The public form needs a supported visitor identity flow (Whop hosting docs point to OAuth) or a different supported way to create the lead. This is separate from checkout and invoicing and is not a prerequisite for the payment work below.

## Current code versus the requested end-to-end flow

The site already has Whop Elements packages, a plan-based checkout modal, a separate setup-mode PaymentElement, a setup-intent API route, and an admin-only invoice route. That is starter code, not a verified payment flow:

- Checkout currently switches between `CheckoutElement` and `ExpressCheckoutElement`; it does not show both together, and there is no `BrandingElement` in the plan checkout surface. Branding is present only in the separate card-save form.
- The setup form appears only after a local checkout callback. The saved `payment_method_id` is returned to the browser and displayed as a success message, but is not persisted against a job/customer for invoice use.
- The invoice handler does not send Whop's required `collection_method`. For `charge_automatically`, Whop also documents a required `payment_token_id`. The handler currently accepts a payment method ID from the request but does not collect or validate that token.
- The invoice route has no contractor-facing admin UI; its bearer secret must never be sent to a visitor/browser.
- The business ID and three plan IDs are blank. The CLI login is authenticated, but the account currently has no Whop business, so there are no real plans or live checkout credentials to test against.
- The code offers Apple Pay and Google Pay only when available. It cannot grant financing approval or guarantee a financing method to a buyer.

## Implementation sequence

### 1. Connect the real Whop business

Before checkout testing, select/create the roofing business in Whop, finish business and payout onboarding, and confirm the account can accept the intended payments. Create the real one-time $149 inspection plan, $500 deposit plan, and agreed flat-rate service plan. Put their IDs, business-owned product ID, and public `biz_...` ID in the template configuration; Whop provides `WHOP_ACCOUNT_ID` and `WHOP_API_KEY` to the server runtime, so do not create app secrets for those reserved runtime values. Keep any additional credential (such as the admin-only invoice secret) in protected app secrets, never in client code. Verify the actual domain and wallet domain requirements.

**Exit condition:** configured `biz_`, product, and three `plan_` IDs belong to that business; each plan is one-time and shows its expected amount in Whop.

### 2. Finish the Whop checkout surface

Use Whop's prebuilt Elements only. Implement the plan checkout with the standard checkout/payment element, express wallet element, and the required Whop branding element in the composition supported by the current Elements API. Keep PayPal disabled if the template is specifically presenting Apple Pay and Google Pay. Remove the current mutually exclusive wallet/full-checkout toggle if the supported layout allows both the express buttons and standard payment options in the same checkout.

Keep the card data entirely in Whop Elements. Route plan selection from the configured plan IDs; do not accept a price from the browser. Handle success, cancellation, decline, and any required next action distinctly. Do not treat a client-side completion callback alone as durable proof of a payment; reconcile completion through Whop's supported server confirmation/webhook path before marking a job paid.

**Exit condition:** all three real plans open Whop Elements; Apple Pay/Google Pay render where Whop and the browser/domain allow them; successful and failed test outcomes are handled correctly; BrandingElement is mounted as required by the selected payment surface.

### 3. Save a payment method as part of the deposit flow

The intended outcome is a paid $500 deposit and a payment method the homeowner has explicitly agreed can be used for the final balance. Use Whop's supported `setupFutureUsage: "off_session"` path for a payment Elements charge if it produces the required reusable payment method for this use case. If Whop requires a separate setup intent, collect/confirm it immediately in the deposit flow with clear consent, then finish any required `handleNextAction` step and confirm the setup intent reached a successful state.

Persist only the identifiers and job/customer association needed to invoice, server-side. The present browser-only `depositPaid` flag and returned payment-method ID do not survive a page reload or provide a trustworthy job record. Prefer the smallest existing Whop-backed storage/webhook path available in the account; do not put payment identifiers or admin credentials in local storage or a public request. Confirm whether Whop's setup-intent response yields the identifiers required by invoice auto-collection before implementing automatic charges.

**Exit condition:** a completed deposit is linked to the right job/customer; the setup/payment method is confirmed reusable for off-session billing; consent and account records are available for the contractor.

### 4. Correct the final-balance invoice flow

Keep invoice creation contractor-only. Default to `send_invoice` for the safer manual-pay path: create the invoice with Whop's required invoice/product/plan details, `collection_method: "send_invoice"`, customer identity, line items, and due date; then show the returned Whop invoice/payment URL to the contractor so it can be sent to the customer.

Offer `charge_automatically` only when the homeowner gave clear authorization and the server has the exact valid stored-method and payment-token values Whop requires. Validate the final balance server-side in integer cents, prevent zero/negative values, and ensure invoice line-item totals match the invoiced plan total. Never let a public visitor choose an arbitrary amount or invoke the admin endpoint. Return a safe invoice summary, not secrets.

**Exit condition:** create one manual final-balance invoice and verify its Whop pay URL; separately verify authorized auto-charge only if the account/API returns the required saved-method and payment-token values.

### 5. Financing, tracking, and proof

Apply for financing in the Whop dashboard. Whop documents financing as appearing automatically at checkout after merchant approval when the method and buyer are eligible; no front-end flag can force it on. Verify eligible options on the actual merchant account and the actual checkout amounts. Keep site wording conditional and avoid promising a particular lender or approval.

Verify `estimate_requested`, `service_viewed`, and `deposit_started` in the Whop pixel dashboard; preserve the existing custom event names. Whop-hosted sites install the pixel and track page views/checkout activity automatically.

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
