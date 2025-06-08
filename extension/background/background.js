import { TrainingManager } from './manager.js';
import { setupMessageHandlers } from './handlers.js';

// Initialize training manager
export const trainingManager = new TrainingManager();

// Setup message handlers
setupMessageHandlers();

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('🎯 YouTube Algorithm Trainer extension installed!');
    
    // Open welcome page or instructions
    chrome.tabs.create({
      url: chrome.runtime.getURL('webapp/index.html')
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
