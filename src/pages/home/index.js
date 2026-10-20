import { INSTRUMENTS } from '../../data/instruments.js';
import { startPrices, stopPrices, subscribePrices, latestSnapshot } from '../../engine/prices.js';
import { fmtPrice, fmtPct } from '../../lib/format.js';
import { siteFooter } from '../../components/ui.js';

export const title='Fiscofx | Markets';
let unsub=null, root=null;
const featured=['crypto:BTC/USDT','crypto:ETH/USDT','stock:NVDA','forex:EUR/USD'];
export function mount(el){
 root=el;startPrices();
 el.innerHTML=`<div class="page">
  <section class="hero">
   <div><div class="chip" style="margin-bottom:18px;color:var(--accent)">MULTI-ASSET MARKET WORKSPACE</div>
    <h1>See the markets.<br><span style="color:var(--accent)">Trade with clarity.</span></h1>
    <p class="lead">Explore a unified market interface for crypto, forex, equities and indices, with watchlists and a dedicated trading workspace.</p>
    <div class="cta-group"><a class="btn btn-primary" href="#/terminal">Open terminal</a><a class="btn" href="#/markets">Explore markets</a></div>
    <p class="small muted" style="margin-top:16px">Market widgets currently display indicative preview data, not exchange-sourced live quotes.</p>
   </div>
   <div><div class="small muted" style="margin-bottom:10px">MARKET SNAPSHOT · PREVIEW</div><div id="home-tickers" class="market-grid"></div></div>
  </section>
  <section style="margin:20px 0 48px"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px"><div><h2 style="margin-bottom:4px">Market overview</h2><p class="small" style="margin:0">Indicative prices and daily movement view</p></div><a href="#/markets">All markets →</a></div>
   <div class="table-wrap"><table class="table"><thead><tr><th>Market</th><th>Last price</th><th>24h change*</th><th>Asset class</th><th></th></tr></thead><tbody id="home-table-body"></tbody></table></div>
   <p class="small muted" style="margin-top:10px">*Change is calculated from the local preview stream and should not be used for financial decisions.</p>
  </section>${siteFooter()}</div>`;
 const render=snap=>{
  if(!root)return;const map=new Map(snap.map(p=>[p.id,p]));
  const cards=root.querySelector('#home-tickers');if(cards)cards.innerHTML=featured.map(id=>{const ins=INSTRUMENTS.find(x=>x.id===id),p=map.get(id);if(!ins||!p)return '';return `<article class="market-card"><div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:18px"><strong>${ins.symbol}</strong><span class="small muted">${ins.asset_class.toUpperCase()}</span></div><div class="mono" style="font-size:19px;font-weight:600">${fmtPrice(p.price,ins.price_precision)}</div><div class="small ${p.changePct>=0?'up':'down'}">${fmtPct(p.changePct)}</div><div class="small muted" style="margin-top:8px">${ins.name}</div></article>`}).join('');
  const body=root.querySelector('#home-table-body');if(body)body.innerHTML=INSTRUMENTS.slice(0,10).map(ins=>{const p=map.get(ins.id);if(!p)return '';return `<tr><td><strong>${ins.symbol}</strong><div class="small muted">${ins.name}</div></td><td class="mono">${fmtPrice(p.price,ins.price_precision)}</td><td class="mono ${p.changePct>=0?'up':'down'}">${fmtPct(p.changePct)}</td><td>${ins.asset_class}</td><td><a class="btn" style="min-height:30px;padding:0 12px" href="#/terminal?pair=${encodeURIComponent(ins.id)}">Trade</a></td></tr>`}).join('');
 };
 render(latestSnapshot());unsub=subscribePrices(render);
}
export function unmount(){if(unsub){unsub();unsub=null;}stopPrices();root=null;}
