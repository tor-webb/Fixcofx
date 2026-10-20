/**
 * Public runtime configuration. Only the Supabase URL and publishable (public)
 * key belong here. NEVER put secret keys, service-role keys, AI keys, payment
 * or broker secrets in this file or anywhere in browser JavaScript.
 *
 * Supabase key types:
 *   sb_publishable_…  -> safe in browser; respects RLS. THIS is what goes here.
 *   sb_secret_…       -> server-only; must NEVER appear in frontend code.
 */
export const ENV = Object.freeze({
  SUPABASE_URL: 'https://thpeckuelyfhrgprcjet.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_at3yuc1DvyYiyh76K16f_A_njGUXdG2',
});

export const hasSupabase = () =>
  Boolean(ENV.SUPABASE_URL && ENV.SUPABASE_PUBLISHABLE_KEY);
