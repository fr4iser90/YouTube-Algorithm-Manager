// Centralized Score System
import type { ScoreConfig } from '@/types/scoring';
import { KeywordConfig } from '@/components/analytics/scoring/KeywordConfig';

export class ScoreSystem {
  private config: ScoreConfig;
  private keywordConfig: KeywordConfig;

  constructor(config?: Partial<ScoreConfig>) {
    this.config = {
      weights: {
        quality: 0.3,
        clickbait: 0.2,
        engagement: 0.2,
        sentiment: 0.15,
        category: 0.15,
        ...config?.weights
      },
      thresholds: {
        clickbait: 0.5,
        quality: {
          high: 0.8,
          medium: 0.5
        },
        ...config?.thresholds
      }
    };
    this.keywordConfig = KeywordConfig.getInstance();
  }

  calculateQualityScore(title: string, description?: string): number {
    const { quality } = this.keywordConfig.getKeywordSets();
    let score = 0.5; // Base score
    
    // Prüfe auf Qualitäts-Keywords
    quality.forEach(keyword => {
      if (title.toLowerCase().includes(keyword.toLowerCase())) {
        score += 0.1;
      }
      if (description?.toLowerCase().includes(keyword.toLowerCase())) {
        score += 0.1;
      }
    });
    
    // Title quality
    if (title.length > 10 && title.length < 100) score += 0.1;
    if (!/[!?]{2,}/.test(title)) score += 0.1;
    if (!/^[A-Z\s!?]+$/.test(title)) score += 0.1;
    
    // Description quality
    if (description) {
      if (description.length > 50) score += 0.1;
      if (description.length > 200) score += 0.1;
      if (!/spam|subscribe|like|comment/i.test(description)) score += 0.1;
    }
    
    return Math.min(score, 1);
  }

  calculateClickbaitScore(title: string): { score: number; isClickbait: boolean } {
    const { clickbait } = this.keywordConfig.getKeywordSets();
    let score = 0;

    // Prüfe auf Clickbait-Keywords
    clickbait.forEach(keyword => {
      if (title.toLowerCase().includes(keyword.toLowerCase())) {
        score += 0.2;
      }
    });

    const punctuationRatio = (title.match(/[!?]/g) || []).length / title.length;
    score += punctuationRatio * 2;

    const capsRatio = (title.match(/[A-Z]/g) || []).length / title.length;
    if (capsRatio > 0.3) score += 0.3;

    score = Math.min(score, 1);
    
    return {
      score,
      isClickbait: score > this.config.thresholds.clickbait
    };
  }

  calculateEngagementScore(sentiment: number, quality: number): number {
    const baseEngagement = 0.5;
    const sentimentBoost = sentiment > 0 ? 0.2 : sentiment < 0 ? -0.1 : 0;
    const qualityBoost = (quality - 0.5) * 0.3;
    
    return Math.max(0, Math.min(1, baseEngagement + sentimentBoost + qualityBoost));
  }

  calculateSentimentScore(keywords: string[]): { score: number; sentiment: 'positive' | 'negative' | 'neutral' } {
    const { positive, negative } = this.keywordConfig.getKeywordSets();
    let score = 0;
    let totalKeywords = 0;

    keywords.forEach(keyword => {
      const word = keyword.toLowerCase();
      if (positive.has(word)) {
        score += 1;
        totalKeywords++;
      } else if (negative.has(word)) {
        score -= 1;
        totalKeywords++;
      }
    });

    // Normalize score based on matched keywords
    const normalizedScore = totalKeywords > 0 ? score / totalKeywords : 0;
    
    let sentiment: 'positive' | 'negative' | 'neutral';
    if (normalizedScore > 0.1) sentiment = 'positive';
    else if (normalizedScore < -0.1) sentiment = 'negative';
    else sentiment = 'neutral';
    
    return { score: normalizedScore, sentiment };
  }

  calculateOverallScore(scores: {
    quality: number;
    clickbait: number;
    engagement: number;
    sentiment: number;
    category: number;
  }): number {
    const { weights } = this.config;
    return (
      scores.quality * weights.quality +
      (1 - scores.clickbait) * weights.clickbait +
      scores.engagement * weights.engagement +
      (scores.sentiment + 1) / 2 * weights.sentiment +
      scores.category * weights.category
    );
  }

  getQualityLevel(score: number): 'high' | 'medium' | 'low' {
    if (score >= this.config.thresholds.quality.high) return 'high';
    if (score >= this.config.thresholds.quality.medium) return 'medium';
    return 'low';
  }
} 