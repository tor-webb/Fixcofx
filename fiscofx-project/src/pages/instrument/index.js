import { getInstrument } from '../../data/instruments.js';
import { startPrices, stopPrices, subscribePrices, latestSnapshot, sparkSeries } from '../../engine/prices.js';
import { fmtPrice, fmtPct, dirClass } from '../../lib/format.js';
import { isWatched, toggleWatched } from '../../services/watchlist.js';
import { pageHead, siteFooter, esc } from '../../components/ui.js';

export const title = 'Instrument';

let root = null;
let unsub = null;
let ins = null;

function sparkline(points, width = 320, height = 80) {
  if (points.length < 2) return '';
  const prices = points.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const span = max - min || 1;
  const step = width / (points.length - 1);
  const d = points.map((p, i) => {
    const x = i * step;
    const y = height - ((p.price - min) / span) * height;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" preserveAspectRatio="none" role="img" aria-label="Simulated price trend">
    <path d="${d}" fill="none" stroke="var(--accent)" stroke-width="1.5"/>
  </svg>`;
}

export function mount(el) {
  root = el;
  const id = decodeURIComponent(location.hash.replace(/^#\/instrument\//, ''));
  ins = getInstrument(id);
  if (!ins) {
    el.innerHTML = `
      <div class="page">
        ${pageHead('Instrument', 'Not found', 'That instrument is not in the simulated catalogue.')}
        <a class="btn btn-link" href="#/markets">Back to markets</a>
        ${siteFooter()}
      </div>`;
    return;
  }
  startPrices();

  const paint = (snap) => {
    const p = snap.find((x) => x.id === id) || {};
    const watched = isWatched(id);
    el.innerHTML = `
      <div class="page">
        ${pageHead(ins.asset_class.toUpperCase(), ins.symbol, ins.name)}
        <div class="panel">
          <div class="card-top">
            <div>
              <p class="kicker">Simulated price</p>
              <p class="mono" style="font-size:1.6rem;margin:0">${fmtPrice(p.price, ins.price_precision)}
                <span class="${dirClass(p.change)}">${fmtPct(p.changePct)}</span>
              </p>
              <p class="small muted">Bid ${fmtPrice(p.bid, ins.price_precision)} · Ask ${fmtPrice(p.ask, ins.price_precision)} · <span class="chip chip-warn">SIMULATED</span></p>
            </div>
            <button type="button" class="btn" id="watch-btn" aria-pressed="${watched}">
              ${watched ? '★ Watching' : '☆ Watch'}
            </button>
          </div>
          ${sparkline(sparkSeries(id))}
          <p class="small muted">Sparkline: last 30 simulated points. Real charts and indicators arrive in a later phase.</p>
        </div>
        <section class="section">
          <h2>Contract details (simulated)</h2>
          <div class="table-wrap"><table class="table"><tbody>
            <tr><th scope="row">Asset class</th><td>${esc(ins.asset_class)}</td></tr>
            <tr><th scope="row">Instrument type</th><td>${esc(ins.instrument_type)}</td></tr>
            <tr><th scope="row">Price precision</th><td>${ins.price_precision} dp</td></tr>
            <tr><th scope="row">Quantity precision</th><td>${ins.qty_precision} dp</td></tr>
            <tr><th scope="row">Min order size</th><td>${ins.min_order_size}</td></tr>
            <tr><th scope="row">Max order size</th><td>${ins.max_order_size}</td></tr>
            <tr><th scope="row">Tick size</th><td>${ins.tick_size}</td></tr>
            <tr><th scope="row">Trading hours</th><td>${esc(ins.trading_hours)}</td></tr>
            <tr><th scope="row">Data status</th><td><span class="chip chip-warn">simulated</span></td></tr>
          </tbody></table></div>
        </section>
        <p><a class="btn btn-link" href="#/markets">← Back to markets</a></p>
        ${siteFooter()}
      </div>`;

    const btn = el.querySelector('#watch-btn');
    if (btn) btn.onclick = () => {
      const next = toggleWatched(id);
      btn.setAttribute('aria-pressed', String(next.includes(id)));
      btn.textContent = next.includes(id) ? '★ Watching' : '☆ Watch';
    };
  };

  paint(latestSnapshot());
  unsub = subscribePrices(paint);
}

export function unmount() {
  if (unsub) unsub();
  stopPrices();
  root = unsub = ins = null;
}
