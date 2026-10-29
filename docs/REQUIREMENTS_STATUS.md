# Requirements status

Statuses reflect what is implemented and verifiable as of 2026-10-29. `done` means the requirement is fulfilled in the source or deliverable. A Whop-hosted result is marked `not done` unless it was actually deployed or verified in the connected Whop account.

## Website and plans

| Requirement | Status |
| --- | --- |
| Build and deploy a Whop Website with Whop CLI or Whop AI | not done |
| Provide a live `whop.app` URL | not done |
| Include repair, replacement, inspection, service area, financing, trust/reviews, and contact sections | done |
| Set the service area to USA | done |
| Create real Whop one-time plans for the $149 inspection, $500 deposit, and one flat-rate service | not done |
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
| Submit estimate requests as Leads on the connected Whop account | not done |
| Create a Whop setup intent to save a method after the deposit checkout | done |
| Create the final Whop invoice for manual payment or auto-charge | done |
| Complete and verify the deposit → saved method → final invoice flow in Whop | not done |
| Call `whop.track` for `estimate_requested`, `service_viewed`, and `deposit_started` | done |
| Verify all three custom events in Whop tracking | not done |
| Rely on Whop's automatic page-view and checkout tracking on the live site | not done |

## Submission items

| Requirement | Status |
| --- | --- |
| Include the source code in a ZIP archive | done |
| Provide a live URL | not done |
| Record the 3–5 minute end-to-end demo | not done |
| Provide a paragraph listing implemented Whop features | done |

## Whop feature summary

The source integrates Whop's hosted checkout and Apple Pay/Google Pay Elements, a post-deposit setup-intent flow for saving a payment method, protected server routes for estimate Leads and final-balance invoices, and custom pixel events for estimate requests, service views, and deposit starts. The Whop business, live plans, Lead submission, checkout, invoice, and event verification are not complete because the authenticated CLI account currently has no business account selected or created.
