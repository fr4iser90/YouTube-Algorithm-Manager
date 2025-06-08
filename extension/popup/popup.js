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
      //const webAppUrl = 'https://tiny-semolina-f9b419.netlify.app';
      const webAppUrl = 'http://localhost:5173';

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

      // Load active profile from storage, NO fallback to default
      const storage = await chrome.storage.local.get(['profiles', 'activeProfileId']);
      let profiles = storage.profiles || [];
      if (!profiles.length) {
        this.showNotification('No profiles found. Please select or create a profile first.', 'error');
        return;
      }
      let activeId = storage.activeProfileId || profiles[0].id;
      let activeProfile = profiles.find(p => p.id === activeId);
      if (!activeProfile) {
        this.showNotification('No active profile selected. Please select a profile first.', 'error');
        return;
      }

      // Require training config
      if (!activeProfile.searches || !activeProfile.trainingDuration) {
        this.showNotification('Active profile does not have training configuration.', 'error');
        return;
      }

      const preset = {
        id: activeProfile.id,
        name: activeProfile.name,
        description: activeProfile.desc || activeProfile.description || '',
        category: activeProfile.category,
        language: activeProfile.language,
        region: activeProfile.region,
        searches: activeProfile.searches,
        targetKeywords: activeProfile.targetKeywords,
        avoidKeywords: activeProfile.avoidKeywords,
        trainingDuration: activeProfile.trainingDuration,
        advancedOptions: activeProfile.advancedOptions
      };

      // Start training
      await chrome.runtime.sendMessage({
        type: 'START_TRAINING',
        preset
      });
      
      this.updateTrainingStatus(true, preset.name);
      this.showNotification(`Training started with "${preset.name}"!`, 'success');
      
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
      url: 'https://github.com/fr4iser90/YouTube-Algorithm-Manager#readme' 
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

/* --- Profiles Dropdown & Controls Logic --- */
function setupProfileSwitcher() {
  const dropdown = document.getElementById('profileDropdown');
  const activateBtn = document.getElementById('activateProfileBtn');
  const anonymCheckbox = document.getElementById('anonymCheckbox');
  const freezeCheckbox = document.getElementById('freezeCheckbox');

  if (!dropdown || !activateBtn || !anonymCheckbox || !freezeCheckbox) return;

  // Load profiles from GitHub and local storage
  async function loadProfilesDropdown() {
    // Fetch GitHub profiles
    let githubProfiles = [];
    const manifestUrl = 'https://raw.githubusercontent.com/fr4iser90/YouTube-Algorithm-Manager/main/profiles/manifest.json';
    const manifestRes = await fetch(manifestUrl, { cache: "no-store" });
    if (!manifestRes.ok) {
      dropdown.innerHTML = '<option disabled selected>Failed to load profiles from GitHub</option>';
      dropdown.dataset.profiles = '[]';
      return;
    }
    const manifest = await manifestRes.json();
    const profilePromises = manifest.map(async (meta) => {
      const res = await fetch('https://raw.githubusercontent.com/fr4iser90/YouTube-Algorithm-Manager/main/' + meta.path, { cache: "no-store" });
      if (!res.ok) return null;
      const profile = await res.json();
      return { ...meta, ...profile, source: 'github' };
    });
    githubProfiles = (await Promise.all(profilePromises)).filter(Boolean);

    // Load local profiles
    let localProfiles = [];
    const storage = await chrome.storage.local.get(['userProfiles']);
    localProfiles = (storage.userProfiles || []).map(p => ({ ...p, source: 'local' }));

    // Merge and populate dropdown
    const allProfiles = [...githubProfiles, ...localProfiles];
    dropdown.innerHTML = '';
    if (allProfiles.length === 0) {
      dropdown.innerHTML = '<option disabled selected>No profiles found</option>';
    } else {
      allProfiles.forEach((profile, idx) => {
        const opt = document.createElement('option');
        opt.value = profile.id || profile.name || idx;
        opt.textContent = `[${profile.source === 'github' ? 'GH' : 'Local'}] ${profile.name}`;
        dropdown.appendChild(opt);
      });
    }
    dropdown.dataset.profiles = JSON.stringify(allProfiles);
  }

  // On Activate: handle freeze/anonym logic
  activateBtn.addEventListener('click', async () => {
    const allProfiles = JSON.parse(dropdown.dataset.profiles || '[]');
    const selectedIdx = dropdown.selectedIndex;
    const selectedProfile = allProfiles[selectedIdx];
    if (!selectedProfile) return;

    // If GitHub profile and not frozen, clone to local
    if (selectedProfile.source === 'github' && !freezeCheckbox.checked) {
      // Clone to local and activate
      const storage = await chrome.storage.local.get(['userProfiles']);
      let userProfiles = storage.userProfiles || [];
      const newProfile = { ...selectedProfile, id: 'local-' + Date.now(), source: 'local', isFrozen: false };
      userProfiles.push(newProfile);
      await chrome.storage.local.set({ userProfiles });
      // Optionally, set as active
      await chrome.storage.local.set({ activeProfileId: newProfile.id });
      alert('Profile cloned to local and activated for growth.');
    } else {
      // Set as active (frozen or local)
      await chrome.storage.local.set({ activeProfileId: selectedProfile.id, isFrozen: freezeCheckbox.checked });
      alert('Profile activated' + (freezeCheckbox.checked ? ' (frozen)' : ''));
    }
    // Optionally, handle anonym logic (not implemented here)
  });

  // Reload profiles on open
  loadProfilesDropdown();
}

