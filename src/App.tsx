import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { PresetCard } from './components/PresetCard';
import { PresetEditor } from './components/PresetEditor';
import { TrainingProgress } from './components/TrainingProgress';
import { AlgorithmAnalysis } from './components/AlgorithmAnalysis';
import { BrowserController } from './components/BrowserController';
import { YouTubeAutomation } from './components/YouTubeAutomation';
import { RealTimeAnalytics } from './components/RealTimeAnalytics';
import { AnonymousMode } from './components/AnonymousMode';
import { MLAnalytics } from './components/MLAnalytics';
import { PreTrainingAnalysis } from './components/PreTrainingAnalysis';
import { ExtensionBridge, ExtensionBridgeHandle } from './components/ExtensionBridge';
import { useLocalStorage, dateReviver } from './hooks/useLocalStorage';
/* Dynamically load presets from GitHub manifest */
import { TrainingPreset, AlgorithmState, BrowserProfile } from './types';
import { Plus, Filter, Search, Settings as SettingsIcon, Brain, Shield, Chrome } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfileController } from './components/ProfileController';
import { ProfileManager } from './components/ProfileManager';
import { AlgorithmController } from './components/AlgorithmController';
import { TrainingController } from './components/TrainingController';
import { BrowserSettings } from './components/BrowserSettings';
import { SecurityMonitor } from './components/SecurityMonitor';
import { ProfileCreationModal } from './components/ProfileCreationModal';

