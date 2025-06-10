import { AnalyticsProvider } from '@/utils/analyticsProvider';

let provider: AnalyticsProvider;
export function setPlaylistsApiProvider(p: AnalyticsProvider) { provider = p; }

export async function listPlaylists(params: { id?: string; part?: string }): Promise<any> {
  if (!provider) throw new Error('API provider not set');
  // playlists.list
  // Hier würdest du provider.getPlaylistData(params.id) implementieren
  throw new Error('Not implemented');
}
// insert, update, delete können nach Bedarf ergänzt werden.
