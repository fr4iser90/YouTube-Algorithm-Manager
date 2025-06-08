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

export interface BubblePreset {
  id: string;
  name: string;
  description: string;
  category: 'tech' | 'politics' | 'music' | 'science' | 'lifestyle' | 'custom';
  color: string;
  language: string;
  region: string;
  searches: SearchPattern[];
  watchPatterns: WatchPattern[];
  channelPreferences: ChannelPreference[];
  targetKeywords: string[];
  avoidKeywords: string[];
  createdAt: Date;
  lastUsed?: Date;
  trainingDuration: number; // in minutes
  advancedOptions: {
    clearHistoryFirst: boolean;
    useIncognito: boolean;
    simulateRealTiming: boolean;
    engagementRate: number; // 0-1
    skipAds: boolean;
  };
}

export interface AlgorithmState {
  timestamp: Date;
  recommendations: VideoRecommendation[];
  categories: CategoryDistribution[];
  sentiment: 'positive' | 'negative' | 'neutral';
  bubbleScore: number;
  language: string;
  region: string;
  blockedChannels: string[];
  prioritizedChannels: string[];
}

export interface VideoRecommendation {
  title: string;
  channel: string;
  category: string;
  position: number;
  thumbnail?: string;
  language?: string;
  viewCount?: number;
  uploadDate?: Date;
}

export interface CategoryDistribution {
  category: string;
  percentage: number;
  count: number;
  language?: string;
}

export interface TrainingProfile {
  id: string;
  presetId: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'paused' | 'error';
  progress: number;
  currentAction: string;
  results?: AlgorithmState;
  language: string;
  region: string;
}

export interface SavedProfile {
  id: string;
  name: string;
  description: string;
  preset: BubblePreset;
  algorithmState: AlgorithmState;
  cookies: string;
  localStorage: string;
  sessionStorage: string;
  createdAt: Date;
  lastUsed: Date;
  bubbleStrength: number;
  totalVideosWatched: number;
  totalSearches: number;
  trainingHours: number;
  isActive: boolean;
  tags: string[];
}
