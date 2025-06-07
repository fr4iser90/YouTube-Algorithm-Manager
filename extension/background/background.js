// Background script for YouTube Algorithm Trainer Extension

class TrainingManager {
  constructor() {
    this.isTraining = false;
    this.currentPreset = null;
    this.trainingTab = null;
    
    console.log('🎯 YouTube Algorithm Trainer background script loaded');
    this.setupMessageHandlers();
  }

  setupMessageHandlers() {
    // Handle messages from content script and popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('📨 Background received message:', message.type);
      
      switch (message.type) {
        case 'START_TRAINING':
          this.startTraining(message.preset, sender.tab);
          sendResponse({ success: true });
          break;
          
        case 'STOP_TRAINING':
          this.stopTraining();
          sendResponse({ success: true });
          break;
          
        case 'GET_TRAINING_STATUS':
          sendResponse({
            isTraining: this.isTraining,
            currentPreset: this.currentPreset?.name || null
          });
          break;
          
        case 'TRAINING_PROGRESS':
          this.handleTrainingProgress(message);
          sendResponse({ success: true });
          break;
          
        case 'TRAINING_COMPLETED':
          this.handleTrainingCompleted(message.results);
          sendResponse({ success: true });
          break;
          
        case 'TRAINING_ERROR':
          this.handleTrainingError(message.error);
          sendResponse({ success: true });
          break;
          
        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    });

    // Handle tab updates
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (this.isTraining && this.trainingTab && tabId === this.trainingTab.id) {
        if (changeInfo.status === 'complete' && tab.url?.includes('youtube.com')) {
          console.log('🔄 YouTube tab updated during training');
        }
      }
    });

    // Handle tab removal
    chrome.tabs.onRemoved.addListener((tabId) => {
      if (this.trainingTab && tabId === this.trainingTab.id) {
        console.log('⚠️ Training tab was closed');
        this.stopTraining();
      }
    });
  }

  async startTraining(preset, tab) {
    if (this.isTraining) {
      console.log('⚠️ Training already in progress');
      return;
    }

    this.isTraining = true;
    this.currentPreset = preset;
    this.trainingTab = tab;

    console.log('🚀 Starting training with preset:', preset.name);

    try {
      // Ensure we're on YouTube
      if (!tab.url?.includes('youtube.com')) {
        await chrome.tabs.update(tab.id, { url: 'https://www.youtube.com' });
        await this.waitForTabLoad(tab.id);
      }

      // Send training command to content script
      await chrome.tabs.sendMessage(tab.id, {
        type: 'START_TRAINING',
        preset: preset
      });

      // Store training state
      await chrome.storage.local.set({
        isTraining: true,
        currentPreset: preset,
        trainingStartTime: Date.now()
      });

    } catch (error) {
      console.error('❌ Failed to start training:', error);
      this.stopTraining();
    }
  }

  async stopTraining() {
    if (!this.isTraining) return;

    console.log('⏹️ Stopping training');

    this.isTraining = false;
    this.currentPreset = null;

    try {
      // Send stop command to content script
      if (this.trainingTab) {
        await chrome.tabs.sendMessage(this.trainingTab.id, {
          type: 'STOP_TRAINING'
        });
      }

      // Clear training state
      await chrome.storage.local.remove(['isTraining', 'currentPreset', 'trainingStartTime']);

    } catch (error) {
      console.error('❌ Error stopping training:', error);
    }

    this.trainingTab = null;
  }

  handleTrainingProgress(progressData) {
    console.log('📊 Training progress:', progressData.message, `${progressData.progress || 0}%`);
    
    // Store progress for popup
    chrome.storage.local.set({
      trainingProgress: progressData
    });

    // Update badge
    if (progressData.progress !== null) {
      chrome.action.setBadgeText({
        text: `${Math.round(progressData.progress)}%`
      });
      chrome.action.setBadgeBackgroundColor({ color: '#10B981' });
    }
  }

  handleTrainingCompleted(results) {
    console.log('✅ Training completed:', results);

    this.isTraining = false;
    this.currentPreset = null;
    this.trainingTab = null;

    // Store results
    chrome.storage.local.set({
      lastTrainingResults: results,
      isTraining: false
    });

    // Update badge
    chrome.action.setBadgeText({ text: '✓' });
    chrome.action.setBadgeBackgroundColor({ color: '#10B981' });

    // Clear badge after 5 seconds
    setTimeout(() => {
      chrome.action.setBadgeText({ text: '' });
    }, 5000);

    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'assets/icon.svg',
      title: 'Training Completed!',
      message: `Watched ${results.videosWatched} videos, performed ${results.searchesPerformed} searches. Bubble score: ${results.bubbleScore}%`
    });
  }

  handleTrainingError(error) {
    console.error('❌ Training error:', error);

    this.isTraining = false;
    this.currentPreset = null;
    this.trainingTab = null;

    // Store error
    chrome.storage.local.set({
      lastTrainingError: error,
      isTraining: false
    });

    // Update badge
    chrome.action.setBadgeText({ text: '!' });
    chrome.action.setBadgeBackgroundColor({ color: '#EF4444' });

    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'assets/icon.svg',
      title: 'Training Failed',
      message: error
    });
  }

  async waitForTabLoad(tabId) {
    return new Promise((resolve) => {
      const listener = (updatedTabId, changeInfo) => {
        if (updatedTabId === tabId && changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          resolve();
        }
      };
      chrome.tabs.onUpdated.addListener(listener);
    });
  }
}

// Initialize training manager
const trainingManager = new TrainingManager();

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('🎯 YouTube Algorithm Trainer extension installed!');
    
    // Open welcome page or instructions
    chrome.tabs.create({
      url: 'https://tiny-semolina-f9b419.netlify.app'
    });
  }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('🔄 YouTube Algorithm Trainer extension started');
  
  // Clear any stale training state
  chrome.storage.local.remove(['isTraining', 'trainingProgress']);
  chrome.action.setBadgeText({ text: '' });
});

console.log('🎯 YouTube Algorithm Trainer background script initialized!');