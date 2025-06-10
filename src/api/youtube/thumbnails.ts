import { AnalyticsProvider } from '@/utils/analyticsProvider';

let provider: AnalyticsProvider;
export function setThumbnailsApiProvider(p: AnalyticsProvider) { provider = p; }

export async function setThumbnail(params: { videoId: string; media: any }): Promise<any> {
  if (!provider) throw new Error('API provider not set');
  // thumbnails.set
  throw new Error('Not implemented');
}
