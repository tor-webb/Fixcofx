import { getSupabase } from './supabase/client.js';

export async function signUp(email, password) {
  const sb = await getSupabase();
  if (!sb) return { data: null, error: { message: 'Supabase is not configured.' } };
  return sb.auth.signUp({ email, password });
}

export async function signIn(email, password) {
  const sb = await getSupabase();
  if (!sb) return { data: null, error: { message: 'Supabase is not configured.' } };
  return sb.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  const sb = await getSupabase();
  if (!sb) return { error: null };
  return sb.auth.signOut();
}

export async function getSession() {
  const sb = await getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data?.session ?? null;
}

export async function getProfile(userId) {
  const sb = await getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from('profiles')
    .select('id, display_name, timezone, role, created_at')
    .eq('id', userId)
    .maybeSingle();
  if (error) return null;
  return data;
}

export async function onAuthChange(cb) {
  const sb = await getSupabase();
  if (!sb) return () => {};
  const { data } = sb.auth.onAuthStateChange((_event, session) => cb(session));
  return () => data.subscription.unsubscribe();
}
