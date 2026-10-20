/* Static-shell cache only. Never caches API/order traffic and never fakes success offline. */
const CACHE = 'fiscofx-shell-v5';
const SHELL = [
  './', './index.html', './manifest.webmanifest',
  './src/main.js', './src/core/router.js', './src/core/store.js',
  './src/components/shell.js', './src/components/ui.js',
  './src/config/demo.config.js', './src/config/env.js', './src/config/site.config.js',
  './src/data/feature-status.js', './src/data/market-overview.js',
  './src/data/instruments.js', './src/data/terms.js',
  './src/engine/prices.js', './src/engine/execution.js',
  './src/lib/format.js',
  './src/services/watchlist.js', './src/services/auth.js', './src/services/orders.js',
  './src/services/supabase/client.js',
  './src/pages/home/index.js', './src/pages/placeholder.js',
  './src/pages/product/index.js', './src/pages/markets/index.js',
  './src/pages/support/index.js', './src/pages/disclosures/index.js',
  './src/pages/instrument/index.js', './src/pages/terms/index.js',
  './src/pages/auth/index.js', './src/pages/account/index.js',
  './src/pages/terminal/index.js', './src/pages/positions/index.js',
  './src/styles/tokens.css', './src/styles/base.css',
  './src/styles/layout.css', './src/styles/site.css', './src/styles/terminal.css',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(fetch(req).catch(() => caches.match(req).then((r) => r || caches.match('./index.html'))));
});
