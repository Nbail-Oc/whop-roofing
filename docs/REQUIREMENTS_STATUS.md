# Requirements status

Statuses reflect what is implemented and verifiable as of 2026-10-29. `done` means the requirement is fulfilled in the source or deliverable. A Whop-hosted result is marked `not done` unless it was actually deployed or verified in the connected Whop account.

## Website and plans

| Requirement | Status |
| --- | --- |
| Build and deploy a Whop Website with Whop CLI or Whop AI | done |
| Provide a live `whop.app` URL | not done |
| Deploy at the live domain supported by the Whop Website CLI (`whop.site`) | done |
| Include repair, replacement, inspection, service area, financing, trust/reviews, and contact sections | done |
| Set the service area to USA | done |
| Create real Whop one-time plans for the $149 inspection, $500 deposit, and one flat-rate service | done |
| Keep company copy, service content, and prices reusable through configuration | done |
| Use original code rather than a cloned marketplace theme | done |
| Implement responsive layouts for mobile and desktop | done |

## Whop integrations

| Requirement | Status |
| --- | --- |
| Use Whop Payment Elements with `CheckoutElement`, `ExpressCheckoutElement` for Apple Pay/Google Pay, and `BrandingElement` | done |
| Keep card entry hosted by Whop; do not use Stripe, PayPal, or custom card fields | done |
| Disable PayPal in the Express Checkout configuration | done |
| Surface financing options for eligible approved merchants | not done |
| Complete a sandbox checkout using Whop Elements and BrandingElement | not done |
| Use a temporary hardcoded business-owner user ID for demo Leads submissions | done |
| Implement estimate submission to the Whop Leads API using the temporary MVP owner user ID | done |
| Confirm the Leads API accepted a website estimate and returned a Lead ID | done |
| Visually verify the Lead row in the connected Whop dashboard | not done |
| Create a Whop setup intent to save a method after the deposit checkout | done |
| Create the final Whop invoice for manual payment or auto-charge | done |
| Send the invoice to the customer using Whop's invoice email action | done |
| Verify Whop delivered a final invoice email to a real customer | not done |
| Configure `WHOP_INVOICE_ADMIN_SECRET` so `/admin/invoices` can call the invoice API | done |
| Complete and verify the deposit → saved method → final invoice flow in Whop | not done |
| Call `whop.track` for `estimate_requested`, `service_viewed`, and `deposit_started` | done |
| Verify all three custom events in Whop tracking | not done |
| Rely on Whop's automatic page-view and checkout tracking on the live site | not done |

## Submission items

| Requirement | Status |
| --- | --- |
| Provide the source code in a GitHub repository or ZIP | done |
| Provide a live Whop-hosted URL (`whop.site`) | done |
| Push the source code to the requested GitHub repository | done |
| Record the 3–5 minute end-to-end demo | not done |
| Provide a paragraph listing implemented Whop features | done |

## Whop feature summary

The live Whop Website is [boomerang-roofing.whop.site](https://boomerang-roofing.whop.site) (app `app_8YZgDz7emvrsE0`). The CLI quickstart documents `whop.site` or a custom domain, not a `whop.app` hostname. Real one-time Whop plans are configured for the $149 roof inspection (`plan_OSx3AsLPE0dFZ`), $500 deposit (`plan_icqTxoMo6e35c`), and $299 leak repair visit (`plan_KIjflGrjbykJC`). Source includes Whop Elements checkout with Apple Pay/Google Pay Express Checkout, a post-deposit setup-intent flow with customer consent and server status verification, a contractor-only invoice tool, MVP estimate Lead submission attributed to the site owner's Whop user ID, and the three custom pixel events. `WHOP_INVOICE_ADMIN_SECRET` is configured as an encrypted Whop app secret. The checkout currently targets production, not sandbox; Whop's current sandbox guide requires a separate sandbox business, API key, and plans. A production estimate test was accepted by Whop and returned Lead ID `lead_f8bE9ZQhhwkr7`; visual confirmation in the dashboard is pending. The customer's email is stored in Lead metadata; the estimate flow does not send a confirmation or notification email. No checkout, setup intent, invoice email, financing approval, or pixel event has been verified end-to-end in the account. Automatic invoice charges are not included; the implemented route creates a manual invoice and then calls Whop's versioned `POST /invoices/{pay_id}/send` action. It records the deposit payment ID in invoice metadata and matches the customer email to the paid deposit.

The Leads API's `user_id` is a Whop user identifier (`user_…`), never an email address. The public API schema calls it nullable, but a prior live anonymous request returned `user_id is required`. For this MVP, the form sends the site owner's Whop user ID (`user_EdlbQktpqyGJu`) so it does not require each homeowner to sign in. All Leads are therefore associated with the owner; homeowner contact details remain in Lead metadata. Replace this owner ID with a supported visitor identity or CRM flow before treating this as a production roofing lead system. Lead creation and appearance in the dashboard still need end-to-end verification.

The manual invoice endpoint checks the completed deposit's plan, business, and buyer email before creating an invoice. It then uses Whop's invoice `send` action, which issues the draft and emails its recipients; the site's success state only says it was sent after that action succeeds. Card-on-file setup remains separate and is not charged by this manual invoice. The Whop account currently lists zero paid payments and zero invoices, so invoice creation and email delivery still need a valid completed deposit before end-to-end verification.
