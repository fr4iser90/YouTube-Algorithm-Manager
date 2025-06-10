import { AlgorithmState } from './algorithm';

export interface BrowserProfile {
  id: string;
  name: string;
  description: string;
  userAgent: string;
  viewport: { width: number; height: number };
  
  // Timestamps
  createdAt: Date;
  lastUsed: Date;
  lastTrainingDate?: Date;
  
  // Status
  isActive: boolean;
  tags: string[];
  freezeProfile?: boolean;  // Whether to freeze profile updates
  
  // Anonymous interactions & statistics
  totalVideosWatched: number;
  totalSearches: number;
  trainingHours: number;
  averageWatchTime: number; // in minutes
  
  // Preferences (based on watch history)
  preferredCategories: string[];    // Frequently watched categories
  preferredChannels: string[];      // Frequently watched channels
  preferredKeywords: string[];      // Frequently searched keywords
  watchHistory: {                   // Recent videos
    videoId: string;
    watchTime: number;
    category: string;
    channel: string;
    timestamp: Date;
  }[];
  
  // Avoided content
  avoidedChannels: string[];        // Channels to avoid
  avoidedKeywords: string[];        // Keywords to avoid

  // New properties
  algorithmState?: AlgorithmState;  // Current algorithm state
  profileStrength: number;         // Profile strength in percentage
  color: string;                   // Profile color
  language: string;                // Profile language
  region: string;                  // Profile region
  category: string;                // Profile category
}

export interface ProfileSnapshot {
  id: string;
  profileId: string;
  name: string;
  category: string;
  createdAt: Date;
  lastUsed: Date;
  // Snapshot of preferences
  preferredCategories: string[];
  preferredChannels: string[];
  preferredKeywords: string[];
  avoidedChannels: string[];
  avoidedKeywords: string[];
}
