import { AnalyticsProvider } from '@/utils/analyticsProvider';

let provider: AnalyticsProvider;
export function setSearchApiProvider(p: AnalyticsProvider) { provider = p; }

export async function searchVideos(params: { q: string; part?: string }): Promise<any> {
  if (!provider) throw new Error('API provider not set');
  // search.list
  return provider.searchVideos(params.q);
}
