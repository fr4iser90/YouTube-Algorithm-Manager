// YouTube Algorithm Trainer Content Script
console.log('🎯 YouTube Algorithm Trainer content script starting...');

class YouTubeAlgorithmTrainer {
  constructor() {
    this.isTraining = false;
    this.currentPreset = null;
    this.progress = 0;
    this.startTime = null;
    this.videosWatched = 0;
    this.searchesPerformed = 0;
    this.recommendations = [];
    this.watchedVideoIds = [];
    
    // Initialize immediately
    this.init();
  }

  async init() {
    console.log('🎯 YouTube Algorithm Trainer initializing...');
    
    // Wait for page to be ready
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }
    
    this.setupMessageListeners();

    // Bind helper functions to this context
    this.sendProgress = sendProgress.bind(this);
    this.sendError = sendError.bind(this);
    this.watchVideo = watchVideo.bind(this);
    this.likeVideo = likeVideo.bind(this);
    this.subscribeToChannel = subscribeToChannel.bind(this);
    
    // Send "I'm alive" signal every 3 seconds to web app
    setInterval(() => {
      this.sendAliveSignal();
    }, 3000);

    // Füge "Training jetzt starten"-Button ein, wenn kein Training läuft und kein Befehl gefunden wird
    setTimeout(() => {
      if (!this.isTraining) {
        // Prüfe, ob ein Button schon existiert
        if (!document.getElementById('yt-trainer-manual-start-btn')) {
          const btn = document.createElement('button');
          btn.id = 'yt-trainer-manual-start-btn';
          btn.textContent = 'Training jetzt starten';
          btn.style.position = 'fixed';
          btn.style.bottom = '24px';
          btn.style.right = '24px';
          btn.style.zIndex = '99999';
          btn.style.padding = '14px 22px';
          btn.style.background = '#2563eb';
          btn.style.color = '#fff';
          btn.style.fontSize = '18px';
          btn.style.border = 'none';
          btn.style.borderRadius = '8px';
          btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
          btn.style.cursor = 'pointer';
          btn.style.opacity = '0.95';
          btn.style.transition = 'opacity 0.2s';
          btn.onmouseenter = () => btn.style.opacity = '1';
          btn.onmouseleave = () => btn.style.opacity = '0.95';

          btn.onclick = async () => {
            // Lade Preset-Liste von GitHub
            let manifestUrl = 'https://raw.githubusercontent.com/fr4iser90/YouTube-Algorithm-Manager/main/training-presets/manifest.json';
            let manifest;
            try {
              const res = await fetch(manifestUrl, { cache: "no-store" });
              manifest = await res.json();
            } catch (e) {
              alert('Konnte Preset-Liste nicht laden. Füge ein Preset als JSON ein.');
              manifest = [];
            }

            let presetList = [];
            if (Array.isArray(manifest)) {
              // Lade alle Presets
              for (let meta of manifest) {
                try {
                  const res = await fetch('https://raw.githubusercontent.com/fr4iser90/YouTube-Algorithm-Manager/main/' + meta.path, { cache: "no-store" });
                  const preset = await res.json();
                  presetList.push({ name: preset.name, data: preset });
                } catch (e) {
                  // skip
                }
              }
            }

            let preset;
            if (presetList.length > 0) {
              // Auswahl anzeigen
              let names = presetList.map((p, i) => `${i + 1}: ${p.name}`).join('\n');
              let idx = prompt('Preset auswählen (Nummer eingeben):\n' + names + '\nOder leer lassen für Demo-Preset.');
              let n = parseInt(idx);
              if (!isNaN(n) && n > 0 && n <= presetList.length) {
                preset = presetList[n - 1].data;
              }
            }

            if (!preset) {
              // Fallback: Prompt für JSON
              let presetJson = prompt('Preset als JSON einfügen (oder leer lassen für Demo-Preset):');
              if (presetJson && presetJson.trim().length > 0) {
                try {
                  preset = JSON.parse(presetJson);
                } catch (e) {
                  alert('Ungültiges JSON!');
                  return;
                }
              } else {
                // Demo-Preset
                preset = {
                  name: "Demo Training",
                  searches: [
                    { query: "KI Tutorial", frequency: 2, duration: 60 },
                    { query: "Machine Learning Grundlagen", frequency: 2, duration: 60 }
                  ],
                  targetKeywords: ["KI", "Machine Learning"],
                  avoidKeywords: [],
                  trainingDuration: 10,
                  advancedOptions: {}
                };
              }
            }
            this.startTraining(preset);
            btn.remove();
          };

          document.body.appendChild(btn);
        }
      }
    }, 2000);

