export const DEMO_CONFIG = Object.freeze({
  demoMode: true,
  bannerText: 'DEMO MODE — SIMULATED DATA',
  newsLabel: 'SAMPLE NEWS — NOT REAL-TIME',
  supportLabel: 'DEMO SUPPORT — AI API NOT CONNECTED',
  simulation: {
    seed: 20261019,
    scenario: 'normal',
  },
  providers: {
    marketData: 'mock',
    news: 'mock',
    calendar: 'mock',
    ai: 'mock',
    broker: 'mock',
    payments: 'none',
    mt: 'none',
  },
});

export function assertNoRealExecution(context) {
  if (DEMO_CONFIG.demoMode) {
    throw new Error(`Blocked: ${context} cannot run in demo mode.`);
  }
}
