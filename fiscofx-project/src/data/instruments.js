export const INSTRUMENTS = [
  f('forex', 'EUR/USD', 'Euro / US Dollar', 1.08500, 5),
  f('forex', 'GBP/USD', 'British Pound / US Dollar', 1.26500, 5),
  f('forex', 'USD/JPY', 'US Dollar / Japanese Yen', 149.500, 3),
  f('forex', 'USD/CHF', 'US Dollar / Swiss Franc', 0.88500, 5),
  f('forex', 'AUD/USD', 'Australian Dollar / US Dollar', 0.65500, 5),
  f('forex', 'USD/CAD', 'US Dollar / Canadian Dollar', 1.36500, 5),
  f('forex', 'NZD/USD', 'New Zealand Dollar / US Dollar', 0.60000, 5),
  f('forex', 'EUR/GBP', 'Euro / British Pound', 0.85500, 5),
  f('forex', 'EUR/JPY', 'Euro / Japanese Yen', 163.000, 3),
  f('forex', 'GBP/JPY', 'British Pound / Japanese Yen', 190.500, 3),
  f('forex', 'AUD/JPY', 'Australian Dollar / Japanese Yen', 97.800, 3),
  f('forex', 'EUR/CHF', 'Euro / Swiss Franc', 0.94000, 5),
  f('crypto', 'BTC/USDT', 'Bitcoin / Tether', 67850.00, 2),
  f('crypto', 'ETH/USDT', 'Ethereum / Tether', 3245.50, 2),
  f('crypto', 'SOL/USDT', 'Solana / Tether', 172.40, 2),
  f('crypto', 'XRP/USDT', 'XRP / Tether', 0.5420, 4),
  f('crypto', 'DOGE/USDT', 'Dogecoin / Tether', 0.1320, 4),
  f('crypto', 'ADA/USDT', 'Cardano / Tether', 0.4850, 4),
  f('stock', 'AAPL', 'Apple Inc.', 225.30, 2),
  f('stock', 'MSFT', 'Microsoft Corp.', 415.80, 2),
  f('stock', 'NVDA', 'NVIDIA Corp.', 128.40, 2),
  f('stock', 'TSLA', 'Tesla Inc.', 245.10, 2),
  f('stock', 'AMZN', 'Amazon.com Inc.', 185.60, 2),
  f('stock', 'GOOGL', 'Alphabet Inc. Class A', 165.20, 2),
  f('index', 'SPX', 'S&P 500 Index', 5480.00, 2),
  f('index', 'NDX', 'Nasdaq 100 Index', 19750.00, 2),
  f('index', 'DJI', 'Dow Jones Industrial Average', 38500.00, 2),
  f('index', 'FTSE', 'FTSE 100 Index', 8150.00, 2),
  f('index', 'DAX', 'DAX 40 Index', 18450.00, 2),
  f('index', 'N225', 'Nikkei 225 Index', 38500.00, 2),
  f('commodity', 'XAU/USD', 'Gold / US Dollar (spot)', 2350.00, 2),
  f('commodity', 'XAG/USD', 'Silver / US Dollar (spot)', 28.500, 3),
  f('commodity', 'WTI', 'WTI Crude Oil (front month)', 78.40, 2),
  f('commodity', 'BRENT', 'Brent Crude Oil (front month)', 82.10, 2),
  f('commodity', 'NATGAS', 'Natural Gas (front month)', 2.750, 3),
  f('commodity', 'COPPER', 'Copper (front month)', 4.350, 4),
  f('derivative', 'BTCUSDT PERP', 'Bitcoin Perpetual (simulated)', 67870.00, 2, { instrument_type: 'perpetual' }),
  f('derivative', 'ETHUSDT PERP', 'Ethereum Perpetual (simulated)', 3248.00, 2, { instrument_type: 'perpetual' }),
];

function f(asset_class, symbol, name, seedPrice, price_precision, overrides = {}) {
  return Object.freeze({
    id: `${asset_class}:${symbol}`,
    symbol,
    name,
    asset_class,
    instrument_type: overrides.instrument_type || 'spot',
    price_precision,
    qty_precision: asset_class === 'crypto' ? 4 : 2,
    min_order_size: asset_class === 'crypto' ? 0.0001 : 0.01,
    max_order_size: 100,
    tick_size: Math.pow(10, -price_precision),
    seed_price: seedPrice,
    data_status: 'simulated',
    trading_hours: asset_class === 'crypto' || asset_class === 'derivative'
      ? '24/7 (simulated)'
      : 'Mon–Fri, exchange hours (simulated)',
  });
}

export const ASSET_CLASS_META = Object.freeze({
  forex:     { name: 'Forex',              short: 'FX'  },
  crypto:    { name: 'Cryptocurrency',     short: 'CRYPTO' },
  stock:     { name: 'Stocks',             short: 'STOCKS' },
  index:     { name: 'Indices',            short: 'INDICES' },
  commodity: { name: 'Commodities',        short: 'COMMODITIES' },
  derivative:{ name: 'Crypto derivatives', short: 'PERPS' },
});

export const getInstrument = (id) => INSTRUMENTS.find((i) => i.id === id) || null;

export const searchInstruments = (term, assetClass = 'all') => {
  const q = (term || '').trim().toLowerCase();
  return INSTRUMENTS.filter((i) => {
    if (assetClass !== 'all' && i.asset_class !== assetClass) return false;
    if (!q) return true;
    return i.symbol.toLowerCase().includes(q) || i.name.toLowerCase().includes(q);
  });
};
