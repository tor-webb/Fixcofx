/*
 * Provider configuration. The UI banner is suppressed, but the price engine and
 * several widgets remain locally generated until real providers are configured.
 * Never interpret demoMode=false as proof that an exchange/broker is connected.
 */
export const DEMO_CONFIG = Object.freeze({
  demoMode: false,
  bannerText: 'MARKET DATA PREVIEW',
  newsLabel: 'SAMPLE NEWS — NOT LIVE',
  supportLabel: 'SUPPORT SERVICE NOT CONNECTED',
  simulation: { seed: 20261019, scenario: 'normal' },
  providers: {
    marketData: 'mock', news: 'mock', calendar: 'mock', ai: 'mock',
    broker: 'mock', payments: 'none', mt: 'none',
  },
});
export function assertNoRealExecution(context) {
  if (DEMO_CONFIG.providers.broker !== 'live') {
    throw new Error(`Blocked: ${context} because no live broker provider is configured.`);
  }
}
