# Whop CLI playbook for AI coding agents

Checked against Whop's official documentation on 2026-10-29. This is a working guide for using the CLI from a fresh coding chat. Whop's docs change; check the linked pages and `whop <command> --help` before relying on a flag.

## What Whop CLI is

The Whop CLI is a terminal interface to Whop's API and app hosting. It can create or manage Whop business resources, scaffold app source code, run a local development server, and deploy website builds to Whop hosting. It is a code-first workflow for a Whop-hosted website.

It is not the Whop AI website builder UI. In the dashboard, Whop AI can build a site from a prompt. With the CLI, an AI coding agent edits the local project and uses Whop CLI commands to connect it to a Whop business and deploy it. The final website is still hosted by Whop.

For public websites, use `app_type=website`. Whop documents the default website domain as `name.whop.site`. A `b2c_app` is a different app type that businesses can install into their Whop. The app type is permanent after creation.

## Important distinction: CLI, MCP, and Whop Skills

Whop documents two hosted MCP servers. They are optional agent integrations and are separate from the local Whop CLI.

| Tool | What it does | URL |
| --- | --- | --- |
| Whop Docs MCP | Lets an AI agent search and read Whop's documentation | `https://docs.whop.com/mcp` |
| Whop MCP | Lets an AI agent call a reviewed subset of the live Whop API | `https://mcp.whop.com/mcp` |
| Whop CLI | Scaffolds, runs, and deploys the local website, and exposes Whop business commands | Installed as `whop` or invoked in PowerShell with `npx.cmd @whop/cli` |
| `whop skills` | Syncs Whop's agent instructions and payment/app/ads playbooks into a supported coding agent | CLI subcommand |

The Whop MCP servers authenticate through a browser. Their setup is a server URL, not an API key pasted into an agent config. The account MCP connection is granted to the user, and business context is selected per operation. Consequential actions use a prepare and confirm flow with a confirmation token and stable idempotency key. Check the action and its effects before confirming it.

Whop's CLI agent mode is not a separate `agent` command. It consists of `whop skills`, machine-readable output flags such as `--schema`, `--llms`, and `--format`, and the usual CLI commands. The official guide says to use the CLI for local project operations such as scaffolding, running, and deploying.

## Production safety

Treat the CLI as a production control surface. Whop's CLI documentation says there is no sandbox, test, or dry-run mode: commands act on production, and some commands create resources or move money. `whop apps init` registers an app and claims or assigns its domain. `whop apps deploy` promotes the build to production unless `--preview` is supplied. Preview still uploads a build to Whop, but does not promote it.

For any new chat:

- Inspect `whop auth status` and the selected account before making account changes.
- Use `whop <group> --help` or `whop <command> --schema` before an unfamiliar command.
- Do not create products, prices, plans, invoices, payment links, or other live resources until the intended Whop business and exact values are clear.
- Do not put API keys in source code, browser JavaScript, chat messages, or committed files. Use OAuth login or Whop's protected app secrets.
- Treat deploys, promotions, domain purchases, invoice creation, and money movement as consequential production actions.
- `--preview` means a non-promoted build, not a sandbox account or test payment environment.

## Windows setup and first checks

This repository's current machine is Windows PowerShell. The plain `npm` and `npx` commands resolve to PowerShell script launchers (`npm.ps1` and `npx.ps1`), and this machine's execution policy blocks those scripts. Use the Windows command launchers, `npm.cmd` and `npx.cmd`, instead. This does not mean Node.js or npm is missing, and you do not need to loosen PowerShell's execution policy to use the Whop CLI.

At the last check, Node.js 24 and `npx.cmd @whop/cli` worked. Verify versions when starting a later chat:

```powershell
node --version
npx.cmd --yes @whop/cli --version
npx.cmd --yes @whop/cli auth status
```

Sign in using the browser-based Whop OAuth flow and choose the correct business when prompted:

```powershell
npx.cmd --yes @whop/cli login --method oauth
npx.cmd --yes @whop/cli quickstart
```

Never paste an API key into this repository. If a task needs non-interactive authentication, use Whop's documented secret handling and account permissions, and keep the key out of shell history and logs.

To inspect the CLI without changing Whop account data:

```powershell
npx.cmd --yes @whop/cli --help
npx.cmd --yes @whop/cli --llms
npx.cmd --yes @whop/cli apps init --help
npx.cmd --yes @whop/cli apps deploy --help
npx.cmd --yes @whop/cli skills --help
```

`--llms-full` prints the larger machine-readable command manifest. `--schema` prints a command's argument schema. The command help is the source of truth for flags supported by the installed CLI version.

## Website workflow

Whop's CLI website quickstart describes this lifecycle:

1. Sign in and select the business.
2. Create a website app, domain, and local scaffold.
3. Run the scaffold through Whop's local runtime.
4. Build and deploy a preview or production build.
5. Review logs and confirm the live URL.

The documented new-project shape is:

```powershell
npx.cmd --yes @whop/cli apps init --app_type website --name "Movie Website" --domain movie-site --dir .\movie-website
Set-Location .\movie-website
npx.cmd --yes @whop/cli apps dev
```

