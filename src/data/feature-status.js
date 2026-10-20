export const STATUS_LABELS = {
  built: { label: 'Built', cls: 'chip-ok' },
  untested: { label: 'Written, not yet tested', cls: 'chip-warn' },
  planned: { label: 'Planned', cls: '' },
  credentials: { label: 'Awaiting credentials', cls: '' },
  approval: { label: 'Awaiting approval', cls: '' },
};

export const FEATURES = [
  { name: 'Public website', status: 'built', note: 'Landing, product, markets overview, support and disclosures.' },
  { name: 'App shell, routing and offline banner', status: 'built', note: 'Hash routing works on static hosting.' },
  { name: 'Design system and responsive layouts', status: 'built', note: 'Desktop, tablet and mobile navigation.' },
  { name: 'Database schema and row-level security', status: 'built', note: '26 tables, 38 policies, 6 triggers. Tested on the live project.' },
  { name: 'Sign-up and login', status: 'built', note: 'Email + password via Supabase. Demo account seeded on signup.' },
  { name: 'Market catalogue, search and watchlists', status: 'built', note: 'Simulated prices, search, category filter, watchlist, instrument detail.' },
  { name: 'Simulated price engine', status: 'built', note: 'Deterministic from DEMO_CONFIG seed; no network.' },
  { name: 'Demo order ticket and execution engine', status: 'built', note: 'Server-side fill via place-order Edge Function. Client read-only tables.' },
  { name: 'Open positions and order history', status: 'built', note: 'Read from positions / orders via RLS.' },
  { name: 'Charts, indicators and timeframes', status: 'planned', phase: 5 },
  { name: 'Sample news and economic calendar', status: 'planned', phase: 6, note: 'Fictional samples, always labelled.' },
  { name: 'Support assistant and tickets', status: 'planned', phase: 7, note: 'Scripted demo assistant, not an AI service.' },
  { name: 'Demo wallet and portfolio analytics', status: 'planned', phase: 8 },
  { name: 'Provider adapter interfaces', status: 'planned', phase: 9 },
  { name: 'Live market data', status: 'credentials', note: 'Needs a licensed data provider.' },
  { name: 'Live news and calendar', status: 'credentials', note: 'Needs a news provider and display licence.' },
  { name: 'Real AI support', status: 'credentials', note: 'Needs an AI API key, held server-side.' },
  { name: 'Real broker or exchange execution', status: 'approval', note: 'Needs a broker agreement and regulatory approval.' },
  { name: 'Deposits and withdrawals', status: 'approval', note: 'Needs a payment provider and compliance sign-off.' },
  { name: 'MetaTrader 4 / 5 connectivity', status: 'approval', note: 'Needs an authorised broker or provider integration.' },
];

export const ADAPTERS = [
  { key: 'marketData', name: 'Market data and historical candles', future: 'Licensed data provider (REST + WebSocket)' },
  { key: 'news', name: 'Financial news', future: 'Licensed news API' },
  { key: 'calendar', name: 'Economic calendar', future: 'Calendar data provider' },
  { key: 'ai', name: 'AI support', future: 'AI API behind a server-side function' },
  { key: 'broker', name: 'Broker and exchange execution', future: 'Authorised broker or exchange API' },
  { key: 'payments', name: 'Payments', future: 'Approved payment provider' },
  { key: 'mt', name: 'MetaTrader 4 / 5', future: 'Broker-authorised integration' },
];
