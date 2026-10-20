import { signIn, signUp } from '../../services/auth.js';
import { appStore } from '../../core/store.js';
import { pageHead, siteFooter, esc } from '../../components/ui.js';

export const title = 'Sign in';

let root = null;
let onSubmit = null;
let mode = 'signin';

export function mount(el) {
  root = el;
  if (appStore.get().session) {
    location.hash = '#/account';
    return;
  }
  render();
}

function render(message = '') {
  const isSignup = mode === 'signup';
  root.innerHTML = `
    <div class="page narrow">
      ${pageHead('Account', isSignup ? 'Create an account' : 'Sign in', 'Email and password. Your session is stored by Supabase and cleared when you sign out.')}
      ${message ? `<div class="notice" role="alert">${esc(message)}</div>` : ''}
      <form id="auth-form" class="panel" novalidate>
        <label for="auth-email">Email</label>
        <input id="auth-email" class="input" type="email" autocomplete="email" required maxlength="254">
        <label for="auth-password" style="margin-top:var(--sp-3)">Password</label>
        <input id="auth-password" class="input" type="password" autocomplete="${isSignup ? 'new-password' : 'current-password'}" required minlength="8" maxlength="72">
        <p class="small muted">${isSignup ? 'At least 8 characters.' : 'Use the password you registered with.'}</p>
        <button type="submit" class="btn btn-primary" id="auth-submit" style="margin-top:var(--sp-3)">
          ${isSignup ? 'Create account' : 'Sign in'}
        </button>
        <p class="small" style="margin-top:var(--sp-3)">
          ${isSignup ? 'Already have an account?' : 'No account yet?'}
          <button type="button" class="btn-link" id="auth-switch" style="background:none;border:none;padding:0;color:var(--accent);text-decoration:underline;min-height:auto">
            ${isSignup ? 'Sign in' : 'Create one'}
          </button>
        </p>
      </form>
      <p class="small muted">By using this demo you agree to the <a href="#/terms">Terms and Conditions</a>. This build uses simulated data only; no real-money activity occurs.</p>
      ${siteFooter()}
    </div>`;

  const form = root.querySelector('#auth-form');
  const submit = root.querySelector('#auth-submit');
  const switchBtn = root.querySelector('#auth-switch');

  switchBtn.addEventListener('click', () => {
    mode = isSignup ? 'signin' : 'signup';
    render();
  });

  onSubmit = async (e) => {
    e.preventDefault();
    const email = root.querySelector('#auth-email').value.trim();
    const password = root.querySelector('#auth-password').value;
    if (!email || !password) return render('Enter your email and password.');
    submit.disabled = true;
    submit.textContent = isSignup ? 'Creating…' : 'Signing in…';
    try {
      const fn = isSignup ? signUp : signIn;
      const { data, error } = await fn(email, password);
      if (error) return render(error.message || 'Something went wrong.');
      if (isSignup) {
        if (!data?.session) {
          mode = 'signin';
          return render('Account created. Check your email to confirm, then sign in.');
        }
      }
      location.hash = '#/account';
    } catch (err) {
      render(err?.message || 'Network error. Try again.');
    } finally {
      submit.disabled = false;
      submit.textContent = mode === 'signup' ? 'Create account' : 'Sign in';
    }
  };
  form.addEventListener('submit', onSubmit);
}

export function unmount() {
  if (onSubmit && root) {
    const form = root.querySelector('#auth-form');
    if (form) form.removeEventListener('submit', onSubmit);
  }
  root = onSubmit = null;
}
