export * from './videos';
export * from './channels';
export * from './playlists';
export * from './search';
export * from './subscriptions';
export * from './comments';
export * from './thumbnails';
export * from './captions';

import { AnalyticsProvider } from '@/utils/analyticsProvider';
import { setVideosApiProvider } from './videos';
import { setChannelsApiProvider } from './channels';
import { setPlaylistsApiProvider } from './playlists';
import { setSearchApiProvider } from './search';
import { setSubscriptionsApiProvider } from './subscriptions';
import { setCommentsApiProvider } from './comments';
import { setThumbnailsApiProvider } from './thumbnails';
import { setCaptionsApiProvider } from './captions';

export function setYoutubeApiProvider(provider: AnalyticsProvider) {
  setVideosApiProvider(provider);
  setChannelsApiProvider(provider);
  setPlaylistsApiProvider(provider);
  setSearchApiProvider(provider);
  setSubscriptionsApiProvider(provider);
  setCommentsApiProvider(provider);
  setThumbnailsApiProvider(provider);
  setCaptionsApiProvider(provider);
}
