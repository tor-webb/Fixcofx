export function createStore(initial) {
  let state = { ...initial };
  const listeners = new Set();
  return {
    get: () => state,
    set(patch) { state = { ...state, ...patch }; listeners.forEach(fn => fn(state)); },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  };
}
// Dark mode is the default on every fresh load. Ignore legacy light-mode preference.
if (typeof document !== 'undefined') document.documentElement.setAttribute('data-theme','dark');
if (typeof localStorage !== 'undefined') { try { localStorage.setItem('fiscofx-theme','dark'); } catch {} }
export const appStore = createStore({
  online: typeof navigator !== 'undefined' ? navigator.onLine : true,
  session:null, user:null, profile:null, authReady:false, theme:'dark',
});
