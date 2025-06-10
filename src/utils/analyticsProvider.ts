import type { AlgorithmState, AnalyticsResults } from '@/types/algorithm';

export interface AnalyticsConfig {
  useApi: boolean;
  apiKey?: string;
  quotaLimit?: number;
}

// Quota cost mapping (June 2025)
const YT_API_QUOTA_COSTS: Record<string, number> = {
  // resource.method: cost
  'activities.list': 1,
  'captions.list': 50,
  'captions.insert': 400,
  'captions.update': 450,
  'captions.delete': 50,
  'channelBanners.insert': 50,
  'channels.list': 1,
  'channels.update': 50,
  'channelSections.list': 1,
  'channelSections.insert': 50,
  'channelSections.update': 50,
  'channelSections.delete': 50,
  'comments.list': 1,
  'comments.insert': 50,
  'comments.update': 50,
  'comments.setModerationStatus': 50,
  'comments.delete': 50,
  'commentThreads.list': 1,
  'commentThreads.insert': 50,
  'commentThreads.update': 50,
  'guideCategories.list': 1,
  'i18nLanguages.list': 1,
  'i18nRegions.list': 1,
  'members.list': 1,
  'membershipsLevels.list': 1,
  'playlistItems.list': 1,
  'playlistItems.insert': 50,
  'playlistItems.update': 50,
  'playlistItems.delete': 50,
  'playlists.list': 1,
  'playlists.insert': 50,
  'playlists.update': 50,
  'playlists.delete': 50,
  'search.list': 100,
  'subscriptions.list': 1,
  'subscriptions.insert': 50,
  'subscriptions.delete': 50,
  'thumbnails.set': 50,
  'videoAbuseReportReasons.list': 1,
  'videoCategories.list': 1,
  'videos.list': 1,
  'videos.insert': 1600,
  'videos.update': 50,
  'videos.rate': 50,
  'videos.getRating': 1,
  'videos.reportAbuse': 50,
  'videos.delete': 50,
  'watermarks.set': 50,
  'watermarks.unset': 50
};

const QUOTA_STORAGE_KEY = 'yt-api-quota-usage';
const QUOTA_TIMESTAMP_KEY = 'yt-api-quota-timestamp';

function getToday(): string {
  const now = new Date();
  return now.toISOString().slice(0, 10); // YYYY-MM-DD
}

function loadQuotaUsage(): number {
  const stored = localStorage.getItem(QUOTA_STORAGE_KEY);
  const ts = localStorage.getItem(QUOTA_TIMESTAMP_KEY);
  if (!stored || !ts || ts !== getToday()) {
    localStorage.setItem(QUOTA_STORAGE_KEY, '0');
    localStorage.setItem(QUOTA_TIMESTAMP_KEY, getToday());
    return 0;
  }
  return parseInt(stored, 10) || 0;
}

function saveQuotaUsage(units: number) {
  localStorage.setItem(QUOTA_STORAGE_KEY, units.toString());
  localStorage.setItem(QUOTA_TIMESTAMP_KEY, getToday());
}

export class AnalyticsProvider {
  private config: AnalyticsConfig;
  private apiQuotaUsed: number;

  constructor(config: AnalyticsConfig) {
    this.config = config;
    this.apiQuotaUsed = loadQuotaUsage();
  }

  private addQuota(resource: string, method: string) {
    const key = `${resource}.${method}`;
    const cost = YT_API_QUOTA_COSTS[key] || 1;
    this.apiQuotaUsed += cost;
    saveQuotaUsage(this.apiQuotaUsed);
    return cost;
  }

  async getChannelData(channelId: string): Promise<any> {
    if (this.config.useApi && this.config.apiKey) {
      return this.getChannelDataFromApi(channelId);
    } else {
      return this.getChannelDataFromBrowser(channelId);
    }
  }

  private async getChannelDataFromApi(channelId: string): Promise<any> {
    if (this.apiQuotaUsed >= (this.config.quotaLimit || 10000)) {
      throw new Error('API quota exceeded');
    }
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=statistics,contentDetails&id=${channelId}&key=${this.config.apiKey}`
      );
      this.addQuota('channels', 'list');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  private async getChannelDataFromBrowser(channelId: string): Promise<any> {
    // Browser-based scraping
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id!, {
          type: 'GET_CHANNEL_DATA',
          channelId
        }, (response) => {
          resolve(response);
        });
      });
    });
  }

  async getVideoData(videoId: string): Promise<any> {
    if (this.config.useApi && this.config.apiKey) {
      return this.getVideoDataFromApi(videoId);
    } else {
      return this.getVideoDataFromBrowser(videoId);
    }
  }

  private async getVideoDataFromApi(videoId: string): Promise<any> {
    if (this.apiQuotaUsed >= (this.config.quotaLimit || 10000)) {
      throw new Error('API quota exceeded');
    }
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoId}&key=${this.config.apiKey}`
      );
      this.addQuota('videos', 'list');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  private async getVideoDataFromBrowser(videoId: string): Promise<any> {
    // Browser-based scraping
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id!, {
          type: 'GET_VIDEO_DATA',
          videoId
        }, (response) => {
          resolve(response);
        });
      });
    });
  }

  async getSubscribedChannels(): Promise<string[]> {
    if (this.config.useApi && this.config.apiKey) {
      return this.getSubscribedChannelsFromApi();
    } else {
      return this.getSubscribedChannelsFromBrowser();
    }
  }

  private async getSubscribedChannelsFromApi(): Promise<string[]> {
    if (this.apiQuotaUsed >= (this.config.quotaLimit || 10000)) {
      throw new Error('API quota exceeded');
    }
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&key=${this.config.apiKey}`
      );
      this.addQuota('subscriptions', 'list');
      const data = await response.json();
      return data.items.map((item: any) => item.snippet.resourceId.channelId);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  private async getSubscribedChannelsFromBrowser(): Promise<string[]> {
    // Browser-based scraping
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id!, {
          type: 'GET_SUBSCRIBED_CHANNELS'
        }, (response) => {
          resolve(response);
        });
      });
    });
  }

  // Example for a search request (100 units)
  async searchVideos(query: string): Promise<any> {
    if (this.config.useApi && this.config.apiKey) {
      if (this.apiQuotaUsed >= (this.config.quotaLimit || 10000)) {
        throw new Error('API quota exceeded');
      }
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${this.config.apiKey}`
        );
        this.addQuota('search', 'list');
        return await response.json();
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    } else {
      // Fallback: browser-based search not implemented
      throw new Error('Browser-based search not supported');
    }
  }

  getQuotaUsage(): number {
    return this.apiQuotaUsed;
  }

  getQuotaLeft(): number {
    return (this.config.quotaLimit || 10000) - this.apiQuotaUsed;
  }

  resetQuota(): void {
    this.apiQuotaUsed = 0;
    saveQuotaUsage(0);
  }
} 