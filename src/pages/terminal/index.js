import { appStore } from '../../core/store.js';
import { ASSET_CLASS_META, getInstrument, searchInstruments } from '../../data/instruments.js';
import { startPrices, stopPrices, subscribePrices, latestSnapshot } from '../../engine/prices.js';
import { estimateFill } from '../../engine/execution.js';
import { placeOrder, getDemoAccount } from '../../services/orders.js';
import { fmtPrice } from '../../lib/format.js';
import { pageHead, siteFooter, esc } from '../../components/ui.js';

export const title = 'Trade';

let root = null;
let unsub = null;
let onInput = null;
let onClick = null;
let onSubmit = null;

let state = {
  instrumentId: 'forex:EUR/USD',
  side: 'buy',
  type: 'market',
  quantity: '',
  limitPrice: '',
  stopLoss: '',
  takeProfit: '',
  submitting: false,
  message: '',
  messageKind: '',
  demoAccount: null,
  lastFill: null,
};

export async function mount(el) {
  root = el;
  if (!appStore.get().session) {
    renderSignedOut();
    return;
  }
  startPrices();
  const acct = await getDemoAccount();
  state.demoAccount = acct.data || null;
  render();
}

function renderSignedOut() {
  root.innerHTML = `
    <div class="page narrow">
      ${pageHead('Trade', 'Sign in to place demo orders', 'The order ticket writes to your account, so it needs an authenticated session.')}
      <div class="panel">
        <a class="btn btn-primary btn-link" href="#/auth">Sign in or create an account</a>
      </div>
      ${siteFooter()}
    </div>`;
}

function selectedInstrument() {
  return getInstrument(state.instrumentId);
}

