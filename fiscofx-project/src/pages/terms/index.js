import { TERMS } from '../../data/terms.js';
import { pageHead, siteFooter, esc } from '../../components/ui.js';

export const title = 'Terms and Conditions';

export function mount(el) {
  el.innerHTML = `
    <div class="page narrow">
      ${pageHead('Legal', 'Terms and Conditions', `Effective ${esc(TERMS.effectiveDate)} · Last updated ${esc(TERMS.lastUpdated)}`)}
      <p>${esc(TERMS.preamble)}</p>
      ${TERMS.sections.map((s) => `
        <section class="section" aria-labelledby="t-${esc(s.id)}">
          <h2 id="t-${esc(s.id)}">${esc(s.heading)}</h2>
          <p>${esc(s.body)}</p>
        </section>`).join('')}
      <p class="small muted">${esc(TERMS.closing)}</p>
      ${siteFooter()}
    </div>`;
}
