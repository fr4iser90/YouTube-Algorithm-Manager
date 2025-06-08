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

function calculateBubbleScore(recommendations, targetKeywords) {
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
      bubbleScore: calculateBubbleScore(this.recommendations, this.currentPreset.targetKeywords || []),
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
