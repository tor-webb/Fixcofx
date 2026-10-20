import { registerRoutes, startRouter } from './core/router.js';
import { renderShell } from './components/shell.js';
import { appStore } from './core/store.js';
import { getSession, onAuthChange } from './services/auth.js';

const placeholder = () => import('./pages/placeholder.js');

registerRoutes({
  '/': () => import('./pages/home/index.js'),
  '/product': () => import('./pages/product/index.js'),
  '/markets': () => import('./pages/markets/index.js'),
  '/support': () => import('./pages/support/index.js'),
  '/disclosures': () => import('./pages/disclosures/index.js'),
  '/terms': () => import('./pages/terms/index.js'),
  '/instrument': () => import('./pages/instrument/index.js'),
  '/auth': () => import('./pages/auth/index.js'),
  '/account': () => import('./pages/account/index.js'),
  '/terminal': () => import('./pages/terminal/index.js'),
  '/positions': () => import('./pages/positions/index.js'),
  '/news': placeholder,
});

const main = renderShell(document.getElementById('app'));

(async () => {
  const session = await getSession();
  appStore.set({ session, user: session?.user ?? null, authReady: true });
  await onAuthChange((next) => {
    appStore.set({ session: next, user: next?.user ?? null });
  });
  startRouter(main, placeholder);
})();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
