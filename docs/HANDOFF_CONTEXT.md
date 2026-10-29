# Whop roofing website — handoff context

Last updated: 2026-10-29

This note is for continuing the work in a new conversation. It separates code that exists from behavior that has actually been verified in Whop. The user's report is that the end-to-end result is not working: email sending, lead generation, sandbox payment, and invoice completion are not satisfactory. Do not present an implemented endpoint as proof that its Whop workflow succeeded.

## Project and websites

- Repository: `https://github.com/Nbail-Oc/whop-roofing.git` (local checkout is the current workspace).
- Main source project: `website/`.
- Production Whop Website: [https://boomerang-roofing.whop.site/](https://boomerang-roofing.whop.site/), Whop app `app_8YZgDz7emvrsE0`.
- The requested `whop.app` URL was not obtained. The deployed address is `whop.site`.
- No separate sandbox website/app has been created or deployed.
- ZIP snapshots present at the repository root: `roofing-whop-template.zip`, `roofing-whop-template-current.zip`, and `roofing-whop-template-updated.zip`.

## What is in the code

The site is a responsive roofing landing page built with React, TypeScript, TanStack Start, Vite, Tailwind CSS, Lucide React, Whop Elements, and the Whop CLI. Its sections include services, process, pricing, service area, trust/reviews, financing copy, and contact/estimate form. The visual direction adapts the Boomerang reference supplied by the user. The Whop business, product, and plan IDs are currently hard-coded in `website/src/site-config.ts` for the production demo account.

Useful source files:

- `website/src/site-config.ts` — business/user/product/plan IDs and roofing copy/prices.
- `website/src/routes/index.tsx` — landing page, estimate form, Whop checkout Elements, setup-intent UI, and `whop.track` calls.
- `website/src/routes/api.estimate.ts` — server-side Whop Leads API request.
- `website/src/routes/api.payment-status.ts` — verifies a deposit payment through Whop.
- `website/src/routes/api.setup-intent.ts` and `api.setup-intent.status.ts` — save and check a payment method using a setup intent.
- `website/src/routes/admin.invoices.tsx` — contractor invoice form at `/admin/invoices`.
- `website/src/routes/api.admin.final-invoice.ts` — checks a paid deposit, creates a manual Whop invoice, then calls the invoice send action.
- `website/src/server/whop.ts` — server-side Whop API request helper.
- `website/whop.app.json` — production app ID/name.
- `instructions.md` — original user-provided requirements.

## Critical status: implementation versus verified outcome

The following are the three core requirements and the current factual state:

| Requirement | Code present | End-to-end verified / satisfactory |
| --- | --- | --- |
| Email sending | The estimate form does not send email. The invoice endpoint calls Whop's invoice `send` action, which is intended to email an invoice. | **Not verified.** No delivered estimate email or invoice email has been confirmed. User reports the email-sending requirement is not working. |
| Lead generation | The form posts to `/api/estimate`, which calls Whop `POST /leads`. It sends the site owner's Whop user ID (`user_EdlbQktpqyGJu`) as `user_id`; the customer's email is contact metadata, not an identity. | **Not satisfactorily verified.** Project docs record one API response with Lead ID `lead_f8bE9ZQhhwkr7`, but dashboard visibility and the user's intended lead workflow were not confirmed. User reports lead generation is not working/satisfactory. Recheck in the sandbox business and its dashboard. |
| Sandbox payment and invoice | Production checkout Elements, setup-intent, deposit validation, and a manual invoice route exist in source. | **Not done.** No successful sandbox checkout, setup intent, sandbox invoice, or invoice email has been demonstrated. No sandbox app has been created/deployed. |

Other limitations:

- Checkout Elements use production plans today. A completed production checkout can charge real money; it is not a sandbox checkout.
- The source uses `CheckoutElement` or `ExpressCheckoutElement` for checkout and `PaymentElement` plus `BrandingElement` for setup mode. Apple Pay, Google Pay, and financing availability depends on merchant/account approval, plan, buyer, and device eligibility.
- The invoice flow is **manual payment**, not automatic charge of the saved method. The current invoice route validates a completed $500 deposit and matching buyer email. A real valid deposit is required for that validation.
- The production account was previously checked and had zero paid payments and zero invoices. No valid completed $500 deposit payment ID is known.
- The estimate form attributes each MVP Lead to the configured site-owner Whop user. It does not create a separate Whop identity for the homeowner and does not send an estimate email.
- The three custom event calls exist in source: `estimate_requested`, `service_viewed`, and `deposit_started`. Their visibility in Whop tracking has not been verified.
- A prior status tracker marks several API operations `done` because code was implemented or a request returned success. For any new work, distinguish code presence from successful account-level verification; the user reports the overall outcomes are not satisfactory.

## Whop accounts and sandbox attempt

Production CLI profile last observed:

- Profile: `thangenabil`
- Production business: `biz_i7AWdtROMztPLW`
- Production Whop user: `user_EdlbQktpqyGJu`
- Email shown by CLI: `thangenabil@gmail.com`

The user has since provided an open sandbox dashboard URL with business ID `biz_lcNvhB56gYcGYV` and says they are signed in there. This ID comes from the user's browser URL; it has **not** been independently queried or confirmed by the CLI.

The CLI still listed only the production profile at the last check. A sandbox OAuth login was attempted against `https://sandbox-api.whop.com/api/v1` and timed out without adding a profile. Codex browser automation reported: `Local browser use is disabled in Work settings`, so the sandbox dashboard could not be inspected or operated. No sandbox API key was supplied to the CLI, and no sandbox plans were created.

Whop's sandbox guide describes sandbox as a separate account/business/API key/data environment. Sandbox test card documented for a successful payment: `4242 4242 4242 4242` with a future expiry and any CVC. The Elements provider supports `environment="sandbox"`, but the currently installed project is not configured to use it and has no sandbox plan IDs.

## Tooling and development environment

- Windows PowerShell environment. Use `npm.cmd` / `npx.cmd` because the PowerShell `.ps1` launchers were blocked by execution policy.
- Whop CLI package is installed in `website/node_modules` as `@whop/cli`; use `website/node_modules/.bin/whop.cmd` or `npx.cmd @whop/cli`.
- Local commands documented in `README.md`: `npm.cmd install`, `npm.cmd run dev`, `npm.cmd run build`, `npx.cmd tsc --noEmit`.
- Whop CLI was used for app setup/deployment and account checks. The production site is Whop-hosted; it is not hosted on Google or a separate hosting provider.
- Whop Elements are from `@whop/elements` and `@whop/elements-react`.
- Git remote is configured to the repository above. Last observed working tree was clean on `main` tracking `origin/main`.
- No email provider/client integration is configured in the project.

## Repository documentation and external Whop references

Start with these local files:

- `instructions.md` — original build brief and acceptance requirements.
- `docs/REQUIREMENTS_STATUS.md` — requirement checklist; treat its `done` values cautiously and update them only after verification.
- `docs/ROOFING_TEMPLATE_PLAN.md` — sections and intended customer/job/payment flow.
- `docs/PAYMENTS_INTEGRATION_PLAN.md` — payment and invoice implementation notes.
- `docs/WHOP_PAYMENT_LEADS_GUIDE.md` — Leads, checkout, sandbox, setup intent, and invoice notes.
- `docs/WHOP_CLI_PLAYBOOK.md` — CLI, hosting, and Windows npm note.

Whop references reviewed or recorded in those local docs during prior work:

- [AI and MCP](https://docs.whop.com/developer/guides/ai_and_mcp)
- [Website quickstart](https://docs.whop.com/developer/websites/quickstart), [hosting](https://docs.whop.com/developer/websites/hosting), and [tracking](https://docs.whop.com/developer/websites/tracking)
- [Whop CLI overview](https://docs.whop.com/cli/overview) and [CLI agent mode](https://docs.whop.com/cli/agent-mode)
- [Elements Payments overview](https://docs.whop.com/elements/latest/payments/overview)
- [Create Lead API](https://docs.whop.com/api-reference/leads/create-lead)
- [Create setup intent API](https://docs.whop.com/api-reference/setup-intents/create-setup-intent)
- [Create invoice API](https://docs.whop.com/api-reference/invoices/create-invoice)
- [Create checkout link](https://docs.whop.com/payments/create-checkout-link)
- [Whop sandbox guide](https://whop.com/blog/whop-sandbox/)
- Financing documentation links are listed in `docs/PAYMENTS_INTEGRATION_PLAN.md`; provider availability still requires account approval and live verification.

This is a record of the relevant docs consulted across the previous conversation, not a claim that every Whop documentation page was read.

## Recommended next conversation starting point

1. Read this file, `instructions.md`, and `docs/REQUIREMENTS_STATUS.md`.
2. Keep production untouched. Authenticate the Whop CLI specifically against the sandbox API and confirm the sandbox business ID `biz_lcNvhB56gYcGYV` before creating resources. Do not ask the user to paste an API key into chat; use a private local credential prompt or Whop's supported OAuth flow.
3. Create the required sandbox product/plans and a separate Whop Website/app, configure the Elements provider for sandbox, and deploy the sandbox app separately.
4. Test each acceptance path with sandbox data: payment via Whop Elements including BrandingElement, Lead creation and dashboard visibility, invoice creation/send and email outcome, and pixel events. Record actual IDs/statuses as evidence.
5. Update `docs/REQUIREMENTS_STATUS.md` based on observed results, not code alone. Do not claim success for invoice email or lead dashboard visibility until confirmed.
