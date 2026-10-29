# Roofing website template plan

## Design direction

Keep the supplied Boomerang reference's editorial feel: P22 Mackinac serif display type, Inter interface type, pure white background, charcoal controls, light gray surfaces, fine rules, and architectural motion in the hero. The first viewport is a complete brand moment with a full-bleed roof video and a bottom anchored overview panel. Added sections use generous whitespace and typography instead of a generic card-heavy contractor theme.

The current demo brand is **Boomerang Roofing**. Its Denver service area and 303-555 phone are sample values, and the supplied Gmail address is configured as the contact email. The trust section uses general process copy rather than fabricated reviews, licenses, insurance, or warranty claims. Before a roofer adopts the template, replace the demo name, contact details, service area, and sample prices with verified business information.

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
4. **Estimate lead:** the form posts to the server, which sends `POST /api/v1/leads` with the account, configured roofing product, referrer and contact fields in metadata. Although the API schema marks `user_id` nullable, the live API returned `user_id is required` when this site sent null. Add Whop OAuth and pass the authenticated visitor's actual ID before calling the Leads API; do not ask visitors to type an ID.
5. **Pixel events:** `service_viewed` fires once when a service enters view, `deposit_started` fires on the deposit CTA, and `estimate_requested` fires only after the server confirms lead creation. Whop automatically handles website page views and checkout events.

## Configuration and data ownership

- **Company-specific copy, phone/email, area, testimonials, prices, product and plan IDs:** `website/src/site-config.ts`.
- **Company API credential:** Whop supplies server API credentials in the hosted runtime. Do not add them to client code or commit them.
- **Whop company ID:** Whop injects `WHOP_ACCOUNT_ID` into the server runtime; it is reserved, so do not create an app secret with that name. Set the public `biz_...` identifier in `site.accountId` for browser Elements. It is an account identifier, not a credential.
- **Lead product ID:** the current demo points `site.leadProductId` to the roofing product on the connected account. It is optional in the Leads API.
- **Plans:** the connected demo account has real one-time variants at $149, $500, and $299; IDs are configured in the site. Replace them when adapting this template for another account.
- **Invoice product:** optionally set `site.invoiceProductId` to one existing product to reuse on every final invoice; when blank, the API creates the product inline.
- **Final invoice tool:** set `WHOP_INVOICE_ADMIN_SECRET` as a Whop app secret. The `/admin/invoices` page accepts it at runtime and sends it only in the authorization header to the server route. The route creates a manual Whop invoice and returns its payment URL.

## Known launch gates

- Merchant payment onboarding is incomplete; verify account eligibility before taking real payments or promising financing.
- Anonymous Lead submission currently fails because the live API requires `user_id`; add and verify visitor OAuth before launch.
- The Whop account/payment environment is not yet verified for the US roofing use case.
- Whop Elements sandbox is documented as not generally available. A completed sandbox charge cannot be honestly claimed until Whop enables sandbox for this account. Production checkout or real charges must not be used as a substitute test without the business owner's explicit acceptance.
- Whop's current website hosting quickstart refers to `*.whop.site` domains. A whop.app URL is not promised by the CLI documentation.
- Checkout wallet buttons require a verified payment-method domain; availability is also merchant/device dependent.

## Pitch / recording checklist

Show the live Whop-hosted URL, complete an authorized test checkout with the Whop elements visible, submit an estimate and verify the Lead in the Whop account, create a final-balance invoice and show its Whop payment URL or successful authorized auto-charge, and verify the three custom pixel events. Record the account/business used and redact buyer personal information from the screen recording.
