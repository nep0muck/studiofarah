# Working on Studio Farah

Use the existing isolated checkout; do not create a Git worktree unless requested.

## Development

- Use Node.js 24.22.1 and `npm ci`. Its `postinstall` prepares the Vite version required by the locked Astro/Tailwind dependencies. Do not bypass TLS, package integrity checks, or lockfile validation.
- `npm run dev` starts development. `npm run build` also regenerates the PDF price list, flyer and QR assets from `src/data/site.ts`.
- Keep the singlepage structure and white/pink design. Use the supplied studio photographs without people. The current logo is a disclosed reproduction of the chat reference.
- Prices, treatment descriptions and contact data are centralized in `src/data/site.ts`. Update `priceListInfo.updatedAt` when prices change. The contact section offers telephone contact only.
- Downloads under `public/downloads/`, `dist/` and `node_modules/` are generated and not committed.

## GitHub and deployment

The user requested that completed website changes made through the assistant be committed and pushed to GitHub, followed by automatic deployment to Hetzner. Unless the user asks for a draft/review only or says not to publish, run appropriate checks, commit the intended changes and push to `main` after completing the work. Preserve unrelated user changes and never commit secrets.

Push the current tested commit with `git push origin HEAD:main` (the Cloud checkout may use a local branch named `work`). Never force-push. The workflow `.github/workflows/deploy.yml` builds and tests every push/PR. Uploads occur only for `main`, after successful checks, once `HETZNER_DEPLOY_ENABLED=true` and the hosting variables/secrets have been configured. Pull requests only build and test. Report actual push/deployment status accurately; a local build does not prove a successful live deployment.

Use a dedicated FTPS login scoped to this domain, a confirmed document-root path, and verified TLS. Do not guess a target directory, remove unrelated remote files, change DNS, order hosting or publish unrelated sites. Initial Hetzner account setup and secure credential entry are still required. See `docs/deployment.md`.
