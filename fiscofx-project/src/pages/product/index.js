import { DEMO_CONFIG } from '../../config/demo.config.js';
import { FEATURES, ADAPTERS } from '../../data/feature-status.js';
import { statusChip, pageHead, siteFooter, esc } from '../../components/ui.js';

export const title = 'Product';

const LAYOUTS = [
  { device: 'Desktop and laptop', text: 'Market watch on the left, chart in the centre, order ticket on the right, and a tabbed workspace below for positions, orders and history.' },
  { device: 'Tablet', text: 'The same panels, collapsible so the chart keeps its space.' },
  { device: 'Mobile', text: 'A dedicated app-style layout: bottom navigation, full-screen charts and a bottom-sheet order form with safeguards against accidental orders.' },
];

const RULES = [
  'Demo orders are filled by a separate simulated engine that has no connection to any broker or exchange.',
  'The app is built so a real provider can replace a mock adapter without rewriting the screens.',
  'Private keys and credentials stay on the server and are never placed in browser code.',
  'An order is never shown as submitted or filled while offline or before a confirmed response exists.',
];

export function mount(el) {
  const adapterRows = ADAPTERS.map((a) => {
    const now = DEMO_CONFIG.providers[a.key];
    const nowLabel = now === 'mock' ? 'Mock (simulated)' : now === 'none' ? 'Not connected' : now;
    return `<tr><td>${esc(a.name)}</td><td><span class="chip chip-warn">${esc(nowLabel)}</span></td><td>${esc(a.future)}</td></tr>`;
  }).join('');

  const featureRows = FEATURES.map((f) =>
    `<tr><td>${esc(f.name)}</td><td>${statusChip(f.status, f.phase)}</td><td>${esc(f.note || '')}</td></tr>`
  ).join('');

  el.innerHTML = `
    <div class="page">
      ${pageHead('Product', 'One terminal, built for every screen', 'Fiscofx is a professional-style trading workspace for desktop, tablet and mobile. This page describes the design and is explicit about what works today.')}

      <section class="section" aria-labelledby="layout-title">
        <h2 id="layout-title">Layout for each device</h2>
        <ul class="card-grid" role="list">
          ${LAYOUTS.map((l) => `<li class="card"><h3>${l.device}</h3><p>${l.text}</p></li>`).join('')}
        </ul>
      </section>

      <section class="section" aria-labelledby="rules-title">
        <h2 id="rules-title">Design principles</h2>
        <ul class="check-list">${RULES.map((r) => `<li>${r}</li>`).join('')}</ul>
      </section>

      <section class="section" aria-labelledby="status-title">
        <h2 id="status-title">What works today</h2>
        <p>This list is maintained at the end of every build phase.</p>
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th scope="col">Feature</th><th scope="col">Status</th><th scope="col">Notes</th></tr></thead>
            <tbody>${featureRows}</tbody>
          </table>
        </div>
      </section>

      <section class="section" aria-labelledby="adapters-title">
        <h2 id="adapters-title">Data and service providers</h2>
        <p>Each service sits behind a replaceable adapter. This table reads the current configuration, so it always reflects what the build is actually using.</p>
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th scope="col">Service</th><th scope="col">In this build</th><th scope="col">Planned replacement</th></tr></thead>
            <tbody>${adapterRows}</tbody>
          </table>
        </div>
        <p class="small muted">Provider capabilities, terms and pricing have not been checked. Nothing is connected until a provider is chosen and approved.</p>
      </section>

      ${siteFooter()}
    </div>`;
}
