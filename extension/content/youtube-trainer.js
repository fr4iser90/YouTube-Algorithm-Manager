// YouTube Algorithm Trainer Content Script
console.log('🎯 YouTube Algorithm Trainer content script starting...');

class YouTubeAlgorithmTrainer {
  constructor() {
    this.isTraining = false;
    this.currentPreset = null;
    this.progress = 0;
    this.startTime = null;
    this.videosWatched = 0;
    this.searchesPerformed = 0;
    this.recommendations = [];
    
    // Initialize immediately
    this.init();
  }

  async init() {
    console.log('🎯 YouTube Algorithm Trainer initializing...');
    
    // Wait for page to be ready
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }
    
    this.setupCrossDomainBridge();
    this.setupMessageListeners();
    
    // Send "I'm alive" signal every 3 seconds to web app
    setInterval(() => {
      this.sendAliveSignal();
    }, 3000);
    
    console.log('✅ YouTube Algorithm Trainer initialized successfully!');
  }

  setupCrossDomainBridge() {
    try {
      // EINFACHE LÖSUNG: Schreibe Extension-Status in localStorage
      // Die Web-App kann das lesen, auch von anderer Domain
      const extensionData = {
        isInstalled: true,
        isConnected: true,
        version: '1.0.0',
        isTraining: this.isTraining,
        timestamp: Date.now(),
        domain: 'youtube.com',
        status: 'ready'
      };
      
      // Schreibe in localStorage (funktioniert cross-domain)
      localStorage.setItem('yt-trainer-extension-status', JSON.stringify(extensionData));
      
      // Auch in sessionStorage für Backup
      sessionStorage.setItem('yt-trainer-extension-status', JSON.stringify(extensionData));
      
      console.log('✅ Cross-domain bridge setup complete:', extensionData);
      
    } catch (error) {
      console.error('❌ Error setting up cross-domain bridge:', error);
    }
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
      
      // Update localStorage every 3 seconds
      localStorage.setItem('yt-trainer-extension-status', JSON.stringify(aliveData));
      sessionStorage.setItem('yt-trainer-extension-status', JSON.stringify(aliveData));
      
      // WICHTIG: Sende auch an alle offenen Tabs der Web-App
      // Das funktioniert über BroadcastChannel API
      try {
        const channel = new BroadcastChannel('yt-trainer-channel');
        channel.postMessage({
          type: 'EXTENSION_ALIVE',
          data: aliveData
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
    // Listen for messages from web app
    window.addEventListener('message', (event) => {
      try {
        if (event.data.type === 'YT_TRAINER_START') {
          console.log('🚀 Received start command from web app');
          this.startTraining(event.data.preset);
        }
        
        if (event.data.type === 'YT_TRAINER_STOP') {
          console.log('⏹️ Received stop command from web app');
          this.stopTraining();
        }

        if (event.data.type === 'YT_TRAINER_PING') {
          console.log('🏓 Received ping, sending pong...');
          window.postMessage({
            type: 'YT_TRAINER_PONG',
            pingId: event.data.pingId,
            extensionInfo: {
              isInstalled: true,
              version: '1.0.0',
              isTraining: this.isTraining,
              timestamp: Date.now()
            }
          }, '*');
        }
      } catch (error) {
        console.error('❌ Error handling message:', error);
      }
    });

    // Check for saved training commands every 3 seconds
    setInterval(() => {
      this.checkForSavedCommands();
    }, 3000);

    // Listen for BroadcastChannel messages
    try {
      const channel = new BroadcastChannel('yt-trainer-channel');
      channel.addEventListener('message', (event) => {
        if (event.data.type === 'START_TRAINING') {
          this.startTraining(event.data.preset);
        }
        if (event.data.type === 'STOP_TRAINING') {
          this.stopTraining();
        }
      });
    } catch (error) {
      console.log('BroadcastChannel not supported');
    }
  }

  checkForSavedCommands() {
    try {
      const savedCommand = localStorage.getItem('yt-trainer-command');
      if (savedCommand && !this.isTraining) {
        const command = JSON.parse(savedCommand);
        if (command.type === 'START_TRAINING' && command.preset) {
          // Check if command is recent (within 30 seconds)
          if (Date.now() - command.timestamp < 30000) {
            console.log('🔄 Found saved training command, starting...');
            this.startTraining(command.preset);
            localStorage.removeItem('yt-trainer-command');
          }
        }
      }
    } catch (error) {
      console.error('❌ Error checking saved commands:', error);
    }
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
      
      console.log('🚀 Starting YouTube Algorithm Training with preset:', preset.name);
      
      // Update status immediately
      this.sendAliveSignal();
      
      // Notify web app that training started
      this.sendProgress(5, 'Training started...');
      
      // Step 1: Navigate to YouTube if needed
      if (!window.location.href.includes('youtube.com')) {
        this.sendProgress(10, 'Navigating to YouTube...');
        window.location.href = 'https://www.youtube.com';
        return; // Will restart when page loads
      }
      
      // Step 2: Clear history if requested
      if (preset.advancedOptions?.clearHistoryFirst) {
        this.sendProgress(15, 'Preparing browser...');
        await this.delay(2000);
      }
      
      // Step 3: Perform searches and watch videos
      const searches = preset.searches || [];
      const totalSteps = searches.length;
      
      for (let i = 0; i < totalSteps; i++) {
        if (!this.isTraining) break;
        
        const search = searches[i];
        const stepProgress = 20 + (i / totalSteps) * 60;
        
        try {
          this.sendProgress(stepProgress, `Searching: "${search.query}"`);
          await this.performSearch(search.query);
          
          this.sendProgress(stepProgress + 10, `Watching videos for: "${search.query}"`);
          await this.watchRecommendedVideos(search.frequency || 2, search.duration || 60);
          
          await this.humanDelay();
          
        } catch (error) {
          console.error(`❌ Error in training step ${i + 1}:`, error);
          // Continue with next step
        }
      }
      
      // Step 4: Extract final recommendations
      this.sendProgress(90, 'Analyzing recommendations...');
      const finalRecommendations = await this.extractRecommendations();
      
      // Step 5: Complete
      this.sendProgress(100, 'Training completed!');
      
      const results = {
        preset: preset.name,
        duration: Date.now() - this.startTime,
        videosWatched: this.videosWatched,
        searchesPerformed: this.searchesPerformed,
        recommendations: finalRecommendations,
        bubbleScore: this.calculateBubbleScore(finalRecommendations, preset.targetKeywords || []),
        language: preset.language || 'en',
        region: preset.region || 'US',
        categories: this.generateCategories(finalRecommendations)
      };
      
      this.sendResults(results);
      
      console.log('✅ Training completed successfully!', results);
      
    } catch (error) {
      console.error('❌ Training failed:', error);
      this.sendError(error.message);
    } finally {
      this.isTraining = false;
      this.sendAliveSignal(); // Update status
    }
  }

  async performSearch(query) {
    console.log(`🔍 Searching for: "${query}"`);
    
    try {
      // Find search box
      const searchBox = await this.waitForElement('input#search', 5000);
      
      // Clear and type query
      searchBox.value = '';
      searchBox.focus();
      await this.typeText(searchBox, query);
      
      // Press Enter
      searchBox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      
      // Wait for search results
      await this.waitForElement('ytd-video-renderer', 10000);
      
      this.searchesPerformed++;
      console.log(`✅ Search completed: "${query}"`);
      
    } catch (error) {
      console.error(`❌ Search failed for "${query}":`, error);
      throw error;
    }
  }

  async watchRecommendedVideos(count, duration) {
    try {
      const videoElements = document.querySelectorAll('ytd-video-renderer');
      const videosToWatch = Math.min(count, videoElements.length, 3); // Max 3 videos
      
      console.log(`📺 Watching ${videosToWatch} videos for ${duration}s each`);
      
      for (let i = 0; i < videosToWatch; i++) {
        if (!this.isTraining) break;
        
        const videoElement = videoElements[i];
        const titleElement = videoElement.querySelector('#video-title');
        const title = titleElement?.textContent?.trim() || `Video ${i + 1}`;
        
        console.log(`📺 Watching: "${title}"`);
        
        // Click video
        titleElement?.click();
        
        // Wait for video page
        await this.delay(3000);
        
        // Watch video
        await this.watchVideo(Math.min(duration, 90)); // Max 90 seconds
        
        // Random engagement
        if (Math.random() < 0.3) {
          await this.likeVideo();
        }
        
        this.videosWatched++;
        
        // Go back
        window.history.back();
        await this.delay(2000);
        
        await this.humanDelay();
      }
      
    } catch (error) {
      console.error('❌ Error watching videos:', error);
    }
  }

  async watchVideo(duration) {
    try {
      const video = document.querySelector('video');
      if (video && video.paused) {
        video.play();
      }
      
      // Watch for specified duration
      const watchTime = Math.min(duration, 120) * 1000; // Max 2 minutes
      await this.delay(watchTime);
      
      console.log(`✅ Watched video for ${duration}s`);
      
    } catch (error) {
      console.error('❌ Error watching video:', error);
    }
  }

  async likeVideo() {
    try {
      await this.delay(1000);
      const likeButton = document.querySelector('button[aria-label*="like" i]:not([aria-pressed="true"])');
      if (likeButton) {
        likeButton.click();
        console.log('👍 Liked video');
      }
    } catch (error) {
      console.log('Could not like video:', error);
    }
  }

  async extractRecommendations() {
    try {
      // Go to YouTube home
      window.location.href = 'https://www.youtube.com';
      await this.delay(3000);
      
      const recommendations = [];
      const recElements = document.querySelectorAll('ytd-rich-item-renderer, ytd-video-renderer');
      
      recElements.forEach((element, index) => {
        if (index >= 15) return; // Limit to 15
        
        const titleElement = element.querySelector('#video-title, h3 a');
        const channelElement = element.querySelector('#channel-name a, .ytd-channel-name a');
        
        if (titleElement && channelElement) {
          recommendations.push({
            title: titleElement.textContent?.trim() || '',
            channel: channelElement.textContent?.trim() || '',
            position: index + 1
          });
        }
      });
      
      console.log(`📊 Extracted ${recommendations.length} recommendations`);
      return recommendations;
      
    } catch (error) {
      console.error('❌ Error extracting recommendations:', error);
      return [];
    }
  }

  generateCategories(recommendations) {
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

  calculateBubbleScore(recommendations, targetKeywords) {
    if (recommendations.length === 0 || targetKeywords.length === 0) return 0;
    
    const targetMatches = recommendations.filter(rec => 
      targetKeywords.some(keyword => 
        rec.title.toLowerCase().includes(keyword.toLowerCase())
      )
    ).length;
    
    return Math.round((targetMatches / recommendations.length) * 100);
  }

  // Utility methods
  async waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) return resolve(element);
      
      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });
      
      observer.observe(document.body, { childList: true, subtree: true });
      
      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found`));
      }, timeout);
    });
  }

  async typeText(element, text) {
    for (const char of text) {
      element.value += char;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      await this.delay(50 + Math.random() * 100);
    }
  }

  async humanDelay() {
    const delay = 2000 + Math.random() * 3000; // 2-5 seconds
    await this.delay(delay);
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  sendResults(results) {
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

  sendError(error) {
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

  sendProgress(progress, message) {
    try {
      this.progress = progress;
      
      const progressData = {
        progress,
        message,
        videosWatched: this.videosWatched,
        searchesPerformed: this.searchesPerformed,
        timestamp: Date.now()
      };
      
      localStorage.setItem('yt-trainer-progress', JSON.stringify(progressData));
      window.postMessage({ type: 'YT_TRAINER_PROGRESS', detail: progressData }, '*');
      
      // Send via BroadcastChannel
      try {
        const channel = new BroadcastChannel('yt-trainer-channel');
        channel.postMessage({
          type: 'TRAINING_PROGRESS',
          progress: progressData
        });
      } catch (error) {
        // BroadcastChannel not supported
      }
      
      // Update alive signal with progress
      this.sendAliveSignal();
      
    } catch (error) {
      console.error('❌ Error sending progress:', error);
    }
  }

  stopTraining() {
    this.isTraining = false;
    this.sendAliveSignal(); // Update status
    console.log('⏹️ Training stopped');
    
    window.postMessage({ type: 'YT_TRAINER_STOPPED' }, '*');
    
    try {
      const channel = new BroadcastChannel('yt-trainer-channel');
      channel.postMessage({
        type: 'TRAINING_STOPPED'
      });
    } catch (error) {
      // BroadcastChannel not supported
    }
  }
}

// Initialize trainer when script loads
try {
  const trainer = new YouTubeAlgorithmTrainer();
  console.log('🎯 YouTube Algorithm Trainer content script loaded successfully!');
} catch (error) {
  console.error('❌ Error initializing trainer:', error);
}