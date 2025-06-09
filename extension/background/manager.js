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
      // Save training state before creating tab
      await chrome.storage.local.set({
        isTraining: true,
        currentPreset: preset,
        trainingStartTime: Date.now(),
        pendingTraining: true // New flag to indicate training should start after reload
      });

      // Always create a new tab for training
      const youtubeTab = await chrome.tabs.create({ url: "https://www.youtube.com" });
      this.trainingTab = youtubeTab;

      // Wait for the tab to load
      await waitForTabLoad(youtubeTab.id);

      // Handle cookies automatically with retry
      const handleCookies = async () => {
        const cookieSelectors = [
          // YouTube's latest consent button structure
          'button[aria-label*="Accept"]',
          'button[aria-label*="Akzeptieren"]',
          'button[aria-label*="Alle akzeptieren"]',
          'button[aria-label*="Accept all"]',
          'button[aria-label*="I agree"]',
          'button[aria-label*="Ich stimme zu"]',
          // YouTube's specific button classes
          'button.yt-spec-button-shape-next--filled',
          'button.yt-spec-button-shape-next--call-to-action',
          'div.yt-spec-touch-feedback-shape__fill',
          // Parent elements that might contain the actual button
          'ytd-consent-bump-v2-lightbox button',
          'ytd-consent-bump-v2-lightbox .yt-spec-button-shape-next',
          // Specific button classes
          'button[jsname*="tWT92d"]',
          'button[jsname*="ZUkOIc"]',
          // Form submit buttons
          'form[action*="consent"] button[type="submit"]',
          // Generic consent buttons
          'button.yt-spec-button-shape-next',
          // Cookie banner specific
          'div[aria-modal="true"] button',
          'div[role="dialog"] button'
        ];

        // Try multiple times with different selectors and wait for page load
        for (let attempt = 0; attempt < 5; attempt++) {
          try {
            // Wait for page to be fully loaded
            await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));

            const result = await chrome.scripting.executeScript({
              target: { tabId: youtubeTab.id },
              func: (selectors) => {
                // Try clicking any visible consent button
                for (const selector of selectors) {
                  const elements = document.querySelectorAll(selector);
                  for (const element of elements) {
                    // Check if element is visible and clickable
                    if (element.offsetParent !== null) {
                      // Try to find the actual button if we have a wrapper
                      const button = element.closest('button') || element;
                      if (button) {
                        try {
                          // Try both click() and mousedown/mouseup events
                          button.click();
                          button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                          button.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
                          console.log('Clicked element:', selector);
                          return true;
                        } catch (err) {
                          console.log('Click failed:', err);
                        }
                      }
                    }
                  }
                }
                return false;
              },
              args: [cookieSelectors]
            });

            if (result[0].result) {
              console.log('✅ Cookie consent handled successfully');
              // After cookie consent, save state again in case of reload
              await chrome.storage.local.set({
                isTraining: true,
                currentPreset: preset,
                trainingStartTime: Date.now(),
                pendingTraining: true
              });
              // Wait a bit longer to make sure the consent is processed
              await new Promise(resolve => setTimeout(resolve, 2000));
              break;
            }
          } catch (error) {
            console.log(`Attempt ${attempt + 1} failed:`, error);
          }
        }
      };

      // Try to handle cookies
      await handleCookies();

      // Check if we need to restore training state
      const storage = await chrome.storage.local.get(['pendingTraining', 'currentPreset']);
      if (storage.pendingTraining && storage.currentPreset) {
        console.log('🔄 Restoring training state after page load');
        // Send the training command to the content script
        await chrome.tabs.sendMessage(youtubeTab.id, {
          type: 'START_TRAINING',
          preset: storage.currentPreset
        });
      }

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
      // Check if tab still exists before sending message
      if (this.trainingTab) {
        try {
          const tab = await chrome.tabs.get(this.trainingTab.id);
          if (tab) {
            await chrome.tabs.sendMessage(this.trainingTab.id, {
              type: 'STOP_TRAINING'
            }).catch(err => {
              console.log('Tab exists but message could not be sent:', err);
            });
          }
        } catch (err) {
          console.log('Tab no longer exists:', err);
        }
      }

      // Clear training state regardless of tab status
      await chrome.storage.local.remove(['isTraining', 'currentPreset', 'trainingStartTime']);

    } catch (error) {
      console.error('❌ Error stopping training:', error);
      // Still try to clear training state even if there was an error
      try {
        await chrome.storage.local.remove(['isTraining', 'currentPreset', 'trainingStartTime']);
      } catch (storageError) {
        console.error('Failed to clear training state:', storageError);
      }
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

      // 2. Restore ALL localStorage and sessionStorage data
      const localStorageData = JSON.parse(decode(profile.localStorage) || '{}');
      const sessionStorageData = JSON.parse(decode(profile.sessionStorage) || '{}');

      await chrome.scripting.executeScript({
        target: { tabId: newTab.id },
        func: (lsData, ssData) => {
          // Copy ALL localStorage data
          Object.keys(lsData).forEach(key => {
            try {
              localStorage.setItem(key, lsData[key]);
            } catch (e) {
              console.log('Failed to set localStorage item:', key, e);
            }
          });
          
          // Copy ALL sessionStorage data
          Object.keys(ssData).forEach(key => {
            try {
              sessionStorage.setItem(key, ssData[key]);
            } catch (e) {
              console.log('Failed to set sessionStorage item:', key, e);
            }
          });
        },
        args: [localStorageData, sessionStorageData],
        world: 'MAIN'
      });

      // 3. Restore ALL Cookies
      const cookieStr = decode(profile.cookies) || '';
      const cookies = cookieStr.split(';').map(c => c.trim());

      for (const cookie of cookies) {
        if (!cookie) continue;
        const [name, ...valueParts] = cookie.split('=');
        const value = valueParts.join('=');
        
        if (name && value) {
          try {
            await chrome.cookies.set({
              url: 'https://www.youtube.com',
              name: name,
              value: value,
              domain: '.youtube.com',
              path: '/',
              secure: true,
              httpOnly: false,
              sameSite: 'no_restriction'
            });
          } catch (e) {
            console.log('Failed to set cookie:', name, e);
          }
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

    // Update profile with training data
    chrome.storage.local.get(['profiles', 'activeProfileId'], async (storage) => {
      if (storage.profiles && storage.activeProfileId) {
        const profiles = storage.profiles;
        const activeProfile = profiles.find(p => p.id === storage.activeProfileId);
        
        if (activeProfile) {
          // Update profile statistics
          activeProfile.totalVideosWatched += results.videosWatched;
          activeProfile.totalSearches += results.searchesPerformed;
          activeProfile.trainingHours += Math.round((Date.now() - results.startTime) / (1000 * 60 * 60));
          activeProfile.profileStrength = results.profileScore;
          activeProfile.lastTrainingDate = new Date();
          
          // Update preferred categories and channels from recommendations
          if (results.recommendations) {
            results.recommendations.forEach(rec => {
              if (rec.category && !activeProfile.preferredCategories.includes(rec.category)) {
                activeProfile.preferredCategories.push(rec.category);
              }
              if (rec.channel && !activeProfile.preferredChannels.includes(rec.channel)) {
                activeProfile.preferredChannels.push(rec.channel);
              }
            });
          }

          // Save updated profile
          const updatedProfiles = profiles.map(p => p.id === activeProfile.id ? activeProfile : p);
          await chrome.storage.local.set({ profiles: updatedProfiles });
          
          // Notify web app about profile update
          chrome.runtime.sendMessage({
            type: 'PROFILE_UPDATED',
            profile: activeProfile
          });
        }
      }
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
      message: `Watched ${results.videosWatched} videos, performed ${results.searchesPerformed} searches. Profile score: ${results.profileScore}%`
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
