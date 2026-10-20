import { DEMO_CONFIG } from '../config/demo.config.js';
import { appStore } from '../core/store.js';

const NAV = [
  { href: '#/', label: 'Home', mobile: true, icon: 'M3 11l9-8 9 8v10h-6v-6H9v6H3z' },
  { href: '#/product', label: 'Product', mobile: false, icon: 'M4 6h16M4 12h16M4 18h10' },
  { href: '#/markets', label: 'Markets', mobile: true, icon: 'M3 17l6-6 4 4 8-8M15 7h6v6' },
  { href: '#/terminal', label: 'Trade', mobile: true, icon: 'M4 20V10m6 10V4m6 16v-8m6 8V8' },
  { href: '#/positions', label: 'Positions', mobile: true, icon: 'M4 6h16M4 12h16M4 18h16' },
  { href: '#/news', label: 'News', mobile: false, icon: 'M4 5h16v14H4zM8 9h8M8 13h8' },
  { href: '#/support', label: 'Support', mobile: true, icon: 'M12 21a9 9 0 100-18 9 9 0 000 18zM9.5 9.5a2.5 2.5 0 114 2c-.9.6-1.5 1-1.5 2M12 17h.01' },
  { href: '#/account', label: 'Account', mobile: true, icon: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0' },
];

const icon = (d) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;

export function renderShell(root) {
  root.innerHTML = `
    <a class="skip-link" href="#main">Skip to content</a>
    <div class="app">
      <header class="app-header">
        ${DEMO_CONFIG.demoMode ? `<div class="demo-banner" role="status">${DEMO_CONFIG.bannerText}</div>` : ''}
        <div class="offline-banner" role="alert">You are offline. Orders cannot be submitted and prices are not updating.</div>
        <div class="topbar">
          <a class="brand" href="#/" aria-label="Fiscofx home">Fisco<span>fx</span></a>
          <nav class="topnav" aria-label="Primary">
            ${NAV.map((n) => `<a data-nav href="${n.href}">${n.label}</a>`).join('')}
          </nav>
          <div class="topbar-actions" id="topbar-actions">
            <span class="chip chip-warn" title="All data in this build is simulated">DEMO</span>
          </div>
        </div>
      </header>
      <main id="main" class="app-main" tabindex="-1"></main>
      <nav class="bottomnav" aria-label="Primary mobile">
        ${NAV.filter((n) => n.mobile).map((n) => `<a data-nav href="${n.href}">${icon(n.icon)}<span>${n.label}</span></a>`).join('')}
      </nav>
    </div>`;

  const sync = (online) => document.body.classList.toggle('is-offline', !online);
  appStore.subscribe((s) => sync(s.online));
  sync(appStore.get().online);
  addEventListener('online', () => appStore.set({ online: true }));
  addEventListener('offline', () => appStore.set({ online: false }));

  const actions = root.querySelector('#topbar-actions');
  const renderActions = (s) => {
    const signedIn = Boolean(s.session);
    actions.innerHTML = `
      <span class="chip chip-warn" title="All data in this build is simulated">DEMO</span>
      <a class="btn small btn-link" href="${signedIn ? '#/account' : '#/auth'}">
        ${signedIn ? 'Account' : 'Sign in'}
      </a>`;
  };
  appStore.subscribe(renderActions);
  renderActions(appStore.get());

  return root.querySelector('#main');
}
