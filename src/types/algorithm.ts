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

export interface AnalyticsResults {
  historyVideoCount: number;
  recommendedVideoCount: number;
  topKeywords: { term: string; score: number }[];
  topPhrases: { phrase: string; count: number }[];
  topChannels: {
    channel: string;
    count: number;
    historyRatio: number;
    recommendationRatio: number;
    categories: string[];
    keywords: string[];
  }[];
  topVideos: { title: string; url: string }[];
  categoryDistribution: Record<string, number>;
  engagementPatterns: {
    watchTimeDistribution: Record<string, number>;
    contentTypes: Record<string, number>;
    peakHours: Record<string, number>;
  };
  timestamp: number;
}

export interface AlgorithmAnalyticsProps {
  currentState?: AlgorithmState;
  historicalData: AlgorithmState[];
}

export interface AlgorithmSnapshotAnalyticsProps {
  onAnalysisComplete?: (results: AnalyticsResults) => void;
  onSaveProfile?: (profile: AlgorithmState) => void;
  onCreatePreset?: (preset: TrainingPreset) => void;
}
