// Real Browser Automation with Puppeteer
// This replaces the mock implementation with actual browser control

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import { Page, Browser } from 'puppeteer';

// Add stealth plugin to avoid detection
puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

export interface RealBrowserConfig {
  headless: boolean;
  incognito: boolean;
  muteAudio: boolean;
  blockAds: boolean;
  userAgent: string;
  viewport: { width: number; height: number };
  speed: number;
  proxy?: string;
  language: string;
  region: string;
}

export interface YouTubeVideoData {
  title: string;
  channel: string;
  url: string;
  viewCount?: number;
  duration?: string;
  uploadDate?: string;
  description?: string;
}

export interface YouTubeRecommendation {
  title: string;
  channel: string;
  url: string;
  thumbnail?: string;
  position: number;
  category?: string;
}

export class RealYouTubeBrowserController {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private config: RealBrowserConfig;
  private isRunning: boolean = false;

  constructor(config: RealBrowserConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    try {
      console.log('🚀 Launching browser with real automation...');
      
      const launchOptions: any = {
        headless: this.config.headless ? 'new' : false,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          ...(this.config.incognito ? ['--incognito'] : []),
          ...(this.config.muteAudio ? ['--mute-audio'] : []),
          `--window-size=${this.config.viewport.width},${this.config.viewport.height}`,
          `--lang=${this.config.language}`,
        ],
        defaultViewport: this.config.viewport,
        ignoreHTTPSErrors: true,
        ignoreDefaultArgs: ['--enable-automation'],
      };

      // Add proxy if configured
      if (this.config.proxy) {
        launchOptions.args.push(`--proxy-server=${this.config.proxy}`);
      }

      this.browser = await puppeteer.launch(launchOptions);
      
      // Create new page (incognito if needed)
      if (this.config.incognito) {
        const context = await this.browser.createIncognitoBrowserContext();
        this.page = await context.newPage();
      } else {
        this.page = await this.browser.newPage();
      }

      // Set user agent
      if (this.config.userAgent !== 'default') {
        await this.page.setUserAgent(this.getUserAgent());
      }

      // Set language and region
      await this.page.setExtraHTTPHeaders({
        'Accept-Language': `${this.config.language}-${this.config.region},${this.config.language};q=0.9,en;q=0.8`
      });

      // Block unnecessary resources for faster loading
      await this.page.setRequestInterception(true);
      this.page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (resourceType === 'image' || resourceType === 'stylesheet' || resourceType === 'font') {
          req.abort();
        } else {
          req.continue();
        }
      });

      // Navigate to YouTube
      await this.page.goto('https://www.youtube.com', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Accept cookies if needed
      await this.handleCookieConsent();

      this.isRunning = true;
      console.log('✅ Browser initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize browser:', error);
      throw error;
    }
  }

  private getUserAgent(): string {
    const userAgents = {
      'mobile': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
      'firefox': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0',
      'safari': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Safari/605.1.15',
      'edge': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
      'random': this.getRandomUserAgent()
    };

    return userAgents[this.config.userAgent as keyof typeof userAgents] || userAgents.random;
  }

  private getRandomUserAgent(): string {
    const agents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ];
    return agents[Math.floor(Math.random() * agents.length)];
  }

  private async handleCookieConsent(): Promise<void> {
    try {
      // Wait for cookie consent dialog and accept
      await this.page!.waitForSelector('button[aria-label*="Accept"], button[aria-label*="Akzeptieren"]', { timeout: 5000 });
      await this.page!.click('button[aria-label*="Accept"], button[aria-label*="Akzeptieren"]');
      await this.delay(2000);
    } catch (error) {
      // Cookie dialog might not appear, continue
      console.log('No cookie consent dialog found');
    }
  }

  async performSearch(query: string): Promise<YouTubeVideoData[]> {
    if (!this.page || !this.isRunning) throw new Error('Browser not initialized');

    try {
      console.log(`🔍 Searching for: "${query}"`);

      // Navigate to search
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
      await this.page.goto(searchUrl, { waitUntil: 'networkidle2' });

      // Wait for search results
      await this.page.waitForSelector('ytd-video-renderer', { timeout: 10000 });

      // Extract search results
      const results = await this.page.evaluate(() => {
        const videoElements = document.querySelectorAll('ytd-video-renderer');
        const videos: any[] = [];

        videoElements.forEach((element, index) => {
          if (index >= 10) return; // Limit to first 10 results

          const titleElement = element.querySelector('#video-title');
          const channelElement = element.querySelector('#channel-name a');
          const linkElement = element.querySelector('#video-title');

          if (titleElement && channelElement && linkElement) {
            videos.push({
              title: titleElement.textContent?.trim() || '',
              channel: channelElement.textContent?.trim() || '',
              url: 'https://www.youtube.com' + linkElement.getAttribute('href'),
            });
          }
        });

        return videos;
      });

      await this.humanDelay();
      return results;

    } catch (error) {
      console.error('❌ Search failed:', error);
      return [];
    }
  }

  async watchVideo(url: string, duration: number, engagementRate: number = 0.7): Promise<YouTubeVideoData | null> {
    if (!this.page || !this.isRunning) throw new Error('Browser not initialized');

    try {
      console.log(`📺 Watching video: ${url}`);

      await this.page.goto(url, { waitUntil: 'networkidle2' });

      // Wait for video to load
      await this.page.waitForSelector('video', { timeout: 10000 });

      // Extract video data
      const videoData = await this.page.evaluate(() => {
        const titleElement = document.querySelector('h1.ytd-video-primary-info-renderer');
        const channelElement = document.querySelector('#channel-name a');
        const viewCountElement = document.querySelector('#count .view-count');

        return {
          title: titleElement?.textContent?.trim() || '',
          channel: channelElement?.textContent?.trim() || '',
          url: window.location.href,
          viewCount: viewCountElement?.textContent?.trim() || '',
        };
      });

      // Start video playback
      await this.page.click('video');
      await this.delay(2000);

      // Watch for specified duration with realistic behavior
      const watchTime = Math.min(duration, 300); // Max 5 minutes
      const segments = Math.floor(watchTime / 10); // Check every 10 seconds

      for (let i = 0; i < segments; i++) {
        await this.delay(10000 / this.config.speed);
        
        // Randomly scroll or interact
        if (Math.random() < 0.3) {
          await this.page.evaluate(() => {
            window.scrollBy(0, Math.random() * 200 - 100);
          });
        }
      }

      // Engage with video based on engagement rate
      if (Math.random() < engagementRate) {
        await this.likeVideo();
      }

      return videoData;

    } catch (error) {
      console.error('❌ Video watching failed:', error);
      return null;
    }
  }

  async likeVideo(): Promise<void> {
    if (!this.page) return;

    try {
      // Find and click like button
      const likeButton = await this.page.$('button[aria-label*="like"], button[title*="like"]');
      if (likeButton) {
        await likeButton.click();
        await this.humanDelay();
        console.log('👍 Liked video');
      }
    } catch (error) {
      console.log('Could not like video:', error);
    }
  }

  async subscribeToChannel(): Promise<void> {
    if (!this.page) return;

    try {
      const subscribeButton = await this.page.$('button[aria-label*="Subscribe"], button[aria-label*="Abonnieren"]');
      if (subscribeButton) {
        await subscribeButton.click();
        await this.humanDelay();
        console.log('🔔 Subscribed to channel');
      }
    } catch (error) {
      console.log('Could not subscribe:', error);
    }
  }

  async extractRecommendations(): Promise<YouTubeRecommendation[]> {
    if (!this.page) return [];

    try {
      // Extract sidebar recommendations
      const recommendations = await this.page.evaluate(() => {
        const recElements = document.querySelectorAll('ytd-compact-video-renderer, ytd-video-renderer');
        const recs: any[] = [];

        recElements.forEach((element, index) => {
          const titleElement = element.querySelector('#video-title');
          const channelElement = element.querySelector('#channel-name a, .ytd-channel-name a');
          const linkElement = element.querySelector('#video-title');
          const thumbnailElement = element.querySelector('img');

          if (titleElement && channelElement && linkElement) {
            recs.push({
              title: titleElement.textContent?.trim() || '',
              channel: channelElement.textContent?.trim() || '',
              url: 'https://www.youtube.com' + linkElement.getAttribute('href'),
              thumbnail: thumbnailElement?.getAttribute('src') || '',
              position: index + 1
            });
          }
        });

        return recs.slice(0, 20); // Limit to 20 recommendations
      });

      return recommendations;

    } catch (error) {
      console.error('❌ Failed to extract recommendations:', error);
      return [];
    }
  }

  async clearHistory(): Promise<void> {
    if (!this.page) return;

    try {
      console.log('🧹 Clearing browser history...');
      
      // Navigate to history page
      await this.page.goto('https://www.youtube.com/feed/history', { waitUntil: 'networkidle2' });
      
      // Look for clear history button
      const clearButton = await this.page.$('button[aria-label*="Clear"], button[aria-label*="Löschen"]');
      if (clearButton) {
        await clearButton.click();
        await this.delay(2000);
        
        // Confirm if needed
        const confirmButton = await this.page.$('button[aria-label*="Clear"], button[aria-label*="Delete"]');
        if (confirmButton) {
          await confirmButton.click();
        }
      }

      // Clear cookies and local storage
      await this.page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      const client = await this.page.target().createCDPSession();
      await client.send('Network.clearBrowserCookies');
      await client.send('Network.clearBrowserCache');

      console.log('✅ History cleared');

    } catch (error) {
      console.error('❌ Failed to clear history:', error);
    }
  }

  async setLanguageAndRegion(language: string, region: string): Promise<void> {
    if (!this.page) return;

    try {
      // Navigate to settings
      await this.page.goto('https://www.youtube.com/account', { waitUntil: 'networkidle2' });
      
      // This would require more complex navigation through YouTube's settings
      // For now, we set it via headers and URL parameters
      await this.page.setExtraHTTPHeaders({
        'Accept-Language': `${language}-${region},${language};q=0.9,en;q=0.8`
      });

      console.log(`🌍 Set language to ${language} and region to ${region}`);

    } catch (error) {
      console.error('❌ Failed to set language/region:', error);
    }
  }

  async blockChannel(channelName: string): Promise<void> {
    // This would require navigating to the channel and using the block feature
    console.log(`🚫 Blocking channel: ${channelName}`);
  }

  async getCurrentVideoData(): Promise<YouTubeVideoData | null> {
    if (!this.page) return null;

    try {
      return await this.page.evaluate(() => {
        const titleElement = document.querySelector('h1.ytd-video-primary-info-renderer');
        const channelElement = document.querySelector('#channel-name a');
        const viewCountElement = document.querySelector('#count .view-count');
        const descriptionElement = document.querySelector('#description');

        return {
          title: titleElement?.textContent?.trim() || '',
          channel: channelElement?.textContent?.trim() || '',
          url: window.location.href,
          viewCount: viewCountElement?.textContent?.trim() || '',
          description: descriptionElement?.textContent?.trim() || '',
        };
      });
    } catch (error) {
      return null;
    }
  }

  async takeScreenshot(filename: string): Promise<void> {
    if (!this.page) return;
    
    await this.page.screenshot({ 
      path: filename, 
      fullPage: true 
    });
  }

  async close(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }
      
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
      
      this.isRunning = false;
      console.log('🔒 Browser closed');

    } catch (error) {
      console.error('❌ Error closing browser:', error);
    }
  }

  // Utility methods
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async humanDelay(): Promise<void> {
    // Random delay between 1-3 seconds to simulate human behavior
    const delay = Math.random() * 2000 + 1000;
    await this.delay(delay);
  }

  // Getters
  get isInitialized(): boolean {
    return this.isRunning && this.page !== null;
  }

  get currentUrl(): string {
    return this.page?.url() || '';
  }
}

