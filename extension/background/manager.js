import { waitForTabLoad } from './utils.js';

export class TrainingManager {
  constructor() {
    this.isTraining = false;
    this.currentPreset = null;
    this.trainingTab = null;
    
    console.log('🎯 YouTube Algorithm Trainer background script loaded');
  }

  async startTraining(preset) {
    if (this.isTraining) {
      console.log('⚠️ Training already in progress');
      return;
    }

    this.isTraining = true;
    this.currentPreset = preset;

    console.log('🚀 Starting training with preset:', preset.name);

    try {
      // Always create a new tab for training
      const youtubeTab = await chrome.tabs.create({ url: "https://www.youtube.com" });
      this.trainingTab = youtubeTab;

      // Wait for the tab to load
      await waitForTabLoad(youtubeTab.id);

      // Handle cookies automatically with retry
      const handleCookies = async () => {
        const cookieSelectors = [
          'button[aria-label*="Accept"]',
          'button[aria-label*="Akzeptieren"]',
          'button[aria-label*="Alle akzeptieren"]',
          'button[aria-label*="Accept all"]',
          'button[jsname*="tWT92d"]', // YouTube's cookie consent button class
          'form[action*="consent"] button[type="submit"]',
          'ytd-consent-bump-v2-lightbox button[aria-label*="Accept"]',
          'ytd-consent-bump-v2-lightbox button[aria-label*="Akzeptieren"]'
        ];

        // Try multiple times with different selectors
        for (let attempt = 0; attempt < 3; attempt++) {
          await chrome.scripting.executeScript({
            target: { tabId: youtubeTab.id },
            func: (selectors) => {
              for (const selector of selectors) {
                const button = document.querySelector(selector);
                if (button) {
                  button.click();
                  return true;
                }
              }
              return false;
            },
            args: [cookieSelectors]
          });

          // Wait a bit before next attempt
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      };

      // Try to handle cookies
      await handleCookies();

      // Send the training command to the content script
      await chrome.tabs.sendMessage(youtubeTab.id, {
        type: 'START_TRAINING',
        preset: preset
      });

      // Save training status
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

  async browseWithProfile(profile) {
    console.log('🚀 Browsing with profile:', profile.name);

    try {
      // 1. Create a new incognito window but don't load any URL yet
      const newWindow = await chrome.windows.create({ incognito: true, url: 'about:blank' });
      const newTab = newWindow.tabs[0];

      // Helper function to decode data
      const decode = (str) => {
        try {
          return decodeURIComponent(atob(str));
        } catch (e) {
          console.error('Failed to decode string:', e);
          return null;
        }
      };

      // 2. Restore localStorage and sessionStorage
      const localStorageData = JSON.parse(decode(profile.localStorage) || '{}');
      const sessionStorageData = JSON.parse(decode(profile.sessionStorage) || '{}');

      await chrome.scripting.executeScript({
        target: { tabId: newTab.id },
        func: (lsData, ssData) => {
          Object.keys(lsData).forEach(key => {
            localStorage.setItem(key, lsData[key]);
          });
          Object.keys(ssData).forEach(key => {
            sessionStorage.setItem(key, ssData[key]);
          });
        },
        args: [localStorageData, sessionStorageData],
        world: 'MAIN'
      });

      // 3. Restore Cookies
      const cookieStr = JSON.parse(decode(profile.cookies) || '""');
      const cookies = cookieStr.split(';').map(c => c.trim());

      for (const cookie of cookies) {
        if (!cookie) continue;
        const [name, ...valueParts] = cookie.split('=');
        const value = valueParts.join('=');
        
        if (name && value) {
          await chrome.cookies.set({
            url: 'https://www.youtube.com',
            name: name,
            value: value,
            domain: '.youtube.com',
            path: '/',
            secure: true,
            httpOnly: false, // Cannot set httpOnly from an extension
            sameSite: 'no_restriction'
          });
        }
      }
      
      console.log(`✅ Restored ${cookies.length} cookies.`);

      // 4. Now, navigate to YouTube
      await chrome.tabs.update(newTab.id, { url: 'https://www.youtube.com' });

    } catch (error) {
      console.error('❌ Failed to browse with profile:', error);
    }
  }

  async startPreTrainingAnalysis(sendResponse) {
    try {
      const historyUrl = 'https://www.youtube.com/feed/history';
      const [historyTab] = await chrome.tabs.query({ url: historyUrl });
      if (historyTab) {
        await chrome.tabs.update(historyTab.id, { active: true });
      } else {
        await chrome.tabs.create({ url: historyUrl });
      }
      sendResponse({ success: true });
    } catch (error) {
      console.error('Error starting pre-training analysis:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async handleHistoryAnalysisComplete(results) {
    try {
      const historyUrl = 'https://www.youtube.com/feed/history';
      const [historyTab] = await chrome.tabs.query({ url: historyUrl });
      if (historyTab) {
        await chrome.tabs.update(historyTab.id, { url: 'https://www.youtube.com/' });
        await waitForTabLoad(historyTab.id);
        chrome.tabs.sendMessage(historyTab.id, {
          type: 'ANALYZE_RECOMMENDATIONS',
          historyVideos: results.historyVideos
        });
      } else {
        // Fallback to old behavior if history tab is not found
        const homepageUrl = 'https://www.youtube.com/';
        const [homepageTab] = await chrome.tabs.query({ url: homepageUrl });
        if (homepageTab) {
          await chrome.tabs.update(homepageTab.id, { active: true });
          await waitForTabLoad(homepageTab.id);
          chrome.tabs.sendMessage(homepageTab.id, {
            type: 'ANALYZE_RECOMMENDATIONS',
            historyVideos: results.historyVideos
          });
        } else {
          const newTab = await chrome.tabs.create({ url: homepageUrl });
          await waitForTabLoad(newTab.id);
          chrome.tabs.sendMessage(newTab.id, {
            type: 'ANALYZE_RECOMMENDATIONS',
            historyVideos: results.historyVideos
          });
        }
      }
    } catch (error) {
      console.error('Error handling history analysis complete:', error);
    }
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
}
