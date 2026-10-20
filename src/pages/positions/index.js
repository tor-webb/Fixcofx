import { appStore } from '../../core/store.js';
import { listPositions, listOrders } from '../../services/orders.js';
import { pageHead, siteFooter, esc } from '../../components/ui.js';
import { fmtPrice } from '../../lib/format.js';

export const title = 'Positions';

let root = null;

export async function mount(el) {
  root = el;
  if (!appStore.get().session) {
    el.innerHTML = `
      <div class="page narrow">
        ${pageHead('Positions', 'Sign in to view positions', '')}
        <div class="panel"><a class="btn btn-primary btn-link" href="#/auth">Sign in</a></div>
        ${siteFooter()}
      </div>`;
    return;
  }
  el.innerHTML = `<div class="page">${pageHead('Positions', 'Open positions and orders', 'Demo fills only. Nothing here is real.')}<p class="muted">Loading…</p>${siteFooter()}</div>`;

  const [posRes, ordRes] = await Promise.all([listPositions(), listOrders(25)]);
  const positions = posRes.data || [];
  const orders = ordRes.data || [];

  el.innerHTML = `
    <div class="page">
      ${pageHead('Positions', 'Open positions and orders', 'Demo fills only. Nothing here is real.')}

      <section class="section">
        <h2>Open positions <span class="mono small muted">${positions.length}</span></h2>
        ${positions.length === 0
          ? `<p class="muted">No open positions. <a href="#/terminal">Place a demo order</a>.</p>`
          : `<div class="table-wrap"><table class="table">
              <thead><tr><th>Symbol</th><th>Side</th><th class="num">Qty</th><th class="num">Entry</th><th class="num">SL</th><th class="num">TP</th><th>Opened</th></tr></thead>
              <tbody>
                ${positions.map((p) => {
                  const ins = p.instruments || {};
                  const prec = ins.price_precision ?? 5;
                  return `<tr>
                    <td class="mono">${esc(ins.symbol || '—')}<br><span class="small muted">${esc(ins.name || '')}</span></td>
                    <td class="${p.side === 'buy' ? 'up' : 'down'}">${esc(p.side)}</td>
                    <td class="num mono">${esc(String(p.quantity))}</td>
                    <td class="num mono">${fmtPrice(Number(p.entry_price), prec)}</td>
                    <td class="num mono">${p.stop_loss ? fmtPrice(Number(p.stop_loss), prec) : '—'}</td>
                    <td class="num mono">${p.take_profit ? fmtPrice(Number(p.take_profit), prec) : '—'}</td>
                    <td class="small">${esc(new Date(p.opened_at).toLocaleString())}</td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table></div>`}
      </section>

      <section class="section">
        <h2>Recent orders <span class="mono small muted">${orders.length}</span></h2>
        ${orders.length === 0
          ? `<p class="muted">No orders yet.</p>`
          : `<div class="table-wrap"><table class="table">
              <thead><tr><th>Symbol</th><th>Side</th><th>Type</th><th class="num">Qty</th><th>Status</th><th>Placed</th></tr></thead>
              <tbody>
                ${orders.map((o) => `
                  <tr>
                    <td class="mono">${esc(o.instruments?.symbol || '—')}</td>
                    <td class="${o.side === 'buy' ? 'up' : 'down'}">${esc(o.side)}</td>
                    <td>${esc(o.type)}</td>
                    <td class="num mono">${esc(String(o.quantity))}</td>
                    <td>${esc(o.status)}</td>
                    <td class="small">${esc(new Date(o.created_at).toLocaleString())}</td>
                  </tr>`).join('')}
              </tbody>
            </table></div>`}
      </section>

      ${siteFooter()}
    </div>`;
}

export function unmount() {
  root = null;
}
