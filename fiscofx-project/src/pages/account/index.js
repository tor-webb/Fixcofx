import { appStore } from '../../core/store.js';
import { signOut, getProfile } from '../../services/auth.js';
import { pageHead, siteFooter, esc } from '../../components/ui.js';

export const title = 'Account';

let root = null;
let onClick = null;
let unsubscribe = null;

export async function mount(el) {
  root = el;
  const { session, profile } = appStore.get();

  if (!session) {
    renderSignedOut();
    return;
  }

  let p = profile;
  if (!p) {
    p = await getProfile(session.user.id);
    appStore.set({ profile: p });
  }

  renderSignedIn(session, p);

  unsubscribe = appStore.subscribe((s) => {
    if (!s.session) renderSignedOut();
  });
}

function renderSignedOut() {
  root.innerHTML = `
    <div class="page narrow">
      ${pageHead('Account', 'You are not signed in', 'Sign in to access your demo account and watchlists.')}
      <div class="panel">
        <p>The public pages (Markets, Product, Support, Disclosures) work without an account.</p>
        <a class="btn btn-primary btn-link" href="#/auth">Sign in or create an account</a>
      </div>
      ${siteFooter()}
    </div>`;
}

function renderSignedIn(session, profile) {
  const email = session.user.email || '';
  const name = profile?.display_name || email.split('@')[0];
  root.innerHTML = `
    <div class="page narrow">
      ${pageHead('Account', `Signed in as ${name}`, 'This is a demo account. No real funds are involved.')}
      <div class="panel">
        <ul class="plain-list">
          <li><span class="muted">Email</span> <span class="mono">${esc(email)}</span></li>
          <li><span class="muted">Display name</span> ${esc(name)}</li>
          <li><span class="muted">Role</span> ${esc(profile?.role || 'user')}</li>
          <li><span class="muted">User ID</span> <span class="mono small">${esc(session.user.id)}</span></li>
          <li><span class="muted">Demo balance</span> <span class="mono">USD 10,000.00</span> <span class="chip chip-warn">DEMO</span></li>
        </ul>
        <button type="button" class="btn" id="signout">Sign out</button>
      </div>
      <p class="small muted">Open positions and order history are on the <a href="#/positions">Positions</a> page.</p>
      ${siteFooter()}
    </div>`;

  onClick = async (e) => {
    if (e.target && e.target.id === 'signout') {
      await signOut();
      location.hash = '#/';
    }
  };
  root.addEventListener('click', onClick);
}

export function unmount() {
  if (unsubscribe) unsubscribe();
  if (root && onClick) root.removeEventListener('click', onClick);
  root = onClick = unsubscribe = null;
}
