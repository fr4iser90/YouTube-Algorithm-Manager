import { AnalyticsProvider } from '@/utils/analyticsProvider';

let provider: AnalyticsProvider;
export function setSubscriptionsApiProvider(p: AnalyticsProvider) { provider = p; }

export async function listSubscriptions(params: { mine?: boolean; part?: string }): Promise<any> {
  if (!provider) throw new Error('API provider not set');
  // subscriptions.list
  return provider.getSubscribedChannels();
}
// insert, delete können nach Bedarf ergänzt werden.
