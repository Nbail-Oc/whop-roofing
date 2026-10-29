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
| Implement estimate submission to the Whop Leads API using an authenticated visitor identity | not done |
| Verify a submitted estimate appears as a Lead in the connected Whop account | not done |
| Create a Whop setup intent to save a method after the deposit checkout | done |
| Create the final Whop invoice for manual payment or auto-charge | done |
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

The live Whop Website is [boomerang-roofing.whop.site](https://boomerang-roofing.whop.site) (app `app_8YZgDz7emvrsE0`). The CLI's documented hosted domain is `whop.site`; the requested `whop.app` hostname is not available through this CLI flow. Real one-time Whop plans are configured for the $149 roof inspection (`plan_OSx3AsLPE0dFZ`), $500 project deposit (`plan_icqTxoMo6e35c`), and $299 leak repair visit (`plan_KIjflGrjbykJC`). Source includes Whop Elements checkout with Apple Pay/Google Pay Express Checkout, a post-deposit setup-intent flow with customer consent and server status verification, a contractor-only manual invoice tool using the Whop Invoices API, estimate Lead submission, and the three custom pixel events. Payment onboarding, Leads API result, checkout, setup intent, invoice, financing approval, and pixel-event verification remain account-level gates. Automatic invoice charges are intentionally not included; the implemented invoice collection method is `send_invoice`.

The Leads route temporarily uses the signed-in business owner's Whop user ID (`user_EdlbQktpqyGJu`) so demo submissions can pass a non-null identity. Every submission is therefore attributed to the owner, not the actual homeowner. Replace it with visitor OAuth before using the form with real prospects; do not mark anonymous/customer Leads verified until a successful test appears in the account.
