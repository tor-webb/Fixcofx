import { pageHead, siteFooter } from '../components/ui.js';

export const title = 'Coming soon';

const PHASES = { news: 'Phase 6' };

export function mount(el) {
  const key = (location.hash.replace(/^#\//, '') || '').split('/')[0].replace(/[^a-z-]/gi, '');
  const known = Object.prototype.hasOwnProperty.call(PHASES, key);
  el.innerHTML = `
    <div class="page">
      ${pageHead(known ? 'Not built yet' : 'Page not found', known ? 'This section is scheduled for ' + PHASES[key] : 'We can’t find that page', '')}
      <div class="panel">
        <p>${known ? 'Nothing here is connected to a live service, and no real data is shown.' : 'Check the address, or use the navigation to go back.'}</p>
        <a class="btn btn-link" href="#/product">See what works today</a>
      </div>
      ${siteFooter()}
    </div>`;
}
