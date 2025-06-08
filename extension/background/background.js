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

// --- Auto Backup Logic ---

function runAutoBackup() {
  chrome.storage.local.get(['browser-settings', 'youtube-profiles'], (result) => {
    if (chrome.runtime.lastError) {
      console.error('Error getting data for auto-backup:', chrome.runtime.lastError);
      return;
    }

    const settings = result['browser-settings'] ? JSON.parse(result['browser-settings']) : {};
    const profiles = result['youtube-profiles'] ? JSON.parse(result['youtube-profiles']) : [];

    if (settings.autoBackup && profiles.length > 0) {
      const dataStr = JSON.stringify(profiles, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `youtube-profiles-backup-${timestamp}.json`;

      chrome.downloads.download({
        url: url,
        filename: filename,
        saveAs: false
      }, (downloadId) => {
        if (chrome.runtime.lastError) {
          console.error('Auto-backup download failed:', chrome.runtime.lastError);
        } else {
          console.log(`✅ Successfully created auto-backup: ${filename}`);
        }
        // Revoke URL after a short delay to ensure download starts
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      });
    }
  });
}

// Create alarm for weekly backup
chrome.alarms.create('weekly-backup', {
  delayInMinutes: 1, // Fire once on startup
  periodInMinutes: 7 * 24 * 60 // Fire every 7 days
});

// Listen for alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'weekly-backup') {
    console.log('⏰ Running weekly auto-backup...');
    runAutoBackup();
  }
});


console.log('🎯 YouTube Algorithm Trainer background script initialized!');
