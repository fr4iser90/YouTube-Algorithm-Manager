import React, { useState, useEffect } from 'react';
import { Chrome, Shield, Volume2, VolumeX, Clock, Eye, EyeOff, Save, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface BrowserSettings {
  useIncognito: boolean;
  muteAudio: boolean;
  speed: number; // 1-5x speed
  blockAds: boolean;
  userAgent: string;
  viewport: { width: number; height: number };
  profileLoadStrategy: 'fresh' | 'restore' | 'quick';
  profileManagement: 'isolated' | 'shared' | 'profile-based';
  autoBackup: boolean;
}

interface BrowserControllerProps {
  onSettingsChange: (settings: BrowserSettings) => void;
  isTraining: boolean;
}

export const BrowserController: React.FC<BrowserControllerProps> = ({
  onSettingsChange,
  isTraining
}) => {
  const [settings, setSettings] = useState<BrowserSettings>({
    useIncognito: false,
    muteAudio: true,
    speed: 2,
    blockAds: true,
    userAgent: 'default',
    viewport: { width: 1920, height: 1080 },
    profileLoadStrategy: 'quick',
    profileManagement: 'profile-based',
    autoBackup: false,
  });

  const [profileLoadTime, setProfileLoadTime] = useState<number>(0);

  useEffect(() => {
    onSettingsChange(settings);
  }, [settings, onSettingsChange]);

  const updateSetting = <K extends keyof BrowserSettings>(
    key: K,
    value: BrowserSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const speedLabels = {
    1: 'Very slow (1x)',
    2: 'Normal (2x)',
    3: 'Fast (3x)',
    4: 'Very fast (4x)',
    5: 'Lightning (5x)'
  };

  const getProfileLoadDescription = (strategy: string) => {
    switch (strategy) {
      case 'fresh': return 'Start completely fresh - Longest time, maximum anonymity';
      case 'restore': return 'Restore last state - Medium time';
      case 'quick': return 'Load instantly - Fastest time';
      default: return '';
    }
  };

  const getProfileDescription = (management: string) => {
    switch (management) {
      case 'isolated': return 'Each profile isolated - Maximum security';
      case 'shared': return 'Profiles share data - Better continuity';
      case 'profile-based': return 'Profile-based - Optimal balance';
      default: return '';
    }
  };

  const estimateProfileLoadTime = () => {
    let baseTime = 30; // seconds
    if (settings.profileLoadStrategy === 'fresh') baseTime = 180;
    else if (settings.profileLoadStrategy === 'restore') baseTime = 60;
    else if (settings.profileLoadStrategy === 'quick') baseTime = 10;
    if (settings.useIncognito) baseTime += 15;
    baseTime = Math.round(baseTime / settings.speed);
    setProfileLoadTime(baseTime);
    return baseTime;
  };

  useEffect(() => {
    estimateProfileLoadTime();
  }, [settings.profileLoadStrategy, settings.useIncognito, settings.speed]);

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center space-x-2 mb-6">
        <Chrome className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Extension Browser Settings</h3>
        <div className="px-2 py-1 bg-green-900/30 text-green-300 rounded text-xs">
          Extension Only
        </div>
      </div>

      {/* Extension Mode Info */}
      <div className="mb-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
        <div className="flex items-start space-x-3">
          <CheckCircle className="h-5 w-5 text-blue-400 mt-0.5" />
          <div>
            <h5 className="text-blue-300 font-medium text-sm">Extension-Only Mode Active</h5>
            <div className="text-blue-200 text-xs mt-2 space-y-1">
              <div>• <strong>Real Training:</strong> Extension controls your actual browser</div>
              <div>• <strong>No Simulation:</strong> All actions happen on real YouTube</div>
              <div>• <strong>Authentic Behavior:</strong> Indistinguishable from manual usage</div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Loading Strategy */}
      <div className="mb-6 p-4 bg-green-900/20 border border-green-700 rounded-lg">
        <h4 className="text-sm font-medium text-green-300 mb-3 flex items-center space-x-2">
          <Save className="h-4 w-4" />
          <span>Profile Loading Strategy</span>
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Load Strategy</label>
            <select
              value={settings.profileLoadStrategy}
              onChange={(e) => updateSetting('profileLoadStrategy', e.target.value as any)}
              disabled={isTraining}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="quick">Quick Load - Instant</option>
              <option value="restore">Restore - Restore last state</option>
              <option value="fresh">Fresh Start - Start completely new</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">
              {getProfileLoadDescription(settings.profileLoadStrategy)}
            </p>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded">
            <span className="text-sm text-gray-300">Estimated profile load time:</span>
            <span className="text-green-400 font-bold">{profileLoadTime}s</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Privacy & Security */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-300 flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Privacy & Security</span>
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">Block Ads</label>
              <input
                type="checkbox"
                checked={settings.blockAds}
                onChange={(e) => updateSetting('blockAds', e.target.checked)}
                disabled={isTraining}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">Auto-backup Profiles</label>
              <input
                type="checkbox"
                checked={settings.autoBackup}
                onChange={(e) => updateSetting('autoBackup', e.target.checked)}
                disabled={isTraining}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        {/* Performance */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-300 flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Performance</span>
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300 flex items-center space-x-1">
                {settings.muteAudio ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                <span>Mute Audio</span>
              </label>
              <input
                type="checkbox"
                checked={settings.muteAudio}
                onChange={(e) => updateSetting('muteAudio', e.target.checked)}
                disabled={isTraining}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2 flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Speed: {speedLabels[settings.speed as keyof typeof speedLabels]}</span>
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={settings.speed}
                onChange={(e) => updateSetting('speed', parseInt(e.target.value))}
                disabled={isTraining}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Slow</span>
                <span>Fast</span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">User Agent</label>
              <select
                value={settings.userAgent}
                onChange={(e) => updateSetting('userAgent', e.target.value)}
                disabled={isTraining}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="default">Standard Chrome</option>
                <option value="mobile">Mobile Chrome</option>
                <option value="firefox">Firefox</option>
                <option value="safari">Safari</option>
                <option value="edge">Edge</option>
                <option value="random">Random rotation</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      {/* Browser Launch Status */}
      {isTraining && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
            <span className="text-blue-300 text-sm">
              Extension training active
            </span>
          </div>
        </motion.div>
      )}
      {/* Current Configuration Summary */}
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
        <h5 className="text-blue-300 font-medium text-sm mb-2">Current Configuration</h5>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-gray-300">
            Profile Strategy: {settings.profileLoadStrategy}
          </div>
          <div className="text-gray-300">
            Speed: {settings.speed}x
          </div>
          <div className="text-gray-300">
            Load Time: ~{profileLoadTime}s
          </div>
          <div className="text-gray-300">
            Mode: Extension Only
          </div>
          <div className="text-gray-300">
            Training: Real YouTube
          </div>
        </div>
      </div>
    </div>
  );
};
