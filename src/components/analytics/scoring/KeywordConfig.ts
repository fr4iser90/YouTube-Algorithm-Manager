import { readFileSync } from 'fs';
import { join } from 'path';
import type { KeywordSets } from '@/types/keywords';

export class KeywordConfig {
  private static instance: KeywordConfig;
  private keywordSets: KeywordSets;

  private constructor() {
    this.keywordSets = {
      positive: new Set(),
      negative: new Set(),
      clickbait: new Set(),
      quality: new Set()
    };
    this.loadKeywords();
  }

  public static getInstance(): KeywordConfig {
    if (!KeywordConfig.instance) {
      KeywordConfig.instance = new KeywordConfig();
    }
    return KeywordConfig.instance;
  }

  private loadKeywords(): void {
    try {
      // Lade Clickbait-Patterns
      const clickbaitPatterns = JSON.parse(
        readFileSync(join(process.cwd(), 'training-presets/cleanup/clickbait/block-patterns.json'), 'utf-8')
      );
      this.keywordSets.clickbait = new Set(clickbaitPatterns.avoidKeywords);
      this.keywordSets.quality = new Set(clickbaitPatterns.targetKeywords);

      // Lade Creative Arts Keywords
      const creativeArts = JSON.parse(
        readFileSync(join(process.cwd(), 'training-presets/music/production/creative-arts-en.json'), 'utf-8')
      );
      
      // Füge positive Keywords hinzu
      creativeArts.targetKeywords.forEach((keyword: string) => {
        this.keywordSets.positive.add(keyword);
      });

      // Füge negative Keywords hinzu
      creativeArts.avoidKeywords.forEach((keyword: string) => {
        this.keywordSets.negative.add(keyword);
      });

    } catch (error) {
      console.error('❌ Fehler beim Laden der Keywords:', error);
      // Fallback zu Standard-Keywords
      this.loadDefaultKeywords();
    }
  }

  private loadDefaultKeywords(): void {
    // Fallback Keywords wenn Presets nicht geladen werden können
    this.keywordSets.positive = new Set(['quality', 'informative', 'educational']);
    this.keywordSets.negative = new Set(['clickbait', 'sensational', 'misleading']);
    this.keywordSets.clickbait = new Set(['shocking', 'you won\'t believe', 'mind blowing']);
    this.keywordSets.quality = new Set(['in-depth', 'analysis', 'research']);
  }

  public getKeywordSets(): KeywordSets {
    return this.keywordSets;
  }

  public updateKeywords(newKeywords: Partial<KeywordSets>): void {
    Object.entries(newKeywords).forEach(([key, keywords]) => {
      if (this.keywordSets[key as keyof KeywordSets]) {
        this.keywordSets[key as keyof KeywordSets] = new Set(keywords);
      }
    });
  }
} 