# Whop roofing website template

This repository contains a reusable, editorial-style roofing website built with React, TypeScript, Vite, TanStack Start, Tailwind CSS, Lucide React, and Whop's Elements/CLI. The landing page adapts the Boomerang design reference to a roofing business and includes estimate leads, Whop checkout entry points, card setup, and final invoice APIs.

## Project

- Website source: [`website/`](website/)
- Requirements supplied for the build: [`instructions.md`](instructions.md)
- Requirement completion tracker: [`docs/REQUIREMENTS_STATUS.md`](docs/REQUIREMENTS_STATUS.md)
- Section map, Whop data flow and launch dependencies: [`docs/ROOFING_TEMPLATE_PLAN.md`](docs/ROOFING_TEMPLATE_PLAN.md)
- Whop CLI reference for future chats: [`docs/WHOP_CLI_PLAYBOOK.md`](docs/WHOP_CLI_PLAYBOOK.md)

## Run locally

```powershell
cd .\website
npm.cmd install
npm.cmd run dev
```

Use `npm.cmd` / `npx.cmd` in this Windows PowerShell environment because PowerShell blocks the `.ps1` launchers. Run `npm.cmd run build` for the production build and `npx.cmd tsc --noEmit` for a type check.

## Whop setup still needed

Edit `website/src/site-config.ts` with the real business information, Whop business ID, product ID and three one-time plan IDs. Configure the final-invoice admin secret with Whop's app-secret command. Then use `npx.cmd --yes @whop/cli apps init --app_type website ...`, `npx.cmd --yes @whop/cli apps dev`, and `npx.cmd --yes @whop/cli apps deploy` from the website directory. The deployment must be linked to a real Whop business.

The current Whop login is authenticated but has no business account selected or available, so this repo does not yet have real Whop products, a registered website app, or a live Whop domain. Do not treat the blank plan IDs as usable checkout. Sandbox access is also account-gated in Whop's current Elements docs.
