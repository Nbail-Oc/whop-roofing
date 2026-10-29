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

Edit `website/src/site-config.ts` with real business information and three one-time plan IDs. The estimate API accepts optional `user_id` and `product_id` (Whop's Leads API allows both to be null); it records the homeowner's supplied contact details in lead metadata, so the public form does not ask visitors to invent a Whop user ID. Whop injects `WHOP_ACCOUNT_ID` and server API credentials into the hosted runtime; do not create secrets with those reserved names. Add `WHOP_INVOICE_ADMIN_SECRET` through `whop apps secrets set --app app_8YZgDz7emvrsE0` as a protected app secret. The contractor invoice page is `/admin/invoices`; it keeps the key in memory and uses the manual `send_invoice` flow. If `invoiceProductId` is blank, the API creates an inline product for each invoice.

The local template has not been configured with the inspection, deposit, or flat-rate plan IDs, so checkout is not ready to charge. The merchant's payment onboarding and financing eligibility, lead creation, setup intent, and final invoice still require account-level testing. Sandbox access is account-gated in Whop's current Elements docs.
