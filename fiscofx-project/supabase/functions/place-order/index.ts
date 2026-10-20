import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function simulatedPrice(instrument: any, side: string, tMs = Date.now()): number {
  const bucket = Math.floor(tMs / 300000);
  let h = 2166136261;
  const seedStr = `${instrument.id}:${bucket}`;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const phase = ((h >>> 0) / 0xffffffff) * Math.PI * 2;
  const amp = instrument.asset_class === 'crypto' ? 0.006 : 0.003;
  const factor = 1 + Math.sin(tMs / 90000 + phase) * amp;
  const raw = Number(instrument.seed_price ?? 1) * factor;
  const tick = Math.pow(10, -instrument.price_precision);
  const rounded = Math.round(raw / tick) * tick;
  return side === 'buy' ? rounded + tick : rounded - tick;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  const authHeader = req.headers.get('Authorization') ?? '';
  const jwt = authHeader.replace(/^Bearer\s+/i, '');
  if (!jwt) return json({ error: 'missing bearer token' }, 401);

  const { data: userData, error: userErr } = await admin.auth.getUser(jwt);
  if (userErr || !userData.user) return json({ error: 'invalid token' }, 401);
  const userId = userData.user.id;

  let input: any;
  try { input = await req.json(); } catch { return json({ error: 'invalid json' }, 400); }

  const { instrument_id, side, type, quantity, limit_price, stop_loss, take_profit, idempotency_key } = input ?? {};
  if (!instrument_id || typeof instrument_id !== 'string') return json({ error: 'instrument_id required' }, 400);
  if (side !== 'buy' && side !== 'sell') return json({ error: 'side must be buy|sell' }, 400);
  if (!['market', 'limit', 'stop'].includes(type)) return json({ error: 'invalid order type' }, 400);
  const qty = Number(quantity);
  if (!Number.isFinite(qty) || qty <= 0) return json({ error: 'quantity must be positive' }, 400);
  if (!idempotency_key || typeof idempotency_key !== 'string') return json({ error: 'idempotency_key required' }, 400);

  const { data: ins, error: insErr } = await admin
    .from('instruments')
    .select('id, symbol, asset_class, price_precision, min_order_size, max_order_size, seed_price, data_status')
    .eq('id', instrument_id)
    .maybeSingle();
  if (insErr || !ins) return json({ error: 'instrument not found' }, 404);
  if (ins.data_status !== 'simulated') return json({ error: 'live instruments are not enabled in this build' }, 400);
  if (qty < Number(ins.min_order_size)) return json({ error: 'quantity below minimum' }, 400);
  if (qty > Number(ins.max_order_size)) return json({ error: 'quantity above maximum' }, 400);

  const { data: acct, error: acctErr } = await admin
    .from('trading_accounts')
    .select('id, balance, is_demo')
    .eq('user_id', userId)
    .eq('is_demo', true)
    .maybeSingle();
  if (acctErr || !acct) return json({ error: 'no demo account found' }, 400);

  const { data: existing } = await admin
    .from('orders')
    .select('id, status, created_at')
    .eq('user_id', userId)
    .eq('idempotency_key', idempotency_key)
    .maybeSingle();
  if (existing) {
    return json({ order_id: existing.id, status: existing.status, idempotent: true });
  }

  const fillPrice = simulatedPrice(ins, side);
  const notional = fillPrice * qty;
  if (notional > Number(acct.balance) * 50) {
    return json({ error: 'order exceeds simulated leverage limit' }, 400);
  }

  const { data: order, error: orderErr } = await admin.from('orders').insert({
    account_id: acct.id,
    user_id: userId,
    instrument_id: ins.id,
    side,
    type,
    quantity: qty,
    limit_price: limit_price ?? null,
    stop_price: type === 'stop' ? (input.stop_price ?? null) : null,
    stop_loss: stop_loss ?? null,
    take_profit: take_profit ?? null,
    status: 'filled',
    idempotency_key,
  }).select('id').single();
  if (orderErr || !order) return json({ error: 'order insert failed', detail: orderErr?.message }, 500);

  const { data: exec, error: execErr } = await admin.from('executions').insert({
    order_id: order.id,
    user_id: userId,
    price: fillPrice,
    quantity: qty,
    fee: 0,
  }).select('id').single();
  if (execErr || !exec) {
    await admin.from('orders').delete().eq('id', order.id);
    return json({ error: 'execution insert failed', detail: execErr?.message }, 500);
  }

  const { data: pos, error: posErr } = await admin.from('positions').insert({
    account_id: acct.id,
    user_id: userId,
    instrument_id: ins.id,
    side,
    quantity: qty,
    entry_price: fillPrice,
    stop_loss: stop_loss ?? null,
    take_profit: take_profit ?? null,
    fees_paid: 0,
  }).select('id').single();
  if (posErr || !pos) {
    await admin.from('executions').delete().eq('id', exec.id);
    await admin.from('orders').delete().eq('id', order.id);
    return json({ error: 'position insert failed', detail: posErr?.message }, 500);
  }

  return json({
    order_id: order.id,
    execution_id: exec.id,
    position_id: pos.id,
    fill_price: fillPrice,
    status: 'filled',
  });
});
