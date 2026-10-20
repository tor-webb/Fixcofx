import { getSupabase } from './supabase/client.js';

export async function placeOrder(payload) {
  const sb = await getSupabase();
  if (!sb) return { data: null, error: { message: 'Supabase not configured.' } };
  const { data, error } = await sb.functions.invoke('place-order', { body: payload });
  return { data, error };
}

export async function listPositions() {
  const sb = await getSupabase();
  if (!sb) return { data: [], error: null };
  return sb
    .from('positions')
    .select('id, instrument_id, side, quantity, entry_price, stop_loss, take_profit, opened_at, instruments(symbol, name, price_precision, asset_class)')
    .order('opened_at', { ascending: false });
}

export async function listOrders(limit = 25) {
  const sb = await getSupabase();
  if (!sb) return { data: [], error: null };
  return sb
    .from('orders')
    .select('id, instrument_id, side, type, quantity, status, created_at, instruments(symbol, name)')
    .order('created_at', { ascending: false })
    .limit(limit);
}

export async function getDemoAccount() {
  const sb = await getSupabase();
  if (!sb) return { data: null, error: null };
  return sb
    .from('trading_accounts')
    .select('id, balance, currency, is_demo')
    .eq('is_demo', true)
    .maybeSingle();
}