Names and directories can differ based on the CLI's output. `apps init` creates Whop resources and writes `whop.app.json` to link the project. Check the domain availability and app selection before running it. The current Whop guide describes `movie-site.whop.site` as the default style of address.

The scaffold uses TanStack Start with Vite and the Whop Vite plugin. It includes Whop deploy and typecheck scripts and the `whop.app.json` app link. Whop's hosting build layout expects static files in `dist/client` and server code in `dist/server` when using its Vite plugin.

Develop and review locally, then use a preview upload before a production promotion:

```powershell
npx.cmd --yes @whop/cli apps deploy --preview
```

After inspecting the preview build and getting the live deployment request in the active task, deploy with:

```powershell
npx.cmd --yes @whop/cli apps deploy
```

Each deploy produces a build. Promote a prior build to roll back:

```powershell
npx.cmd --yes @whop/cli apps builds promote abld_xxxxxxxx
```

Useful follow-up commands:

```powershell
npx.cmd --yes @whop/cli apps logs --level error
npx.cmd --yes @whop/cli apps pull --app app_xxxxxxxx
npx.cmd --yes @whop/cli domains get movie-site.whop.site
```

`apps dev` injects the local runtime variables and a short-lived Whop API credential for server-side API requests. Hosted apps receive app secrets as protected environment variables. Only server-side requests receive the injected key. Browser requests should call the app's own server route instead of exposing a credential to visitors.

## Starting from an existing Whop website or blueprint

If a Whop website already exists, `apps pull` can download its published source archive. If the project is already linked locally, the CLI can merge deployed source updates; use `--overwrite` only when intentionally replacing local code.

Blueprints are working Whop businesses with products, pricing, and a website. Deploying one creates a copy in the account. To customize its code, Whop documents:

```powershell
npx.cmd --yes @whop/cli apps init --template app_xxxxxxxx --name "Movie Website" --domain movie-site
```

That command creates a new app from the blueprint's published source. It has production account effects, so inspect the blueprint, business, and domain first. Do not clone a blueprint marketplace theme if the project requires original design and code.

## Whop API and website integration notes

- Use Whop Payment Elements or a Whop checkout URL for payments. Do not build or store card forms yourself.
- Keep Whop API calls in server routes. The hosted runtime injects `WHOP_API_ORIGIN`, account/app context, and an API key for server-side requests; do not bundle secrets into client code.
- The Whop website pixel is installed automatically on Whop-hosted websites. Page views and Whop checkout events are automatic. Add `window.whop.track("event_name", data)` for custom business events, and fire it after the action succeeds.
- Use Whop's current Elements and API docs for product checkout, leads, invoices, payment methods, setup intents, or other billing flows. The CLI is not a substitute for those API references.
- Financing and available payment methods depend on the Whop business, payment configuration, customer, and merchant eligibility. Never promise a method will appear before verifying it in that business's checkout.
- A CLI preview build is not the same thing as a test payment or sandbox business. Consult Whop's sandbox/payment docs and account eligibility before promising end-to-end test charges.

For a movie-related website, first determine what "movie website" means before building. It could be a film studio or filmmaker portfolio, a cinema or screening ticket site, a movie discovery site, or a streaming/community membership. Each has different pages, products, payment plans, and potentially different Whop policy and account requirements. Do not invent movie titles, rights, schedules, reviews, or availability.

## Source documentation

These are the primary Whop references used to write this playbook:

- [AI and MCP](https://docs.whop.com/developer/guides/ai_and_mcp)
- [Whop CLI overview](https://docs.whop.com/cli/overview)
- [Whop CLI agent mode](https://docs.whop.com/cli/agent-mode)
- [Build a website with the CLI](https://docs.whop.com/developer/websites/quickstart)
- [Whop website hosting](https://docs.whop.com/developer/websites/hosting)
- [Whop website blueprints](https://docs.whop.com/developer/websites/blueprints)
- [Track website visitors](https://docs.whop.com/developer/websites/tracking)
- [Whop documentation index](https://docs.whop.com/llms.txt)
- [Developer documentation index](https://docs.whop.com/_llms/for-developers.txt)

Whop's public index lists more than 1,000 developer pages across many products and API surfaces. This playbook maps the pages relevant to using the CLI and publishing a website; it is not a copy or line-by-line review of every Whop API endpoint. Read the current product-specific reference before implementing a feature.

## Prompt for the new movie-website chat

Paste this into a new chat opened in this repository:

> Read `README.md` and `docs/WHOP_CLI_PLAYBOOK.md` first. Build a movie-related website as a Whop `website` using the Whop CLI, not a site hosted elsewhere. Start by clarifying what kind of movie website I mean and the real business details, then inspect the current Whop CLI version, login status, selected business, and available Whop documentation. Use Whop's `whop skills` guidance where supported. Keep API credentials out of source and browser code. Before any CLI command that creates or changes Whop resources, explain its exact effect and confirm the target business/domain from the active instructions. Build the local site and preview it first. Do not create live products, charges, invoices, or publish a production build unless I explicitly request that step. Use Whop payments and checkout only; verify the current official docs for each API or element you use. Cite any changed Whop API assumptions in the project docs. Make the source reusable, responsive, and original.

