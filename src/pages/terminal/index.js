import { appStore } from '../../core/store.js';
import { ASSET_CLASS_META, getInstrument, searchInstruments } from '../../data/instruments.js';
import { startPrices, stopPrices, subscribePrices, latestSnapshot } from '../../engine/prices.js';
import { placeOrder, getDemoAccount } from '../../services/orders.js';
import { fmtPrice, fmtPct, dirClass } from '../../lib/format.js';
import { esc } from '../../components/ui.js';

export const title = 'Trading Terminal';
let root = null, unsub = null, chart = null, candleSeries = null, resizeObserver = null;
let state = { instrumentId:'crypto:BTC/USDT', type:'limit', quantity:'', limitPrice:'', submitting:false, message:'', messageKind:'', account:null };

export async function mount(el) {
  root = el;
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const pair = params.get('pair');
  if (pair && getInstrument(pair)) state.instrumentId = pair;
  if (appStore.get().session) {
    const result = await getDemoAccount();
    state.account = result?.data || null;
  }
  startPrices();
  render();
}
function render() {
  if (!root) return;
  if (unsub) { unsub(); unsub = null; }
  destroyChart();
  const ins = getInstrument(state.instrumentId);
  const instruments = searchInstruments('', 'all');
  if (!state.limitPrice || !Number.isFinite(Number(state.limitPrice))) state.limitPrice = String(ins.seed_price);
  const acct = state.account;
  root.innerHTML = `
  <div class="terminal-layout">
    <section class="terminal-left">
      <header class="terminal-panel" style="padding:14px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:14px;min-width:0"><div><div style="font-size:18px;font-weight:700">${esc(ins.symbol)}</div><div class="small muted">${esc(ins.name)} · ${esc(ins.asset_class.toUpperCase())}</div></div><div id="term-quote" class="mono" style="font-size:18px;font-weight:700"></div></div>
        <select id="term-select" class="input" aria-label="Select market" style="width:min(230px,100%)">
          ${Object.entries(ASSET_CLASS_META).map(([cls,meta])=>`<optgroup label="${esc(meta.name)}">${instruments.filter(i=>i.asset_class===cls).map(i=>`<option value="${esc(i.id)}" ${i.id===ins.id?'selected':''}>${esc(i.symbol)}</option>`).join('')}</optgroup>`).join('')}
        </select>
      </header>
      <section class="terminal-panel terminal-chart">
        <div style="position:absolute;z-index:2;left:14px;top:10px;display:flex;gap:10px;align-items:center;font-size:11px;color:var(--text-secondary);pointer-events:none"><strong style="color:var(--text)">Candlestick</strong><span>1H</span><span>OHLC preview</span></div>
        <div id="tv-chart" aria-label="Candlestick price chart"></div>
        <div style="position:absolute;bottom:6px;left:10px;z-index:2;font-size:10px;color:var(--text-tertiary);pointer-events:none">Indicative chart preview · connect a market-data provider for exchange prices</div>
      </section>
      <section class="terminal-bottom">
        <div class="terminal-panel terminal-data">
          <div style="display:flex;justify-content:space-between;margin-bottom:10px"><strong>Order Book</strong><span class="small muted">Indicative depth</span></div>
          <div class="terminal-data-list" id="term-book"></div>
        </div>
        <div class="terminal-panel terminal-data">
          <div style="display:flex;justify-content:space-between;margin-bottom:10px"><strong>Market Trades</strong><span class="small muted">Preview feed</span></div>
          <div class="terminal-data-list" id="term-trades"></div>
        </div>
      </section>
    </section>
    <aside class="terminal-ticket">
      <div style="display:flex;align-items:center;justify-content:space-between"><h2 style="margin:0">Place Order</h2><span class="chip">Spot preview</span></div>
      <div class="notice small">Orders are submitted to the configured backend. No live broker or exchange feed is connected by this interface alone.</div>
      <div style="display:flex;justify-content:space-between;gap:12px;font-size:12px"><span class="muted">Available balance</span><strong class="mono">${acct ? Number(acct.balance||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})+' '+esc(acct.currency||'USD') : 'Sign in to view'}</strong></div>
      <div class="seg" role="group" aria-label="Order type"><button type="button" class="seg-btn" data-type="limit" aria-pressed="${state.type==='limit'}">Limit</button><button type="button" class="seg-btn" data-type="market" aria-pressed="${state.type==='market'}">Market</button></div>
      <div><label for="t-limit">Price (${esc(ins.symbol.split('/')[1] || 'USD')})</label><input id="t-limit" class="input mono" inputmode="decimal" value="${esc(state.limitPrice)}" ${state.type==='market'?'disabled':''}></div>
      <div><label for="t-qty">Size (${esc(ins.symbol.split('/')[0])})</label><input id="t-qty" class="input mono" inputmode="decimal" placeholder="0.000" value="${esc(state.quantity)}"><div class="small muted" style="display:flex;justify-content:space-between;margin-top:6px"><span>Min ${esc(String(ins.min_order_size))}</span><span>Max ${esc(String(ins.max_order_size))}</span></div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px"><button type="button" id="t-submit-buy" class="btn" style="background:var(--up);border-color:var(--up);color:#071b13" ${state.submitting?'disabled':''}>Buy / Long</button><button type="button" id="t-submit-sell" class="btn" style="background:var(--down);border-color:var(--down);color:white" ${state.submitting?'disabled':''}>Sell / Short</button></div>
      <div style="margin-top:auto;border-top:1px solid var(--border);padding-top:14px;font-size:12px;display:grid;gap:8px"><div style="display:flex;justify-content:space-between"><span class="muted">Estimated value</span><strong id="t-value" class="mono">—</strong></div><div style="display:flex;justify-content:space-between"><span class="muted">Order status</span><span>${state.submitting?'Submitting…':'Ready'}</span></div></div>
      ${state.message?`<div class="notice" role="status" style="border-color:${state.messageKind==='error'?'rgba(246,70,93,.5)':'rgba(14,203,129,.5)'}">${esc(state.message)}</div>`:''}
    </aside>
  </div>`;
  bind(ins);
  initChart(ins).catch(err => {
    const host=root?.querySelector('#tv-chart');
    if(host) host.innerHTML='<div style="padding:60px 20px;text-align:center;color:var(--text-secondary)">Chart library could not load. Check your connection or CDN policy.</div>';
    console.error('Chart initialization failed',err);
  });
}
function destroyChart(){
  if(resizeObserver){resizeObserver.disconnect();resizeObserver=null;}
  if(chart){chart.remove();chart=null;candleSeries=null;}
}
async function initChart(ins){
  const host=root?.querySelector('#tv-chart'); if(!host)return;
  const lib=await import('https://cdn.jsdelivr.net/npm/lightweight-charts@4.2.2/+esm');
  if(!root || !root.contains(host))return;
  chart=lib.createChart(host,{width:Math.max(300,host.clientWidth),height:Math.max(300,host.clientHeight),layout:{background:{type:'solid',color:'#1E2329'},textColor:'#848E9C',fontFamily:'IBM Plex Mono, monospace'},grid:{vertLines:{color:'#2B3139'},horzLines:{color:'#2B3139'}},rightPriceScale:{borderColor:'#2B3139'},timeScale:{borderColor:'#2B3139',timeVisible:true,secondsVisible:false},crosshair:{vertLine:{color:'#474D57'},horzLine:{color:'#474D57'}}});
  candleSeries=chart.addCandlestickSeries({upColor:'#0ECB81',downColor:'#F6465D',borderUpColor:'#0ECB81',borderDownColor:'#F6465D',wickUpColor:'#0ECB81',wickDownColor:'#F6465D'});
  let price=ins.seed_price; const now=Math.floor(Date.now()/1000), data=[];
  for(let i=90;i>=0;i--){const open=price;const move=(Math.random()-.49)*ins.seed_price*.006;const close=Math.max(ins.tick_size,open+move);const high=Math.max(open,close)+Math.random()*ins.seed_price*.002;const low=Math.max(ins.tick_size,Math.min(open,close)-Math.random()*ins.seed_price*.002);data.push({time:now-i*3600,open,high,low,close});price=close;}
  candleSeries.setData(data);chart.timeScale().fitContent();
  resizeObserver=new ResizeObserver(()=>{if(chart&&host.isConnected)chart.applyOptions({width:Math.max(300,host.clientWidth),height:Math.max(300,host.clientHeight)});});
  resizeObserver.observe(host);
}
function bind(ins){
  const paint=(snapshot)=>{
    const p=snapshot.find(x=>x.id===ins.id);if(!p||!root)return;
    const quote=root.querySelector('#term-quote');if(quote)quote.innerHTML=`<span class="${dirClass(p.change)}">${fmtPrice(p.price,ins.price_precision)}</span><span class="small ${dirClass(p.changePct)}" style="margin-left:8px">${fmtPct(p.changePct)}</span>`;
    if(candleSeries){const t=Math.floor(Date.now()/3600_000)*3600+3600;const candle={time:t,open:p.price-(p.change||0),high:p.price+ins.tick_size,low:Math.max(ins.tick_size,p.price-ins.tick_size),close:p.price};try{candleSeries.update(candle);}catch{}}
    const book=root.querySelector('#term-book');
    if(book){let html='';for(let i=5;i>=1;i--){const price=p.ask+ins.tick_size*(i-1);html+=`<div class="data-row down"><span>${fmtPrice(price,ins.price_precision)}</span><span>${(0.02+i*.017).toFixed(4)}</span></div>`;}html+=`<div style="text-align:center;color:var(--text);padding:3px 0;border-block:1px solid var(--border)">${fmtPrice(p.price,ins.price_precision)}</div>`;for(let i=1;i<=5;i++){html+=`<div class="data-row up"><span>${fmtPrice(p.bid-ins.tick_size*(i-1),ins.price_precision)}</span><span>${(0.018+i*.013).toFixed(4)}</span></div>`;}book.innerHTML=html;}
    const trades=root.querySelector('#term-trades');
    if(trades){const rows=Array.from({length:8},(_,i)=>{const buy=(i%2===0);const price=p.price+(buy?1:-1)*ins.tick_size*(i%3);const time=new Date(Date.now()-i*7000).toLocaleTimeString('en-GB',{hour12:false});return `<div class="data-row ${buy?'up':'down'}"><span>${fmtPrice(price,ins.price_precision)}</span><span>${(0.01+(i*.003)).toFixed(4)} <span class="muted">${time}</span></span></div>`;});trades.innerHTML=rows.join('');}
    const value=root.querySelector('#t-value');const qty=Number(root.querySelector('#t-qty')?.value||state.quantity||0);if(value)value.textContent=Number.isFinite(qty)?(qty*(state.type==='limit'?Number(state.limitPrice||p.price):p.price)).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}):'—';
  };
  paint(latestSnapshot());unsub=subscribePrices(paint);
  root.querySelector('#term-select').addEventListener('change',e=>{state.instrumentId=e.target.value;state.limitPrice=String(getInstrument(state.instrumentId).seed_price);state.message='';render();});
  root.querySelectorAll('[data-type]').forEach(btn=>btn.addEventListener('click',()=>{state.type=btn.dataset.type;render();}));
  root.querySelector('#t-limit').addEventListener('input',e=>{state.limitPrice=e.target.value;const p=latestSnapshot().find(x=>x.id===ins.id);const val=root.querySelector('#t-value');if(val)val.textContent=(Number(state.quantity||0)*Number(state.type==='limit'?state.limitPrice:p?.price||0)).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});});
  root.querySelector('#t-qty').addEventListener('input',e=>{state.quantity=e.target.value;const p=latestSnapshot().find(x=>x.id===ins.id);const val=root.querySelector('#t-value');if(val)val.textContent=(Number(state.quantity||0)*Number(state.type==='limit'?state.limitPrice:p?.price||0)).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});});
  const submit=async side=>{
    if(!appStore.get().session){state.message='Please sign in before submitting an order.';state.messageKind='error';render();return;}
    const qty=Number(state.quantity),price=Number(state.limitPrice);
    if(!Number.isFinite(qty)||qty<=0||qty<Number(ins.min_order_size)||qty>Number(ins.max_order_size)){state.message='Enter a size within the market minimum and maximum.';state.messageKind='error';render();return;}
    if(state.type==='limit'&&(!Number.isFinite(price)||price<=0)){state.message='Enter a valid limit price.';state.messageKind='error';render();return;}
    if(state.submitting)return;
    state.submitting=true;state.message='';render();
    try{const {data,error}=await placeOrder({instrument_id:ins.id,side,type:state.type,quantity:qty,limit_price:state.type==='limit'?price:undefined,idempotency_key:crypto.randomUUID()});if(error||!data||data.error){state.message=error?.message||data?.error||'Order could not be submitted.';state.messageKind='error';}else{state.message=`Order accepted${data.fill_price?` at ${fmtPrice(data.fill_price,ins.price_precision)}`:''}.`;state.messageKind='ok';state.quantity='';const fresh=await getDemoAccount();state.account=fresh?.data||state.account;}}
    catch(err){state.message=err?.message||'Network error while submitting order.';state.messageKind='error';}
    finally{state.submitting=false;render();}
  };
  root.querySelector('#t-submit-buy').addEventListener('click',()=>submit('buy'));root.querySelector('#t-submit-sell').addEventListener('click',()=>submit('sell'));
}
export function unmount(){if(unsub){unsub();unsub=null;}destroyChart();stopPrices();root=null;state.message='';}
