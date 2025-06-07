// Machine Learning Content Classifier - Browser Compatible Version
export interface ContentAnalysis {
  category: string;
  confidence: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  keywords: string[];
  topics: string[];
  language: string;
  isClickbait: boolean;
  clickbaitScore: number;
  qualityScore: number;
  engagementPrediction: number;
}

export interface TrainingData {
  text: string;
  category: string;
  sentiment: number;
  isClickbait: boolean;
  qualityScore: number;
}

export class MLContentClassifier {
  private isInitialized: boolean = false;
  private categories: string[] = [
    'tech', 'science', 'politics', 'music', 'lifestyle', 'gaming', 
    'education', 'entertainment', 'news', 'sports', 'cooking', 'travel'
  ];

  // Simple sentiment word lists for browser-based analysis
  private positiveWords = [
    'amazing', 'awesome', 'brilliant', 'excellent', 'fantastic', 'great', 'incredible',
    'outstanding', 'perfect', 'wonderful', 'best', 'love', 'beautiful', 'good'
  ];

  private negativeWords = [
    'awful', 'terrible', 'horrible', 'bad', 'worst', 'hate', 'disgusting',
    'disappointing', 'failed', 'broken', 'useless', 'annoying', 'boring'
  ];

  async initialize(): Promise<void> {
    try {
      console.log('🧠 Initializing ML Content Classifier (Browser Mode)...');
      
      // Browser-compatible initialization
      this.isInitialized = true;
      console.log('✅ ML Content Classifier initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize ML classifier:', error);
      throw error;
    }
  }

  async analyzeContent(title: string, description?: string, channelName?: string): Promise<ContentAnalysis> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const fullText = [title, description, channelName].filter(Boolean).join(' ');
    
