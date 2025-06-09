export interface SearchPattern {
  query: string;
  frequency: number;
  duration: number;
  language?: string;
  region?: string;
}

export interface WatchPattern {
  videoId?: string;
  category: string;
  watchTime: number;
  engagement: 'like' | 'dislike' | 'none';
  language?: string;
}

export interface ChannelPreference {
  channelId: string;
  channelName: string;
  action: 'subscribe' | 'avoid' | 'block' | 'prioritize';
  reason?: string;
}
