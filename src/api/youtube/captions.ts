import { AnalyticsProvider } from '@/utils/analyticsProvider';

let provider: AnalyticsProvider;
export function setCaptionsApiProvider(p: AnalyticsProvider) { provider = p; }

export async function listCaptions(params: { videoId: string; part?: string }): Promise<any> {
  if (!provider) throw new Error('API provider not set');
  // captions.list
  throw new Error('Not implemented');
}
// insert, update, delete können nach Bedarf ergänzt werden.
