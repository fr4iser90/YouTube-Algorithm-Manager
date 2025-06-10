import { AnalyticsProvider } from '@/utils/analyticsProvider';

let provider: AnalyticsProvider;
export function setChannelsApiProvider(p: AnalyticsProvider) { provider = p; }

export async function listChannels(params: { id?: string; part?: string }): Promise<any> {
  if (!provider) throw new Error('API provider not set');
  // channels.list
  return provider.getChannelData(params.id!);
}
// update kann nach Bedarf ergänzt werden.
