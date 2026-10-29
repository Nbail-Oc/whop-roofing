# Whop roofing website template

This repository contains a reusable, editorial-style roofing website built with React, TypeScript, Vite, TanStack Start, Tailwind CSS, Lucide React, and Whop's Elements/CLI. The landing page adapts the Boomerang design reference to a roofing business and includes estimate leads, Whop checkout entry points, card setup, and final invoice APIs.

## Project

- Website source: [`website/`](website/)
- Requirements supplied for the build: [`instructions.md`](instructions.md)
- Requirement completion tracker: [`docs/REQUIREMENTS_STATUS.md`](docs/REQUIREMENTS_STATUS.md)
- Section map, Whop data flow and launch dependencies: [`docs/ROOFING_TEMPLATE_PLAN.md`](docs/ROOFING_TEMPLATE_PLAN.md)
- Payments implementation sequence and account gates: [`docs/PAYMENTS_INTEGRATION_PLAN.md`](docs/PAYMENTS_INTEGRATION_PLAN.md)
- Whop CLI reference for future chats: [`docs/WHOP_CLI_PLAYBOOK.md`](docs/WHOP_CLI_PLAYBOOK.md)

## Run locally

```powershell
cd .\website
npm.cmd install
npm.cmd run dev
```

Use `npm.cmd` / `npx.cmd` in this Windows PowerShell environment because PowerShell blocks the `.ps1` launchers. Run `npm.cmd run build` for the production build and `npx.cmd tsc --noEmit` for a type check.

## Whop setup still needed

The site is deployed at [boomerang-roofing.whop.site](https://boomerang-roofing.whop.site) (Whop app `app_8YZgDz7emvrsE0`). Whop's current Website CLI publishes to a `whop.site` subdomain or a connected custom domain; the CLI did not provide a `whop.app` domain.

The hosted site is configured to the connected demo business and its three one-time plans. For another roofer, replace the business/product/plan IDs and copy in `website/src/site-config.ts`. The estimate form records contact details in Whop Lead metadata and associates the lead with the roofing product; it does not ask homeowners to invent a Whop user ID. Whop injects `WHOP_ACCOUNT_ID` and server API credentials into the hosted runtime; do not create secrets with those reserved names. Add `WHOP_INVOICE_ADMIN_SECRET` through `whop apps secrets set --app app_8YZgDz7emvrsE0` as a protected app secret. The contractor invoice page is `/admin/invoices`; it keeps the key in memory and uses the manual `send_invoice` flow. If `invoiceProductId` is blank, the API creates an inline product for each invoice.

The inspection, deposit, and flat-rate plan IDs are configured, and the checkout warning in the screenshot is fixed. Complete merchant payment onboarding and test checkout, Lead creation, setup intent, final invoice, and financing eligibility before using this demo for real customers. Sandbox access is account-gated in Whop's current Elements docs.
