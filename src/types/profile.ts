export interface BrowserProfile {
  id: string;
  name: string;
  description: string;
  // Browser-Daten
  cookies: string;
  localStorage: string;
  sessionStorage: string;
  userAgent: string;
  viewport: { width: number; height: number };
  
  // Zeitstempel
  createdAt: Date;
  lastUsed: Date;
  lastTrainingDate?: Date;
  
  // Status
  isActive: boolean;
  tags: string[];
  
  // Anonyme Interaktionen & Statistiken
  totalVideosWatched: number;
  totalSearches: number;
  trainingHours: number;
  averageWatchTime: number; // in Minuten
  
  // Präferenzen (basierend auf Watch-History)
  preferredCategories: string[];    // Häufig angesehene Kategorien
  preferredChannels: string[];      // Häufig angesehene Kanäle
  preferredKeywords: string[];      // Häufig gesuchte Keywords
  watchHistory: {                   // Letzte Videos
    videoId: string;
    watchTime: number;
    category: string;
    channel: string;
    timestamp: Date;
  }[];
  
  // Vermiedene Inhalte
  avoidedChannels: string[];        // Kanäle die vermieden werden
  avoidedKeywords: string[];        // Keywords die vermieden werden
}

export interface ProfileSnapshot {
  id: string;
  profileId: string;
  name: string;
  category: string;
  cookies: string;
  localStorage: string;
  createdAt: Date;
  lastUsed: Date;
  // Momentaufnahme der Präferenzen
  preferredCategories: string[];
  preferredChannels: string[];
  preferredKeywords: string[];
  avoidedChannels: string[];
  avoidedKeywords: string[];
}
