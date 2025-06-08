class PreTrainingAnalyzer {
  constructor() {
    // Stopwords for English and German
    this.stopwords = new Set([
      'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves',
      'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their',
      'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
      'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an',
      'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about',
      'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up',
      'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
      'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
      'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don',
      'should', 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', 'couldn', 'didn', 'doesn', 'hadn',
      'hasn', 'haven', 'isn', 'ma', 'mightn', 'mustn', 'needn', 'shan', 'shouldn', 'wasn', 'weren', 'won', 'wouldn',
      'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'sie', 'sich', 'mein', 'dein', 'sein', 'unser', 'euer', 'ihr',
      'mich', 'dich', 'ihn', 'uns', 'euch', 'meine', 'deine', 'seine', 'meinen', 'deinen', 'seinen', 'meinem',
      'deinem', 'seinem', 'eines', 'keines', 'einer', 'keiner', 'einem', 'keinem', 'einen', 'keinen', 'der', 'die',
      'das', 'dass', 'daß', 'und', 'oder', 'als', 'wenn', 'wann', 'warum', 'wie', 'wo', 'was', 'wer', 'wen', 'wem',
      'wessen', 'ein', 'eine', 'einen', 'einem', 'eines', 'kein', 'keine', 'keinen', 'keinem', 'keines', 'nicht',
      'von', 'zu', 'mit', 'bei', 'nach', 'vor', 'hinter', 'über', 'unter', 'neben', 'an', 'in', 'auf', 'aus',
      'für', 'ist', 'sind', 'war', 'waren', 'wird', 'werden', 'wurde', 'wurden', 'habe', 'hast', 'hat', 'haben',
      'hatte', 'hatten', 'kann', 'können', 'konnte', 'konnten', 'soll', 'sollen', 'sollte', 'sollten', 'will',
      'wollen', 'wollte', 'wollten', 'muss', 'müssen', 'musste', 'mussten', 'darf', 'dürfen', 'durfte', 'durften'
    ]);
  }

  tokenize(text) {
    return text.toLowerCase().split(/[^a-zäöüß]+/).filter(word => word.length > 2 && !this.stopwords.has(word));
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

  analyze(historyVideos = []) {
    console.log('🔬 Starting pre-training analysis of recommendations...');
    const recommendedVideos = this.scrapeRecommended();

    const allVideoData = [
      ...historyVideos,
      ...recommendedVideos.map(v => `${v.title} ${v.channel} ${v.description}`)
    ];
    const documents = allVideoData.map(text => this.tokenize(text));
    const idf = this.calculateIdf(documents);

    const allTokens = [].concat(...documents);
    const tf = this.calculateTf(allTokens);

    const tfidf = this.calculateTfidf(tf, idf);

    const sortedKeywords = Object.entries(tfidf)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([term, score]) => ({ term, score }));

    const analysisResults = {
      historyVideoCount: historyVideos.length,
      recommendedVideoCount: recommendedVideos.length,
      topKeywords: sortedKeywords,
      timestamp: Date.now()
    };

    console.log('✅ Pre-training analysis complete:', analysisResults);
    chrome.runtime.sendMessage({ type: 'PRE_TRAINING_ANALYSIS_COMPLETE', results: analysisResults });
  }

  scrapeRecommended() {
    const videos = [];
    // Find all title elements first, as they are the most reliable anchor.
    document.querySelectorAll('#video-title').forEach(titleElement => {
      // Find the closest ancestor that is a known video container.
      const container = titleElement.closest(
        'ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer, ytd-grid-video-renderer'
      );

      if (container && titleElement.textContent && titleElement.textContent.trim()) {
        const channelElement = container.querySelector('ytd-channel-name, #channel-name'); // Look for both new and old selectors
        const descriptionElement = container.querySelector('#description-text');

        const videoData = {
          title: titleElement.textContent.trim(),
          channel: channelElement ? channelElement.textContent.trim() : '',
          description: descriptionElement ? descriptionElement.textContent.trim() : '',
        };

        // Ensure we don't add duplicates
        if (!videos.some(v => v.title === videoData.title)) {
          videos.push(videoData);
        }
      } else if (titleElement.textContent && titleElement.textContent.trim()) {
        // Fallback if a known container isn't found, just grab the title.
        const videoData = {
          title: titleElement.textContent.trim(),
          channel: '',
          description: '',
        };
        if (!videos.some(v => v.title === videoData.title)) {
          videos.push(videoData);
        }
      }
    });
    return videos;
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ANALYZE_RECOMMENDATIONS') {
    const analyzer = new PreTrainingAnalyzer();
    analyzer.analyze(message.historyVideos);
    sendResponse({ success: true });
  }
});
