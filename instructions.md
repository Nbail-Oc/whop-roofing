Build a production-ready website template for a US roofing company using Whop Websites
Build a production-ready website template for a US roofing company using Whop Websites — deployed live to a whop.app address via Whop AI or the Whop CLI (whop.sh). This template will be used to pitch real roofing businesses, so it must demo Whop end-to-end.

Roofing is a high-ticket vertical. Your template must nail the deposit → job → final invoice flow:

Scaffold and deploy a Whop Website with the CLI or Whop AI. Live whop.app URL required.
Site sections: services (repair, replacement, inspection), service area, financing callout, reviews/trust, contact.
Create real plans: a one-time inspection fee (e.g. $149), a project deposit (e.g. $500), and one flat-rate service.
Checkout must use Whop Payment Elements: CheckoutElement (or PaymentElement) + ExpressCheckoutElement (Apple Pay / Google Pay) + the required BrandingElement. No custom card forms — checkout runs entirely on Whop so financing options (Klarna, Splitit, Afterpay, etc.) surface automatically for approved merchants.
"Request an Estimate" form wired to the Whop Leads API — quote requests must land as leads on the account.
Card-on-file via a setup intent at deposit checkout, then show how the final balance is billed with the Whop Invoices API (auto-charge the stored method or send for manual payment).
Fire custom pixel events with whop.track: estimate_requested, service_viewed, deposit_started. Page views and checkout events are automatic on whop.app.

Docs: docs.whop.com/developer/websites/quickstart · docs.whop.com/developer/websites/tracking · docs.whop.com/elements

Requirements:
Must be built on Whop Websites and live at a whop.app URL. Mockups, Figma files, or sites hosted elsewhere will not be accepted.
Whop Payments only — no Stripe, PayPal, or custom card forms.
A test/sandbox checkout must complete successfully using Payment Elements, including BrandingElement.
Estimate form must create a Lead via the Whop API. At least 3 custom whop.track events must fire and be verifiable.
Must include the inspection fee, deposit plan, and one flat-rate service plan.
Original code, cleanly reusable as a template — swapping company name, services, and pricing must not require structural changes.
Responsive on mobile and desktop.
AI-assisted builds are fine; cloned marketplace themes are not.

What to submit:
Live whop.app URL.
Source code (GitHub repo or zip).
3–5 minute screen recording: the live site, a completed test checkout with Payment Elements, the estimate form creating a lead, an invoice created for a final balance, and pixel events firing.
One paragraph listing the Whop features you implemented.