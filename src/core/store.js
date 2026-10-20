export function createStore(initial) {
  let state = { ...initial };
  const listeners = new Set();
  return {
    get: () => state,
    set(patch) {
      state = { ...state, ...patch };
      listeners.forEach((fn) => fn(state));
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}

export const appStore = createStore({
  online: typeof navigator !== 'undefined' ? navigator.onLine : true,
  session: null,
  user: null,
  profile: null,
  authReady: false,
});