    console.log('✅ YouTube Algorithm Trainer initialized successfully!');
  }

  sendAliveSignal() {
    try {
      const aliveData = {
        isInstalled: true,
        isConnected: true,
        version: '1.0.0',
        isTraining: this.isTraining,
        currentPreset: this.currentPreset?.name || null,
        timestamp: Date.now(),
        domain: 'youtube.com',
        url: window.location.href,
        videosWatched: this.videosWatched,
        searchesPerformed: this.searchesPerformed
      };
      
      // WICHTIG: Sende auch an alle offenen Tabs der Web-App
      // Das funktioniert über BroadcastChannel API
      try {
        chrome.runtime.sendMessage({
          type: 'STATUS_UPDATE',
          ...aliveData
        });
      } catch (broadcastError) {
        // BroadcastChannel nicht unterstützt, egal
      }
      
      console.log('📡 Alive signal sent:', aliveData);
      
    } catch (error) {
      console.error('❌ Error sending alive signal:', error);
    }
  }

  setupMessageListeners() {
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'START_TRAINING') {
        console.log('🚀 Received start command from background script');
        this.startTraining(message.preset);
        sendResponse({ success: true });
      }
      if (message.type === 'STOP_TRAINING') {
        console.log('⏹️ Received stop command from background script');
        this.stopTraining();
        sendResponse({ success: true });
      }
    });
  }

  checkForSavedCommands() {
    try {
      const savedCommand = localStorage.getItem('yt-trainer-command');
      console.log('[DEBUG] checkForSavedCommands: savedCommand =', savedCommand);
      if (savedCommand && !this.isTraining) {
        const command = JSON.parse(savedCommand);
        console.log('[DEBUG] Parsed command:', command);
        if (command.type === 'START_TRAINING' && command.preset) {
          // Check if command is recent (within 30 seconds)
          const age = Date.now() - command.timestamp;
          console.log('[DEBUG] Command age (ms):', age);
          if (age < 30000) {
            console.log('🔄 Found saved training command, starting...');
            this.startTraining(command.preset);
            localStorage.removeItem('yt-trainer-command');
          } else {
            console.log('[DEBUG] Command too old, ignoring.');
          }
        } else {
          console.log('[DEBUG] Command type or preset missing/invalid.');
        }
      } else {
        if (this.isTraining) {
          console.log('[DEBUG] Already training, skipping command.');
        } else {
          console.log('[DEBUG] No savedCommand found.');
        }
      }
    } catch (error) {
      console.error('❌ Error checking saved commands:', error);
    }
  }

  async startTraining(preset) {
    if (this.isTraining) {
      console.log('⚠️ Training already in progress');
      return;
    }

    try {
      this.isTraining = true;
      this.currentPreset = preset;
      this.progress = 0;
      this.startTime = Date.now();
      this.videosWatched = 0;
      this.searchesPerformed = 0;
      this.recommendations = [];
      this.watchedVideoIds = [];
      
      console.log('🚀 Starting YouTube Algorithm Training with preset:', preset.name);
      
      // Update status immediately
      this.sendAliveSignal();
      
      // Notify web app that training started
      this.sendProgress(5, 'Training started...');
      
      // Step 1: Navigiere IMMER zu https://www.youtube.com und warte auf Suchfeld
      if (!window.location.href.startsWith('https://www.youtube.com')) {
        this.sendProgress(10, 'Navigating to YouTube...');
        window.location.href = 'https://www.youtube.com';
        return; // Will restart when page loads
      }
      // Warte auf Suchfeld (wird jetzt in performSearch gemacht)
      this.sendProgress(12, 'Warte auf Suchfeld...');

      // Step 2: Clear history if requested
      if (preset.advancedOptions?.clearHistoryFirst) {
        this.sendProgress(15, 'Clearing browsing data...');
        await new Promise(resolve => {
          chrome.runtime.sendMessage({ type: 'CLEAR_HISTORY' }, () => {
            resolve();
          });
        });
        await delay(2000);
      }
      
      // Step 3: Perform searches and watch videos
      const searches = preset.searches || [];
      const totalSteps = searches.length;
      
      for (let i = 0; i < totalSteps; i++) {
        if (!this.isTraining) break;
        
        const search = searches[i];
        const stepProgress = 20 + (i / totalSteps) * 60;
        
        try {
          await performSearch.call(this, search.query);
          this.sendProgress(stepProgress, `Searching: "${search.query}"`);
          
          await watchRecommendedVideos.call(this, search.frequency || 2, search.duration || 60);
          this.sendProgress(stepProgress + 10, `Watching videos for: "${search.query}"`);
          
          await humanDelay();
          
        } catch (error) {
          console.error(`❌ Error in training step ${i + 1}:`, error);
          // Continue with next step
        }
      }
      
      // Step 4: Extract final recommendations
      this.sendProgress(90, 'Analyzing recommendations...');
      const finalRecommendations = await extractRecommendations.call(this);
      
      // Step 5: Complete
      this.sendProgress(100, 'Training completed!');
      
      const results = {
        preset: preset.name,
        duration: Date.now() - this.startTime,
        videosWatched: this.videosWatched,
        searchesPerformed: this.searchesPerformed,
        recommendations: finalRecommendations,
        bubbleScore: calculateBubbleScore(finalRecommendations, preset.targetKeywords || []),
        language: preset.language || 'en',
        region: preset.region || 'US',
        categories: generateCategories(finalRecommendations)
      };
      
      sendResults(results);
      
      console.log('✅ Training completed successfully!', results);
      
    } catch (error) {
      console.error('❌ Training failed:', error);
      this.sendError(error.message);
    } finally {
      this.isTraining = false;
      this.sendAliveSignal(); // Update status
    }
  }

  stopTraining() {
    this.isTraining = false;
    this.sendAliveSignal(); // Update status
    console.log('⏹️ Training stopped');
    
    window.postMessage({ type: 'YT_TRAINER_STOPPED' }, '*');
    
    try {
      const channel = new BroadcastChannel('yt-trainer-channel');
      channel.postMessage({
        type: 'TRAINING_STOPPED'
      });
    } catch (error) {
      // BroadcastChannel not supported
    }
  }
}

// Initialize trainer when script loads
try {
  const trainer = new YouTubeAlgorithmTrainer();
  console.log('🎯 YouTube Algorithm Trainer content script loaded successfully!');
} catch (error) {
  console.error('❌ Error initializing trainer:', error);
}
