import React, { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { PresetCard } from '@/components/presets/PresetCard';
import { PresetEditor } from '@/components/presets/PresetEditor';
import { TrainingProgress } from '@/components/training/TrainingProgress';
import { AlgorithmAnalytics } from '@/components/analytics/AlgorithmAnalytics';
import { YouTubeAutomation } from '@/components/training/YouTubeAutomation';
import { RealTimeAnalytics } from '@/components/analytics/RealTimeAnalytics';
import { AlgorithmSnapshotAnalytics } from '@/components/analytics/AlgorithmSnapshotAnalytics';
import { ExtensionBridge, ExtensionBridgeHandle } from '@/components/browser/ExtensionBridge';
import { useLocalStorage, dateReviver } from '@/hooks/useLocalStorage';
import { TrainingPreset, AlgorithmState, BrowserProfile } from '@/types';
import { Plus, Filter, Search, Settings as SettingsIcon, Brain, Shield, Chrome } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfileCreationModal } from '@/components/profile/ProfileCreationModal';
import { BoltBadge } from '@/components/layout/BoltBadge';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { usePresetFilters } from '@/hooks/usePresetFilters';
import { usePresetManagement } from '@/hooks/usePresetManagement';
import { useProfileManagement } from '@/hooks/useProfileManagement';
import { AnalyticsProvider } from '@/utils/analyticsProvider';
import { PresetGrid } from '@/components/layout/PresetGrid';

