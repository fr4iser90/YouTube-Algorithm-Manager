class PopupManager {
  constructor() {
    this.isTraining = false;
    this.currentProgress = 0;
    
    this.initializeElements();
    this.setupEventListeners();
    this.loadCurrentStatus();
    
    console.log('🎯 Popup manager initialized');
  }

  initializeElements() {
    // Status elements
    this.statusDot = document.getElementById('statusDot');
    this.statusText = document.getElementById('statusText');
    this.progressSection = document.getElementById('progressSection');
    this.progressFill = document.getElementById('progressFill');
    this.progressText = document.getElementById('progressText');
    this.videosWatched = document.getElementById('videosWatched');
    this.searchesPerformed = document.getElementById('searchesPerformed');
    
    // Button elements
    this.openWebAppBtn = document.getElementById('openWebApp');
    this.quickStartBtn = document.getElementById('quickStart');
    this.stopTrainingBtn = document.getElementById('stopTraining');
    this.checkYouTubeBtn = document.getElementById('checkYouTube');
    
    // Other elements
    this.notification = document.getElementById('notification');
    this.notificationText = document.getElementById('notificationText');
  }

  setupEventListeners() {
    // Button click handlers
    this.openWebAppBtn.addEventListener('click', () => this.openWebApp());
    this.quickStartBtn.addEventListener('click', () => this.quickStartTraining());
    this.stopTrainingBtn.addEventListener('click', () => this.stopTraining());
    this.checkYouTubeBtn.addEventListener('click', () => this.goToYouTube());
    
    // Help and settings
    document.getElementById('helpLink').addEventListener('click', (e) => {
      e.preventDefault();
      this.openHelp();
    });
    
    document.getElementById('settingsLink').addEventListener('click', (e) => {
      e.preventDefault();
      this.openSettings();
    });
  }

  async loadCurrentStatus() {
    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Check if we're on YouTube
      const isOnYouTube = tab.url?.includes('youtube.com');
      
      // Get training status from background
      const response = await chrome.runtime.sendMessage({ type: 'GET_TRAINING_STATUS' });
      
      if (response.isTraining) {
        this.updateTrainingStatus(true, response.currentPreset);
      } else {
        this.updateIdleStatus(isOnYouTube);
      }
      
      // Load stored progress if available
      const storage = await chrome.storage.local.get(['trainingProgress', 'lastTrainingResults']);
      
      if (storage.trainingProgress) {
        this.updateProgress(storage.trainingProgress);
      }
      
      if (storage.lastTrainingResults) {
        this.showNotification(`Last training: ${storage.lastTrainingResults.bubbleScore}% bubble score`, 'success');
      }
      
    } catch (error) {
      console.error('Error loading status:', error);
      this.updateIdleStatus(false);
    }
  }

  updateIdleStatus(isOnYouTube) {
    this.isTraining = false;
    this.statusDot.className = 'status-dot idle';
    this.statusText.textContent = isOnYouTube ? 'Ready on YouTube' : 'Extension Ready';
    this.progressSection.classList.remove('visible');
    
    // Update buttons
    this.quickStartBtn.disabled = !isOnYouTube;
    this.stopTrainingBtn.disabled = true;
    this.checkYouTubeBtn.disabled = isOnYouTube;
    
    if (!isOnYouTube) {
      this.quickStartBtn.innerHTML = `
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
        </svg>
        Go to YouTube First
      `;
    } else {
      this.quickStartBtn.innerHTML = `
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path>
        </svg>
        Quick Start Training
      `;
    }
  }

  updateTrainingStatus(isTraining, presetName = null) {
    this.isTraining = isTraining;
    
    if (isTraining) {
      this.statusDot.className = 'status-dot training';
      this.statusText.textContent = presetName ? `Training: ${presetName}` : 'Training Active';
      this.progressSection.classList.add('visible');
      
      // Update buttons
      this.quickStartBtn.disabled = true;
      this.stopTrainingBtn.disabled = false;
      this.openWebAppBtn.disabled = false;
      this.checkYouTubeBtn.disabled = true;
      
    } else {
      this.loadCurrentStatus(); // Reload idle status
    }
  }

  updateProgress(progressData) {
    if (!progressData) return;
    
    const { progress, message, videosWatched, searchesPerformed } = progressData;
    
    if (progress !== null && progress !== undefined) {
      this.progressFill.style.width = `${progress}%`;
      this.currentProgress = progress;
    }
    
    if (message) {
      this.progressText.textContent = message;
    }
    
    if (videosWatched !== undefined) {
      this.videosWatched.textContent = videosWatched;
    }
    
    if (searchesPerformed !== undefined) {
      this.searchesPerformed.textContent = searchesPerformed;
    }
  }

  async openWebApp() {
    try {
      // Use the deployed web app URL
      const webAppUrl = 'https://tiny-semolina-f9b419.netlify.app';
      
      await chrome.tabs.create({ url: webAppUrl });
      window.close();
      
    } catch (error) {
      console.error('Error opening web app:', error);
      this.showNotification('Could not open web app', 'error');
    }
  }

  async quickStartTraining() {
    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url?.includes('youtube.com')) {
        this.showNotification('Please navigate to YouTube first', 'error');
        return;
      }
      
      // Create a quick training preset
      const quickPreset = {
        id: 'quick-start',
        name: 'Quick Start',
        description: 'Quick training profile',
        category: 'tech',
        language: 'en',
        region: 'US',
        searches: [
          { query: 'programming tutorial', frequency: 2, duration: 60 },
          { query: 'tech news', frequency: 2, duration: 45 }
        ],
        targetKeywords: ['programming', 'tech', 'tutorial'],
        avoidKeywords: ['drama', 'gossip'],
        trainingDuration: 10,
        advancedOptions: {
          clearHistoryFirst: false,
          useIncognito: false,
          simulateRealTiming: true,
          engagementRate: 0.3,
          skipAds: true
        }
      };
      
      // Start training
      await chrome.runtime.sendMessage({
        type: 'START_TRAINING',
        preset: quickPreset
      });
      
      this.updateTrainingStatus(true, 'Quick Start');
      this.showNotification('Quick training started!', 'success');
      
    } catch (error) {
      console.error('Error starting quick training:', error);
      this.showNotification('Failed to start training', 'error');
    }
  }

  async stopTraining() {
    try {
      await chrome.runtime.sendMessage({ type: 'STOP_TRAINING' });
      this.updateTrainingStatus(false);
      this.showNotification('Training stopped', 'success');
      
    } catch (error) {
      console.error('Error stopping training:', error);
      this.showNotification('Failed to stop training', 'error');
    }
  }

  async goToYouTube() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await chrome.tabs.update(tab.id, { url: 'https://www.youtube.com' });
      window.close();
      
    } catch (error) {
      console.error('Error navigating to YouTube:', error);
      this.showNotification('Could not navigate to YouTube', 'error');
    }
  }

  openHelp() {
    chrome.tabs.create({ 
      url: 'https://github.com/your-repo/youtube-algorithm-trainer#readme' 
    });
    window.close();
  }

  openSettings() {
    this.openWebApp(); // Settings are in the web app
  }

  showNotification(message, type = 'success') {
    this.notificationText.textContent = message;
    this.notification.className = `notification ${type} show`;
    
    setTimeout(() => {
      this.notification.classList.remove('show');
    }, 3000);
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const popup = window.popupManager;
  if (!popup) return;
  
  switch (message.type) {
    case 'TRAINING_PROGRESS':
      popup.updateProgress(message);
      break;
      
    case 'TRAINING_COMPLETED':
      popup.updateTrainingStatus(false);
      popup.showNotification(`Training completed! Bubble score: ${message.results.bubbleScore}%`, 'success');
      break;
      
    case 'TRAINING_ERROR':
      popup.updateTrainingStatus(false);
      popup.showNotification(`Training failed: ${message.error}`, 'error');
      break;
  }
});

// Store popup manager globally for message handling
window.addEventListener('load', () => {
  window.popupManager = new PopupManager();
});