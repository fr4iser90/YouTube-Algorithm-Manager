import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PresetCard } from './components/PresetCard';
import { PresetEditor } from './components/PresetEditor';
import { TrainingProgress } from './components/TrainingProgress';
import { AlgorithmAnalysis } from './components/AlgorithmAnalysis';
import { BubbleProfileController } from './components/BubbleProfileController';
import { BrowserController } from './components/BrowserController';
import { YouTubeAutomation } from './components/YouTubeAutomation';
import { RealTimeAnalytics } from './components/RealTimeAnalytics';
import { AnonymousMode } from './components/AnonymousMode';
import { MLAnalytics } from './components/MLAnalytics';
import { ExtensionBridge } from './components/ExtensionBridge';
import { useLocalStorage, dateReviver } from './hooks/useLocalStorage';
import { presetTemplates } from './data/presetTemplates';
import { BubblePreset, TrainingProfile, AlgorithmState } from './types';
import { Plus, Filter, Search, Settings as SettingsIcon, Brain, Shield, Chrome } from 'lucide-react';
import { motion } from 'framer-motion';

function App() {
  const [presets, setPresets] = useLocalStorage<BubblePreset[]>('youtube-presets', []);
  const [algorithmHistory, setAlgorithmHistory] = useLocalStorage<AlgorithmState[]>('algorithm-history', []);
  const [currentProfile, setcurrentProfile] = useState<TrainingProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<BubblePreset | undefined>(undefined);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [browserSettings, setBrowserSettings] = useState<any>({});
  const [anonymousConfig, setAnonymousConfig] = useState<any>({});
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [activeProfileId, setactiveProfileId] = useState<string | null>(null);
  const [extensionTrainingActive, setExtensionTrainingActive] = useState(false);

  // Initialize with template presets if none exist
  useEffect(() => {
    if (presets.length === 0) {
      const initialPresets = presetTemplates.map(template => ({
        ...template,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date()
      }));
      setPresets(initialPresets);
    }
  }, [presets.length, setPresets]);

  // Auto-load last active profile on startup
  useEffect(() => {
    const autoLoadProfile = () => {
      try {
        const savedProfiles = localStorage.getItem('youtube-profiles');
        if (savedProfiles) {
          const profiles = JSON.parse(savedProfiles, dateReviver);
          const activeProfile = profiles.find((s: any) => s.isActive);
          
          if (activeProfile && browserSettings.bubbleLoadStrategy === 'quick') {
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
  }, [browserSettings.bubbleLoadStrategy]);

  const loadProfileData = (profile: any) => {
    try {
      // Restore algorithm state
      if (profile.algorithmState) {
        setAlgorithmHistory(prev => {
          const filtered = prev.filter(state => state.timestamp !== profile.algorithmState.timestamp);
          return [...filtered, profile.algorithmState];
        });
      }

      // Set active profile
      setactiveProfileId(profile.id);
      
      // Simulate quick bubble loading
      console.log(`✅ Profile "${profile.name}" loaded instantly with ${profile.bubbleStrength}% bubble strength`);
      
      // Update recommendations if available
      if (profile.algorithmState?.recommendations) {
        setRecommendations(profile.algorithmState.recommendations);
      }

    } catch (error) {
      console.error('Failed to load profile data:', error);
    }
  };

  const handleTrainPreset = async (preset: BubblePreset) => {
    if (currentProfile || extensionTrainingActive) return;

    // Verbesserte Extension-Erkennung
    const extensionAvailable = !!(
      localStorage.getItem('yt-trainer-extension-status') ||
      localStorage.getItem('yt-trainer-extension-info') ||
      document.querySelector('#yt-trainer-extension-marker') ||
      (window as any).ytTrainerExtension
    );

    if (!extensionAvailable) {
      alert('❌ Browser Extension Required!\n\nPlease install the browser extension to enable real YouTube algorithm training.\n\nWithout the extension, no training is possible.');
      return;
    }

    // Start extension training
    try {
      const success = await startExtensionTraining(preset);
      if (success) {
        setExtensionTrainingActive(true);
      } else {
        alert('❌ Extension Training Failed!\n\nCould not start training. Please check if the extension is properly installed and try again.');
      }
    } catch (error) {
      console.error('Extension training failed:', error);
      alert('❌ Extension Training Error!\n\nTraining failed to start. Please check the browser console for details.');
    }
  };

  const startExtensionTraining = async (preset: BubblePreset): Promise<boolean> => {
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

  const handleDuplicatePreset = (preset: BubblePreset) => {
    const duplicated: BubblePreset = {
      ...preset,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: `${preset.name} (Copy)`,
      createdAt: new Date(),
      lastUsed: undefined
    };
    setPresets(prev => [...prev, duplicated]);
  };

  const handleEditPreset = (preset: BubblePreset) => {
    setEditingPreset(preset);
    setIsEditorOpen(true);
  };

  const handleCreatePreset = () => {
    setEditingPreset(undefined);
    setIsEditorOpen(true);
  };

  const handleSavePreset = (preset: BubblePreset) => {
    if (editingPreset) {
      // Update existing preset
      setPresets(prev => prev.map(p => p.id === preset.id ? preset : p));
    } else {
      // Add new preset
      setPresets(prev => [...prev, preset]);
    }
  };

  const handleStopTraining = () => {
    setcurrentProfile(null);
    setExtensionTrainingActive(false);
    
    // Stop extension training
    localStorage.removeItem('yt-trainer-command');
    window.postMessage({ type: 'YT_TRAINER_STOP' }, '*');
    
    // Try global extension object
    const globalExtension = (window as any).ytTrainerExtension;
    if (globalExtension && globalExtension.stopTraining) {
      globalExtension.stopTraining();
    }
  };

  const handleLoadProfile = (profile: any) => {
    loadProfileData(profile);
  };

  const handleExtensionTrainingStart = (preset: BubblePreset) => {
    setExtensionTrainingActive(true);
    console.log('🎯 Extension training started for:', preset.name);
  };

  const handleExtensionTrainingComplete = (results: any) => {
    setExtensionTrainingActive(false);
    
    // Convert extension results to algorithm state
    const algorithmState: AlgorithmState = {
      timestamp: new Date(),
      recommendations: results.recommendations || [],
      categories: results.categories || [],
      sentiment: 'positive',
      bubbleScore: results.bubbleScore || 0,
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

  const currentAlgorithmState = algorithmHistory[algorithmHistory.length - 1];
  const availableLanguages = Array.from(new Set(presets.map(p => p.language || 'en')));
  const currentPreset = currentProfile ? presets.find(p => p.id === currentProfile.presetId) : undefined;

  return (
    <div className="min-h-screen bg-gray-900">
      <Header
        onExport={handleExport}
        onImport={handleImport}
        onSettings={() => setShowAdvancedSettings(!showAdvancedSettings)}
        currentPreset={currentPreset}
        currentAlgorithmState={currentAlgorithmState}
        onLoadProfile={handleLoadProfile}
        onCreateProfile={handleCreatePreset}
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
                  Bubble loaded instantly with persistent cookies. Ready for training or browsing.
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <AlgorithmAnalysis
              currentState={currentAlgorithmState}
              historicalData={algorithmHistory}
            />
          </div>
          <div>
            <BubbleProfileController />
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
    </div>
  );
}

export default App;