    try {
      // Text preprocessing
      const processedText = this.preprocessText(fullText);
      
      // Category prediction using keyword matching
      const categoryPrediction = this.predictCategory(processedText);
      
      // Sentiment analysis using word lists
      const sentimentResult = this.analyzeSentiment(fullText);
      
      // Clickbait detection
      const clickbaitAnalysis = this.detectClickbait(title);
      
      // Quality assessment
      const qualityScore = this.assessQuality(title, description);
      
      // Keyword extraction
      const keywords = this.extractKeywords(fullText);
      
      // Topic modeling
      const topics = this.extractTopics(fullText);
      
      // Language detection
      const language = this.detectLanguage(fullText);
      
      // Engagement prediction
      const engagementPrediction = this.predictEngagement(sentimentResult.score, qualityScore);

      return {
        category: categoryPrediction.category,
        confidence: categoryPrediction.confidence,
        sentiment: sentimentResult.sentiment,
        sentimentScore: sentimentResult.score,
        keywords,
        topics,
        language,
        isClickbait: clickbaitAnalysis.isClickbait,
        clickbaitScore: clickbaitAnalysis.score,
        qualityScore,
        engagementPrediction
      };

    } catch (error) {
      console.error('❌ Content analysis failed:', error);
      
      // Fallback analysis
      return this.getFallbackAnalysis(title, description);
    }
  }

  private preprocessText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private predictCategory(text: string): { category: string; confidence: number } {
    const categoryKeywords = {
      tech: ['ai', 'artificial', 'intelligence', 'machine', 'learning', 'computer', 'software', 'programming', 'code', 'tech', 'digital', 'app', 'website'],
      science: ['science', 'research', 'study', 'experiment', 'discovery', 'biology', 'chemistry', 'physics', 'space', 'nasa', 'laboratory'],
      politics: ['politics', 'government', 'election', 'vote', 'president', 'congress', 'senate', 'policy', 'law', 'democracy'],
      music: ['music', 'song', 'album', 'artist', 'band', 'concert', 'guitar', 'piano', 'singing', 'melody', 'rhythm'],
      lifestyle: ['lifestyle', 'life', 'daily', 'routine', 'health', 'fitness', 'fashion', 'beauty', 'home', 'family'],
      gaming: ['game', 'gaming', 'play', 'player', 'xbox', 'playstation', 'nintendo', 'pc', 'mobile', 'esports'],
      education: ['education', 'learn', 'tutorial', 'course', 'school', 'university', 'study', 'teach', 'lesson', 'knowledge'],
      entertainment: ['entertainment', 'movie', 'film', 'tv', 'show', 'celebrity', 'actor', 'actress', 'comedy', 'drama'],
      news: ['news', 'breaking', 'report', 'journalist', 'media', 'press', 'update', 'current', 'events', 'headline'],
      sports: ['sports', 'football', 'basketball', 'soccer', 'baseball', 'tennis', 'golf', 'olympics', 'athlete', 'team'],
      cooking: ['cooking', 'recipe', 'food', 'kitchen', 'chef', 'baking', 'ingredients', 'meal', 'restaurant', 'cuisine'],
      travel: ['travel', 'trip', 'vacation', 'destination', 'hotel', 'flight', 'adventure', 'explore', 'journey', 'tourism']
    };

    let bestCategory = 'unknown';
    let bestScore = 0;

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      let score = 0;
      keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          score += 1;
        }
      });
      
      const normalizedScore = score / keywords.length;
      if (normalizedScore > bestScore) {
        bestScore = normalizedScore;
        bestCategory = category;
      }
    }

    return {
      category: bestCategory,
      confidence: Math.min(bestScore * 2, 1) // Scale confidence
    };
  }

  private analyzeSentiment(text: string): { sentiment: 'positive' | 'negative' | 'neutral'; score: number } {
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;

    words.forEach(word => {
      if (this.positiveWords.includes(word)) {
        score += 1;
      } else if (this.negativeWords.includes(word)) {
        score -= 1;
      }
    });

    // Normalize score
    const normalizedScore = score / Math.max(words.length / 10, 1);
    
    let sentiment: 'positive' | 'negative' | 'neutral';
    if (normalizedScore > 0.1) sentiment = 'positive';
    else if (normalizedScore < -0.1) sentiment = 'negative';
    else sentiment = 'neutral';
    
    return {
      sentiment,
      score: normalizedScore
    };
  }

  private detectClickbait(title: string): { isClickbait: boolean; score: number } {
    const clickbaitIndicators = [
      /you won't believe/i,
      /shocking/i,
      /amazing/i,
      /incredible/i,
      /must see/i,
      /gone wrong/i,
      /gone sexual/i,
      /\d+ things/i,
      /this will/i,
      /watch until the end/i,
      /!!!+/,
      /\?{2,}/,
      /clickbait/i
    ];

    let score = 0;
    clickbaitIndicators.forEach(pattern => {
      if (pattern.test(title)) {
        score += 0.2;
      }
    });

    // Check for excessive punctuation
    const punctuationRatio = (title.match(/[!?]/g) || []).length / title.length;
    score += punctuationRatio * 2;

    // Check for caps ratio
    const capsRatio = (title.match(/[A-Z]/g) || []).length / title.length;
    if (capsRatio > 0.3) score += 0.3;

    score = Math.min(score, 1);
    
    return {
      isClickbait: score > 0.5,
      score
    };
  }

  private assessQuality(title: string, description?: string): number {
    let score = 0.5; // Base score
    
    // Title quality
    if (title.length > 10 && title.length < 100) score += 0.1;
    if (!/[!?]{2,}/.test(title)) score += 0.1;
    if (!/^[A-Z\s!?]+$/.test(title)) score += 0.1; // Not all caps
    
    // Description quality
    if (description) {
      if (description.length > 50) score += 0.1;
      if (description.length > 200) score += 0.1;
      if (!/spam|subscribe|like|comment/i.test(description)) score += 0.1;
    }
    
    return Math.min(score, 1);
  }

  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['this', 'that', 'with', 'have', 'will', 'from', 'they', 'been', 'were', 'said'].includes(word));

    // Get unique words and their frequency
    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Sort by frequency and return top keywords
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  private extractTopics(text: string): string[] {
    // Simple topic extraction based on common patterns
    const topicPatterns = [
      /about (\w+)/gi,
      /(\w+) tutorial/gi,
      /(\w+) review/gi,
      /(\w+) guide/gi,
      /how to (\w+)/gi
    ];

    const topics: string[] = [];
    
    topicPatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].length > 2) {
          topics.push(match[1].toLowerCase());
        }
      }
    });

    return [...new Set(topics)].slice(0, 5);
  }

  private detectLanguage(text: string): string {
    // Simple language detection based on common words
    const germanWords = ['der', 'die', 'das', 'und', 'ist', 'ein', 'eine', 'mit', 'für', 'auf'];
    const englishWords = ['the', 'and', 'is', 'a', 'an', 'with', 'for', 'on', 'in', 'to'];
    const spanishWords = ['el', 'la', 'y', 'es', 'un', 'una', 'con', 'para', 'en', 'de'];
    
    const words = text.toLowerCase().split(/\s+/);
    
    let germanScore = 0;
    let englishScore = 0;
    let spanishScore = 0;
    
    words.forEach(word => {
      if (germanWords.includes(word)) germanScore++;
      if (englishWords.includes(word)) englishScore++;
      if (spanishWords.includes(word)) spanishScore++;
    });
    
    if (germanScore > englishScore && germanScore > spanishScore) return 'de';
    if (spanishScore > englishScore && spanishScore > germanScore) return 'es';
    return 'en';
  }

  private predictEngagement(sentiment: number, quality: number): number {
    // Simple engagement prediction based on features
    const baseEngagement = 0.5;
    const sentimentBoost = sentiment > 0 ? 0.2 : sentiment < 0 ? -0.1 : 0;
    const qualityBoost = (quality - 0.5) * 0.3;
    
    return Math.max(0, Math.min(1, baseEngagement + sentimentBoost + qualityBoost));
  }

  private getFallbackAnalysis(title: string, description?: string): ContentAnalysis {
    return {
      category: 'unknown',
      confidence: 0.1,
      sentiment: 'neutral',
      sentimentScore: 0,
      keywords: title.split(' ').slice(0, 5),
      topics: [],
      language: 'en',
      isClickbait: false,
      clickbaitScore: 0,
      qualityScore: 0.5,
      engagementPrediction: 0.5
    };
  }

  // Batch analysis for multiple videos
  async analyzeMultipleContents(contents: Array<{ title: string; description?: string; channelName?: string }>): Promise<ContentAnalysis[]> {
    const results: ContentAnalysis[] = [];
    
    for (const content of contents) {
      const analysis = await this.analyzeContent(content.title, content.description, content.channelName);
      results.push(analysis);
    }
    
    return results;
  }

  // Get model performance metrics
  getModelMetrics(): { accuracy: number; categories: string[]; isInitialized: boolean } {
    return {
      accuracy: this.isInitialized ? 0.75 : 0, // Mock accuracy for browser version
      categories: this.categories,
      isInitialized: this.isInitialized
    };
  }
}

// Factory function
export const createMLClassifier = (): MLContentClassifier => {
  return new MLContentClassifier();
};

// Utility functions
export const analyzeContentBatch = async (
  classifier: MLContentClassifier,
  videos: Array<{ title: string; description?: string; channel?: string }>
): Promise<ContentAnalysis[]> => {
  return await classifier.analyzeMultipleContents(videos);
};

export const filterContentByQuality = (
  analyses: ContentAnalysis[],
  minQuality: number = 0.6
): ContentAnalysis[] => {
  return analyses.filter(analysis => analysis.qualityScore >= minQuality);
};

export const groupContentByCategory = (analyses: ContentAnalysis[]): Record<string, ContentAnalysis[]> => {
  return analyses.reduce((groups, analysis) => {
    const category = analysis.category;
    if (!groups[category]) groups[category] = [];
    groups[category].push(analysis);
    return groups;
  }, {} as Record<string, ContentAnalysis[]>);
};