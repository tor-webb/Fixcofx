# Fiscofx — Demo Trading Platform

This archive reconstructs the supplied Phase 1–4 source bundle into its intended folder structure.

## Important
- This build is a **simulation**. Market prices and order fills are simulated; it is not a live broker and does not accept real deposits or withdrawals.
- The frontend contains only the Supabase project URL and publishable key. Never add a Supabase service-role key, payment secret, broker credential, or AI API key to browser code.
- Before making the site public, review the legal copy, security policies, Supabase configuration, and any applicable regulatory requirements.

## Run locally
Because this project uses JavaScript modules, serve it over HTTP rather than opening `index.html` directly. For example, with Python installed:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Supabase setup
1. Confirm the project reference and public configuration in `src/config/env.js` and `supabase/config.toml`.
2. Apply `supabase/migrations/0001_foundation.sql` to the intended Supabase project (review it first, especially if the project already contains data).
3. Deploy the `place-order` Edge Function. It expects `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in its server-side environment.
4. If using GitHub Actions deployment, configure repository secrets `SUPABASE_ACCESS_TOKEN` and `SUPABASE_SERVICE_ROLE_KEY`.

Do not commit secret keys. The SQL migration is not automatically applied by the included deployment workflow.

## Validation performed
- Reconstructed 44 source/configuration files from the supplied bundle.
- Checked local JavaScript files with Node.js syntax validation.
- Parsed `manifest.webmanifest` as JSON.
- Checked relative JavaScript imports and service-worker shell paths for missing local files.

These checks do not replace a full browser test, a Supabase migration run, or end-to-end order-flow testing.
