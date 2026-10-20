import { INSTRUMENTS } from '../../data/instruments.js';
import { startPrices, stopPrices, subscribePrices, latestSnapshot } from '../../engine/prices.js';
import { fmtPrice, fmtPct } from '../../lib/format.js';
import { siteFooter } from '../../components/ui.js';

export const title='Fiscofx | Markets';
let unsub=null, root=null;
const featured=['crypto:BTC/USDT','crypto:ETH/USDT','stock:NVDA','forex:EUR/USD'];

const REVIEWS = [
  { name: 'Sarah K.', role: 'Day Trader', text: 'The execution speed on the terminal is flawless. The charting and order book feel exactly like a real exchange.', rating: 5 },
  { name: 'James M.', role: 'Crypto Investor', text: 'Finally, a platform that handles crypto, forex, and indices in one clean interface. The watchlist feature is a game changer.', rating: 5 },
  { name: 'Elena R.', role: 'Portfolio Manager', text: 'I use the demo environment to test strategies. The order book depth and real-time trade feed are incredibly accurate.', rating: 5 }
];

export function mount(el){
 root=el;startPrices();
 
 // Generate the ticker HTML (static, just scrolling)
 const tickerHtml = INSTRUMENTS.slice(0, 8).map(ins => {
   const p = latestSnapshot().find(x => x.id === ins.id);
   const color = p.changePct >= 0 ? 'var(--up)' : 'var(--down)';
   return `<span style="margin-right:32px;font-family:var(--font-mono);font-size:13px;color:var(--text)"><strong>${ins.symbol}</strong> <span style="color:${color}">${p.price.toFixed(2)}</span> <span style="color:${color};font-size:11px">${p.changePct >= 0 ? '+' : ''}${p.changePct.toFixed(2)}%</span></span>`;
 }).join('');

 el.innerHTML=`<div>
  <!-- Moving Ticker Strip -->
  <div style="background:var(--bg-secondary);border-bottom:1px solid var(--border);overflow:hidden;white-space:nowrap;padding:10px 0">
    <div id="ticker-track" style="display:inline-block;animation:scroll 30s linear infinite">${tickerHtml}${tickerHtml}</div>
  </div>
  
  <div class="page">
  <section class="hero">
   <div><div class="chip" style="margin-bottom:18px;color:var(--accent)">MULTI-ASSET MARKET WORKSPACE</div>
    <h1>See the markets.<br><span style="color:var(--accent)">Trade with clarity.</span></h1>
    <p class="lead">Explore a unified market interface for crypto, forex, equities and indices, with watchlists and a dedicated trading workspace.</p>
    <div class="cta-group"><a class="btn btn-primary" href="#/terminal">Open terminal</a><a class="btn" href="#/markets">Explore markets</a></div>
   </div>
   <div><div class="small muted" style="margin-bottom:10px">MARKET SNAPSHOT</div><div id="home-tickers" class="market-grid"></div></div>
  </section>
  
  <section style="margin:20px 0 48px">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px">
      <div><h2 style="margin-bottom:4px">Market overview</h2><p class="small" style="margin:0">Indicative prices and daily movement view</p></div>
      <a href="#/markets">All markets →</a>
    </div>
    <div class="table-wrap"><table class="table"><thead><tr><th>Market</th><th>Last price</th><th>24h change</th><th>Asset class</th><th></th></tr></thead><tbody id="home-table-body"></tbody></table></div>
  </section>
  
  <!-- REVIEWS SECTION -->
  <section style="margin:48px 0;padding-top:48px;border-top:1px solid var(--border)">
    <h2 style="text-align:center;margin-bottom:32px">Trusted by Traders Worldwide</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px">
      ${REVIEWS.map(r => `
        <div class="panel" style="padding:24px">
          <div style="color:var(--accent);margin-bottom:12px">${'★'.repeat(r.rating)}</div>
          <p style="font-style:italic;margin-bottom:16px">"${r.text}"</p>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:40px;height:40px;border-radius:50%;background:var(--accent);color:#000;display:flex;align-items:center;justify-content:center;font-weight:700">${r.name.charAt(0)}</div>
            <div><div style="font-weight:600">${r.name}</div><div class="small muted">${r.role}</div></div>
          </div>
        </div>
      `).join('')}
    </div>
  </section>
  
  ${siteFooter()}</div></div>
  
  <style>@keyframes scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }</style>`;
  
 const render=snap=>{
  if(!root)return;const map=new Map(snap.map(p=>[p.id,p]));
  const cards=root.querySelector('#home-tickers');if(cards)cards.innerHTML=featured.map(id=>{const ins=INSTRUMENTS.find(x=>x.id===id),p=map.get(id);if(!ins||!p)return '';return `<article class="market-card"><div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:18px"><strong>${ins.symbol}</strong><span class="small muted">${ins.asset_class.toUpperCase()}</span></div><div class="mono" style="font-size:19px;font-weight:600">${fmtPrice(p.price,ins.price_precision)}</div><div class="small ${p.changePct>=0?'up':'down'}">${fmtPct(p.changePct)}</div><div class="small muted" style="margin-top:8px">${ins.name}</div></article>`}).join('');
  const body=root.querySelector('#home-table-body');if(body)body.innerHTML=INSTRUMENTS.slice(0,10).map(ins=>{const p=map.get(ins.id);if(!p)return '';return `<tr><td><strong>${ins.symbol}</strong><div class="small muted">${ins.name}</div></td><td class="mono">${fmtPrice(p.price,ins.price_precision)}</td><td class="mono ${p.changePct>=0?'up':'down'}">${fmtPct(p.changePct)}</td><td>${ins.asset_class}</td><td><a class="btn" style="min-height:30px;padding:0 12px" href="#/terminal?pair=${encodeURIComponent(ins.id)}">Trade</a></td></tr>`}).join('');
 };
 render(latestSnapshot());unsub=subscribePrices(render);
}
export function unmount(){if(unsub){unsub();unsub=null;}stopPrices();root=null;}