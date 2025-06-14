export interface ScoreConfig {
  weights: {
    quality: number;
    clickbait: number;
    engagement: number;
    sentiment: number;
    category: number;
  };
  thresholds: {
    clickbait: number;
    quality: {
      high: number;
      medium: number;
    };
  };
} 