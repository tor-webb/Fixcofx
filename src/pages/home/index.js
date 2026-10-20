import { DEMO_CONFIG } from '../../config/demo.config.js';
import { ASSET_CLASSES, countSymbols } from '../../data/market-overview.js';
import { FEATURES } from '../../data/feature-status.js';
import { statusChip, siteFooter } from '../../components/ui.js';

export const title = 'Home';

const HIGHLIGHTS = [
  { name: 'Charts and indicators', text: 'Candlestick, line and area charts, multiple timeframes and a modular indicator library.', feature: 'Charts, indicators and timeframes' },
  { name: 'Demo order execution', text: 'Market, limit and stop orders with stop-loss, take-profit, simulated spreads and commissions.', feature: 'Demo order ticket and execution engine' },
  { name: 'Watchlists and search', text: 'One searchable catalogue across every asset class, with multiple watchlists.', feature: 'Market catalogue, search and watchlists' },
  { name: 'News and calendar', text: 'A news feed and economic calendar, labelled as samples until a provider is connected.', feature: 'Sample news and economic calendar' },
  { name: 'Support', text: 'A guided help assistant and ticket flow with a route to human support.', feature: 'Support assistant and tickets' },
  { name: 'Demo wallet', text: 'Fictional balances and transaction history to rehearse the full workflow.', feature: 'Demo wallet and portfolio analytics' },
];

const featureOf = (name) => FEATURES.find((f) => f.name === name);

export function mount(el) {
  const labels = [
    { text: DEMO_CONFIG.bannerText, where: 'Top of every page', means: 'Every price, balance and order in this build is simulated.' },
    { text: DEMO_CONFIG.newsLabel, where: 'News and calendar', means: 'Stories and events are fictional samples, not reporting.' },
    { text: DEMO_CONFIG.supportLabel, where: 'Support assistant', means: 'Replies are scripted. No AI service is connected.' },
  ];

  el.innerHTML = `
    <div class="page">
      <section class="hero" aria-labelledby="hero-title">
        <p class="kicker">Multi-asset trading platform · Demo build</p>
        <h1 id="hero-title">Practise multi-asset trading before real markets are connected.</h1>
        <p class="lead">Fiscofx brings forex, crypto, international stocks, indices and commodities into one terminal. Today everything runs on clearly labelled simulated data, so you can test the full workflow without risking money.</p>
        <div class="cta-row">
          <a class="btn btn-primary btn-link" href="#/markets">Explore markets</a>
          <a class="btn btn-link" href="#/disclosures">Read the demo disclosures</a>
        </div>
        <div class="notice" role="note">
          <strong>Simulation only.</strong> No live prices, no real orders, no real broker and no deposits or withdrawals.
        </div>
      </section>

      <section class="section" aria-labelledby="markets-title">
        <div class="section-head">
          <h2 id="markets-title">Markets covered</h2>
          <a href="#/markets">See all candidate symbols</a>
        </div>
        <ul class="card-grid" role="list">
          ${ASSET_CLASSES.map((c) => `
            <li class="card">
              <h3>${c.name}</h3>
              <p>${c.summary}</p>
              <p class="mono small">${countSymbols(c)} candidate ${countSymbols(c) === 1 ? 'symbol' : 'symbols'}</p>
            </li>`).join('')}
        </ul>
        <p class="small muted">Candidate symbols are not a guarantee of listing or availability. Each must be validated against a real provider before live use.</p>
      </section>

      <section class="section" aria-labelledby="features-title">
        <div class="section-head">
          <h2 id="features-title">What the platform is designed to do</h2>
          <a href="#/product">Full status list</a>
        </div>
        <ul class="card-grid" role="list">
          ${HIGHLIGHTS.map((h) => {
            const f = featureOf(h.feature);
            return `
            <li class="card">
              <div class="card-top"><h3>${h.name}</h3>${f ? statusChip(f.status, f.phase) : ''}</div>
              <p>${h.text}</p>
            </li>`;
          }).join('')}
        </ul>
      </section>

      <section class="section" aria-labelledby="honest-title">
        <h2 id="honest-title">How we keep the demo honest</h2>
        <p>Labels are built into the interface so simulated content can't be mistaken for the real thing.</p>
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th scope="col">Label</th><th scope="col">Where it appears</th><th scope="col">What it means</th></tr></thead>
            <tbody>
              ${labels.map((l) => `<tr><td><span class="chip chip-warn">${l.text}</span></td><td>${l.where}</td><td>${l.means}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <section class="section panel support-cta" aria-labelledby="help-title">
        <div>
          <h2 id="help-title">Need help?</h2>
          <p>Browse common questions, see how to reach a person, or find out when the guided assistant arrives.</p>
        </div>
        <a class="btn btn-primary btn-link" href="#/support">Go to support</a>
      </section>

      ${siteFooter()}
    </div>`;
}
