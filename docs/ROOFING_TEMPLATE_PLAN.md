# Roofing website template plan

## Design direction

Keep the supplied Boomerang reference's editorial feel: P22 Mackinac serif display type, Inter interface type, pure white background, charcoal controls, light gray surfaces, fine rules, and architectural motion in the hero. The first viewport is a complete brand moment with a full-bleed roof video and a bottom anchored overview panel. Added sections use generous whitespace and typography instead of a generic card-heavy contractor theme.

The current demo brand is **Boomerang Roofing**. It is intentionally a replaceable sample name. The page does not claim a real license, warranty, service address, phone number, review, or customer result. Before pitching or publishing for a real roofer, replace every square-bracket prompt and replace the review prompts with approved, verifiable quotes.

## Sections and content

| Section | What visitors see | Source / edit location |
| --- | --- | --- |
| Hero | “A roof built to last,” repair/replacement/inspection intro, estimate CTA, looping architectural video | `website/src/routes/index.tsx`; exact supplied CloudFront video and text in `website/src/site-config.ts` |
| First-screen overview | “Careful work. Lasting protection,” short explanation, three service principles | `website/src/routes/index.tsx` |
| Services | Roof repair, replacement, and inspection descriptions and estimate links | `services` array in `website/src/site-config.ts` |
| Process | Inspect, approve and schedule, complete work and invoice; shows $500 project deposit | `website/src/routes/index.tsx`; deposit price in `plans` |
| Pricing | $149 inspection, $500 project deposit, example $299 leak-repair visit | `plans` in `website/src/site-config.ts`; replace the flat-rate example and define included work |
| Financing | Explains that available checkout methods depend on merchant approval and buyer eligibility | `website/src/routes/index.tsx`; keep legal/approval language current for the roofer |
| Service area | USA, with ZIP-code request | `site.area` in `website/src/site-config.ts` |
| Trust and reviews | Review prompts and empty license/warranty copy prompts | `site.reviewPrompts` and the trust section; replace with real proof before publication |
| Contact / estimate | Name, email, phone, ZIP, requested service, details and contact consent | Form in `website/src/routes/index.tsx`; lead submission handled by `/api/estimate` |

## Whop feature flow

1. **Inspection and service purchase:** each configured `plan_...` ID is mounted in a Whop `Checkout`. The visitor can choose `CheckoutElement` or `ExpressCheckoutElement`; those share an exclusive entry slot in the installed Elements API. Whop owns the payment fields and checkout session. Wallets render only when Whop, the merchant and the verified domain allow them.
2. **Project deposit:** the $500 one-time plan is a Whop checkout. After completion, the server retrieves the payment and checks that the configured deposit plan is paid. The same dialog mounts `Payments` in `mode="setup"` with `PaymentElement` and `BrandingElement`; the homeowner explicitly consents, the setup confirmation token is sent to the server, and the server creates a Whop Setup Intent. The UI follows any `handleNextAction` requirement and checks setup status. The payment-method ID stays server-side/inside Whop.
3. **Final invoice:** the contractor uses `/admin/invoices`. A server endpoint verifies the paid deposit and creates a one-time invoice with `collection_method: "send_invoice"`, a final-balance line item, customer details and a due date. Whop emails the customer and the tool shows the Whop payment URL. Automatic charging is not implemented in this version.
4. **Estimate lead:** the form posts to the server, which sends `POST /api/v1/leads` with the account, configured roofing product, Whop user ID, referrer and contact fields in metadata. The official API requires a Whop `user_id`; the current form exposes this as a setup prerequisite. For a public roofing website, add a supported Whop sign-in/user-resolution flow before removing that field. Never silently create a lead against a made-up user.
5. **Pixel events:** `service_viewed` fires once when a service enters view, `deposit_started` fires on the deposit CTA, and `estimate_requested` fires only after the server confirms lead creation. Whop automatically handles website page views and checkout events.

## Configuration and data ownership

- **Company-specific copy, phone/email, area, testimonials, prices, product and plan IDs:** `website/src/site-config.ts`.
- **Company API credential:** Whop supplies server API credentials in the hosted runtime. Do not add them to client code or commit them.
- **Whop company ID:** Whop injects `WHOP_ACCOUNT_ID` into the server runtime; it is reserved, so do not create an app secret with that name. Set the public `biz_...` identifier in `site.accountId` for browser Elements. It is an account identifier, not a credential.
- **Lead product ID:** set `site.leadProductId` to a real product on the same company account.
- **Plans:** create three real one-time plans on the actual Whop business and copy their `plan_...` IDs into `plans.inspection.id`, `plans.deposit.id`, and `plans.flat.id`. This workspace is not connected to a Whop business yet, so it does not claim these plans have been created.
- **Invoice product:** optionally set `site.invoiceProductId` to one existing product to reuse on every final invoice; when blank, the API creates the product inline.
- **Final invoice tool:** set `WHOP_INVOICE_ADMIN_SECRET` as a Whop app secret. The `/admin/invoices` page accepts it at runtime and sends it only in the authorization header to the server route. The route creates a manual Whop invoice and returns its payment URL.

## Known launch gates

- The signed-in Whop profile currently has no business account. `whop apps init`, real plans, domain assignment and deployment need a selected Whop business, so there is no truthful live Whop URL yet.
- The Leads API documents `user_id` as part of the create payload. The public customer identity resolution path must be completed and tested with the target Whop account.
- Whop Elements sandbox is documented as not generally available. A completed sandbox charge cannot be honestly claimed until Whop enables sandbox for this account. Production checkout or real charges must not be used as a substitute test without the business owner's explicit acceptance.
- Whop's current website hosting quickstart refers to `*.whop.site` domains. A whop.app URL is not promised by the CLI documentation.
- Checkout wallet buttons require a verified payment-method domain; availability is also merchant/device dependent.

## Pitch / recording checklist

Once the company account is available: show the live Whop-hosted URL, complete an authorized test checkout with the Whop elements visible, submit an estimate and verify the Lead in the Whop account, create a final-balance invoice and show its Whop payment URL or successful authorized auto-charge, and verify the three custom pixel events. Record the account/business used and redact buyer personal information from the screen recording.
