function generateCategories(recommendations) {
  const categories = {};
  const totalRecs = recommendations.length;
  
  recommendations.forEach(rec => {
    const title = rec.title.toLowerCase();
    let category = 'other';
    
    if (title.includes('tech') || title.includes('programming')) category = 'tech';
    else if (title.includes('music')) category = 'music';
    else if (title.includes('game')) category = 'gaming';
    else if (title.includes('news')) category = 'news';
    else if (title.includes('tutorial')) category = 'education';
    
    categories[category] = (categories[category] || 0) + 1;
  });
  
  return Object.entries(categories).map(([category, count]) => ({
    category,
    percentage: Math.round((count / totalRecs) * 100),
    count
  }));
}

function calculateProfileScore(recommendations, targetKeywords) {
  if (recommendations.length === 0 || targetKeywords.length === 0) return 0;
  
  const targetMatches = recommendations.filter(rec => 
    targetKeywords.some(keyword => 
      rec.title.toLowerCase().includes(keyword.toLowerCase())
    )
  ).length;
  
  return Math.round((targetMatches / recommendations.length) * 100);
}

function sendResults(results) {
  try {
    // Send to web app via localStorage
    localStorage.setItem('yt-trainer-results', JSON.stringify({
      ...results,
      timestamp: Date.now()
    }));
    
    // Send via postMessage
    window.postMessage({ type: 'YT_TRAINER_COMPLETED', results }, '*');
    
    // Send via BroadcastChannel
    try {
      const channel = new BroadcastChannel('yt-trainer-channel');
      channel.postMessage({
        type: 'TRAINING_COMPLETED',
        results
      });
    } catch (error) {
      // BroadcastChannel not supported
    }
    
    console.log('📤 Results sent to web app');
    
  } catch (error) {
    console.error('❌ Error sending results:', error);
  }
}

function sendError(error) {
  try {
    localStorage.setItem('yt-trainer-error', JSON.stringify({
      error,
      timestamp: Date.now()
    }));
    
    window.postMessage({ type: 'YT_TRAINER_ERROR', error }, '*');
    
    try {
      const channel = new BroadcastChannel('yt-trainer-channel');
      channel.postMessage({
        type: 'TRAINING_ERROR',
        error
      });
    } catch (broadcastError) {
      // BroadcastChannel not supported
    }
    
  } catch (err) {
    console.error('❌ Error sending error:', err);
  }
}

function sendProgress(progress, message) {
  try {
    this.progress = progress;
    
    const progressData = {
      progress,
      message,
      videosWatched: this.videosWatched,
      searchesPerformed: this.searchesPerformed,
      recommendations: this.recommendations,
      profileScore: calculateProfileScore(this.recommendations, this.currentPreset.targetKeywords || []),
      timestamp: Date.now()
    };
    
    // Send via runtime message
    try {
      chrome.runtime.sendMessage({
        type: 'TRAINING_PROGRESS',
        progress: progressData
      });
    } catch (error) {
      console.error('Error sending progress via runtime message:', error);
    }
    
    // Update alive signal with progress
    this.sendAliveSignal();
    
  } catch (error) {
    console.error('❌ Error sending progress:', error);
  }
}

async function extractRecommendations() {
  try {
    console.log('🔍 Extracting recommendations...');
    
    // Wait for recommendations to load
    await delay(2000);
    
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
        const categoryElement = container.querySelector('#metadata-line span:first-child');

        const videoData = {
          title: titleElement.textContent.trim(),
          channel: channelName,
          description: descriptionElement ? descriptionElement.textContent.trim() : '',
          category: categoryElement ? categoryElement.textContent.trim() : 'unknown',
          url: titleElement.href,
          position: videos.length + 1
        };

        if (!videos.some(v => v.title === videoData.title)) {
          videos.push(videoData);
        }
      }
    });

    console.log(`✅ Extracted ${videos.length} recommendations`);
    return videos;
    
  } catch (error) {
    console.error('❌ Error extracting recommendations:', error);
    return [];
  }
}
