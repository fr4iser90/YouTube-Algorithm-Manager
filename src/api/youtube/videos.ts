import { AnalyticsProvider } from '@/utils/analyticsProvider';

let provider: AnalyticsProvider;
export function setVideosApiProvider(p: AnalyticsProvider) { provider = p; }

export async function listVideos(params: { id?: string; part?: string }): Promise<any> {
  if (!provider) throw new Error('API provider not set');
  // videos.list
  return provider.getVideoData(params.id!);
}
// Weitere Methoden wie insert, update, delete, rate, getRating, reportAbuse können nach Bedarf ergänzt werden.
