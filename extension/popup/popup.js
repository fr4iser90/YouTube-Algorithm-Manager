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
        this.showNotification(`Last training: ${storage.lastTrainingResults.profileScore}% profile score`, 'success');
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
      const webAppUrl = 'webapp/index.html';
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

  // Edit Preset (local or GitHub)
  editBtn.addEventListener('click', async () => {
    const allPresets = JSON.parse(dropdown.dataset.presets || '[]');
    const selectedIdx = dropdown.selectedIndex;
    let selectedPreset = allPresets[selectedIdx];
    if (!selectedPreset) return;

    // If GitHub preset, clone to local first
    if (selectedPreset.source === 'github') {
      selectedPreset = await clonePresetToLocal(selectedPreset);
      // Refresh dropdown and select new local preset
      await loadPresetsDropdown();
      const allPresetsNew = JSON.parse(dropdown.dataset.presets || '[]');
      const newIdx = allPresetsNew.findIndex(p => p.id === selectedPreset.id);
      dropdown.selectedIndex = newIdx;
    }

    openPresetEditorModal(selectedPreset);
  });

  // Clone a GitHub preset to local storage
  async function clonePresetToLocal(preset) {
    const storage = await chrome.storage.local.get(['userPresets']);
    let userPresets = storage.userPresets || [];
    const newPreset = {
      ...preset,
      id: 'local-' + Date.now(),
      source: 'local'
    };
    userPresets.push(newPreset);
    await chrome.storage.local.set({ userPresets });
    return newPreset;
  }

  // Modal logic
  function openPresetEditorModal(preset) {
    let modal = document.getElementById('presetEditorModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'presetEditorModal';
      modal.className = 'modal-overlay active';
      modal.innerHTML = `
        <div class="modal-window" style="max-width: 98vw; width: 340px;">
          <div class="modal-header">
            <span class="modal-title">${preset ? 'Edit Preset' : 'Create Preset'}</span>
            <button class="modal-close" id="closePresetEditorBtn">&times;</button>
          </div>
          <div class="modal-content" id="presetEditorTabs">
            <div style="display:flex;gap:8px;margin-bottom:16px;">
              <button class="preset-tab-btn" data-tab="basic" style="flex:1;" autofocus>Basic</button>
              <button class="preset-tab-btn" data-tab="keywords" style="flex:1;">Keywords</button>
              <button class="preset-tab-btn" data-tab="searches" style="flex:1;">Searches</button>
              <button class="preset-tab-btn" data-tab="channels" style="flex:1;">Channels</button>
              <button class="preset-tab-btn" data-tab="advanced" style="flex:1;">Advanced</button>
            </div>
            <form id="presetEditorForm">
              <div class="preset-tab-content" data-tab="basic">
                <label style="display:block;font-weight:600;margin-bottom:4px;">Preset Name *</label>
                <input type="text" name="name" value="${preset.name || ''}" required style="width:100%;padding:8px;border-radius:6px;margin-bottom:10px;" />
                <label style="display:block;font-weight:600;margin-bottom:4px;">Description</label>
                <textarea name="description" rows="2" style="width:100%;padding:8px;border-radius:6px;margin-bottom:10px;">${preset.description || ''}</textarea>
                <label style="display:block;font-weight:600;margin-bottom:4px;">Category</label>
                <select name="category" style="width:100%;padding:8px;border-radius:6px;margin-bottom:10px;">
                  <option value="tech" ${preset.category === 'tech' ? 'selected' : ''}>Tech</option>
                  <option value="science" ${preset.category === 'science' ? 'selected' : ''}>Science</option>
                  <option value="politics" ${preset.category === 'politics' ? 'selected' : ''}>Politics</option>
                  <option value="music" ${preset.category === 'music' ? 'selected' : ''}>Music</option>
                  <option value="lifestyle" ${preset.category === 'lifestyle' ? 'selected' : ''}>Lifestyle</option>
                  <option value="custom" ${!preset.category || preset.category === 'custom' ? 'selected' : ''}>Custom</option>
                </select>
                <label style="display:block;font-weight:600;margin-bottom:4px;">Language</label>
                <select name="language" style="width:100%;padding:8px;border-radius:6px;margin-bottom:10px;">
                  <option value="en" ${preset.language === 'en' ? 'selected' : ''}>English</option>
                  <option value="de" ${preset.language === 'de' ? 'selected' : ''}>Deutsch</option>
                  <option value="es" ${preset.language === 'es' ? 'selected' : ''}>Español</option>
                  <option value="fr" ${preset.language === 'fr' ? 'selected' : ''}>Français</option>
                  <option value="ja" ${preset.language === 'ja' ? 'selected' : ''}>日本語</option>
                  <option value="zh" ${preset.language === 'zh' ? 'selected' : ''}>中文</option>
                  <option value="ru" ${preset.language === 'ru' ? 'selected' : ''}>Русский</option>
                  <option value="pt" ${preset.language === 'pt' ? 'selected' : ''}>Português</option>
                  <option value="it" ${preset.language === 'it' ? 'selected' : ''}>Italiano</option>
                  <option value="ko" ${preset.language === 'ko' ? 'selected' : ''}>한국어</option>
                </select>
                <label style="display:block;font-weight:600;margin-bottom:4px;">Region</label>
                <select name="region" style="width:100%;padding:8px;border-radius:6px;margin-bottom:10px;">
                  <option value="US" ${preset.region === 'US' ? 'selected' : ''}>United States</option>
                  <option value="DE" ${preset.region === 'DE' ? 'selected' : ''}>Germany</option>
                  <option value="ES" ${preset.region === 'ES' ? 'selected' : ''}>Spain</option>
                  <option value="FR" ${preset.region === 'FR' ? 'selected' : ''}>France</option>
                  <option value="JP" ${preset.region === 'JP' ? 'selected' : ''}>Japan</option>
                  <option value="CN" ${preset.region === 'CN' ? 'selected' : ''}>China</option>
                  <option value="RU" ${preset.region === 'RU' ? 'selected' : ''}>Russia</option>
                  <option value="BR" ${preset.region === 'BR' ? 'selected' : ''}>Brazil</option>
                  <option value="IT" ${preset.region === 'IT' ? 'selected' : ''}>Italy</option>
                  <option value="KR" ${preset.region === 'KR' ? 'selected' : ''}>South Korea</option>
                  <option value="GB" ${preset.region === 'GB' ? 'selected' : ''}>United Kingdom</option>
                  <option value="CA" ${preset.region === 'CA' ? 'selected' : ''}>Canada</option>
                  <option value="AU" ${preset.region === 'AU' ? 'selected' : ''}>Australia</option>
                </select>
                <label style="display:block;font-weight:600;margin-bottom:4px;">Training Duration (minutes)</label>
                <input type="number" name="trainingDuration" min="10" max="180" value="${preset.trainingDuration || 45}" style="width:100%;padding:8px;border-radius:6px;margin-bottom:10px;" />
                <label style="display:block;font-weight:600;margin-bottom:4px;">Color</label>
                <input type="color" name="color" value="${preset.color || '#3B82F6'}" style="width:100%;height:36px;padding:0;border-radius:6px;margin-bottom:10px;" />
              </div>
              <!-- Keywords Tab -->
              <div class="preset-tab-content" data-tab="keywords" style="display:none;">
                <label style="display:block;font-weight:600;margin-bottom:4px;">Target Keywords</label>
                <div id="targetKeywordsList" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;">
                  ${(preset.targetKeywords || []).map(k => `
                    <span class="keyword-chip" style="background:#10B98122;color:#10B981;padding:3px 8px;border-radius:8px;display:inline-flex;align-items:center;gap:4px;">
                      ${k}
                      <button type="button" class="remove-keyword-btn" data-keyword="${k}" data-type="target" style="background:none;border:none;color:#10B981;cursor:pointer;font-size:14px;">&times;</button>
                    </span>
                  `).join('')}
                </div>
                <div style="display:flex;gap:6px;margin-bottom:12px;">
                  <input type="text" id="addTargetKeywordInput" placeholder="Add target keyword..." style="flex:1;padding:6px;border-radius:6px;" />
                  <button type="button" id="addTargetKeywordBtn" class="button success" style="padding:6px 12px;">Add</button>
                </div>
                <label style="display:block;font-weight:600;margin-bottom:4px;">Avoid Keywords</label>
                <div id="avoidKeywordsList" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;">
                  ${(preset.avoidKeywords || []).map(k => `
                    <span class="keyword-chip" style="background:#EF444422;color:#EF4444;padding:3px 8px;border-radius:8px;display:inline-flex;align-items:center;gap:4px;">
                      ${k}
                      <button type="button" class="remove-keyword-btn" data-keyword="${k}" data-type="avoid" style="background:none;border:none;color:#EF4444;cursor:pointer;font-size:14px;">&times;</button>
                    </span>
                  `).join('')}
                </div>
                <div style="display:flex;gap:6px;">
                  <input type="text" id="addAvoidKeywordInput" placeholder="Add avoid keyword..." style="flex:1;padding:6px;border-radius:6px;" />
                  <button type="button" id="addAvoidKeywordBtn" class="button danger" style="padding:6px 12px;">Add</button>
                </div>
              </div>
              <!-- Searches Tab -->
              <div class="preset-tab-content" data-tab="searches" style="display:none;">
                <label style="display:block;font-weight:600;margin-bottom:4px;">Search Patterns</label>
                <div id="searchesList" style="margin-bottom:10px;">
                  ${(preset.searches || []).map((s, i) => `
                    <div class="search-item" data-index="${i}" style="background:#222;padding:6px 8px;border-radius:8px;margin-bottom:6px;display:flex;align-items:center;gap:8px;">
                      <span style="flex:1;">${s.query} <span style="color:#9CA3AF;font-size:11px;">(${s.frequency}×, ${s.duration}s, ${s.language || ''}/${s.region || ''})</span></span>
                      <button type="button" class="remove-search-btn" data-index="${i}" style="background:none;border:none;color:#EF4444;cursor:pointer;font-size:16px;">&times;</button>
                    </div>
                  `).join('')}
                </div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                  <input type="text" id="addSearchQueryInput" placeholder="Search query..." style="flex:2;padding:6px;border-radius:6px;" />
                  <input type="number" id="addSearchFreqInput" min="1" max="10" value="3" style="width:50px;padding:6px;border-radius:6px;" placeholder="Freq" />
                  <input type="number" id="addSearchDurInput" min="30" max="300" value="90" style="width:60px;padding:6px;border-radius:6px;" placeholder="Sec" />
                  <button type="button" id="addSearchBtn" class="button success" style="padding:6px 12px;">Add</button>
                </div>
              </div>
              <!-- Channels Tab -->
              <div class="preset-tab-content" data-tab="channels" style="display:none;">
                <label style="display:block;font-weight:600;margin-bottom:4px;">Channel Preferences</label>
                <div id="channelsList" style="margin-bottom:10px;">
                  ${(preset.channelPreferences || []).map((c, i) => `
                    <div class="channel-item" data-index="${i}" style="background:#222;padding:6px 8px;border-radius:8px;margin-bottom:6px;display:flex;align-items:center;gap:8px;">
                      <span style="flex:1;">${c.channelName} <span style="color:#9CA3AF;font-size:11px;">[${c.action}]</span></span>
                      <button type="button" class="remove-channel-btn" data-index="${i}" style="background:none;border:none;color:#EF4444;cursor:pointer;font-size:16px;">&times;</button>
                    </div>
                  `).join('')}
                </div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                  <input type="text" id="addChannelNameInput" placeholder="Channel name..." style="flex:2;padding:6px;border-radius:6px;" />
                  <select id="addChannelActionInput" style="flex:1;padding:6px;border-radius:6px;">
                    <option value="prioritize">Prioritize</option>
                    <option value="subscribe">Subscribe</option>
                    <option value="avoid">Avoid</option>
                    <option value="block">Block</option>
                  </select>
                  <button type="button" id="addChannelBtn" class="button success" style="padding:6px 12px;">Add</button>
                </div>
              </div>
              <!-- Advanced Tab -->
              <div class="preset-tab-content" data-tab="advanced" style="display:none;">
                <label style="display:block;font-weight:600;margin-bottom:8px;">Advanced Options</label>
                <div style="display:flex;flex-direction:column;gap:10px;">
                  <label style="display:flex;align-items:center;gap:8px;">
                    <input type="checkbox" id="advSkipAds" ${preset.advancedOptions?.skipAds ? "checked" : ""} />
                    Skip Ads
                  </label>
                  <label style="display:block;font-weight:600;margin-top:10px;">Engagement Rate: <span id="advEngagementVal">${Math.round((preset.advancedOptions?.engagementRate ?? 0.7) * 100)}%</span></label>
                  <input type="range" id="advEngagement" min="0" max="1" step="0.05" value="${preset.advancedOptions?.engagementRate ?? 0.7}" style="width:100%;" />
                  <div style="display:flex;justify-content:space-between;font-size:11px;color:#9CA3AF;">
                    <span>Passive</span>
                    <span>Active</span>
                  </div>
                </div>
              </div>
              <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:18px;">
                <button type="button" class="button secondary" id="cancelPresetEditorBtn">Cancel</button>
                <button type="submit" class="button primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // Tab logic
      const tabBtns = modal.querySelectorAll('.preset-tab-btn');
      const tabContents = modal.querySelectorAll('.preset-tab-content');
      tabBtns.forEach(btn => {
        btn.onclick = () => {
          tabBtns.forEach(b => b.classList.remove('primary'));
          btn.classList.add('primary');
          tabContents.forEach(tc => {
            tc.style.display = tc.getAttribute('data-tab') === btn.getAttribute('data-tab') ? 'block' : 'none';
          });
        };
      });
      // Show only the first tab by default
      tabBtns[0].classList.add('primary');
      tabContents.forEach((tc, i) => tc.style.display = i === 0 ? 'block' : 'none');

      // Close logic
      document.getElementById('closePresetEditorBtn').onclick = () => {
        modal.remove();
      };
      document.getElementById('cancelPresetEditorBtn').onclick = () => {
        modal.remove();
      };

      // --- Keywords tab logic ---
      let targetKeywords = Array.isArray(preset.targetKeywords) ? [...preset.targetKeywords] : [];
      let avoidKeywords = Array.isArray(preset.avoidKeywords) ? [...preset.avoidKeywords] : [];
      let searches = Array.isArray(preset.searches) ? [...preset.searches] : [];
      let channelPreferences = Array.isArray(preset.channelPreferences) ? [...preset.channelPreferences] : [];

      function renderKeywords() {
        // Target
        const targetList = modal.querySelector('#targetKeywordsList');
        targetList.innerHTML = targetKeywords.map(k => `
          <span class="keyword-chip" style="background:#10B98122;color:#10B981;padding:3px 8px;border-radius:8px;display:inline-flex;align-items:center;gap:4px;">
            ${k}
            <button type="button" class="remove-keyword-btn" data-keyword="${k}" data-type="target" style="background:none;border:none;color:#10B981;cursor:pointer;font-size:14px;">&times;</button>
          </span>
        `).join('');
        // Avoid
        const avoidList = modal.querySelector('#avoidKeywordsList');
        avoidList.innerHTML = avoidKeywords.map(k => `
          <span class="keyword-chip" style="background:#EF444422;color:#EF4444;padding:3px 8px;border-radius:8px;display:inline-flex;align-items:center;gap:4px;">
            ${k}
            <button type="button" class="remove-keyword-btn" data-keyword="${k}" data-type="avoid" style="background:none;border:none;color:#EF4444;cursor:pointer;font-size:14px;">&times;</button>
          </span>
        `).join('');
      }
      renderKeywords();

      modal.querySelector('#addTargetKeywordBtn').onclick = () => {
        const input = modal.querySelector('#addTargetKeywordInput');
        const val = input.value.trim();
        if (val && !targetKeywords.includes(val)) {
          targetKeywords.push(val);
          input.value = '';
          renderKeywords();
        }
      };
      modal.querySelector('#addAvoidKeywordBtn').onclick = () => {
        const input = modal.querySelector('#addAvoidKeywordInput');
        const val = input.value.trim();
        if (val && !avoidKeywords.includes(val)) {
          avoidKeywords.push(val);
          input.value = '';
          renderKeywords();
        }
      };
      modal.querySelector('#targetKeywordsList').onclick = (e) => {
        if (e.target.classList.contains('remove-keyword-btn')) {
          const k = e.target.getAttribute('data-keyword');
          targetKeywords = targetKeywords.filter(x => x !== k);
          renderKeywords();
        }
      };
      modal.querySelector('#avoidKeywordsList').onclick = (e) => {
        if (e.target.classList.contains('remove-keyword-btn')) {
          const k = e.target.getAttribute('data-keyword');
          avoidKeywords = avoidKeywords.filter(x => x !== k);
          renderKeywords();
        }
      };

      // --- Searches tab logic ---
      function renderSearches() {
        const searchesList = modal.querySelector('#searchesList');
        searchesList.innerHTML = searches.map((s, i) => `
          <div class="search-item" data-index="${i}" style="background:#222;padding:6px 8px;border-radius:8px;margin-bottom:6px;display:flex;align-items:center;gap:8px;">
            <span style="flex:1;">${s.query} <span style="color:#9CA3AF;font-size:11px;">(${s.frequency}×, ${s.duration}s, ${s.language || ''}/${s.region || ''})</span></span>
            <button type="button" class="remove-search-btn" data-index="${i}" style="background:none;border:none;color:#EF4444;cursor:pointer;font-size:16px;">&times;</button>
          </div>
        `).join('');
      }
      renderSearches();

      modal.querySelector('#addSearchBtn').onclick = () => {
        const queryInput = modal.querySelector('#addSearchQueryInput');
        const freqInput = modal.querySelector('#addSearchFreqInput');
        const durInput = modal.querySelector('#addSearchDurInput');
        const query = queryInput.value.trim();
        const frequency = parseInt(freqInput.value) || 3;
        const duration = parseInt(durInput.value) || 90;
        if (query) {
          searches.push({
            query,
            frequency,
            duration,
            language: modal.querySelector('select[name="language"]').value,
            region: modal.querySelector('select[name="region"]').value
          });
          queryInput.value = '';
          renderSearches();
        }
      };
      modal.querySelector('#searchesList').onclick = (e) => {
        if (e.target.classList.contains('remove-search-btn')) {
          const idx = parseInt(e.target.getAttribute('data-index'));
          searches.splice(idx, 1);
          renderSearches();
        }
      };

      // --- Channels tab logic ---
      function renderChannels() {
        const channelsList = modal.querySelector('#channelsList');
        channelsList.innerHTML = channelPreferences.map((c, i) => `
          <div class="channel-item" data-index="${i}" style="background:#222;padding:6px 8px;border-radius:8px;margin-bottom:6px;display:flex;align-items:center;gap:8px;">
            <span style="flex:1;">${c.channelName} <span style="color:#9CA3AF;font-size:11px;">[${c.action}]</span></span>
            <button type="button" class="remove-channel-btn" data-index="${i}" style="background:none;border:none;color:#EF4444;cursor:pointer;font-size:16px;">&times;</button>
          </div>
        `).join('');
      }
      renderChannels();

      modal.querySelector('#addChannelBtn').onclick = () => {
        const nameInput = modal.querySelector('#addChannelNameInput');
        const actionInput = modal.querySelector('#addChannelActionInput');
        const name = nameInput.value.trim();
        const action = actionInput.value;
        if (name) {
          channelPreferences.push({
            channelId: 'channel_' + Date.now(),
            channelName: name,
            action,
            reason: ''
          });
          nameInput.value = '';
          renderChannels();
        }
      };
      modal.querySelector('#channelsList').onclick = (e) => {
        if (e.target.classList.contains('remove-channel-btn')) {
          const idx = parseInt(e.target.getAttribute('data-index'));
          channelPreferences.splice(idx, 1);
          renderChannels();
        }
      };

      // --- Advanced tab logic ---
      const advEngagement = modal.querySelector('#advEngagement');
      const advEngagementVal = modal.querySelector('#advEngagementVal');
      if (advEngagement && advEngagementVal) {
        advEngagement.oninput = () => {
          advEngagementVal.textContent = Math.round(parseFloat(advEngagement.value) * 100) + "%";
        };
      }

      // Save logic (all tabs)
      modal.querySelector('#presetEditorForm').onsubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const updatedPreset = {
          ...preset,
          name: form.name.value,
          description: form.description.value,
          category: form.category.value,
          language: form.language.value,
          region: form.region.value,
          trainingDuration: parseInt(form.trainingDuration.value),
          color: form.color.value,
          targetKeywords,
          avoidKeywords,
          searches,
          channelPreferences,
          advancedOptions: {
            skipAds: modal.querySelector('#advSkipAds').checked,
            engagementRate: parseFloat(modal.querySelector('#advEngagement').value)
          }
        };
        // Save to local storage
        const storage = await chrome.storage.local.get(['userPresets']);
        let userPresets = storage.userPresets || [];
        const idx = userPresets.findIndex(p => p.id === updatedPreset.id);
        if (idx !== -1) {
          userPresets[idx] = updatedPreset;
        } else {
          userPresets.push(updatedPreset);
        }
        await chrome.storage.local.set({ userPresets });
        modal.remove();
        // Optionally, refresh dropdown
        if (typeof loadPresetsDropdown === 'function') loadPresetsDropdown();
      };
    }
  }

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
      popup.showNotification(`Training completed! Profile score: ${message.results.profileScore}%`, 'success');
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
