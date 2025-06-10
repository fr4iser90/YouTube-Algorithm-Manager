import { trainingManager, profileManager } from './background.js';

export function setupMessageHandlers() {
  // Handle messages from content script and popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('📨 Background received message:', message.type);
    
    switch (message.type) {
      case 'START_TRAINING':
        trainingManager.startTraining(message.preset, sender.tab);
        sendResponse({ success: true });
        break;
        
      case 'STOP_TRAINING':
        trainingManager.stopTraining();
        sendResponse({ success: true });
        break;
        
      case 'GET_TRAINING_STATUS':
        sendResponse({
          isTraining: trainingManager.isTraining,
          currentPreset: trainingManager.currentPreset?.name || null
        });
        break;
        
      case 'TRAINING_PROGRESS':
        trainingManager.handleTrainingProgress(message);
        sendResponse({ success: true });
        break;
        
      case 'TRAINING_COMPLETED':
        trainingManager.handleTrainingCompleted(message.results);
        sendResponse({ success: true });
        break;
        
      case 'TRAINING_ERROR':
        trainingManager.handleTrainingError(message.error);
        sendResponse({ success: true });
        break;
        
      case 'CLEAR_HISTORY':
        if (chrome.browsingData) {
          chrome.browsingData.remove({
            "since": 0
          }, {
            "history": true,
            "downloads": true,
            "cache": true,
            "passwords": true,
            "formData": true
          }, () => {
            console.log('Browsing data cleared');
            sendResponse({ success: true });
          });
        } else {
          console.error('chrome.browsingData API is not available.');
          sendResponse({ success: false, error: 'browsingData API not available' });
        }
        return true; // Indicates that the response is sent asynchronously

      case 'ANALYZE_PRE_TRAINING':
        trainingManager.startAlgorithmSnapshotAnalytics(sendResponse);
        return true; // Indicates that the response is sent asynchronously

      case 'HISTORY_ANALYSIS_COMPLETE':
        trainingManager.handleHistoryAnalysisComplete(message.results);
        sendResponse({ success: true });
        break;

      case 'BROWSE_WITH_PROFILE':
        trainingManager.browseWithProfile(message.profile);
        sendResponse({ success: true });
        break;

      case 'GET_PROFILES':
        profileManager.getProfiles().then(profiles => {
          sendResponse({ success: true, profiles });
        });
        return true;

      case 'SAVE_PROFILES':
        profileManager.getProfiles().then(existingProfiles => {
          const updatedProfiles = [...existingProfiles, ...message.profiles];
          profileManager.saveProfiles(updatedProfiles)
            .then(() => {
              sendResponse({ success: true });
            })
            .catch(error => {
              console.error('Error saving profiles:', error);
              sendResponse({ success: false, error: error.message });
            });
        })
        .catch(error => {
          console.error('Error getting existing profiles:', error);
          sendResponse({ success: false, error: error.message });
        });
        return true;

      case 'PROFILE_UPDATED':
        // Update profile in storage
        chrome.storage.local.get(['profiles'], (result) => {
          if (result.profiles) {
            const updatedProfiles = result.profiles.map(p => 
              p.id === message.profile.id ? message.profile : p
            );
            chrome.storage.local.set({ profiles: updatedProfiles });
            
            // Notify web app about profile update
            chrome.runtime.sendMessage({
              type: 'PROFILE_UPDATED',
              profile: message.profile
            });
          }
        });
        sendResponse({ success: true });
        break;

      case 'SWITCH_PROFILE':
        profileManager.switchProfile(message.profileId).then(response => {
          sendResponse(response);
        });
        return true;

      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  });

  // Handle tab updates
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (trainingManager.isTraining && trainingManager.trainingTab && tabId === trainingManager.trainingTab.id) {
      if (changeInfo.status === 'complete' && tab.url?.includes('youtube.com')) {
        console.log('🔄 YouTube tab updated during training');
      }
    }
  });

  // Handle tab removal
  chrome.tabs.onRemoved.addListener((tabId) => {
    if (trainingManager.trainingTab && tabId === trainingManager.trainingTab.id) {
      console.log('⚠️ Training tab was closed');
      trainingManager.stopTraining();
    }
  });
}
