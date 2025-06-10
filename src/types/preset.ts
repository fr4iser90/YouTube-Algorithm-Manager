import { SearchPattern, WatchPattern, ChannelPreference } from './patterns';

export interface TrainingPreset {
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
    engagementRate: number; // 0-1
    skipAds: boolean;
  };
}
