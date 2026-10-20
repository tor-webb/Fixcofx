const routes = new Map();
let current = null;
let outlet = null;

export function registerRoutes(table) {
  Object.entries(table).forEach(([path, loader]) => routes.set(path, loader));
}

export function startRouter(el, notFoundLoader) {
  outlet = el;
  const render = async () => {
    const path = location.hash.replace(/^#/, '') || '/';
    const exact = routes.get(path);
    const prefixed = !exact && [...routes.keys()].find((k) => k !== '/' && path.startsWith(k + '/'));
    const loader = exact || (prefixed ? routes.get(prefixed) : notFoundLoader);
    if (current?.unmount) current.unmount();
    outlet.setAttribute('aria-busy', 'true');
    try {
      const mod = await loader();
      outlet.replaceChildren();
      current = mod;
      await mod.mount(outlet);
      document.title = `${mod.title || 'Fiscofx'} · Fiscofx`;
    } catch (err) {
      console.error(err);
      outlet.textContent = 'This page failed to load. Please refresh and try again.';
    } finally {
      outlet.removeAttribute('aria-busy');
    }
    document.querySelectorAll('[data-nav]').forEach((a) => {
      if (a.getAttribute('href') === `#${path}`) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    outlet.focus({ preventScroll: true });
  };
  addEventListener('hashchange', render);
  render();
}