function App() {
  // Local Storage Hooks
  const [presets, setPresets, presetsLoading] = useLocalStorage<TrainingPreset[]>('youtube-presets', []);
  const [algorithmHistory, setAlgorithmHistory, historyLoading] = useLocalStorage<AlgorithmState[]>('algorithm-history', []);
  const [browserSettings, setBrowserSettings, settingsLoading] = useLocalStorage<any>('browser-settings', {});

  // Custom Hooks
  const {
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    languageFilter,
    setLanguageFilter,
    filteredPresets,
    availableLanguages
  } = usePresetFilters(presets);

  const {
    presets: managedPresets,
    setPresets: setManagedPresets,
    isEditorOpen,
    setIsEditorOpen,
    editingPreset,
    setEditingPreset,
    handleCreatePreset,
    handleEditPreset,
    handleDeletePreset,
    handleDuplicatePreset,
    handleSavePreset
  } = usePresetManagement(presets);

  const {
    savedProfiles,
    setSavedProfiles,
    profilesLoading,
    currentProfile,
    setCurrentProfile,
    currentAlgorithmState,
    setCurrentAlgorithmState,
    showProfileCreate,
    setShowProfileCreate,
    pendingTrainingPreset,
    setPendingTrainingPreset,
    loadProfileData,
    handleProfileSave
  } = useProfileManagement(algorithmHistory);

  // Other State
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [anonymousConfig, setAnonymousConfig] = useState<any>({});
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [activeProfileId, setactiveProfileId] = useState<string | null>(null);
  const [extensionTrainingActive, setExtensionTrainingActive] = useState(false);
  const [apiConfig, setApiConfig] = useState<{
    useApi: boolean;
    apiKey?: string;
    quotaLimit?: number;
  }>({
    useApi: false
  });
  const extensionBridgeRef = useRef<ExtensionBridgeHandle>(null);

  // API quota tracking
  const analyticsProvider = React.useMemo(() => new AnalyticsProvider(apiConfig), [apiConfig]);
  const [apiQuotaUsed, setApiQuotaUsed] = useState(analyticsProvider.getQuotaUsage());

  // Update quota used on every render if API is enabled
  useEffect(() => {
    if (apiConfig.useApi) {
      setApiQuotaUsed(analyticsProvider.getQuotaUsage());
    }
  }, [apiConfig, analyticsProvider]);

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

  // Initialize extension bridge
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'YT_TRAINER_STATUS') {
        setExtensionTrainingActive(event.data.isTraining);
      } else if (event.data.type === 'PROFILE_UPDATED') {
        setSavedProfiles(prev => 
          prev.map(p => p.id === event.data.profile.id ? event.data.profile : p)
        );
        setCurrentProfile(prev => 
          prev?.id === event.data.profile.id ? event.data.profile : prev
        );
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [setSavedProfiles, setCurrentProfile]);

  const handleTrainPreset = async (preset: TrainingPreset) => {
    console.log('🎯 Starting training for preset:', preset.name);
    
    const activeProfile = savedProfiles.find(p => p.isActive);
    
    if (!activeProfile) {
      console.log('👤 No active profile, opening creation modal');
      setPendingTrainingPreset(preset);
      setShowProfileCreate(true);
      return;
    }

    console.log('🚀 Starting training with profile:', activeProfile.name);
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

  const handleStopTraining = async () => {
    if (extensionBridgeRef.current) {
      await extensionBridgeRef.current.stopTraining();
      setExtensionTrainingActive(false);
    }
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

  if (presetsLoading || historyLoading || settingsLoading || profilesLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <BoltBadge />
      <Header
        onExport={handleExport}
        onImport={handleImport}
        onSettings={() => setShowAdvancedSettings(true)}
        currentPreset={currentProfile ? presets.find(p => p.id === currentProfile.presetId) : undefined}
        currentAlgorithmState={currentAlgorithmState}
        onLoadProfile={loadProfileData}
        onCreateProfile={() => setShowProfileCreate(true)}
        savedProfiles={savedProfiles}
        setSavedProfiles={setSavedProfiles}
        apiConfig={apiConfig}
        apiQuotaUsed={apiQuotaUsed}
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
                  Profile loaded instantly. Ready for training or browsing.
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
            onTrainingStart={(preset) => {
              setExtensionTrainingActive(true);
              console.log('🎯 Extension training started for:', preset.name);
            }}
            onTrainingComplete={(results) => {
              setExtensionTrainingActive(false);
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
            }}
            onTrainingProgress={(progress) => {
              console.log('📊 Extension training progress:', progress);
            }}
          />
        </div>

        {/* Settings Modal */}
        <SettingsModal
          isOpen={showAdvancedSettings}
          onClose={() => setShowAdvancedSettings(false)}
          browserSettings={browserSettings}
          onBrowserSettingsChange={setBrowserSettings}
          anonymousConfig={anonymousConfig}
          onAnonymousConfigChange={setAnonymousConfig}
          apiConfig={apiConfig}
          onApiConfigChange={setApiConfig}
          isTraining={extensionTrainingActive}
        />

        {/* Real-time Analytics */}
        {extensionTrainingActive && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <YouTubeAutomation
              isActive={extensionTrainingActive}
              onStart={() => {}}
              onPause={() => {}}
              onStop={handleStopTraining}
              currentPreset={currentProfile ? presets.find(p => p.id === currentProfile.presetId) : undefined}
            />
            <RealTimeAnalytics
              isActive={extensionTrainingActive}
              targetKeywords={currentProfile ? presets.find(p => p.id === currentProfile.presetId)?.targetKeywords || [] : []}
              avoidKeywords={currentProfile ? presets.find(p => p.id === currentProfile.presetId)?.avoidKeywords || [] : []}
            />
          </div>
        )}

        {/* Analysis and Profile Management */}
        <div className="mb-8">
          <AlgorithmSnapshotAnalytics />
        </div>

        {/* Analysis and Profile Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <AlgorithmAnalytics
              currentState={currentAlgorithmState}
              historicalData={algorithmHistory}
            />
          </div>
        </div>

        {/* Presets Section */}
        <PresetGrid
          filteredPresets={filteredPresets}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          languageFilter={languageFilter}
          setLanguageFilter={setLanguageFilter}
          availableLanguages={availableLanguages}
          handleCreatePreset={handleCreatePreset}
          handleTrainPreset={handleTrainPreset}
          handleEditPreset={handleEditPreset}
          handleDeletePreset={handleDeletePreset}
          handleDuplicatePreset={handleDuplicatePreset}
          isTraining={extensionTrainingActive}
        />
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
