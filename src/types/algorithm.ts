export interface AlgorithmState {
  id: string;
  profileId: string;  // Reference to the profile this state belongs to
  timestamp: Date;
  recommendations: VideoRecommendation[];
  categoryDistribution: CategoryDistribution[];
  contentAnalysis: ContentAnalysis;
  trainingProgress: number;
  lastTrainingDate: Date;
  totalVideosWatched: number;
  totalSearches: number;
  averageWatchTime: number;
  preferredCategories: string[];
  preferredChannels: string[];
  preferredKeywords: string[];
  avoidedChannels: string[];
  avoidedKeywords: string[];
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

export interface ContentAnalysis {
  relevance: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  category: string;
  keywords: string[];
}
