import { trainingManager } from './background.js';

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
          "cookies": true,
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
        trainingManager.startPreTrainingAnalysis(sendResponse);
        return true; // Indicates that the response is sent asynchronously

      case 'HISTORY_ANALYSIS_COMPLETE':
        trainingManager.handleHistoryAnalysisComplete(message.results);
        sendResponse({ success: true });
        break;

      case 'BROWSE_WITH_PROFILE':
        trainingManager.browseWithProfile(message.profile);
        sendResponse({ success: true });
        break;

      case 'SAVE_PROFILE':
        const profileContent = JSON.stringify(message.profile, null, 2);
        const blob = new Blob([profileContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        chrome.downloads.download({
          url: url,
          filename: `profiles/${message.profile.id}.json`,
          saveAs: true
        }, (downloadId) => {
          if (chrome.runtime.lastError) {
            console.error('Error downloading profile:', chrome.runtime.lastError);
            sendResponse({ success: false, error: 'Failed to download profile.' });
          } else {
            console.log('Profile downloaded with ID:', downloadId);
            // We can't read the manifest directly, so we'll just log instructions
            // to the user on how to update it.
            console.log("\n--- UPDATE MANIFEST ---");
            console.log("2. Open 'profiles/manifest.json' and add a new entry for your profile. It should look like this:");
            console.log(JSON.stringify({
              id: message.profile.id,
              name: message.profile.name,
              desc: message.profile.desc,
              avatar: message.profile.avatar,
              category: message.profile.category,
              path: `profiles/${message.profile.id}.json`
            }, null, 2));
            alert("The profile JSON has been downloaded. Please save it in the 'profiles' directory. Instructions to update the manifest have been logged to the developer console (F12).");
            sendResponse({ success: true, message: 'Profile downloaded. Manifest instructions logged to console.' });
          }
        });
        return true; // Indicates that the response is sent asynchronously
        
      case 'SAVE_BUBBLE_PROFILE':
        const profileContentBubble = JSON.stringify(message.profile, null, 2);
        const blobBubble = new Blob([profileContentBubble], { type: 'application/json' });
        const urlBubble = URL.createObjectURL(blobBubble);

        chrome.downloads.download({
          url: urlBubble,
          filename: `profiles/${message.profile.id}.json`,
          saveAs: true
        }, (downloadId) => {
          if (chrome.runtime.lastError) {
            console.error('Error downloading profile:', chrome.runtime.lastError);
            sendResponse({ success: false, error: 'Failed to download profile.' });
          } else {
            console.log('Profile downloaded with ID:', downloadId);
            sendResponse({ success: true, message: 'Profile downloaded.' });
          }
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