/* --- Training Presets Dropdown & Controls Logic --- */
function setupTrainingSwitcher() {
  const dropdown = document.getElementById('trainingDropdown');
  const startBtn = document.getElementById('startTrainingBtn');
  const editBtn = document.getElementById('editPresetBtn');
  const createBtn = document.getElementById('createPresetBtn');

  if (!dropdown || !startBtn || !editBtn || !createBtn) return;

  // Load presets from GitHub and local storage
  async function loadPresetsDropdown() {
    // Fetch GitHub presets
    let githubPresets = [];
    const manifestUrl = 'https://raw.githubusercontent.com/fr4iser90/YouTube-Algorithm-Manager/main/training-presets/manifest.json';
    const manifestRes = await fetch(manifestUrl, { cache: "no-store" });
    if (!manifestRes.ok) {
      dropdown.innerHTML = '<option disabled selected>Failed to load presets from GitHub</option>';
      dropdown.dataset.presets = '[]';
      return;
    }
    const manifest = await manifestRes.json();
    const presetPromises = manifest.map(async (meta) => {
      const res = await fetch('https://raw.githubusercontent.com/fr4iser90/YouTube-Algorithm-Manager/main/' + meta.path, { cache: "no-store" });
      if (!res.ok) return null;
      const preset = await res.json();
      return { ...meta, ...preset, source: 'github' };
    });
    githubPresets = (await Promise.all(presetPromises)).filter(Boolean);

    // Load local presets
    let localPresets = [];
    const storage = await chrome.storage.local.get(['userPresets']);
    localPresets = (storage.userPresets || []).map(p => ({ ...p, source: 'local' }));

    // Merge and populate dropdown
    const allPresets = [...githubPresets, ...localPresets];
    dropdown.innerHTML = '';
    if (allPresets.length === 0) {
      dropdown.innerHTML = '<option disabled selected>No presets found</option>';
    } else {
      allPresets.forEach((preset, idx) => {
        const opt = document.createElement('option');
        opt.value = preset.id || preset.name || idx;
        opt.textContent = `[${preset.source === 'github' ? 'GH' : 'Local'}] ${preset.name}`;
        dropdown.appendChild(opt);
      });
    }
    dropdown.dataset.presets = JSON.stringify(allPresets);
  }

  // Start Training
  startBtn.addEventListener('click', () => {
    const allPresets = JSON.parse(dropdown.dataset.presets || '[]');
    const selectedIdx = dropdown.selectedIndex;
    const selectedPreset = allPresets[selectedIdx];
    if (!selectedPreset) return;
    chrome.runtime.sendMessage({ type: 'START_TRAINING', preset: selectedPreset });
  });

  // Edit Preset (local only)
  editBtn.addEventListener('click', () => {
    const allPresets = JSON.parse(dropdown.dataset.presets || '[]');
    const selectedIdx = dropdown.selectedIndex;
    const selectedPreset = allPresets[selectedIdx];
    if (!selectedPreset || selectedPreset.source !== 'local') {
      alert('Only local presets can be edited.');
      return;
    }
    // Simple prompt-based edit (for demo)
    const newName = prompt('Edit preset name:', selectedPreset.name);
    if (newName) {
      selectedPreset.name = newName;
      chrome.storage.local.get(['userPresets'], (storage) => {
        let userPresets = storage.userPresets || [];
        userPresets = userPresets.map(p => p.id === selectedPreset.id ? selectedPreset : p);
        chrome.storage.local.set({ userPresets }, loadPresetsDropdown);
      });
    }
  });

  // Create Preset (local)
  createBtn.addEventListener('click', () => {
    const name = prompt('Preset name:');
    if (!name) return;
    const newPreset = {
      id: 'local-' + Date.now(),
      name,
      source: 'local',
      description: '',
      searches: [],
      watchPatterns: [],
      channelPreferences: [],
      targetKeywords: [],
      avoidKeywords: [],
      trainingDuration: 30,
      advancedOptions: {}
    };
    chrome.storage.local.get(['userPresets'], (storage) => {
      let userPresets = storage.userPresets || [];
      userPresets.push(newPreset);
      chrome.storage.local.set({ userPresets }, loadPresetsDropdown);
    });
  });

  // Reload presets on open
  loadPresetsDropdown();
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
  setupProfileSwitcher();
  setupTrainingSwitcher();
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