function App() {
  const [presets, setPresets, presetsLoading] = useLocalStorage<TrainingPreset[]>('youtube-presets', []);
  const [savedProfiles, setSavedProfiles] = useState<BrowserProfile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [algorithmHistory, setAlgorithmHistory, historyLoading] = useLocalStorage<AlgorithmState[]>('algorithm-history', []);
  const [browserSettings, setBrowserSettings, settingsLoading] = useLocalStorage<any>('browser-settings', {});
  const [currentProfile, setCurrentProfile] = useState<BrowserProfile | null>(null);
  const [currentAlgorithmState, setCurrentAlgorithmState] = useState<AlgorithmState | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<TrainingPreset | undefined>(undefined);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [anonymousConfig, setAnonymousConfig] = useState<any>({});
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [activeProfileId, setactiveProfileId] = useState<string | null>(null);
  const [extensionTrainingActive, setExtensionTrainingActive] = useState(false);
  const extensionBridgeRef = useRef<ExtensionBridgeHandle>(null);
  const [showProfileCreate, setShowProfileCreate] = useState(false);
  const [pendingTrainingPreset, setPendingTrainingPreset] = useState<TrainingPreset | null>(null);

  const loadProfiles = useCallback(async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_PROFILES' });
      console.log('📦 Profiles received from background:', response);
      if (response.success) {
        setSavedProfiles(response.profiles);
      }
    } catch (error) {
      console.error('Failed to fetch profiles:', error);
    } finally {
      setProfilesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
    window.addEventListener('profiles-updated', loadProfiles);
    return () => {
      window.removeEventListener('profiles-updated', loadProfiles);
    };
  }, [loadProfiles]);

  // Initialize with template presets from GitHub if none exist
  useEffect(() => {
    if (presets.length === 0) {
      const fetchPresets = async () => {
        try {
          const manifestUrl = 'https://raw.githubusercontent.com/fr4iser90/YouTube-Algorithm-Manager/main/training-presets/manifest.json';
          const manifestRes = await fetch(manifestUrl, { cache: "no-store" });
          const manifest = await manifestRes.json();
          const presetPromises = manifest.map(async (meta: any) => {
            const presetRes = await fetch('https://raw.githubusercontent.com/fr4iser90/YouTube-Algorithm-Manager/main/' + meta.path, { cache: "no-store" });
            const preset = await presetRes.json();
            return {
              ...preset,
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              createdAt: new Date()
            };
          });
          const initialPresets = await Promise.all(presetPromises);
          setPresets(initialPresets);
        } catch (e) {
          console.error('Failed to fetch presets from GitHub:', e);
        }
      };
      fetchPresets();
    }
  }, [presets.length, setPresets]);

  // Auto-load last active profile on startup
  useEffect(() => {
    if (profilesLoading) return; // Wait for profiles to load

    const autoLoadProfile = () => {
      try {
        if (savedProfiles) {
          const activeProfile = savedProfiles.find((s: any) => s.isActive);
          
          if (activeProfile && browserSettings.profileLoadStrategy === 'quick') {
            console.log('🚀 Auto-loading active profile:', activeProfile.name);
            loadProfileData(activeProfile);
          }
        }
      } catch (error) {
        console.error('Failed to auto-load profile:', error);
      }
    };

    // Auto-load after a short delay to ensure components are ready
    const timer = setTimeout(autoLoadProfile, 1000);
    return () => clearTimeout(timer);
  }, [browserSettings.profileLoadStrategy, savedProfiles, profilesLoading]);

  // Auto-backup profiles on change
  useEffect(() => {
    if (browserSettings.autoBackup && presets.length > 0) {
      console.log('Detected profile change, triggering auto-backup...');
      const dataStr = JSON.stringify(presets, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.download = `youtube-profiles-backup-${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, [presets, browserSettings.autoBackup]);

  const loadProfileData = (profile: BrowserProfile) => {
    try {
      // Set active profile
      setCurrentProfile(profile);
      
      // Load associated algorithm state if available
      const profileAlgorithmState = algorithmHistory.find(state => state.profileId === profile.id);
      setCurrentAlgorithmState(profileAlgorithmState);

      // Update last used timestamp
      const updatedProfile = {
        ...profile,
        lastUsed: new Date()
      };
      
      // Update saved profiles
      setSavedProfiles(prev => 
        prev.map(p => p.id === profile.id ? updatedProfile : p)
      );

      console.log('✅ Profile loaded:', profile.name);
    } catch (err) {
      console.error('❌ Failed to load profile:', err);
    }
  };

  // Initialize extension bridge
  useEffect(() => {
    // Listen for extension messages
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'YT_TRAINER_STATUS') {
        setExtensionTrainingActive(event.data.isTraining);
      } else if (event.data.type === 'PROFILE_UPDATED') {
        // Update profile in state
        setSavedProfiles(prev => 
          prev.map(p => p.id === event.data.profile.id ? event.data.profile : p)
        );
        // Also update current profile if it's the active one
        setCurrentProfile(prev => 
          prev?.id === event.data.profile.id ? event.data.profile : prev
        );
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleTrainPreset = async (preset: TrainingPreset) => {
    console.log('🎯 Starting training for preset:', preset.name);
    
    // Prüfen ob ein Profil aktiv ist
    const activeProfile = savedProfiles.find(p => p.isActive);
    
    if (!activeProfile) {
      console.log('👤 No active profile, opening creation modal');
      // Kein Profil aktiv -> Modal öffnen
      setPendingTrainingPreset(preset);
      setShowProfileCreate(true);
      return;
    }

    console.log('🚀 Starting training with profile:', activeProfile.name);
    // Profil aktiv -> Training starten
    if (extensionBridgeRef.current) {
      try {
        const success = await extensionBridgeRef.current.startTraining(preset);
        if (success) {
          console.log('✅ Training started successfully');
          setExtensionTrainingActive(true);
        } else {
          console.error('❌ Failed to start training');
        }
      } catch (err) {
        console.error('❌ Error starting training:', err);
      }
    } else {
      console.error('❌ Extension bridge not initialized');
    }
  };

  const handleProfileSave = async (profile: BrowserProfile) => {
    // Profil speichern
    const updatedProfiles = [...savedProfiles, profile];
    setSavedProfiles(updatedProfiles);
    setShowProfileCreate(false);

    // Wenn ein Training aussteht -> Starten
    if (pendingTrainingPreset) {
      if (extensionBridgeRef.current) {
        const success = await extensionBridgeRef.current.startTraining(pendingTrainingPreset);
        if (success) {
          setExtensionTrainingActive(true);
        }
      }
      setPendingTrainingPreset(null);
    }
  };

  const startExtensionTraining = async (preset: TrainingPreset): Promise<boolean> => {
    try {
      // Save preset for extension
      localStorage.setItem('yt-trainer-command', JSON.stringify({
        type: 'START_TRAINING',
        preset,
        timestamp: Date.now()
      }));

      // Send message to extension
      window.postMessage({
        type: 'YT_TRAINER_START',
        preset
      }, '*');

      // Try global extension object
      const globalExtension = (window as any).ytTrainerExtension;
      if (globalExtension && globalExtension.startTraining) {
        globalExtension.startTraining(preset);
      }

      console.log('🚀 Started extension training for preset:', preset.name);
      return true;

    } catch (error) {
      console.error('Failed to start extension training:', error);
      return false;
    }
  };

  const handleDeletePreset = (id: string) => {
    setPresets(prev => prev.filter(p => p.id !== id));
  };

  const handleDuplicatePreset = (preset: TrainingPreset) => {
    const duplicated: TrainingPreset = {
      ...preset,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: `${preset.name} (Copy)`,
      createdAt: new Date(),
      lastUsed: undefined
    };
    setPresets(prev => [...prev, duplicated]);
  };

  const handleEditPreset = (preset: TrainingPreset) => {
    setEditingPreset(preset);
    setIsEditorOpen(true);
  };

  const handleCreatePreset = () => {
    setEditingPreset(undefined);
    setIsEditorOpen(true);
  };

  const handleCreateProfile = () => {
    if (extensionBridgeRef.current) {
      extensionBridgeRef.current.openProfileManager();
    }
  };

  const handleSavePreset = (preset: TrainingPreset) => {
    if (editingPreset) {
      // Update existing preset
      setPresets(prev => prev.map(p => p.id === preset.id ? preset : p));
    } else {
      // Add new preset
      setPresets(prev => [...prev, preset]);
    }
  };

  const handleStopTraining = async () => {
    if (extensionBridgeRef.current) {
      await extensionBridgeRef.current.stopTraining();
      setExtensionTrainingActive(false);
    }
  };

  const handleLoadProfile = (profile: BrowserProfile) => {
    loadProfileData(profile);
  };

  const handleExtensionTrainingStart = (preset: TrainingPreset) => {
    setExtensionTrainingActive(true);
    console.log('🎯 Extension training started for:', preset.name);
  };

  const handleExtensionTrainingComplete = (results: any) => {
    setExtensionTrainingActive(false);
    
    // Convert extension results to algorithm state
    const algorithmState: AlgorithmState = {
      timestamp: new Date(),
      recommendations: results.recommendations || [],
      sentiment: 'positive',
      profileScore: results.profileScore || 0,
      language: results.language || 'en',
      region: results.region || 'US',
      blockedChannels: [],
      prioritizedChannels: []
    };

    setAlgorithmHistory(prev => [...prev, algorithmState]);
    setRecommendations(results.recommendations || []);
    
    console.log('✅ Extension training completed:', results);
  };

  const handleExtensionTrainingProgress = (progress: any) => {
    console.log('📊 Extension training progress:', progress);
  };

  const handleExport = () => {
    const data = {
      presets,
      savedProfiles,
      algorithmHistory,
      browserSettings,
      anonymousConfig,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'youtube-manager-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string, dateReviver);
            if (data.presets) setPresets(data.presets);
            if (data.savedProfiles) setSavedProfiles(data.savedProfiles);
            if (data.algorithmHistory) setAlgorithmHistory(data.algorithmHistory);
            if (data.browserSettings) setBrowserSettings(data.browserSettings);
            if (data.anonymousConfig) setAnonymousConfig(data.anonymousConfig);
          } catch (error) {
            alert('Invalid file format');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const filteredPresets = presets.filter(preset => {
    const matchesSearch = preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         preset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (preset.targetKeywords || []).some(keyword => 
                           keyword.toLowerCase().includes(searchQuery.toLowerCase())
                         );
    const matchesCategory = categoryFilter === 'all' || preset.category === categoryFilter;
    const matchesLanguage = languageFilter === 'all' || preset.language === languageFilter;
    return matchesSearch && matchesCategory && matchesLanguage;
  });

  const availableLanguages = Array.from(new Set(presets.map(p => p.language || 'en')));
  const currentPreset = currentProfile ? presets.find(p => p.id === currentProfile.presetId) : undefined;

  if (presetsLoading || historyLoading || settingsLoading || profilesLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header
        onExport={handleExport}
        onImport={handleImport}
        onSettings={() => setShowAdvancedSettings(!showAdvancedSettings)}
        currentPreset={currentPreset}
        currentAlgorithmState={currentAlgorithmState}
        onLoadProfile={handleLoadProfile}
        onCreateProfile={handleCreateProfile}
        savedProfiles={savedProfiles}
        setSavedProfiles={setSavedProfiles}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Active Profile Indicator */}
        {activeProfileId && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-900/20 border border-green-700 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <Chrome className="h-5 w-5 text-green-400" />
              <div>
                <h3 className="text-green-300 font-medium">Profile Active</h3>
                <p className="text-green-200 text-sm">
                  Profile loaded instantly with persistent cookies. Ready for training or browsing.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Extension Training Indicator */}
        {extensionTrainingActive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Chrome className="h-5 w-5 text-blue-400" />
                <div>
                  <h3 className="text-blue-300 font-medium">Extension Training Active</h3>
                  <p className="text-blue-200 text-sm">
                    Real YouTube algorithm training in progress via browser extension.
                  </p>
                </div>
              </div>
              <button
                onClick={handleStopTraining}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                Stop Training
              </button>
            </div>
          </motion.div>
        )}

        {/* Extension Bridge Component */}
        <div className="mb-8">
          <ExtensionBridge
            ref={extensionBridgeRef}
            onTrainingStart={handleExtensionTrainingStart}
            onTrainingComplete={handleExtensionTrainingComplete}
            onTrainingProgress={handleExtensionTrainingProgress}
          />
        </div>

        {/* Advanced Settings Panel */}
        {showAdvancedSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BrowserController
                onSettingsChange={setBrowserSettings}
                isTraining={extensionTrainingActive}
              />
              <AnonymousMode
                onConfigChange={setAnonymousConfig}
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MLAnalytics
                isActive={extensionTrainingActive}
                recommendations={recommendations}
                targetKeywords={currentPreset?.targetKeywords || []}
                avoidKeywords={currentPreset?.avoidKeywords || []}
              />
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center space-x-2 mb-4">
                  <Chrome className="h-5 w-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Extension Only Mode</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
                    <h4 className="text-green-300 font-medium text-sm mb-2">✅ Real Training Only</h4>
                    <ul className="text-green-200 text-xs space-y-1">
                      <li>• No simulation - only real YouTube algorithm training</li>
                      <li>• Browser extension required for all functionality</li>
                      <li>• Direct interaction with YouTube's recommendation system</li>
                      <li>• Authentic user behavior patterns</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                    <h4 className="text-blue-300 font-medium text-sm mb-2">🎯 How It Works</h4>
                    <ul className="text-blue-200 text-xs space-y-1">
                      <li>• Extension runs in your real browser with your cookies</li>
                      <li>• Performs actual searches and watches real videos</li>
                      <li>• Trains the algorithm that affects your actual recommendations</li>
                      <li>• No servers, no APIs - everything happens locally</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Real-time Analytics */}
        {extensionTrainingActive && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <YouTubeAutomation
              isActive={extensionTrainingActive}
              onStart={() => {}}
              onPause={() => {}}
              onStop={handleStopTraining}
              currentPreset={currentPreset}
            />
            <RealTimeAnalytics
              isActive={extensionTrainingActive}
              targetKeywords={currentPreset?.targetKeywords || []}
              avoidKeywords={currentPreset?.avoidKeywords || []}
            />
          </div>
        )}

        {/* Analysis and Profile Management */}
        <div className="mb-8">
          <PreTrainingAnalysis />
        </div>

        {/* Analysis and Profile Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <AlgorithmAnalysis
              currentState={currentAlgorithmState}
              historicalData={algorithmHistory}
            />
          </div>
        </div>

        {/* Presets Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">YouTube Presets</h2>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  showAdvancedSettings 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-1">
                  <SettingsIcon className="h-4 w-4" />
                  <Brain className="h-4 w-4" />
                  <Shield className="h-4 w-4" />
                  <Chrome className="h-4 w-4" />
                </div>
                <span>AI + Privacy + Extension</span>
              </button>
              <button 
                onClick={handleCreatePreset}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Create Preset</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search presets, keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="tech">Tech</option>
                <option value="science">Science</option>
                <option value="politics">Politics</option>
                <option value="music">Music</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Languages</option>
                {availableLanguages.map(lang => (
                  <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Preset Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {filteredPresets.map((preset) => (
              <PresetCard
                key={preset.id}
                preset={preset}
                onTrain={handleTrainPreset}
                onEdit={handleEditPreset}
                onDelete={handleDeletePreset}
                onDuplicate={handleDuplicatePreset}
                isTraining={extensionTrainingActive}
              />
            ))}
          </motion.div>

          {filteredPresets.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                {searchQuery || categoryFilter !== 'all' || languageFilter !== 'all' 
                  ? 'No presets found' 
                  : 'No presets available'
                }
              </div>
              <button 
                onClick={handleCreatePreset}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Create First Preset
              </button>
            </div>
          )}
        </div>
      </div>

      <PresetEditor
        preset={editingPreset}
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingPreset(undefined);
        }}
        onSave={handleSavePreset}
      />

      {/* Profile Creation Modal */}
      <AnimatePresence>
        {showProfileCreate && (
          <ProfileCreationModal
            isOpen={showProfileCreate}
            onClose={() => setShowProfileCreate(false)}
            onSave={handleProfileSave}
            currentPreset={pendingTrainingPreset || undefined}
            currentAlgorithmState={currentAlgorithmState}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
