import { TrainingPreset } from '../types';

export const presetTemplates: Omit<TrainingPreset, 'id' | 'createdAt'>[] = [
  {
    name: "Tech Deep Dive (English)",
    description: "AI research, programming, and cutting-edge technology in English",
    category: 'tech',
    color: '#3B82F6',
    language: 'en',
    region: 'US',
    searches: [
      { query: "AI research papers 2024", frequency: 5, duration: 120, language: 'en', region: 'US' },
      { query: "Rust programming tutorial", frequency: 3, duration: 90, language: 'en', region: 'US' },
      { query: "Machine learning explained", frequency: 4, duration: 100, language: 'en', region: 'US' },
      { query: "Tech conference talks", frequency: 2, duration: 150, language: 'en', region: 'US' },
      { query: "Open source projects", frequency: 3, duration: 80, language: 'en', region: 'US' },
      { query: "Software engineering best practices", frequency: 2, duration: 110, language: 'en', region: 'US' }
    ],
    watchPatterns: [
      { category: 'tech', watchTime: 0.85, engagement: 'like', language: 'en' },
      { category: 'programming', watchTime: 0.90, engagement: 'like', language: 'en' },
      { category: 'ai', watchTime: 0.95, engagement: 'like', language: 'en' }
    ],
    channelPreferences: [
      { channelId: 'UC_x5XG1OV2P6uZZ5FSM9Ttw', channelName: 'Google DeepMind', action: 'prioritize', reason: 'High-quality AI research' },
      { channelId: 'UCXuqSBlHAE6Xw-yeJA0Tunw', channelName: 'Linus Tech Tips', action: 'subscribe', reason: 'Tech reviews and news' },
      { channelId: 'UC2eYFnH61tmytImy1mTYvhA', channelName: 'Luke Smith', action: 'avoid', reason: 'Too opinionated content' }
    ],
    targetKeywords: ['AI', 'machine learning', 'programming', 'tech', 'software', 'algorithm', 'open source'],
    avoidKeywords: ['drama', 'gossip', 'clickbait', 'reaction'],
    trainingDuration: 60,
    advancedOptions: {
      clearHistoryFirst: true,
      useIncognito: false,
      simulateRealTiming: true,
      engagementRate: 0.7,
      skipAds: true
    }
  },
  {
    name: "Tech Deutsch",
    description: "Deutsche Tech-Inhalte, Programmierung und Technologie",
    category: 'tech',
    color: '#3B82F6',
    language: 'de',
    region: 'DE',
    searches: [
      { query: "KI Forschung Deutschland", frequency: 4, duration: 110, language: 'de', region: 'DE' },
      { query: "Programmieren lernen deutsch", frequency: 5, duration: 95, language: 'de', region: 'DE' },
      { query: "Tech News Deutschland", frequency: 3, duration: 85, language: 'de', region: 'DE' },
      { query: "Software Entwicklung Tutorial", frequency: 3, duration: 120, language: 'de', region: 'DE' },
      { query: "Digitalisierung Deutschland", frequency: 2, duration: 100, language: 'de', region: 'DE' }
    ],
    watchPatterns: [
      { category: 'tech', watchTime: 0.88, engagement: 'like', language: 'de' },
      { category: 'programming', watchTime: 0.85, engagement: 'like', language: 'de' },
      { category: 'education', watchTime: 0.80, engagement: 'like', language: 'de' }
    ],
    channelPreferences: [
      { channelId: 'UC0GyQ7NjNqHZcDUzGjr-jQw', channelName: 'The Morpheus Tutorials', action: 'prioritize', reason: 'Excellent German programming tutorials' },
      { channelId: 'UCVdfWajbXrH0-0j5P_DFqag', channelName: 'Programmieren Starten', action: 'subscribe', reason: 'Good beginner content' }
    ],
    targetKeywords: ['KI', 'Programmierung', 'Software', 'Technologie', 'Deutschland', 'Tutorial'],
    avoidKeywords: ['Drama', 'Klatsch', 'Clickbait'],
    trainingDuration: 50,
    advancedOptions: {
      clearHistoryFirst: true,
      useIncognito: false,
      simulateRealTiming: true,
      engagementRate: 0.6,
      skipAds: true
    }
  },
  {
    name: "Scientific Method",
    description: "Research, experiments, and scientific discussions",
    category: 'science',
    color: '#10B981',
    language: 'en',
    region: 'US',
    searches: [
      { query: "scientific method explained", frequency: 4, duration: 110, language: 'en', region: 'US' },
      { query: "physics experiments", frequency: 3, duration: 95, language: 'en', region: 'US' },
      { query: "research paper analysis", frequency: 2, duration: 140, language: 'en', region: 'US' },
      { query: "peer review process", frequency: 2, duration: 80, language: 'en', region: 'US' },
      { query: "Nobel Prize lectures", frequency: 1, duration: 180, language: 'en', region: 'US' },
      { query: "science communication", frequency: 3, duration: 90, language: 'en', region: 'US' }
    ],
    watchPatterns: [
      { category: 'science', watchTime: 0.88, engagement: 'like', language: 'en' },
      { category: 'research', watchTime: 0.92, engagement: 'like', language: 'en' },
      { category: 'education', watchTime: 0.80, engagement: 'like', language: 'en' }
    ],
    channelPreferences: [
      { channelId: 'UC6nSFpj9HTCZ5t-N3Rm3-HA', channelName: 'Veritasium', action: 'prioritize', reason: 'High-quality science content' },
      { channelId: 'UCsXVk37bltHxD1rDPwtNM8Q', channelName: 'Kurzgesagt', action: 'subscribe', reason: 'Great science animations' },
      { channelId: 'pseudoscience123', channelName: 'Conspiracy Science', action: 'block', reason: 'Spreads misinformation' }
    ],
    targetKeywords: ['science', 'research', 'experiment', 'study', 'analysis', 'method', 'evidence'],
    avoidKeywords: ['pseudoscience', 'conspiracy', 'unproven', 'miracle cure'],
    trainingDuration: 45,
    advancedOptions: {
      clearHistoryFirst: false,
      useIncognito: false,
      simulateRealTiming: true,
      engagementRate: 0.8,
      skipAds: false
    }
  },
  {
    name: "Política Española",
    description: "Análisis político, noticias y debates en español",
    category: 'politics',
    color: '#EF4444',
    language: 'es',
    region: 'ES',
    searches: [
      { query: "política española análisis", frequency: 4, duration: 100, language: 'es', region: 'ES' },
      { query: "debate político España", frequency: 3, duration: 120, language: 'es', region: 'ES' },
      { query: "noticias políticas", frequency: 5, duration: 80, language: 'es', region: 'ES' },
      { query: "elecciones España", frequency: 2, duration: 110, language: 'es', region: 'ES' },
      { query: "parlamento español", frequency: 2, duration: 90, language: 'es', region: 'ES' }
    ],
    watchPatterns: [
      { category: 'politics', watchTime: 0.75, engagement: 'none', language: 'es' },
      { category: 'news', watchTime: 0.70, engagement: 'none', language: 'es' },
      { category: 'analysis', watchTime: 0.85, engagement: 'like', language: 'es' }
    ],
    channelPreferences: [
      { channelId: 'spanish_politics_1', channelName: 'Análisis Político', action: 'prioritize', reason: 'Balanced political analysis' },
      { channelId: 'extreme_politics', channelName: 'Política Extrema', action: 'block', reason: 'Too biased content' }
    ],
    targetKeywords: ['política', 'España', 'análisis', 'debate', 'elecciones', 'parlamento'],
    avoidKeywords: ['extremismo', 'odio', 'fake news'],
    trainingDuration: 50,
    advancedOptions: {
      clearHistoryFirst: true,
      useIncognito: true,
      simulateRealTiming: true,
      engagementRate: 0.4,
      skipAds: true
    }
  },
  {
    name: "Creative Arts",
    description: "Music production, visual arts, and creative processes",
    category: 'music',
    color: '#8B5CF6',
    language: 'en',
    region: 'US',
    searches: [
      { query: "music production tips", frequency: 5, duration: 85, language: 'en', region: 'US' },
      { query: "digital art tutorial", frequency: 4, duration: 75, language: 'en', region: 'US' },
      { query: "creative process", frequency: 3, duration: 95, language: 'en', region: 'US' },
      { query: "artist interviews", frequency: 2, duration: 110, language: 'en', region: 'US' },
      { query: "music theory explained", frequency: 3, duration: 100, language: 'en', region: 'US' },
      { query: "art critique analysis", frequency: 2, duration: 120, language: 'en', region: 'US' }
    ],
    watchPatterns: [
      { category: 'music', watchTime: 0.90, engagement: 'like', language: 'en' },
      { category: 'art', watchTime: 0.85, engagement: 'like', language: 'en' },
      { category: 'creative', watchTime: 0.88, engagement: 'like', language: 'en' }
    ],
    channelPreferences: [
      { channelId: 'UC-9-kyTW8ZkZNDHQJ6FgpwQ', channelName: 'Music Theory Guy', action: 'prioritize', reason: 'Excellent music education' },
      { channelId: 'art_drama_channel', channelName: 'Art Drama Central', action: 'avoid', reason: 'Too much drama, not enough art' }
    ],
    targetKeywords: ['music', 'art', 'creative', 'design', 'production', 'artist', 'theory'],
    avoidKeywords: ['drama', 'beef', 'controversy', 'gossip'],
    trainingDuration: 40,
    advancedOptions: {
      clearHistoryFirst: false,
      useIncognito: false,
      simulateRealTiming: true,
      engagementRate: 0.9,
      skipAds: false
    }
  },
  {
    name: "Minimalist Living",
    description: "Simple living, productivity, and intentional lifestyle",
    category: 'lifestyle',
    color: '#F59E0B',
    language: 'en',
    region: 'US',
    searches: [
      { query: "minimalist lifestyle", frequency: 4, duration: 70, language: 'en', region: 'US' },
      { query: "productivity systems", frequency: 3, duration: 85, language: 'en', region: 'US' },
      { query: "simple living tips", frequency: 5, duration: 60, language: 'en', region: 'US' },
      { query: "decluttering guide", frequency: 2, duration: 90, language: 'en', region: 'US' },
      { query: "mindful consumption", frequency: 3, duration: 75, language: 'en', region: 'US' },
      { query: "sustainable lifestyle", frequency: 2, duration: 95, language: 'en', region: 'US' }
    ],
    watchPatterns: [
      { category: 'lifestyle', watchTime: 0.82, engagement: 'like', language: 'en' },
      { category: 'productivity', watchTime: 0.87, engagement: 'like', language: 'en' },
      { category: 'wellness', watchTime: 0.75, engagement: 'none', language: 'en' }
    ],
    channelPreferences: [
      { channelId: 'minimalist_channel', channelName: 'The Minimalists', action: 'prioritize', reason: 'Authentic minimalist content' },
      { channelId: 'consumerist_channel', channelName: 'Buy More Stuff', action: 'block', reason: 'Promotes overconsumption' }
    ],
    targetKeywords: ['minimalism', 'simple', 'productivity', 'lifestyle', 'wellness', 'intentional', 'sustainable'],
    avoidKeywords: ['consumerism', 'shopping haul', 'materialism', 'excess'],
    trainingDuration: 35,
    advancedOptions: {
      clearHistoryFirst: false,
      useIncognito: false,
      simulateRealTiming: true,
      engagementRate: 0.6,
      skipAds: true
    }
  },
  {
    name: "日本のテクノロジー",
    description: "Japanese technology, innovation, and digital culture",
    category: 'tech',
    color: '#EC4899',
    language: 'ja',
    region: 'JP',
    searches: [
      { query: "日本 テクノロジー", frequency: 4, duration: 100, language: 'ja', region: 'JP' },
      { query: "プログラミング 日本語", frequency: 3, duration: 90, language: 'ja', region: 'JP' },
      { query: "AI 人工知能 日本", frequency: 3, duration: 110, language: 'ja', region: 'JP' },
      { query: "ゲーム開発", frequency: 4, duration: 85, language: 'ja', region: 'JP' },
      { query: "ロボット技術", frequency: 2, duration: 120, language: 'ja', region: 'JP' }
    ],
    watchPatterns: [
      { category: 'tech', watchTime: 0.85, engagement: 'like', language: 'ja' },
      { category: 'gaming', watchTime: 0.90, engagement: 'like', language: 'ja' },
      { category: 'robotics', watchTime: 0.88, engagement: 'like', language: 'ja' }
    ],
    channelPreferences: [
      { channelId: 'japanese_tech_channel', channelName: 'テックチャンネル', action: 'prioritize', reason: 'Quality Japanese tech content' }
    ],
    targetKeywords: ['テクノロジー', 'プログラミング', 'AI', 'ゲーム', 'ロボット', '日本'],
    avoidKeywords: ['ドラマ', 'ゴシップ'],
    trainingDuration: 45,
    advancedOptions: {
      clearHistoryFirst: true,
      useIncognito: false,
      simulateRealTiming: true,
      engagementRate: 0.7,
      skipAds: true
    }
  }
];