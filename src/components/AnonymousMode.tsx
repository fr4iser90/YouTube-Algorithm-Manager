import React, { useState } from 'react';
import { Shield, Eye, EyeOff, RefreshCw, AlertTriangle, CheckCircle, Save, Trash2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { BrowserProfile } from '../types';

interface AnonymousModeProps {
  onConfigChange: (config: AnonymousConfig) => void;
}

interface AnonymousConfig {
  enabled: boolean;
  rotateUserAgent: boolean;
  profiles: BrowserProfile[];
  activeProfile: string | null;
  useVPN: boolean;
  randomizeViewport: boolean;
  disableWebRTC: boolean;
  spoofTimezone: boolean;
  blockTracking: boolean;
  autoSaveProfiles: boolean;
  quickLoadEnabled: boolean;
}

export const AnonymousMode: React.FC<AnonymousModeProps> = ({ onConfigChange }) => {
  const [config, setConfig] = useState<AnonymousConfig>({
    enabled: true,
    rotateUserAgent: true,
    profiles: [
      {
        id: 'tech-profile',
        name: 'Tech Profile',
        description: 'Profile for tech content',
        userAgent: '',
        viewport: { width: 1920, height: 1080 },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isActive: false,
        tags: ['tech', 'ai'],
        totalVideosWatched: 150,
        totalSearches: 75,
        trainingHours: 5,
        averageWatchTime: 15,
        preferredCategories: ['tech', 'programming'],
        preferredChannels: [],
        preferredKeywords: ['AI', 'programming', 'tech'],
        watchHistory: [],
        avoidedChannels: [],
        avoidedKeywords: [],
        profileStrength: 0,
        color: '#3B82F6',
        language: 'en',
        region: 'US',
        category: 'tech',
      }
    ],
    activeProfile: null,
    useVPN: false,
    randomizeViewport: true,
    disableWebRTC: true,
    spoofTimezone: false,
    blockTracking: true,
    autoSaveProfiles: true,
    quickLoadEnabled: true
  });

  const [anonymityScore, setAnonymityScore] = useState(85);
  const [showProfileManager, setShowProfileManager] = useState(false);

  const updateConfig = <K extends keyof AnonymousConfig>(
    key: K,
    value: AnonymousConfig[K]
  ) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onConfigChange(newConfig);
    calculateAnonymityScore(newConfig);
  };

  const calculateAnonymityScore = (cfg: AnonymousConfig) => {
    let score = 0;
    if (cfg.enabled) score += 20;
    if (cfg.rotateUserAgent) score += 15;
    if (cfg.useVPN) score += 25;
    if (cfg.randomizeViewport) score += 10;
    if (cfg.disableWebRTC) score += 15;
    if (cfg.spoofTimezone) score += 10;
    if (cfg.blockTracking) score += 15;
    setAnonymityScore(Math.min(100, score));
  };

  const loadProfile = (profileId: string) => {
    updateConfig('activeProfile', profileId);
  };

  const saveProfile = (name: string, description: string) => {
    const newProfile: BrowserProfile = {
      id: Date.now().toString(),
      name,
      description,
      userAgent: '',
      viewport: { width: 1920, height: 1080 },
      createdAt: new Date(),
      lastUsed: new Date(),
      isActive: false,
      tags: [],
      totalVideosWatched: 0,
      totalSearches: 0,
      trainingHours: 0,
      averageWatchTime: 0,
      preferredCategories: [],
      preferredChannels: [],
      preferredKeywords: [],
      watchHistory: [],
      avoidedChannels: [],
      avoidedKeywords: [],
      profileStrength: 0,
      color: '#3B82F6',
      language: 'en',
      region: 'US',
      category: 'general',
    };
    updateConfig('profiles', [...config.profiles, newProfile]);
  };

  const deleteProfile = (profileId: string) => {
    const updatedProfiles = config.profiles.filter(p => p.id !== profileId);
    updateConfig('profiles', updatedProfiles);
    if (config.activeProfile === profileId) {
      updateConfig('activeProfile', null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-400" />;
    if (score >= 60) return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
    return <AlertTriangle className="h-5 w-5 text-red-400" />;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return 'just now';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Smart Anonymous Mode</h3>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {getScoreIcon(anonymityScore)}
            <span className={`font-bold ${getScoreColor(anonymityScore)}`}>
              {anonymityScore}%
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Enabled</span>
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => updateConfig('enabled', e.target.checked)}
              className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
            />
          </div>
        </div>
      </div>
      {/* Anonymity Score Visualization */}
      <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-300">Anonymity Score</span>
          <span className={`text-sm font-medium ${getScoreColor(anonymityScore)}`}>
            {anonymityScore >= 80 ? 'High' : anonymityScore >= 60 ? 'Medium' : 'Low'}
          </span>
        </div>
        <div className="w-full bg-gray-600 rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full ${
              anonymityScore >= 80 ? 'bg-green-500' :
              anonymityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${anonymityScore}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
      {/* Profile Manager */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-300">Saved Profiles</h4>
          <button
            onClick={() => setShowProfileManager(!showProfileManager)}
            className="text-xs text-purple-400 hover:text-purple-300"
          >
            {showProfileManager ? 'Hide' : 'Manage'}
          </button>
        </div>
        {config.profiles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {config.profiles.slice(0, showProfileManager ? undefined : 2).map(profile => (
              <motion.div
                key={profile.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  config.activeProfile === profile.id
                    ? 'bg-purple-900/30 border-purple-500'
                    : 'bg-gray-700/30 border-gray-600 hover:border-gray-500'
                }`}
                onClick={() => loadProfile(profile.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      profile.preferredCategories.includes('tech') ? 'bg-blue-400' :
                      profile.preferredCategories.includes('science') ? 'bg-green-400' :
                      profile.preferredCategories.includes('music') ? 'bg-purple-400' :
                      'bg-gray-400'
                    }`} />
                    <span className="text-white font-medium text-sm">{profile.name}</span>
                  </div>
                  {showProfileManager && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProfile(profile.id);
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimeAgo(profile.lastUsed)}</span>
                  </span>
                  <span className={`font-medium ${
                    profile.totalVideosWatched >= 150 ? 'text-green-400' :
                    profile.totalVideosWatched >= 75 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {profile.totalVideosWatched} videos watched
                  </span>
                </div>
                {config.activeProfile === profile.id && (
                  <div className="mt-2 text-xs text-purple-300">
                    ✓ Active Profile
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
        {config.quickLoadEnabled && (
          <div className="p-3 bg-green-900/20 border border-green-700 rounded-lg">
            <div className="flex items-center space-x-2 text-green-300 text-sm">
              <CheckCircle className="h-4 w-4" />
              <span>Quick Load enabled - Profile loads instantly!</span>
            </div>
            <p className="text-green-200 text-xs mt-1">
              Next startup will automatically load the last profile.
            </p>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Browser Fingerprinting */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-300 flex items-center space-x-2">
            <Eye className="h-5 w-4" />
            <span>Browser Fingerprinting</span>
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">Rotate User Agent</label>
              <input
                type="checkbox"
                checked={config.rotateUserAgent}
                onChange={(e) => updateConfig('rotateUserAgent', e.target.checked)}
                disabled={!config.enabled}
                className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">Randomize Viewport</label>
              <input
                type="checkbox"
                checked={config.randomizeViewport}
                onChange={(e) => updateConfig('randomizeViewport', e.target.checked)}
                disabled={!config.enabled}
                className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">Disable WebRTC</label>
              <input
                type="checkbox"
                checked={config.disableWebRTC}
                onChange={(e) => updateConfig('disableWebRTC', e.target.checked)}
                disabled={!config.enabled}
                className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">Spoof Timezone</label>
              <input
                type="checkbox"
                checked={config.spoofTimezone}
                onChange={(e) => updateConfig('spoofTimezone', e.target.checked)}
                disabled={!config.enabled}
                className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
        {/* Privacy & Tracking */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-300 flex items-center space-x-2">
            <EyeOff className="h-4 w-4" />
            <span>Privacy & Tracking</span>
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">Block Tracking</label>
              <input
                type="checkbox"
                checked={config.blockTracking}
                onChange={(e) => updateConfig('blockTracking', e.target.checked)}
                disabled={!config.enabled}
                className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300 flex items-center space-x-1">
                <span>Use VPN</span>
                <span className="text-xs text-yellow-400">(external)</span>
              </label>
              <input
                type="checkbox"
                checked={config.useVPN}
                onChange={(e) => updateConfig('useVPN', e.target.checked)}
                disabled={!config.enabled}
                className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
      </div>
      {/* Strategy Explanation */}
      <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
          <div>
            <h5 className="text-yellow-300 font-medium text-sm">Anonymity Guide</h5>
            <div className="text-yellow-200 text-xs mt-2 space-y-1">
              <div><strong>Persistent Profiles:</strong> Profile stays active, fastest startup</div>
              <div><strong>Profile Only:</strong> Profile only during browser session</div>
              <div><strong>Clear Profiles:</strong> Maximum anonymity, but profile must rebuild</div>
              <div><strong>Rotate Profiles:</strong> Switch between different profiles</div>
            </div>
            <div className="mt-3 p-2 bg-yellow-900/30 rounded text-xs text-yellow-100">
              💡 <strong>Recommendation:</strong> Use "Persistent" for fast profile loading or "Rotate" for maximum flexibility
            </div>
          </div>
        </div>
      </div>
      {/* Current Configuration Summary */}
      {config.enabled && (
        <div className="mt-6 p-4 bg-purple-900/20 border border-purple-700 rounded-lg">
          <h5 className="text-purple-300 font-medium text-sm mb-2">Active Configuration</h5>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-gray-300">
              User Agent: {config.rotateUserAgent ? 'Rotating' : 'Static'}
            </div>
            <div className="text-gray-300">
              Viewport: {config.randomizeViewport ? 'Random' : 'Standard'}
            </div>
            <div className="text-gray-300">
              Tracking: {config.blockTracking ? 'Blocked' : 'Allowed'}
            </div>
            <div className="text-gray-300">
              Profiles: {config.profiles.length} saved
            </div>
            <div className="text-gray-300">
              Quick Load: {config.quickLoadEnabled ? 'Enabled' : 'Disabled'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};