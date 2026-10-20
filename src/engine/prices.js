import { DEMO_CONFIG } from '../config/demo.config.js';
import { INSTRUMENTS } from '../data/instruments.js';

const TICK_MS = 1000;
const history = new Map();
const listeners = new Set();
let timer = null;

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 0xffffffff;
}

function priceAt(instrument, tMs) {
  const seed = DEMO_CONFIG.simulation.seed;
  const phase = hash(instrument.id + seed) * Math.PI * 2;
  const amp = instrument.asset_class === 'crypto' ? 0.006
            : instrument.asset_class === 'stock' ? 0.004
            : instrument.asset_class === 'commodity' ? 0.003
            : 0.0015;
  const w1 = Math.sin(tMs / 90000 + phase);
  const w2 = Math.sin(tMs / 230000 + phase * 1.7) * 0.6;
  const w3 = Math.sin(tMs / 11000 + phase * 2.3) * 0.25;
  const factor = 1 + (w1 + w2 + w3) * amp;
  const raw = instrument.seed_price * factor;
  const tick = Math.pow(10, -instrument.price_precision);
  return Math.round(raw / tick) * tick;
}

function computeAll(tMs) {
  return INSTRUMENTS.map((ins) => {
    const price = priceAt(ins, tMs);
    const prev = history.get(ins.id)?.at(-1)?.price ?? price;
    const change = price - prev;
    const changePct = prev ? (change / prev) * 100 : 0;
    return {
      id: ins.id,
      price,
      prev,
      change,
      changePct,
      bid: price - ins.tick_size,
      ask: price + ins.tick_size,
      t: tMs,
      data_status: 'simulated',
    };
  });
}

function tick() {
  const now = Date.now();
  const snap = computeAll(now);
  snap.forEach((p) => {
    const arr = history.get(p.id) || [];
    arr.push({ t: now, price: p.price });
    if (arr.length > 60) arr.shift();
    history.set(p.id, arr);
  });
  listeners.forEach((fn) => fn(snap, now));
}

export function startPrices() {
  if (timer) return;
  tick();
  timer = setInterval(tick, TICK_MS);
}

export function stopPrices() {
  if (timer) clearInterval(timer);
  timer = null;
}

export function subscribePrices(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function latestSnapshot() {
  return computeAll(Date.now());
}

export function priceHistory(id) {
  return history.get(id) || [];
}

export function sparkSeries(id, n = 30) {
  const arr = priceHistory(id);
  if (arr.length === 0) {
    const now = Date.now();
    const ins = INSTRUMENTS.find((i) => i.id === id);
    if (!ins) return [];
    return Array.from({ length: n }, (_, i) => ({
      t: now - (n - i) * TICK_MS,
      price: priceAt(ins, now - (n - i) * TICK_MS),
    }));
  }
  return arr.slice(-n);
}
