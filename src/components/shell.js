import { DEMO_CONFIG } from '../config/demo.config.js';
import { appStore } from '../core/store.js';

const NAV = [
  { href: '#/', label: 'Home', mobile: true },
  { href: '#/markets', label: 'Markets', mobile: true },
  { href: '#/terminal', label: 'Trade', mobile: true },
  { href: '#/positions', label: 'Positions', mobile: true },
  { href: '#/support', label: 'Support', mobile: true },
];

export function renderShell(root) {
  root.innerHTML = `
    <a class="skip-link" href="#main">Skip to content</a>
    <div class="app">
      <header class="app-header">
        ${DEMO_CONFIG.demoMode ? `<div class="demo-banner" role="status">${DEMO_CONFIG.bannerText}</div>` : ''}
        <div class="topbar">
          <a class="brand" href="#/" aria-label="Fiscofx home">Fisco<span>fx</span></a>
          <nav class="topnav" aria-label="Primary">
            ${NAV.map((n) => `<a data-nav href="${n.href}">${n.label}</a>`).join('')}
          </nav>
          <div class="topbar-actions" id="topbar-actions"></div>
        </div>
      </header>
      <main id="main" class="app-main" tabindex="-1"></main>
      <nav class="bottomnav" aria-label="Primary mobile">
        ${NAV.filter((n) => n.mobile).map((n) => `<a data-nav href="${n.href}"><span>${n.label}</span></a>`).join('')}
      </nav>
    </div>`;

  const actions = root.querySelector('#topbar-actions');
  const renderActions = (s) => {
    const signedIn = Boolean(s.session);
    actions.innerHTML = `
      <a class="btn btn-link" href="${signedIn ? '#/account' : '#/auth'}">${signedIn ? 'Account' : 'Log In'}</a>
      ${!signedIn ? `<a class="btn btn-primary" href="#/auth">Sign Up</a>` : ''}
    `;
  };

  appStore.subscribe(renderActions);
  renderActions(appStore.get());
  return root.querySelector('#main');
}