function render() {
  const ins = selectedInstrument();
  const insList = searchInstruments('', 'all');
  const acct = state.demoAccount;

  root.innerHTML = `
    <div class="page">
      ${pageHead('Trade', 'Demo order ticket', 'Orders are filled by a simulated engine. Nothing is sent to a broker or exchange.')}
      <div class="notice" role="note">
        <strong>Simulated fills.</strong> Market, limit and stop orders all fill immediately at a simulated price. There is no matching engine and no real money.
      </div>

      <div class="ticket-grid">
        <section class="panel">
          <h2>Instrument</h2>
          <label for="t-select">Symbol</label>
          <select id="t-select" class="input">
            ${Object.entries(ASSET_CLASS_META).map(([cls, meta]) => `
              <optgroup label="${esc(meta.name)}">
                ${insList.filter((i) => i.asset_class === cls).map((i) =>
                  `<option value="${esc(i.id)}" ${i.id === state.instrumentId ? 'selected' : ''}>${esc(i.symbol)} — ${esc(i.name)}</option>`
                ).join('')}
              </optgroup>`).join('')}
          </select>
          <div id="t-quote" class="quote" aria-live="polite"></div>

          <h2>Order</h2>
          <div class="seg" role="group" aria-label="Side">
            <button type="button" class="seg-btn" data-side="buy" aria-pressed="${state.side === 'buy'}">Buy</button>
            <button type="button" class="seg-btn" data-side="sell" aria-pressed="${state.side === 'sell'}">Sell</button>
          </div>
          <label for="t-type">Order type</label>
          <select id="t-type" class="input">
            <option value="market" ${state.type === 'market' ? 'selected' : ''}>Market</option>
            <option value="limit" ${state.type === 'limit' ? 'selected' : ''}>Limit</option>
            <option value="stop" ${state.type === 'stop' ? 'selected' : ''}>Stop</option>
          </select>

          ${state.type === 'limit' ? `
            <label for="t-limit">Limit price</label>
            <input id="t-limit" class="input" inputmode="decimal" value="${esc(state.limitPrice)}" placeholder="e.g. ${fmtPrice(ins.seed_price, ins.price_precision)}">
          ` : ''}

          <label for="t-qty">Quantity</label>
          <input id="t-qty" class="input" inputmode="decimal" value="${esc(state.quantity)}" placeholder="min ${ins.min_order_size}">
          <p class="small muted">Precision: ${ins.qty_precision} dp · Max ${ins.max_order_size}</p>

          <label for="t-sl">Stop loss (optional)</label>
          <input id="t-sl" class="input" inputmode="decimal" value="${esc(state.stopLoss)}">
          <label for="t-tp">Take profit (optional)</label>
          <input id="t-tp" class="input" inputmode="decimal" value="${esc(state.takeProfit)}">

          <div class="quote">
            <p class="small muted">Estimated fill: <span class="mono">${fmtPrice(estimateFill(ins, state.side), ins.price_precision)}</span></p>
            <p class="small muted">Demo balance: ${acct ? `<span class="mono">${acct.currency} ${Number(acct.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>` : '<span class="chip chip-bad">no demo account</span>'}</p>
          </div>

          <button type="button" class="btn btn-primary" id="t-submit" ${state.submitting || !acct ? 'disabled' : ''}>
            ${state.submitting ? 'Placing…' : (state.side === 'buy' ? 'Buy ' : 'Sell ') + esc(ins.symbol)}
          </button>

          ${state.message ? `<div class="notice" role="alert"><strong>${state.messageKind === 'error' ? 'Error' : 'Done'}.</strong> ${esc(state.message)}</div>` : ''}
          ${state.lastFill ? `
            <div class="panel" style="margin-top:var(--sp-3)">
              <p class="small muted">Last fill</p>
              <p class="mono">${esc(state.lastFill.side.toUpperCase())} ${state.lastFill.qty} ${esc(state.lastFill.symbol)} @ ${fmtPrice(state.lastFill.price, state.lastFill.precision)}</p>
              <p class="small muted">Order ${esc(state.lastFill.orderId.slice(0, 8))}… · <a href="#/positions">View positions</a></p>
            </div>` : ''}
        </section>

        <section class="panel">
          <h2>Instrument details</h2>
          <table class="table">
            <tbody>
              <tr><th scope="row">Symbol</th><td class="mono">${esc(ins.symbol)}</td></tr>
              <tr><th scope="row">Name</th><td>${esc(ins.name)}</td></tr>
              <tr><th scope="row">Class</th><td>${esc(ASSET_CLASS_META[ins.asset_class].name)}</td></tr>
              <tr><th scope="row">Type</th><td>${esc(ins.instrument_type)}</td></tr>
              <tr><th scope="row">Tick size</th><td>${ins.tick_size}</td></tr>
              <tr><th scope="row">Min size</th><td>${ins.min_order_size}</td></tr>
              <tr><th scope="row">Data status</th><td><span class="chip chip-warn">simulated</span></td></tr>
            </tbody>
          </table>
        </section>
      </div>

      ${siteFooter()}
    </div>`;

  bind(ins);
}

function bind(ins) {
  const q = root.querySelector('#t-quote');
  const paintQuote = (snap) => {
    const p = snap.find((x) => x.id === ins.id);
    if (!p) return;
    q.innerHTML = `
      <p class="mono" style="font-size:1.2rem;margin:var(--sp-2) 0">${fmtPrice(p.price, ins.price_precision)}</p>
      <p class="small muted">Bid ${fmtPrice(p.bid, ins.price_precision)} · Ask ${fmtPrice(p.ask, ins.price_precision)}</p>`;
  };
  paintQuote(latestSnapshot());
  unsub = subscribePrices(paintQuote);

  root.querySelector('#t-select').addEventListener('change', (e) => {
    state.instrumentId = e.target.value;
    state.message = '';
    rerender();
  });
  root.querySelector('#t-type').addEventListener('change', (e) => {
    state.type = e.target.value;
    rerender();
  });

  onClick = (e) => {
    const sideBtn = e.target.closest('[data-side]');
    if (sideBtn) { state.side = sideBtn.dataset.side; rerender(); }
  };
  root.addEventListener('click', onClick);

  onInput = (e) => {
    const id = e.target.id;
    if (id === 't-qty') state.quantity = e.target.value;
    if (id === 't-limit') state.limitPrice = e.target.value;
    if (id === 't-sl') state.stopLoss = e.target.value;
    if (id === 't-tp') state.takeProfit = e.target.value;
  };
  root.addEventListener('input', onInput);

  onSubmit = async () => {
    if (state.submitting) return;
    state.message = '';
    state.messageKind = '';
    const qty = Number(state.quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      state.message = 'Enter a quantity greater than zero.';
      state.messageKind = 'error';
      return rerender();
    }
    state.submitting = true;
    rerender();
    const idempotency_key = crypto.randomUUID();
    const payload = {
      instrument_id: ins.id,
      side: state.side,
      type: state.type,
      quantity: qty,
      limit_price: state.type === 'limit' ? Number(state.limitPrice) || undefined : undefined,
      stop_loss: state.stopLoss ? Number(state.stopLoss) : undefined,
      take_profit: state.takeProfit ? Number(state.takeProfit) : undefined,
      idempotency_key,
    };
    try {
      const { data, error } = await placeOrder(payload);
      if (error || !data || data.error) {
        state.message = (error && error.message) || (data && data.error) || 'Order failed.';
        state.messageKind = 'error';
      } else {
        state.message = `Filled at ${fmtPrice(data.fill_price, ins.price_precision)}.`;
        state.messageKind = 'ok';
        state.lastFill = {
          side: state.side, qty, symbol: ins.symbol,
          price: data.fill_price, precision: ins.price_precision,
          orderId: data.order_id,
        };
        state.quantity = '';
        const refreshed = await getDemoAccount();
        state.demoAccount = refreshed.data || state.demoAccount;
      }
    } catch (err) {
      state.message = err?.message || 'Network error.';
      state.messageKind = 'error';
    } finally {
      state.submitting = false;
      rerender();
    }
  };
  root.querySelector('#t-submit').addEventListener('click', onSubmit);
}

function rerender() {
  if (unsub) { unsub(); unsub = null; }
  if (onClick && root) root.removeEventListener('click', onClick);
  if (onInput && root) root.removeEventListener('input', onInput);
  onClick = onInput = onSubmit = null;
  render();
}

export function unmount() {
  if (unsub) unsub();
  if (root && onClick) root.removeEventListener('click', onClick);
  if (root && onInput) root.removeEventListener('input', onInput);
  stopPrices();
  root = unsub = onClick = onInput = onSubmit = null;
  state = { ...state, message: '', lastFill: null };
}
