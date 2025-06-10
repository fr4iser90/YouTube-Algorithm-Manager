// YouTube Actions Module
console.log('🎯 Actions module loaded');

async function waitForElement(selector, timeout = 5000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const element = document.querySelector(selector);
    if (element) return element;
    await delay(100);
  }
  
  throw new Error(`Element ${selector} not found after ${timeout}ms`);
}

async function typeText(element, text) {
  for (const char of text) {
    element.value += char;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    await delay(Math.random() * 100 + 50); // Random delay between 50-150ms
  }
}

async function performSearch(query) {
  console.log(`🔍 Searching for: "${query}"`);
  try {
    await delay(2000);
    
    const searchBox = await waitForElement('input[name="search_query"]');
    searchBox.value = '';
    searchBox.focus();
    await typeText(searchBox, query);
    searchBox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true }));
    await waitForElement('ytd-video-renderer', 10000);
    this.searchesPerformed++;
    console.log(`✅ Search completed: "${query}"`);
  } catch (error) {
    console.error(`❌ Search failed for "${query}":`, error);
    throw error;
  }
}

async function watchRecommendedVideos(count, duration) {
  try {
    const videoCandidates = Array.from(document.querySelectorAll('ytd-video-renderer'));
    const scoredVideos = videoCandidates.map(video => calculateVideoScore(video, this.currentPreset))
                                        .sort((a, b) => b.score - a.score);
    
    const videosToWatch = scoredVideos.slice(0, Math.min(count, 3));
    
    console.log(`📺 Watching ${videosToWatch.length} videos for ${duration}s each`);
    
    for (const { video, title, channel } of videosToWatch) {
      if (!this.isTraining) break;

      const videoLink = video.querySelector('a#video-title');
      const videoId = videoLink ? getVideoId(videoLink.href) : null;

      if (!videoId || this.watchedVideoIds.includes(videoId)) {
        console.log(`Skipping already watched or invalid video: "${title}"`);
        continue;
      }
      
      console.log(`📺 Watching: "${title}"`);
      
      const titleElement = video.querySelector('#video-title');
      titleElement?.click();
      
      await delay(3000);
      
      await this.watchVideo(Math.min(duration, 90));
      this.watchedVideoIds.push(videoId);
      
      if (this.currentPreset.channelPreferences) {
        const pref = this.currentPreset.channelPreferences.find(p => channel.includes(p.channelName.toLowerCase()));
        if (pref && pref.action === 'subscribe') {
          await this.subscribeToChannel();
        }
      }
      
      const engagementRate = (this.currentPreset.advancedOptions?.engagementRate || 30) / 100;
      if (Math.random() < engagementRate) {
        await this.likeVideo();
      }
      
      this.videosWatched++;
      
      window.history.back();
      await delay(2000);
      
      await humanDelay();
    }
    
  } catch (error) {
    console.error('❌ Error watching videos:', error);
  }
}

async function watchVideo(duration = 60) {
  try {
    // Wait for video to load
    await this.delay(3000);
    
    // Get video info
    const videoInfo = await this.getVideoInfo();
    
    // Update profile data
    this.videosWatched++;
    this.watchedVideoIds.push(videoInfo.id);
    
    // Watch for specified duration
    await this.delay(duration * 1000);
    
    // Notify background script
    chrome.runtime.sendMessage({
      type: 'VIDEO_WATCHED',
      videoInfo
    });
    
    return videoInfo;
  } catch (error) {
    console.error('Error watching video:', error);
    throw error;
  }
}

async function likeVideo() {
  try {
    await delay(1000);
    const likeButton = document.querySelector('button[aria-label*="like" i]:not([aria-pressed="true"])');
    if (likeButton) {
      likeButton.click();
      console.log('👍 Liked video');
    }
  } catch (error) {
    console.log('Could not like video:', error);
  }
}

async function subscribeToChannel() {
  try {
    await delay(1000);
    const subscribeButton = document.querySelector('button.yt-spec-button-shape-next--filled:not([aria-label*="Subscribed"])');
    if (subscribeButton) {
      subscribeButton.click();
      console.log('👍 Subscribed to channel');
    }
  } catch (error) {
    console.log('Could not subscribe to channel:', error);
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function humanDelay() {
  // Random delay between 2-5 seconds to simulate human behavior
  const delay = Math.random() * 3000 + 2000;
  return new Promise(resolve => setTimeout(resolve, delay));
}

// Make functions globally available
window.performSearch = performSearch;
window.watchRecommendedVideos = watchRecommendedVideos;
window.watchVideo = watchVideo;
window.likeVideo = likeVideo;
window.subscribeToChannel = subscribeToChannel;
window.waitForElement = waitForElement;
window.typeText = typeText;
window.delay = delay;
window.humanDelay = humanDelay;

