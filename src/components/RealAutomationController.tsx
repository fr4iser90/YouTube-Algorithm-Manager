import React from 'react';
import { Play, Pause, Square, AlertTriangle, CheckCircle, Chrome } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRealAutomation } from '../hooks/useRealAutomation';
import { BubblePreset } from '../types';

interface RealAutomationControllerProps {
  preset?: BubblePreset;
  browserConfig: any;
  anonymousConfig: any;
  onComplete: (results: any) => void;
}

export const RealAutomationController: React.FC<RealAutomationControllerProps> = ({
  preset,
  browserConfig,
  anonymousConfig,
  onComplete
}) => {
  const { isActive, progress, error, startAutomation, pauseAutomation, stopAutomation } = useRealAutomation();

  const handleStart = async () => {
    if (!preset) return;
    await startAutomation(preset, browserConfig, anonymousConfig, onComplete);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Chrome className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Echte Browser Automation</h3>
          {isActive && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-green-900/30 text-green-300 rounded text-xs">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Aktiv</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {!isActive ? (
            <button
              onClick={handleStart}
              disabled={!preset}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition-colors"
            >
              <Play className="h-4 w-4" />
              <span>Echte Automation starten</span>
            </button>
          ) : (
            <>
              <button
                onClick={pauseAutomation}
                className="flex items-center space-x-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors"
              >
                <Pause className="h-4 w-4" />
                <span>Pause</span>
              </button>
              <button
                onClick={stopAutomation}
                className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                <Square className="h-4 w-4" />
                <span>Stop</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Progress Display */}
      {progress && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">{progress.currentAction}</span>
            <span className="text-sm text-gray-400">{Math.round(progress.progress)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress.progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Real-time Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-gray-700/50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-blue-400">{progress.searchesPerformed}</div>
              <div className="text-xs text-gray-400">Suchen</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-green-400">{progress.videosWatched}</div>
              <div className="text-xs text-gray-400">Videos</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-purple-400">{progress.bubbleScore}%</div>
              <div className="text-xs text-gray-400">Bubble Score</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div>
              <h5 className="text-red-300 font-medium">Automation Fehler</h5>
              <p className="text-red-200 text-sm mt-1">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Configuration Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-700/30 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Browser Konfiguration</h4>
          <div className="space-y-2 text-xs text-gray-400">
            {/* Headless-Modus entfernt */}
            <div className="flex justify-between">
              <span>Incognito:</span>
              <span>{browserConfig.useIncognito ? 'Ja' : 'Nein'}</span>
            </div>
            <div className="flex justify-between">
              <span>Geschwindigkeit:</span>
              <span>{browserConfig.speed}x</span>
            </div>
            <div className="flex justify-between">
              <span>Audio:</span>
              <span>{browserConfig.muteAudio ? 'Stumm' : 'An'}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-700/30 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Anonymität</h4>
          <div className="space-y-2 text-xs text-gray-400">
            <div className="flex justify-between">
              <span>User Agent:</span>
              <span>{anonymousConfig.rotateUserAgent ? 'Rotierend' : 'Statisch'}</span>
            </div>
            <div className="flex justify-between">
              <span>Cookies:</span>
              <span>{anonymousConfig.clearCookiesFrequency}</span>
            </div>
            <div className="flex justify-between">
              <span>Tracking:</span>
              <span>{anonymousConfig.blockTracking ? 'Blockiert' : 'Erlaubt'}</span>
            </div>
            <div className="flex justify-between">
              <span>WebRTC:</span>
              <span>{anonymousConfig.disableWebRTC ? 'Deaktiviert' : 'Aktiv'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Requirements Notice */}
      {!isActive && (
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-blue-400 mt-0.5" />
            <div>
              <h5 className="text-blue-300 font-medium text-sm">Echte Browser Integration</h5>
              <p className="text-blue-200 text-xs mt-1">
                Diese Funktion verwendet Puppeteer für echte Browser-Automation. 
                Stelle sicher, dass alle Abhängigkeiten installiert sind.
              </p>
              <div className="mt-2 text-xs text-blue-200">
                <code className="bg-blue-900/30 px-2 py-1 rounded">
                  npm install puppeteer puppeteer-extra puppeteer-extra-plugin-stealth
                </code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
