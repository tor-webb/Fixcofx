export const ASSET_CLASSES = [
  {
    id: 'forex',
    name: 'Forex',
    summary: 'Currency pairs, quoted as the price of one currency in another.',
    notes: 'Pair availability, sessions and pricing must be confirmed by the eventual broker.',
    groups: [
      { name: 'Major pairs', symbols: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD'] },
      { name: 'Popular crosses', symbols: ['EUR/GBP', 'EUR/JPY', 'EUR/CHF', 'EUR/AUD', 'EUR/CAD', 'EUR/NZD', 'GBP/JPY', 'GBP/CHF', 'GBP/AUD', 'GBP/CAD', 'GBP/NZD', 'AUD/JPY', 'AUD/CHF', 'AUD/CAD', 'AUD/NZD', 'CAD/JPY', 'CAD/CHF', 'NZD/JPY'] },
      { name: 'Additional crosses', symbols: ['NZD/CHF', 'NZD/CAD', 'CHF/JPY', 'EUR/SEK', 'EUR/NOK', 'EUR/PLN', 'EUR/SGD', 'GBP/SGD', 'AUD/SGD', 'CAD/SGD'] },
      { name: 'Emerging-market and regional', symbols: ['USD/CNH', 'USD/HKD', 'USD/SGD', 'USD/INR', 'USD/KRW', 'USD/MXN', 'USD/ZAR', 'USD/TRY', 'USD/PLN', 'USD/THB', 'USD/IDR', 'USD/BRL', 'USD/SEK', 'USD/NOK', 'USD/DKK'] },
    ],
  },
  {
    id: 'crypto',
    name: 'Cryptocurrency',
    summary: 'Digital assets. An asset (BTC) is not the same as a market (BTC/USDT on a specific exchange).',
    notes: 'Token names, listings, ticker collisions and venue support must be validated before use.',
    groups: [
      { name: 'Major assets', symbols: ['BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'XRP', 'SOL', 'DOGE', 'ADA', 'TRX', 'AVAX', 'LINK', 'DOT', 'BCH', 'LTC'] },
      { name: 'DeFi and infrastructure', symbols: ['UNI', 'AAVE', 'MKR', 'SKY', 'CRV', 'SUSHI', 'COMP', 'SNX', 'LDO', 'RUNE', 'NEAR', 'ATOM', 'ICP', 'FIL', 'AR'] },
      { name: 'Scaling and Web3', symbols: ['POL', 'OP', 'ARB', 'IMX', 'GRT', 'ENS', 'FET', 'RENDER', 'INJ', 'SEI', 'SUI', 'APT', 'TIA', 'STX', 'HBAR'] },
      { name: 'Additional candidates', symbols: ['SHIB', 'PEPE', 'BONK', 'FLOKI', 'WIF', 'FTM', 'ALGO', 'VET', 'EGLD', 'XLM', 'XMR', 'ZEC', 'ETC', 'MANA', 'SAND'] },
    ],
  },
  {
    id: 'stocks',
    name: 'International stocks',
    summary: 'Shares in listed companies, grouped here by sector.',
    notes: 'Listings, exchange access and licensing depend on the market-data provider.',
    groups: [
      { name: 'Technology and semiconductors', symbols: ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'GOOG', 'AMZN', 'META', 'AVGO', 'AMD', 'INTC', 'QCOM', 'MU', 'TXN', 'AMAT', 'LRCX', 'ORCL', 'CRM', 'IBM', 'CSCO', 'NOW'] },
      { name: 'Finance and payments', symbols: ['JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'BLK', 'V', 'MA', 'PYPL'] },
      { name: 'Retail, consumer and entertainment', symbols: ['WMT', 'COST', 'HD', 'MCD', 'NKE', 'KO', 'PEP', 'NFLX', 'DIS', 'UBER'] },
      { name: 'Energy, industrials and healthcare', symbols: ['XOM', 'CVX', 'CAT', 'GE', 'HON', 'UNH', 'JNJ', 'LLY', 'ABBV', 'MRK'] },
      { name: 'Automotive, aerospace and growth', symbols: ['TSLA', 'F', 'GM', 'BA', 'RTX', 'PLTR', 'COIN', 'SHOP', 'ARM', 'PANW'] },
    ],
  },
  {
    id: 'indices',
    name: 'Stock-market indices',
    summary: 'Benchmarks that track a basket of shares.',
    notes: 'Cash indices, futures and ETFs are different products and are kept in separate categories.',
    groups: [{ name: 'Candidate benchmarks', symbols: ['SPX', 'NDX', 'DJI', 'RUT', 'FTSE', 'DAX', 'N225', 'HSI', 'STI', 'NSEI'] }],
  },
  {
    id: 'commodities',
    name: 'Commodities and metals',
    summary: 'Precious metals, energy and agricultural markets.',
    notes: 'Spot metals, futures and CFDs are different contract types and are labelled as such.',
    groups: [{ name: 'Candidate instruments', symbols: ['XAU/USD', 'XAG/USD', 'WTI', 'BRENT', 'NATGAS', 'COPPER', 'CORN', 'WHEAT'] }],
  },
  {
    id: 'derivatives',
    name: 'Crypto derivatives',
    summary: 'Perpetual contracts, where the data source supports them.',
    notes: 'Funding rate, mark price, index price, expiry and liquidation data are shown only when the source provides them.',
    groups: [{ name: 'Examples', symbols: ['BTCUSDT PERP', 'ETHUSDT PERP'] }],
  },
];

export const countSymbols = (cls) => cls.groups.reduce((n, g) => n + g.symbols.length, 0);
