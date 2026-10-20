export function estimateFill(instrument, side, tMs = Date.now()) {
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
