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

    // Get current video data
    const videoData = {
      videoId: getVideoId(window.location.href),
      title: document.querySelector('h1.title')?.textContent?.trim() || '',
      channel: document.querySelector('#channel-name a')?.textContent?.trim() || '',
      category: document.querySelector('#top-level-buttons-computed')?.textContent?.includes('Gaming') ? 'Gaming' : 'Other',
      watchTime: duration,
      timestamp: new Date(),
      url: window.location.href
    };

    // Check if profile is frozen
    const storage = await chrome.storage.local.get(['profiles', 'activeProfileId', 'freezeProfile']);
    const isFrozen = storage.freezeProfile === true;

    if (!isFrozen && storage.profiles && storage.activeProfileId) {
      const profiles = storage.profiles;
      const activeProfile = profiles.find(p => p.id === storage.activeProfileId);
      
      if (activeProfile) {
        // Update profile data
        activeProfile.totalVideosWatched++;
        activeProfile.watchHistory = [
          {
            videoId: videoData.videoId,
            title: videoData.title,
            url: videoData.url,
            watchTime: videoData.watchTime,
            category: videoData.category,
            channel: videoData.channel,
            timestamp: videoData.timestamp
          },
          ...(activeProfile.watchHistory || []).slice(0, 49) // Keep last 50 videos
        ];

        // Update preferred categories and channels
        if (!activeProfile.preferredCategories.includes(videoData.category)) {
          activeProfile.preferredCategories.push(videoData.category);
        }
        if (!activeProfile.preferredChannels.includes(videoData.channel)) {
          activeProfile.preferredChannels.push(videoData.channel);
        }

        // Update average watch time
        const totalWatchTime = activeProfile.watchHistory.reduce((sum, v) => sum + v.watchTime, 0);
        activeProfile.averageWatchTime = totalWatchTime / activeProfile.watchHistory.length;

        // Save updated profile
        const updatedProfiles = profiles.map(p => p.id === activeProfile.id ? activeProfile : p);
        await chrome.storage.local.set({ profiles: updatedProfiles });
        
        // Notify background script
        chrome.runtime.sendMessage({
          type: 'PROFILE_UPDATED',
          profile: activeProfile,
          videoData: videoData
        });
      }
    }

    let adSkipInterval;
    if (this.currentPreset.advancedOptions?.skipAds) {
      adSkipInterval = setInterval(() => {
        // Try different ad skip button selectors
        const skipSelectors = [
          // New YouTube skip button text
          '.ytp-skip-ad-button__text',
          // Skip button container
          '.ytp-ad-skip-button',
          '.ytp-ad-skip-button-modern',
          '.ytp-skip-ad-button',
          // Button with specific text
          'button[aria-label="Skip Ad"]',
          'button[aria-label="Werbung überspringen"]',
          'button[aria-label="Skip"]',
          'button[aria-label="Überspringen"]',
          // Additional button classes
          'button.ytp-ad-skip-button',
          'button.ytp-ad-skip-button-container',
          'div.ytp-ad-skip-button-container button',
          // Generic skip buttons
          'button[aria-label*="Skip"]',
          'button[aria-label*="Überspringen"]',
          // Ad overlay close buttons
          '.ytp-ad-overlay-close-button',
          'button[aria-label="Close ad"]',
          'button[aria-label="Werbung schließen"]'
        ];

        // Try to find and click any skip button
        for (const selector of skipSelectors) {
          const elements = document.querySelectorAll(selector);
          for (const element of elements) {
            if (element.offsetParent !== null) { // Check if element is visible
              try {
                // If we found the text element, click its parent button
                const button = element.closest('button') || element;
                if (button) {
                  // Try multiple click methods
                  button.click();
                  button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                  button.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
                  button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                  
                  // Also try to focus and press Enter
                  button.focus();
                  button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
                  
                  // Try to click the parent if it's a text element
                  if (element.classList.contains('ytp-skip-ad-button__text')) {
                    const parentButton = element.closest('.ytp-skip-ad-button');
                    if (parentButton) {
                      parentButton.click();
                      parentButton.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                      parentButton.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
                      parentButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                    }
                  }
                  
                  console.log('✅ Ad skip attempted with:', selector);
                  break;
                }
              } catch (err) {
                console.log('Skip attempt failed:', err);
              }
            }
          }
        }

        // Also try to skip video ads by seeking
        if (video.duration && video.duration > 0) {
          // For short videos (likely ads)
          if (video.duration < 30) {
            try {
              video.currentTime = video.duration - 0.1;
              console.log('✅ Tried to seek to end of short video');
            } catch (err) {
              console.log('Could not seek video:', err);
            }
          }
          
          // For longer ads, try to skip to last 5 seconds
          if (video.duration > 30 && video.duration < 60) {
            try {
              video.currentTime = video.duration - 5;
              console.log('✅ Tried to skip to last 5 seconds');
            } catch (err) {
              console.log('Could not seek video:', err);
            }
          }
        }

        // Try to mute and speed up ads
        if (video.muted === false) {
          video.muted = true;
        }
        if (video.playbackRate < 2) {
          video.playbackRate = 2;
        }
      }, 500); // Check every 500ms
    }
    
    const watchTime = Math.min(duration, 120) * 1000;
    const watchdog = setTimeout(() => {
      console.log('Watchdog timer triggered, something is wrong');
      window.history.back();
    }, watchTime + 30000);
    
    await delay(watchTime);
    
    clearTimeout(watchdog);
    if (adSkipInterval) {
      clearInterval(adSkipInterval);
    }
    
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
