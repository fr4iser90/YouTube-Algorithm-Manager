import type { AlgorithmState, AnalyticsResults, CategoryDistribution } from '@/types/algorithm';

export class AlgorithmAnalyzer {
  private state: AlgorithmState;

  constructor(state: AlgorithmState) {
    this.state = state;
  }

  public analyzeContent(): AnalyticsResults {
    return {
      historyVideoCount: this.state.totalVideosWatched,
      recommendedVideoCount: this.state.recommendations.length,
      topKeywords: this.extractTopKeywords(),
      topPhrases: this.extractTopPhrases(),
      topChannels: this.analyzeChannels(),
      topVideos: this.getTopVideos(),
      categoryDistribution: this.calculateCategoryDistribution(),
      engagementPatterns: this.analyzeEngagementPatterns(),
      timestamp: Date.now()
    };
  }

  private extractTopKeywords(): { term: string; score: number }[] {
    const keywordMap = new Map<string, number>();
    
    // Analyze from recommendations
    this.state.recommendations.forEach(rec => {
      const words = rec.title.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 3) { // Ignore short words
          keywordMap.set(word, (keywordMap.get(word) || 0) + 1);
        }
      });
    });

    // Convert to array and sort
    return Array.from(keywordMap.entries())
      .map(([term, count]) => ({ term, score: count }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 20); // Top 20 keywords
  }

  private extractTopPhrases(): { phrase: string; count: number }[] {
    const phraseMap = new Map<string, number>();
    
    // Extract 2-3 word phrases from titles
    this.state.recommendations.forEach(rec => {
      const words = rec.title.toLowerCase().split(/\s+/);
      for (let i = 0; i < words.length - 1; i++) {
        const phrase = `${words[i]} ${words[i + 1]}`;
        phraseMap.set(phrase, (phraseMap.get(phrase) || 0) + 1);
      }
    });

    return Array.from(phraseMap.entries())
      .map(([phrase, count]) => ({ phrase, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15); // Top 15 phrases
  }

  private analyzeChannels() {
    const channelMap = new Map<string, {
      count: number;
      categories: Set<string>;
      keywords: Set<string>;
    }>();

    this.state.recommendations.forEach(rec => {
      const channel = channelMap.get(rec.channel) || {
        count: 0,
        categories: new Set(),
        keywords: new Set()
      };

      channel.count++;
      channel.categories.add(rec.category);
      rec.title.toLowerCase().split(/\s+/).forEach(word => {
        if (word.length > 3) channel.keywords.add(word);
      });

      channelMap.set(rec.channel, channel);
    });

    return Array.from(channelMap.entries()).map(([channel, data]) => ({
      channel,
      count: data.count,
      historyRatio: this.calculateHistoryRatio(channel),
      recommendationRatio: data.count / this.state.recommendations.length,
      categories: Array.from(data.categories),
      keywords: Array.from(data.keywords)
    })).sort((a, b) => b.count - a.count);
  }

  private calculateHistoryRatio(channel: string): number {
    // This would need to be implemented based on actual watch history data
    return 0.5; // Placeholder
  }

  private getTopVideos() {
    return this.state.recommendations
      .slice(0, 10)
      .map(rec => ({
        title: rec.title,
        url: `https://youtube.com/watch?v=${rec.id}`
      }));
  }

  private calculateCategoryDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {};
    const total = this.state.recommendations.length;

    this.state.recommendations.forEach(rec => {
      distribution[rec.category] = (distribution[rec.category] || 0) + 1;
    });

    // Convert to percentages
    Object.keys(distribution).forEach(category => {
      distribution[category] = (distribution[category] / total) * 100;
    });

    return distribution;
  }

  private analyzeEngagementPatterns() {
    return {
      watchTimeDistribution: this.calculateWatchTimeDistribution(),
      contentTypes: this.analyzeContentTypes(),
      peakHours: this.calculatePeakHours()
    };
  }

  private calculateWatchTimeDistribution(): Record<string, number> {
    // This would need real watch time data
    return {
      '0-5min': 0.3,
      '5-10min': 0.4,
      '10-20min': 0.2,
      '20+min': 0.1
    };
  }

  private analyzeContentTypes(): Record<string, number> {
    const types: Record<string, number> = {};
    this.state.recommendations.forEach(rec => {
      types[rec.category] = (types[rec.category] || 0) + 1;
    });
    return types;
  }

  private calculatePeakHours(): Record<string, number> {
    // This would need real watch time data
    return {
      'morning': 0.2,
      'afternoon': 0.4,
      'evening': 0.3,
      'night': 0.1
    };
  }
}
