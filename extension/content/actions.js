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

async function watchVideo(duration) {
  try {
    const video = await waitForElement('video', 5000);
    video.muted = true;
    if (this.currentPreset.advancedOptions?.playbackSpeed) {
      video.playbackRate = this.currentPreset.advancedOptions.playbackSpeed;
    }
    if (video.paused) {
      video.play();
    }
    
    const adSkipInterval = setInterval(() => {
      const skipButton = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern');
      if (skipButton) {
        skipButton.click();
        console.log('Ad skipped');
      }
    }, 500);
    
    const watchTime = Math.min(duration, 120) * 1000;
    const watchdog = setTimeout(() => {
      console.log('Watchdog timer triggered, something is wrong');
      window.history.back();
    }, watchTime + 30000);
    
    await delay(watchTime);
    
    clearTimeout(watchdog);
    clearInterval(adSkipInterval);
    
    console.log(`✅ Watched video for ${duration}s`);
    
  } catch (error) {
    console.error('❌ Error watching video:', error);
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
