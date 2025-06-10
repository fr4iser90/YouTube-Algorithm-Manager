class PreTrainingAnalyzer {
  constructor() {
    this.stopwords = window.stopwords;
  }

  tokenize(text) {
    return text.toLowerCase().split(/[^a-zäöüß]+/).filter(word => word.length > 2 && !this.stopwords.has(word));
  }

  extractKeywords(text) {
    const tokens = this.tokenize(text);
    const tf = this.calculateTf(tokens);
    const idf = this.calculateIdf([tokens]);
    const tfidf = this.calculateTfidf(tf, idf);
    
    return Object.entries(tfidf)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([term]) => term);
  }

  calculateTf(tokens) {
    const tf = {};
    const tokenCount = tokens.length;
    for (const token of tokens) {
      tf[token] = (tf[token] || 0) + 1;
    }
    for (const token in tf) {
      tf[token] /= tokenCount;
    }
    return tf;
  }

  calculateIdf(documents) {
    const idf = {};
    const docCount = documents.length;
    const allTokens = new Set();
    for (const doc of documents) {
      for (const token of new Set(doc)) {
        allTokens.add(token);
      }
    }
    for (const token of allTokens) {
      let count = 0;
      for (const doc of documents) {
        if (doc.includes(token)) {
          count++;
        }
      }
      idf[token] = Math.log(docCount / (1 + count));
    }
    return idf;
  }

  calculateTfidf(tf, idf) {
    const tfidf = {};
    for (const token in tf) {
      tfidf[token] = tf[token] * (idf[token] || 0);
    }
    return tfidf;
  }

  async smartScroll() {
    console.log('📜 Starting definitive smart scroll...');
    let lastVideoCount = 0;
    let consecutiveStops = 0;
    const maxConsecutiveStops = 3; // Stop after 3 scrolls with no new videos

    for (let i = 0; i < 30; i++) { // Generous limit
      lastVideoCount = document.querySelectorAll('#video-title').length;
      
      // Scroll the main document element, which is correct for YouTube
      window.scrollTo(0, document.documentElement.scrollHeight);
      
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newVideoCount = document.querySelectorAll('#video-title').length;

      if (newVideoCount > lastVideoCount) {
        console.log(`📜 Found more videos. Count: ${newVideoCount}`);
        consecutiveStops = 0;
      } else {
        consecutiveStops++;
        console.log(`📜 Video count unchanged. Stop attempt ${consecutiveStops} of ${maxConsecutiveStops}.`);
        if (consecutiveStops >= maxConsecutiveStops) {
          console.log('📜 End of page reached. Stopping scroll.');
          break;
        }
      }
    }
  }

  async analyze(historyVideos = []) {
    console.log('🔬 Starting pre-training analysis of recommendations...');

    await this.smartScroll();

    const recommendedVideos = this.scrapeRecommended();

    // --- Keyword Analysis ---
    const allVideoData = [
      ...historyVideos,
      ...recommendedVideos.map(v => `${v.title} ${v.channel} ${v.description}`)
    ];
    const documents = allVideoData.map(text => this.tokenize(text));
    const idf = this.calculateIdf(documents);
    const allTokens = [].concat(...documents);
    const tf = this.calculateTf(allTokens);
    const tfidf = this.calculateTfidf(tf, idf);
    const topKeywords = Object.entries(tfidf)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([term, score]) => ({ term, score }));

    // --- Phrase Analysis ---
    const phrases = this.extractPhrases(allVideoData);
    const topPhrases = Object.entries(phrases)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([phrase, count]) => ({ phrase, count }));

    // --- Channel Analysis ---
    const channelStats = {};
    for (const video of [...historyVideos, ...recommendedVideos]) {
      if (video.channel && video.channel !== 'Unknown Channel') {
        if (!channelStats[video.channel]) {
          channelStats[video.channel] = {
            count: 0,
            inHistory: 0,
            inRecommendations: 0,
            categories: new Set(),
            keywords: new Set()
          };
        }
        channelStats[video.channel].count++;
        if (historyVideos.includes(video)) {
          channelStats[video.channel].inHistory++;
        } else {
          channelStats[video.channel].inRecommendations++;
        }
        
        // Extract categories and keywords from video data
        const videoText = `${video.title} ${video.description}`.toLowerCase();
        const categories = this.detectCategories(videoText);
        categories.forEach(cat => channelStats[video.channel].categories.add(cat));
        
        const keywords = this.extractKeywords(videoText);
        keywords.forEach(kw => channelStats[video.channel].keywords.add(kw));
      }
    }

    const topChannels = Object.entries(channelStats)
      .map(([channel, stats]) => ({
        channel,
        count: stats.count,
        historyRatio: stats.inHistory / stats.count,
        recommendationRatio: stats.inRecommendations / stats.count,
        categories: Array.from(stats.categories),
        keywords: Array.from(stats.keywords)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // --- Content Category Analysis ---
    const categoryDistribution = this.analyzeCategoryDistribution(allVideoData);

    // --- Engagement Pattern Analysis ---
    const engagementPatterns = this.analyzeEngagementPatterns(historyVideos);

    const analysisResults = {
      historyVideoCount: historyVideos.length,
      recommendedVideoCount: recommendedVideos.length,
      topKeywords: topKeywords,
      topPhrases: topPhrases,
      topChannels: topChannels,
      topVideos: recommendedVideos.slice(0, 20),
      categoryDistribution,
      engagementPatterns,
      timestamp: Date.now()
    };

    console.log('✅ Pre-training analysis complete:', analysisResults);
    chrome.runtime.sendMessage({ type: 'PRE_TRAINING_ANALYSIS_COMPLETE', results: analysisResults });
  }

  scrapeRecommended() {
    const videos = [];
    document.querySelectorAll('#video-title').forEach(titleElement => {
      const container = titleElement.closest(
        'ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer, ytd-grid-video-renderer'
      );

      if (container && titleElement.textContent && titleElement.textContent.trim()) {
        const channelContainer = container.querySelector('ytd-channel-name');
        let channelName = 'Unknown Channel';
        if (channelContainer) {
            const channelLink = channelContainer.querySelector('a');
            channelName = (channelLink || channelContainer).textContent.trim();
        }
        
        const descriptionElement = container.querySelector('#description-text, .metadata-snippet-text');

        const videoData = {
          title: titleElement.textContent.trim(),
          channel: channelName,
          description: descriptionElement ? descriptionElement.textContent.trim() : '',
          url: titleElement.href,
        };

        if (!videos.some(v => v.title === videoData.title)) {
          videos.push(videoData);
        }
      }
    });
    return videos;
  }

  extractPhrases(texts) {
    const phrases = {};
    const minPhraseLength = 2;
    const maxPhraseLength = 4;

    for (const text of texts) {
      const words = text.toLowerCase().split(/\s+/);
      for (let i = 0; i < words.length; i++) {
        for (let len = minPhraseLength; len <= maxPhraseLength && i + len <= words.length; len++) {
          const phrase = words.slice(i, i + len).join(' ');
          // Check if any word in the phrase is a stopword
          const hasStopword = phrase.split(' ').some(word => this.stopwords.has(word));
          if (phrase.length > 3 && !hasStopword) {
            phrases[phrase] = (phrases[phrase] || 0) + 1;
          }
        }
      }
    }
    return phrases;
  }

  detectCategories(text) {
    const categories = new Set();
    const categoryKeywords = {
      gaming: ['game', 'gaming', 'playthrough', 'walkthrough', 'stream'],
      music: ['music', 'song', 'album', 'concert', 'live performance'],
      tech: ['technology', 'tech', 'review', 'tutorial', 'how to'],
      news: ['news', 'update', 'report', 'coverage', 'latest'],
      education: ['learn', 'tutorial', 'course', 'education', 'explained'],
      entertainment: ['funny', 'comedy', 'entertainment', 'show', 'episode'],
      sports: ['sports', 'game', 'match', 'tournament', 'championship'],
      lifestyle: ['lifestyle', 'vlog', 'daily', 'routine', 'life']
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        categories.add(category);
      }
    }
    return Array.from(categories);
  }

  analyzeCategoryDistribution(videos) {
    const distribution = {};
    for (const video of videos) {
      const categories = this.detectCategories(video.toLowerCase());
      categories.forEach(cat => {
        distribution[cat] = (distribution[cat] || 0) + 1;
      });
    }
    return distribution;
  }

  analyzeEngagementPatterns(videos) {
    return {
      watchTimeDistribution: this.calculateWatchTimeDistribution(videos),
      contentTypes: this.analyzeContentTypes(videos),
      peakHours: this.detectPeakHours(videos)
    };
  }

  calculateWatchTimeDistribution(videos) {
    // This would normally use actual watch time data
    // For now, we'll use a placeholder distribution
    return {
      short: 0.3,  // 0-5 minutes
      medium: 0.4, // 5-15 minutes
      long: 0.3    // 15+ minutes
    };
  }

  analyzeContentTypes(videos) {
    const types = {
      shortForm: 0,
      longForm: 0,
      live: 0,
      series: 0
    };

    for (const video of videos) {
      const title = video.toLowerCase();
      if (title.includes('short') || title.includes('shorts')) types.shortForm++;
      if (title.includes('live') || title.includes('stream')) types.live++;
      if (title.includes('episode') || title.includes('part')) types.series++;
      else types.longForm++;
    }

    return types;
  }

  detectPeakHours(videos) {
    // This would normally use actual timestamp data
    // For now, we'll return a placeholder distribution
    return {
      morning: 0.2,   // 6-12
      afternoon: 0.3, // 12-18
      evening: 0.4,   // 18-24
      night: 0.1      // 0-6
    };
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ANALYZE_RECOMMENDATIONS') {
    const analyzer = new PreTrainingAnalyzer();
    // Use an async IIFE to handle the async analyze method
    (async () => {
      await analyzer.analyze(message.historyVideos);
      sendResponse({ success: true });
    })();
    return true; // Keep the message channel open for the async response
  }
});
