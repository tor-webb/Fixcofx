import { signIn, signUp } from '../../services/auth.js';
import { appStore } from '../../core/store.js';
import { pageHead, siteFooter, esc } from '../../components/ui.js';

export const title = 'Account';
let root=null, submitHandler=null, mode='signin';
export function mount(el){root=el;if(appStore.get().session){location.hash='#/account';return;}render();}
function render(message=''){
 if(!root)return;
 const signup=mode==='signup';
 root.innerHTML=`<div class="page narrow" style="padding-top:48px">
  ${pageHead('Account',signup?'Create your account':'Welcome back',signup?'Register with your email address and a password.':'Sign in with your registered email address.')}
  ${message?`<div class="notice" role="alert" style="margin-bottom:14px">${esc(message)}</div>`:''}
  <form id="auth-form" class="panel" style="padding:24px" novalidate>
   <label for="auth-email">Email address</label>
   <input id="auth-email" class="input" type="email" inputmode="email" autocomplete="email" autocapitalize="none" spellcheck="false" required maxlength="254">
   <label for="auth-password" style="margin-top:16px">Password</label>
   <input id="auth-password" class="input" type="password" autocomplete="${signup?'new-password':'current-password'}" required>
   ${signup?'<p class="small muted" style="margin-top:8px">Use a password that meets your Supabase project’s password policy.</p>':''}
   <button id="auth-submit" class="btn btn-primary" type="submit" style="width:100%;margin-top:20px">${signup?'Create account':'Sign in'}</button>
   <p class="small" style="margin:18px 0 0;text-align:center">${signup?'Already registered?':'New to Fiscofx?'} <button id="auth-switch" class="btn-link" type="button" style="padding:0;border:0;background:none">${signup?'Sign in':'Create an account'}</button></p>
  </form>
  <p class="small muted" style="margin-top:14px">Prices and trading widgets currently include preview data; connecting this interface does not by itself connect a live exchange.</p>
  ${siteFooter()}</div>`;
 const form=root.querySelector('#auth-form'), submit=root.querySelector('#auth-submit');
 root.querySelector('#auth-switch').addEventListener('click',()=>{mode=signup?'signin':'signup';render();});
 submitHandler=async e=>{
  e.preventDefault();
  const email=root.querySelector('#auth-email').value.trim();
  const password=root.querySelector('#auth-password').value;
  if(!email||!password){render('Enter your email address and password.');return;}
  submit.disabled=true;submit.textContent=signup?'Creating account…':'Signing in…';
  try{
   const result=signup?await signUp(email,password):await signIn(email,password);
   if(result?.error){render(result.error.message||'Authentication failed.');return;}
   if(signup&&!result?.data?.session){mode='signin';render('Account request submitted. If email confirmation is enabled, check your inbox before signing in.');return;}
   location.hash='#/account';
  }catch(err){render(err?.message||'Could not reach the authentication service. Please try again.');}
 };
 form.addEventListener('submit',submitHandler);
}
export function unmount(){if(submitHandler&&root){const form=root.querySelector('#auth-form');if(form)form.removeEventListener('submit',submitHandler);}root=null;submitHandler=null;}
