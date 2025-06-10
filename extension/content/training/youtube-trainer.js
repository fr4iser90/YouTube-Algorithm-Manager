// YouTube Algorithm Trainer Content Script
console.log('🎯 YouTube Algorithm Trainer content script starting...');

class YouTubeAlgorithmTrainer {
  constructor() {
    // Bind all required functions
    this.performSearch = window.performSearch.bind(this);
    this.watchRecommendedVideos = window.watchRecommendedVideos.bind(this);
    this.watchVideo = window.watchVideo.bind(this);
    this.likeVideo = window.likeVideo.bind(this);
    this.subscribeToChannel = window.subscribeToChannel.bind(this);
    this.delay = window.delay.bind(this);
    this.humanDelay = window.humanDelay.bind(this);
    this.waitForElement = window.waitForElement.bind(this);
    this.typeText = window.typeText.bind(this);
    this.calculateVideoScore = window.calculateVideoScore.bind(this);
    this.extractRecommendations = window.extractRecommendations.bind(this);
    this.generateCategories = window.generateCategories.bind(this);
    this.calculateProfileScore = window.calculateProfileScore.bind(this);
    this.sendResults = window.sendResults.bind(this);
    this.sendProgress = window.sendProgress.bind(this);
    this.sendError = window.sendError.bind(this);

    // Initialize state
    this.isTraining = false;
    this.currentPreset = null;
    this.watchedVideoIds = [];
    this.videosWatched = 0;
    this.searchesPerformed = 0;
    this.startTime = null;
    this.adDetector = window.adDetector;

    // Start alive signal
    this.startAliveSignal();

    // Initialize immediately
    this.init();
  }

  startAliveSignal() {
    // Send initial alive signal
    this.sendAliveSignal();
    
    // Set up interval for regular signals
    setInterval(() => {
      this.sendAliveSignal();
    }, 3000);
  }

  async init() {
    console.log('🎯 YouTube Algorithm Trainer initializing...');
    
    // Wait for page to be ready
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }
    
    this.setupMessageListeners();

    // Check if we need to restore training state
    try {
      const storage = await chrome.storage.local.get(['pendingTraining', 'currentPreset']);
      if (storage.pendingTraining && storage.currentPreset && !this.isTraining) {
        console.log('🔄 Restoring training state on page load');
        this.startTraining(storage.currentPreset);
      }
    } catch (error) {
      console.error('Error checking training state:', error);
    }
    
    // Send "I'm alive" signal every 3 seconds to web app
    setInterval(() => {
      this.sendAliveSignal();
    }, 3000);

