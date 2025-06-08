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

      // Load active profile from storage, fallback to default
      const storage = await chrome.storage.local.get(['profiles', 'activeProfileId']);
      let profiles = storage.profiles || [
        {
          id: 'quick-start',
          name: 'Quick Start',
          desc: 'Quick training profile',
          avatar: '⚡',
          // Default training config
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
        }
      ];
      let activeId = storage.activeProfileId || profiles[0].id;
      let activeProfile = profiles.find(p => p.id === activeId) || profiles[0];

      // If the profile doesn't have training config, fallback to default config
      const preset = {
        id: activeProfile.id,
        name: activeProfile.name,
        description: activeProfile.desc || activeProfile.description || '',
        category: activeProfile.category || 'tech',
        language: activeProfile.language || 'en',
        region: activeProfile.region || 'US',
        searches: activeProfile.searches || [
          { query: 'programming tutorial', frequency: 2, duration: 60 },
          { query: 'tech news', frequency: 2, duration: 45 }
        ],
        targetKeywords: activeProfile.targetKeywords || ['programming', 'tech', 'tutorial'],
        avoidKeywords: activeProfile.avoidKeywords || ['drama', 'gossip'],
        trainingDuration: activeProfile.trainingDuration || 10,
        advancedOptions: activeProfile.advancedOptions || {
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

/* --- Profile Modal Logic --- */
function setupProfilesModal() {
  const openBtn = document.getElementById('openProfilesModal');
  const modal = document.getElementById('profilesModal');
  const closeBtn = document.getElementById('closeProfilesModal');
  const cardsContainer = modal?.querySelector('.profile-cards');

  if (!openBtn || !modal || !closeBtn || !cardsContainer) return;

  // Load manifest and all profiles from local server, GitHub, or static assets
  async function loadProfiles() {
    const LOCAL_BASE = 'http://localhost:3000/';
    const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/fr4iser90/YouTube-Algorithm-Manager/main/';
    let manifest = null;
    let profiles = null;
    let source = 'static';

    // Try local server first
    try {
      const manifestRes = await fetch(LOCAL_BASE + 'profiles/manifest.json', { cache: "no-store" });
      if (!manifestRes.ok) throw new Error('Local manifest fetch failed');
      manifest = await manifestRes.json();
      const profilePromises = manifest.map(async meta => {
        const res = await fetch(LOCAL_BASE + meta.path, { cache: "no-store" });
        const data = await res.json();
        return { ...meta, ...data };
      });
      profiles = await Promise.all(profilePromises);
      source = 'local';
    } catch (e) {
      // Try GitHub next
      try {
        const manifestRes = await fetch(GITHUB_RAW_BASE + 'profiles/manifest.json', { cache: "no-store" });
        if (!manifestRes.ok) throw new Error('GitHub manifest fetch failed');
        manifest = await manifestRes.json();
        const profilePromises = manifest.map(async meta => {
          const res = await fetch(GITHUB_RAW_BASE + meta.path, { cache: "no-store" });
          const data = await res.json();
          return { ...meta, ...data };
        });
        profiles = await Promise.all(profilePromises);
        source = 'github';
      } catch (e2) {
        // fallback to static assets
        try {
          const manifestRes = await fetch(chrome.runtime.getURL('profiles/manifest.json'));
          manifest = await manifestRes.json();
          const profilePromises = manifest.map(async meta => {
            const res = await fetch(chrome.runtime.getURL(meta.path));
            const data = await res.json();
            return { ...meta, ...data };
          });
          profiles = await Promise.all(profilePromises);
          source = 'static';
        } catch (e3) {
          // fallback to default demo profiles if all fail
          profiles = [
            {
              id: 'tech-guru',
              name: 'Tech Guru',
              desc: 'Tech-focused recommendations',
              avatar: '🧑‍💻',
              category: 'tech'
            },
            {
              id: 'art-explorer',
              name: 'Art Explorer',
              desc: 'Art & creativity profile',
              avatar: '🎨',
              category: 'art'
            }
          ];
        }
      }
    }

    // Get active profile from storage
    const storage = await chrome.storage.local.get(['activeProfileId']);
    let activeId = storage.activeProfileId || profiles[0]?.id;

    // Get unique categories
    const categories = [...new Set(profiles.map(p => p.category))];

    renderProfiles(profiles, activeId, categories);
  }

  // Render profile cards with category filter
  function renderProfiles(profiles, activeId, categories) {
    cardsContainer.innerHTML = '';

    // Category filter UI
    const filterBar = document.createElement('div');
    filterBar.style.display = 'flex';
    filterBar.style.gap = '8px';
    filterBar.style.marginBottom = '12px';

    let selectedCategory = categories[0];
    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
      btn.className = 'profile-action' + (cat === selectedCategory ? ' primary' : ' secondary');
      btn.style.fontSize = '12px';
      btn.addEventListener('click', () => {
        selectedCategory = cat;
        renderProfiles(profiles, activeId, categories);
      });
      filterBar.appendChild(btn);
    });
    cardsContainer.appendChild(filterBar);

    // Filter profiles by selected category
    const filtered = profiles.filter(p => p.category === selectedCategory);

    filtered.forEach(profile => {
      const card = document.createElement('div');
      card.className = 'profile-card' + (profile.id === activeId ? ' active' : '');

      // Profile type label
      const typeLabel = profile.mode === 'learning'
        ? `<span class="profile-type learning">Learning</span>`
        : `<span class="profile-type template">Template</span>`;

      // Freeze toggle for learning profiles
      let freezeToggle = '';
      if (profile.mode === 'learning') {
        const checked = profile.isFrozen ? 'checked' : '';
        freezeToggle = `
          <label style="display:flex;align-items:center;gap:6px;margin-top:6px;font-size:12px;">
            <input type="checkbox" class="freeze-toggle" ${checked} style="accent-color:#8B5CF6;">
            Freeze ❄️
          </label>
        `;
      }

      card.innerHTML = `
        <div class="profile-avatar">${profile.avatar || '👤'}</div>
        <div class="profile-info">
          <div class="profile-name">${profile.name} ${typeLabel}</div>
          <div class="profile-desc">${profile.desc}</div>
          ${freezeToggle}
        </div>
        <button class="profile-action ${profile.id === activeId ? 'primary' : 'secondary'}">
          ${profile.id === activeId ? 'Active' : 'Switch'}
        </button>
      `;

      // Switch profile handler
      if (profile.id !== activeId) {
        card.querySelector('.profile-action').addEventListener('click', async () => {
          await chrome.storage.local.set({ activeProfileId: profile.id });
          renderProfiles(profiles, profile.id, categories);
        });
      }

      // Freeze toggle handler
      if (profile.mode === 'learning' && profile.id === activeId) {
        const freezeInput = card.querySelector('.freeze-toggle');
        if (freezeInput) {
          freezeInput.addEventListener('change', async (e) => {
            // Update isFrozen in local storage for this profile
            const storage = await chrome.storage.local.get(['userProfiles']);
            let userProfiles = storage.userProfiles || [];
            userProfiles = userProfiles.map(p =>
              p.id === profile.id ? { ...p, isFrozen: e.target.checked } : p
            );
            await chrome.storage.local.set({ userProfiles });
            // Also update in-memory for immediate UI feedback
            profile.isFrozen = e.target.checked;
            renderProfiles(profiles, activeId, categories);
          });
        }
      }

      cardsContainer.appendChild(card);
    });

    // Add Profile Card (optional: only for demo, not from manifest)
    const addCard = document.createElement('div');
    addCard.className = 'profile-card add-profile';
    addCard.innerHTML = `
      <div class="profile-avatar">+</div>
      <div class="profile-info">
        <div class="profile-name">Add Profile</div>
        <div class="profile-desc">Create a new profile</div>
      </div>
      <button class="profile-action success">Add</button>
    `;
    addCard.querySelector('.profile-action').addEventListener('click', () => {
      // For now, just show a notification (since profiles are static assets)
      alert('Adding new profiles via UI is not supported in this demo. Add JSON files to profiles/ and update manifest.json.');
    });
    cardsContainer.appendChild(addCard);
  }

  openBtn.addEventListener('click', () => {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    loadProfiles();
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  });

  // Optional: close modal when clicking outside modal window
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

/* --- Training Presets Modal Logic --- */
function setupTrainingModal() {
  const openBtn = document.getElementById('openTrainingModal');
  const modal = document.getElementById('trainingModal');
  const closeBtn = document.getElementById('closeTrainingModal');
  const cardsContainer = modal?.querySelector('.training-cards');

  if (!openBtn || !modal || !closeBtn || !cardsContainer) return;

  // Fetch and render training presets from GitHub
  async function loadTrainingPresets() {
    try {
      const manifestUrl = 'https://raw.githubusercontent.com/fr4iser90/YouTube-Algorithm-Manager/main/training-presets/profiles/manifest.json';
      const manifestRes = await fetch(manifestUrl, { cache: "no-store" });
      const manifest = await manifestRes.json();
      const presetPromises = manifest.map(async (meta) => {
        const presetRes = await fetch('https://raw.githubusercontent.com/fr4iser90/YouTube-Algorithm-Manager/main/' + meta.path, { cache: "no-store" });
        const preset = await presetRes.json();
        return { ...meta, ...preset };
      });
      const presets = await Promise.all(presetPromises);

      cardsContainer.innerHTML = '';
      presets.forEach(preset => {
        const card = document.createElement('div');
        card.className = 'profile-card';
        card.innerHTML = `
          <div class="profile-avatar">🎯</div>
          <div class="profile-info">
            <div class="profile-name">${preset.name}</div>
            <div class="profile-desc">${preset.description || preset.desc || ''}</div>
          </div>
          <button class="profile-action primary">Start Training</button>
        `;
        card.querySelector('.profile-action').addEventListener('click', () => {
          // Start training with this preset (send message to background or content script)
          chrome.runtime.sendMessage({ type: 'START_TRAINING', preset });
          modal.classList.remove('active');
          document.body.style.overflow = '';
        });
        cardsContainer.appendChild(card);
      });
    } catch (e) {
      cardsContainer.innerHTML = '<div style="color:#f87171;">Failed to load training presets from GitHub.</div>';
    }
  }

  openBtn.addEventListener('click', () => {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    loadTrainingPresets();
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
  setupProfilesModal();
  setupTrainingModal();
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
