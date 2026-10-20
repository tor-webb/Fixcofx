import { STATUS_LABELS } from '../data/feature-status.js';

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function statusChip(status, phase) {
  const s = STATUS_LABELS[status] || STATUS_LABELS.planned;
  const label = status === 'planned' && phase ? `Planned · Phase ${phase}` : s.label;
  return `<span class="chip ${s.cls}">${esc(label)}</span>`;
}

export function pageHead(kicker, title, lead) {
  return `
    <header class="page-head">
      <p class="kicker">${esc(kicker)}</p>
      <h1>${esc(title)}</h1>
      ${lead ? `<p class="lead">${esc(lead)}</p>` : ''}
    </header>`;
}

export function siteFooter() {
  return `
    <footer class="site-footer">
      <div class="site-footer-grid">
        <div>
          <a class="brand" href="#/">Fisco<span>fx</span></a>
          <p class="muted small">A multi-asset trading platform currently running as a simulation. No real prices, orders, funds or brokers.</p>
        </div>
        <nav aria-label="Footer">
          <a href="#/product">Product</a>
          <a href="#/markets">Markets</a>
          <a href="#/news">News</a>
          <a href="#/support">Support</a>
          <a href="#/disclosures">Disclosures</a>
          <a href="#/terms">Terms</a>
        </nav>
      </div>
      <p class="small muted">Trading leveraged and volatile products can result in the loss of money. Nothing on this site is financial advice. Fiscofx is not a licensed financial adviser, and this demo does not offer real-money trading.</p>
    </footer>`;
}
