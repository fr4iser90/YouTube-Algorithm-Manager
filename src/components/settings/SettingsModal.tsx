import React from 'react';
import { motion } from 'framer-motion';
import { X, Chrome, Shield, Key } from 'lucide-react';
import { BrowserController } from '@/components/browser/BrowserController';
import { AnonymousMode } from '@/components/browser/AnonymousMode';
import { ApiConfigModal } from './ApiConfigModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  browserSettings: any;
  onBrowserSettingsChange: (settings: any) => void;
  anonymousConfig: any;
  onAnonymousConfigChange: (config: any) => void;
  apiConfig: {
    useApi: boolean;
    apiKey?: string;
    quotaLimit?: number;
  };
  onApiConfigChange: (config: { useApi: boolean; apiKey?: string; quotaLimit?: number }) => void;
  isTraining: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  browserSettings,
  onBrowserSettingsChange,
  anonymousConfig,
  onAnonymousConfigChange,
  apiConfig,
  onApiConfigChange,
  isTraining
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Einstellungen</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {/* Browser Settings */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center space-x-2 mb-4">
              <Chrome className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Browser Einstellungen</h3>
            </div>
            <BrowserController
              onSettingsChange={onBrowserSettingsChange}
              isTraining={isTraining}
            />
          </div>

          {/* Anonymous Mode */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Anonyme Modus</h3>
            </div>
            <AnonymousMode
              onConfigChange={onAnonymousConfigChange}
              isTraining={isTraining}
            />
          </div>

          {/* API Configuration */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center space-x-2 mb-4">
              <Key className="h-5 w-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">API Configuration</h3>
            </div>
            <div className="mb-4 text-sm text-yellow-200 bg-yellow-900/30 border border-yellow-700 rounded p-3">
              <strong>YouTube Data API v3:</strong> <br />
              <ul className="list-disc ml-5">
                <li>10,000 units free per day (resets every 24h)</li>
                <li>Typical costs: 1 unit for video/channel details, 100 units for search</li>
                <li>Excess usage: $0.0001 per extra unit (Google charges)</li>
                <li>Get your API key from <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="underline text-blue-300">Google Cloud Console</a></li>
              </ul>
              <span className="block mt-2 text-yellow-300">For most users, the free quota is more than enough for analytics and training.</span>
            </div>
            <div className="flex items-center mb-4">
              <label className="flex items-center text-white">
                <input
                  type="checkbox"
                  checked={apiConfig.useApi}
                  onChange={e => onApiConfigChange({ ...apiConfig, useApi: e.target.checked })}
                  className="form-checkbox h-5 w-5 text-blue-600 mr-2"
                />
                Use YouTube API
              </label>
            </div>
            {apiConfig.useApi && (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-1">API Key</label>
                  <input
                    type="text"
                    value={apiConfig.apiKey || ''}
                    onChange={e => onApiConfigChange({ ...apiConfig, apiKey: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                    placeholder="Enter your YouTube API Key"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Daily Quota Limit</label>
                  <input
                    type="number"
                    value={apiConfig.quotaLimit || 10000}
                    onChange={e => onApiConfigChange({ ...apiConfig, quotaLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                    min={100}
                    step={100}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}; 