// Factory function
export const createRealBrowserController = (config: RealBrowserConfig): RealYouTubeBrowserController => {
  return new RealYouTubeBrowserController(config);
};

// Utility functions for content analysis
export const analyzeContent = (title: string, targetKeywords: string[], avoidKeywords: string[]) => {
  const titleLower = title.toLowerCase();
  
  const targetMatches = targetKeywords.filter(keyword => 
    titleLower.includes(keyword.toLowerCase())
  );
  
  const avoidMatches = avoidKeywords.filter(keyword => 
    titleLower.includes(keyword.toLowerCase())
  );
  
  return {
    isTargetContent: targetMatches.length > 0,
    isAvoidContent: avoidMatches.length > 0,
    targetMatches,
    avoidMatches,
    relevanceScore: targetMatches.length > 0 ? 100 : avoidMatches.length > 0 ? 0 : 50
  };
};

export const calculateBubbleStrength = (recommendations: YouTubeRecommendation[], targetKeywords: string[]): number => {
  if (recommendations.length === 0) return 0;
  
  const targetCount = recommendations.filter(rec => 
    targetKeywords.some(keyword => 
      rec.title.toLowerCase().includes(keyword.toLowerCase())
    )
  ).length;
  
  return Math.round((targetCount / recommendations.length) * 100);
};