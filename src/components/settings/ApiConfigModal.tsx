import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, AlertCircle } from 'lucide-react';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: { useApi: boolean; apiKey?: string; quotaLimit?: number }) => void;
  currentConfig?: {
    useApi: boolean;
    apiKey?: string;
    quotaLimit?: number;
  };
}

export function ApiConfigModal({ isOpen, onClose, onSave, currentConfig }: ApiConfigModalProps) {
  const [useApi, setUseApi] = useState(currentConfig?.useApi ?? false);
  const [apiKey, setApiKey] = useState(currentConfig?.apiKey ?? '');
  const [quotaLimit, setQuotaLimit] = useState(currentConfig?.quotaLimit ?? 10000);
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    onSave({
      useApi,
      apiKey: useApi ? apiKey : undefined,
      quotaLimit: useApi ? quotaLimit : undefined
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">API Konfiguration</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* API Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-white">YouTube API verwenden</label>
                <button
                  onClick={() => setUseApi(!useApi)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    useApi ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      useApi ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {useApi && (
                <>
                  {/* API Key Input */}
                  <div className="space-y-2">
                    <label className="text-white flex items-center space-x-2">
                      <Key className="h-4 w-4" />
                      <span>API Key</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showKey ? 'text' : 'password'}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="YouTube API Key"
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showKey ? '🔒' : '👁️'}
                      </button>
                    </div>
                  </div>

                  {/* Quota Limit */}
                  <div className="space-y-2">
                    <label className="text-white">Tägliches API Limit</label>
                    <input
                      type="number"
                      value={quotaLimit}
                      onChange={(e) => setQuotaLimit(Number(e.target.value))}
                      min="1"
                      max="100000"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Info Box */}
                  <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-200">
                        <p className="font-medium mb-1">API Kosten & Limits</p>
                        <ul className="space-y-1">
                          <li>• Kostenlos: 10.000 Einheiten/Tag</li>
                          <li>• Danach: $0.0001 pro Einheit</li>
                          <li>• Video Details: 1 Einheit</li>
                          <li>• Suche: 100 Einheiten</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Save Button */}
              <button
                onClick={handleSave}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Konfiguration speichern
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 