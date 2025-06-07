// Automation Manager - Orchestrates the entire training process
import { RealYouTubeBrowserController, createRealBrowserController, RealBrowserConfig } from './realBrowserAutomation';
import { BubblePreset, TrainingSession, AlgorithmState } from '../types';

export interface AutomationProgress {
  currentAction: string;
  progress: number;
  recommendations: any[];
  bubbleScore: number;
  videosWatched: number;
  searchesPerformed: number;
}

export class AutomationManager {
  private browserController: RealYouTubeBrowserController | null = null;
  private isRunning: boolean = false;
  private currentSession: TrainingSession | null = null;

  async startTraining(
    preset: BubblePreset,
    browserConfig: any,
    anonymousConfig: any,
    onProgress: (progress: AutomationProgress) => void,
    onComplete: (results: AlgorithmState) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      this.isRunning = true;
      
      // Convert configs to browser config
      const realBrowserConfig: RealBrowserConfig = {
        headless: browserConfig.headless || false,
        incognito: browserConfig.useIncognito || true,
        muteAudio: browserConfig.muteAudio || true,
        blockAds: browserConfig.blockAds || true,
        userAgent: browserConfig.userAgent || 'default',
        viewport: browserConfig.viewport || { width: 1920, height: 1080 },
        speed: browserConfig.speed || 2,
        language: preset.language,
        region: preset.region
      };

      // Initialize browser
      onProgress({
        currentAction: 'Browser wird gestartet...',
        progress: 5,
        recommendations: [],
        bubbleScore: 0,
        videosWatched: 0,
        searchesPerformed: 0
      });

      this.browserController = createRealBrowserController(realBrowserConfig);
      await this.browserController.initialize();

      // Clear history if requested
      if (preset.advancedOptions.clearHistoryFirst) {
        onProgress({
          currentAction: 'Browser-Verlauf wird gelöscht...',
          progress: 10,
          recommendations: [],
          bubbleScore: 0,
          videosWatched: 0,
          searchesPerformed: 0
        });
        
        await this.browserController.clearHistory();
      }

      // Set language and region
      onProgress({
        currentAction: `Sprache auf ${preset.language} und Region auf ${preset.region} setzen...`,
        progress: 15,
        recommendations: [],
        bubbleScore: 0,
        videosWatched: 0,
        searchesPerformed: 0
      });

      await this.browserController.setLanguageAndRegion(preset.language, preset.region);

      // Perform searches and watch videos
      let progress = 20;
      let videosWatched = 0;
      let searchesPerformed = 0;
      let allRecommendations: any[] = [];

      // Execute searches
      for (const search of preset.searches || []) {
        if (!this.isRunning) break;

        onProgress({
          currentAction: `Suche nach: "${search.query}"`,
          progress: progress,
          recommendations: allRecommendations,
          bubbleScore: this.calculateBubbleScore(allRecommendations, preset.targetKeywords),
          videosWatched,
          searchesPerformed
        });

        const searchResults = await this.browserController.performSearch(search.query);
        searchesPerformed++;

        // Watch videos from search results
        const videosToWatch = Math.min(search.frequency || 3, searchResults.length);
        
        for (let i = 0; i < videosToWatch; i++) {
          if (!this.isRunning) break;

          const video = searchResults[i];
          if (!video) continue;

          onProgress({
            currentAction: `Video ansehen: "${video.title}"`,
            progress: progress + (i / videosToWatch) * 10,
            recommendations: allRecommendations,
            bubbleScore: this.calculateBubbleScore(allRecommendations, preset.targetKeywords),
            videosWatched,
            searchesPerformed
          });

          await this.browserController.watchVideo(
            video.url,
            search.duration || 90,
            preset.advancedOptions.engagementRate
          );

          videosWatched++;

          // Extract recommendations after each video
          const newRecommendations = await this.browserController.extractRecommendations();
          allRecommendations = [...allRecommendations, ...newRecommendations];

          // Human-like delay between videos
          await this.delay(this.getRandomDelay(5000, 15000));
        }

        progress += 15;
      }

      // Block unwanted channels
      for (const channelPref of preset.channelPreferences || []) {
        if (channelPref.action === 'block') {
          onProgress({
            currentAction: `Kanal blockieren: ${channelPref.channelName}`,
            progress: progress,
            recommendations: allRecommendations,
            bubbleScore: this.calculateBubbleScore(allRecommendations, preset.targetKeywords),
            videosWatched,
            searchesPerformed
          });

          await this.browserController.blockChannel(channelPref.channelName);
          progress += 2;
        }
      }

      // Final analysis
      onProgress({
        currentAction: 'Finale Analyse der Algorithmus-Änderungen...',
        progress: 95,
        recommendations: allRecommendations,
        bubbleScore: this.calculateBubbleScore(allRecommendations, preset.targetKeywords),
        videosWatched,
        searchesPerformed
      });

      // Generate final results
      const finalResults: AlgorithmState = {
        timestamp: new Date(),
        recommendations: allRecommendations.slice(0, 50), // Limit to 50 most recent
        categories: this.analyzeCategoryDistribution(allRecommendations, preset.targetKeywords),
        sentiment: this.analyzeSentiment(allRecommendations, preset.targetKeywords, preset.avoidKeywords),
        bubbleScore: this.calculateBubbleScore(allRecommendations, preset.targetKeywords),
        language: preset.language,
        region: preset.region,
        blockedChannels: preset.channelPreferences?.filter(cp => cp.action === 'block').map(cp => cp.channelName) || [],
        prioritizedChannels: preset.channelPreferences?.filter(cp => cp.action === 'prioritize').map(cp => cp.channelName) || []
      };

      onProgress({
        currentAction: 'Training abgeschlossen!',
        progress: 100,
        recommendations: allRecommendations,
        bubbleScore: finalResults.bubbleScore,
        videosWatched,
        searchesPerformed
      });

      onComplete(finalResults);

    } catch (error) {
      console.error('❌ Training failed:', error);
      onError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      await this.cleanup();
    }
  }

  async pauseTraining(): Promise<void> {
    this.isRunning = false;
  }

  async stopTraining(): Promise<void> {
    this.isRunning = false;
    await this.cleanup();
  }

  private async cleanup(): Promise<void> {
    if (this.browserController) {
      await this.browserController.close();
      this.browserController = null;
    }
    this.isRunning = false;
  }

  private calculateBubbleScore(recommendations: any[], targetKeywords: string[]): number {
    if (recommendations.length === 0) return 0;
    
    const targetMatches = recommendations.filter(rec => 
      targetKeywords.some(keyword => 
        rec.title?.toLowerCase().includes(keyword.toLowerCase())
      )
    ).length;
    
    return Math.round((targetMatches / recommendations.length) * 100);
  }

  private analyzeCategoryDistribution(recommendations: any[], targetKeywords: string[]) {
    const categories = new Map<string, number>();
    
    recommendations.forEach(rec => {
      // Simple categorization based on keywords
      let category = 'other';
      
      for (const keyword of targetKeywords) {
        if (rec.title?.toLowerCase().includes(keyword.toLowerCase())) {
          category = keyword;
          break;
        }
      }
      
      categories.set(category, (categories.get(category) || 0) + 1);
    });

    return Array.from(categories.entries()).map(([category, count]) => ({
      category,
      percentage: Math.round((count / recommendations.length) * 100),
      count
    }));
  }

  private analyzeSentiment(recommendations: any[], targetKeywords: string[], avoidKeywords: string[]): 'positive' | 'negative' | 'neutral' {
    const targetMatches = recommendations.filter(rec => 
      targetKeywords.some(keyword => 
        rec.title?.toLowerCase().includes(keyword.toLowerCase())
      )
    ).length;

    const avoidMatches = recommendations.filter(rec => 
      avoidKeywords.some(keyword => 
        rec.title?.toLowerCase().includes(keyword.toLowerCase())
      )
    ).length;

    if (targetMatches > avoidMatches * 2) return 'positive';
    if (avoidMatches > targetMatches) return 'negative';
    return 'neutral';
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getRandomDelay(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  get isTrainingActive(): boolean {
    return this.isRunning;
  }
}

// Singleton instance
export const automationManager = new AutomationManager();