    console.log('✅ YouTube Algorithm Trainer initialized successfully!');
  }

  sendAliveSignal() {
    try {
      const aliveData = {
        isInstalled: true,
        isConnected: true,
        version: '1.0.0',
        isTraining: this.isTraining,
        currentPreset: this.currentPreset?.name || null,
        timestamp: Date.now(),
        domain: 'youtube.com',
        url: window.location.href,
        videosWatched: this.videosWatched,
        searchesPerformed: this.searchesPerformed
      };
      
      // WICHTIG: Sende auch an alle offenen Tabs der Web-App
      // Das funktioniert über BroadcastChannel API
      try {
        chrome.runtime.sendMessage({
          type: 'STATUS_UPDATE',
          ...aliveData
        });
      } catch (broadcastError) {
        // BroadcastChannel nicht unterstützt, egal
      }
      
      console.log('📡 Alive signal sent:', aliveData);
      
    } catch (error) {
      console.error('❌ Error sending alive signal:', error);
    }
  }

  setupMessageListeners() {
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'START_TRAINING') {
        console.log('🚀 Received start command from background script');
        this.startTraining(message.preset);
        sendResponse({ success: true });
      }
      if (message.type === 'STOP_TRAINING') {
        console.log('⏹️ Received stop command from background script');
        this.stopTraining();
        sendResponse({ success: true });
      }
    });
  }

  checkForSavedCommands() {
    try {
      const savedCommand = localStorage.getItem('yt-trainer-command');
      console.log('[DEBUG] checkForSavedCommands: savedCommand =', savedCommand);
      if (savedCommand && !this.isTraining) {
        const command = JSON.parse(savedCommand);
        console.log('[DEBUG] Parsed command:', command);
        if (command.type === 'START_TRAINING' && command.preset) {
          // Check if command is recent (within 30 seconds)
          const age = Date.now() - command.timestamp;
          console.log('[DEBUG] Command age (ms):', age);
          if (age < 30000) {
            console.log('🔄 Found saved training command, starting...');
            this.startTraining(command.preset);
            localStorage.removeItem('yt-trainer-command');
          } else {
            console.log('[DEBUG] Command too old, ignoring.');
          }
        } else {
          console.log('[DEBUG] Command type or preset missing/invalid.');
        }
      } else {
        if (this.isTraining) {
          console.log('[DEBUG] Already training, skipping command.');
        } else {
          console.log('[DEBUG] No savedCommand found.');
        }
      }
    } catch (error) {
      console.error('❌ Error checking saved commands:', error);
    }
  }

  async searchPreferredChannels() {
    if (!this.currentPreset.channelPreferences) return;
    
    console.log('🔍 Starting channel search phase...');
    
    for (const pref of this.currentPreset.channelPreferences) {
      if (!this.isTraining) break;
      
      if (pref.action === 'prioritize' || pref.action === 'subscribe') {
        try {
          console.log(`🔍 Searching for channel: "${pref.channelName}"`);
          
          // Search for the channel
          await this.performSearch(pref.channelName);
          await this.delay(2000);
          
          // Click on the first channel result
          const channelResults = document.querySelectorAll('ytd-channel-renderer');
          if (channelResults.length > 0) {
            const channelLink = channelResults[0].querySelector('a#main-link');
            if (channelLink) {
              console.log(`✅ Found channel: "${pref.channelName}"`);
              channelLink.click();
              await this.delay(3000);
              
              // Watch a few videos from the channel
              const channelVideos = document.querySelectorAll('ytd-rich-item-renderer');
              const videosToWatch = Math.min(2, channelVideos.length);
              
              console.log(`📺 Watching ${videosToWatch} videos from channel: "${pref.channelName}"`);
              
              for (let i = 0; i < videosToWatch; i++) {
                if (!this.isTraining) break;
                
                const video = channelVideos[i];
                const videoLink = video.querySelector('a#video-title');
                if (videoLink) {
                  videoLink.click();
                  await this.delay(3000);
                  await this.watchVideo(60); // Watch for 60 seconds
                  window.history.back();
                  await this.delay(2000);
                }
              }
              
              // Go back to search results
              console.log('🔙 Returning to search results');
              window.history.back();
              await this.delay(2000);
            }
          } else {
            console.log(`⚠️ No channel results found for: "${pref.channelName}"`);
            window.history.back();
            await this.delay(2000);
          }
        } catch (error) {
          console.error(`❌ Error searching for channel ${pref.channelName}:`, error);
        }
      }
    }
    
    console.log('✅ Channel search phase completed');
  }

  async startTraining(preset) {
    if (this.isTraining) {
      console.log('⚠️ Training already in progress');
      return;
    }

    try {
      this.isTraining = true;
      this.currentPreset = preset;
      this.progress = 0;
      this.startTime = Date.now();
      this.videosWatched = 0;
      this.searchesPerformed = 0;
      this.recommendations = [];
      this.watchedVideoIds = [];
      
      console.log('🚀 Starting YouTube Algorithm Training with preset:', preset.name);
      
      // Update status immediately
      this.sendAliveSignal();
      
      // Notify web app that training started
      this.sendProgress(5, 'Training started...');
      
      // Step 1: Navigiere IMMER zu https://www.youtube.com und warte auf Suchfeld
      if (!window.location.href.startsWith('https://www.youtube.com')) {
        this.sendProgress(10, 'Navigating to YouTube...');
        window.location.href = 'https://www.youtube.com';
        return; // Will restart when page loads
      }
      
      // Warte auf Suchfeld
      this.sendProgress(12, 'Warte auf Suchfeld...');

      // Handle cookie consent at the start
      await window.cookieManager.handleCookieConsent();

      // NEW STEP: Search for preferred channels first
      this.sendProgress(20, 'Searching for preferred channels...');
      await this.searchPreferredChannels();
      
      // Step 3: Perform searches and watch videos
      const searches = preset.searches || [];
      const totalSteps = searches.length;
      let timeLimitReached = false;
      
      for (let i = 0; i < totalSteps; i++) {
        if (!this.isTraining) break;
        
        const search = searches[i];
        // Linear progress from 20% to 80%
        const stepProgress = 20 + (i / totalSteps) * 60;
        
        try {
          // Check time before starting new search
          const elapsedTime = (Date.now() - this.startTime) / (1000 * 60); // in minutes
          if (elapsedTime >= preset.trainingDuration) {
            console.log('⏱️ Training duration reached, completing...');
            timeLimitReached = true;
            // Set progress to 80% when time limit is reached
            this.sendProgress(80, 'Time limit reached, completing training...');
            break;
          }

          await this.performSearch(search.query);
          // Search is 30% of the step
          this.sendProgress(stepProgress, `Searching: "${search.query}"`);
          
          await this.watchRecommendedVideos(search.frequency || 2, search.duration || 60);
          // Watching videos is 70% of the step
          this.sendProgress(stepProgress + (60 / totalSteps * 0.7), `Watched videos for: "${search.query}"`);
          
          // Check time again after watching videos
          const newElapsedTime = (Date.now() - this.startTime) / (1000 * 60);
          if (newElapsedTime >= preset.trainingDuration) {
            console.log('⏱️ Training duration reached after watching videos, completing...');
            timeLimitReached = true;
            // Set progress to 80% when time limit is reached
            this.sendProgress(80, 'Time limit reached, completing training...');
            break;
          }
          
          await this.humanDelay();
          
        } catch (error) {
          console.error(`❌ Error in training step ${i + 1}:`, error);
          // Continue with next step
        }
      }
      
      // Step 4: Extract final recommendations (5% of total)
      this.sendProgress(85, 'Analyzing recommendations...');
      
      // Extract recommendations from the page
      const finalRecommendations = [];
      try {
        // Wait for recommendations to load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Get all video elements
        const videoElements = document.querySelectorAll('ytd-video-renderer, ytd-rich-item-renderer');
        
        for (const element of videoElements) {
          try {
            const titleElement = element.querySelector('#video-title');
            const channelElement = element.querySelector('#channel-name');
            const descriptionElement = element.querySelector('#description-text');
            
            if (titleElement && channelElement) {
              finalRecommendations.push({
                title: titleElement.textContent.trim(),
                channel: channelElement.textContent.trim(),
                description: descriptionElement ? descriptionElement.textContent.trim() : '',
                url: titleElement.href || '',
                position: finalRecommendations.length + 1
              });
            }
          } catch (e) {
            console.log('Failed to extract video details:', e);
          }
        }
        
        console.log('📊 Extracted recommendations:', finalRecommendations.length);
      } catch (error) {
        console.error('Failed to extract recommendations:', error);
      }
      
      // Step 5: Complete (final 15%)
      this.sendProgress(100, timeLimitReached ? 'Training completed (time limit reached)!' : 'Training completed!');
      
      const results = {
        preset: preset.name,
        duration: Date.now() - this.startTime,
        videosWatched: this.videosWatched,
        searchesPerformed: this.searchesPerformed,
        recommendations: finalRecommendations,
        profileScore: this.calculateProfileScore(finalRecommendations, preset.targetKeywords || []),
        language: preset.language || 'en',
        region: preset.region || 'US',
        categories: this.generateCategories(finalRecommendations)
      };
      
      // Ensure we send results before stopping
      await this.sendResults(results);
      
      console.log('✅ Training completed successfully!', results);
      
    } catch (error) {
      console.error('❌ Training failed:', error);
      this.sendError(error.message);
    } finally {
      this.isTraining = false;
      this.sendAliveSignal(); // Update status
    }
  }

  stopTraining() {
    this.isTraining = false;
    this.currentPreset = null;
    this.progress = 0;
    this.startTime = null;
    this.videosWatched = 0;
    this.searchesPerformed = 0;
    this.recommendations = [];
    this.watchedVideoIds = [];
    
    // Notify web app that training stopped
    this.sendProgress(0, 'Training stopped.');
  }
}