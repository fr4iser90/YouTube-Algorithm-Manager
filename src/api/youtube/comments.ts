import { AnalyticsProvider } from '@/utils/analyticsProvider';

let provider: AnalyticsProvider;
export function setCommentsApiProvider(p: AnalyticsProvider) { provider = p; }

export async function listComments(params: { videoId?: string; part?: string }): Promise<any> {
  if (!provider) throw new Error('API provider not set');
  // comments.list
  throw new Error('Not implemented');
}
// insert, update, delete können nach Bedarf ergänzt werden.
