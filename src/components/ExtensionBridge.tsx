import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Chrome, Download, CheckCircle, AlertTriangle, Zap, Play, Square, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BubblePreset } from '../types';

interface ExtensionStatus {
  isInstalled: boolean;
  isConnected: boolean;
  version?: string;
  isTraining: boolean;
  currentPreset?: string;
  detectionMethod?: string;
}

interface TrainingProgress {
  progress: number;
  message: string;
  videosWatched: number;
  searchesPerformed: number;
  timestamp: number;
}

interface ExtensionBridgeProps {
  onTrainingStart?: (preset: BubblePreset) => void;
  onTrainingComplete?: (results: any) => void;
  onTrainingProgress?: (progress: TrainingProgress) => void;
}

export interface ExtensionBridgeHandle {
  startTraining: (preset: BubblePreset) => Promise<boolean>;
  stopTraining: () => Promise<void>;
}

export const ExtensionBridge = forwardRef<ExtensionBridgeHandle, ExtensionBridgeProps>(({
  onTrainingStart,
  onTrainingComplete,
  onTrainingProgress
}, ref) => {
  const [extensionStatus, setExtensionStatus] = useState<ExtensionStatus>({
    isInstalled: false,
    isConnected: false,
    isTraining: false
  });
  
  const [trainingProgress, setTrainingProgress] = useState<TrainingProgress | null>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    checkExtensionStatus();
    
    // Listen for messages from the background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('📡 Received runtime message:', message);
      switch (message.type) {
        case 'TRAINING_PROGRESS':
          setTrainingProgress(message.progress);
          onTrainingProgress?.(message.progress);
          break;
        case 'TRAINING_COMPLETED':
          onTrainingComplete?.(message.results);
          setExtensionStatus(prev => ({ ...prev, isTraining: false }));
          setTrainingProgress(null);
          break;
        case 'TRAINING_ERROR':
          console.error('Extension training error:', message.error);
          setExtensionStatus(prev => ({ ...prev, isTraining: false }));
          setTrainingProgress(null);
          break;
        case 'TRAINING_STOPPED':
          setExtensionStatus(prev => ({ ...prev, isTraining: false }));
          setTrainingProgress(null);
          break;
        case 'STATUS_UPDATE':
          setExtensionStatus(prev => ({
            ...prev,
            isInstalled: true,
            isConnected: true,
            isTraining: message.isTraining,
            currentPreset: message.currentPreset,
            version: message.version,
            detectionMethod: 'runtime-message'
          }));
          break;
      }
    });

    // Check status every 3 seconds
    const interval = setInterval(checkExtensionStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const checkExtensionStatus = async () => {
    if (chrome.runtime && chrome.runtime.id) {
      try {
        const response = await chrome.runtime.sendMessage({ type: 'GET_TRAINING_STATUS' });
        if (response) {
          setExtensionStatus({
            isInstalled: true,
            isConnected: true,
            isTraining: response.isTraining,
            currentPreset: response.currentPreset,
            detectionMethod: 'runtime-message'
          });
        } else {
          setExtensionStatus(prev => ({ ...prev, isConnected: false }));
        }
      } catch (error) {
        // This error is expected if the extension is not installed or has been reloaded
        setExtensionStatus({ isInstalled: false, isConnected: false, isTraining: false });
      }
    } else {
      setExtensionStatus({ isInstalled: false, isConnected: false, isTraining: false });
    }
  };


  const startTrainingWithExtension = async (preset: BubblePreset) => {
    if (!extensionStatus.isInstalled) {
      setShowInstallGuide(true);
      return false;
    }
    try {
      await chrome.runtime.sendMessage({ type: 'START_TRAINING', preset });
      setExtensionStatus(prev => ({ ...prev, isTraining: true, currentPreset: preset.name }));
      onTrainingStart?.(preset);
      return true;
    } catch (error) {
      console.error('Error starting training with extension:', error);
      setShowInstallGuide(true);
      return false;
    }
  };

  const stopTrainingWithExtension = async () => {
    try {
      await chrome.runtime.sendMessage({ type: 'STOP_TRAINING' });
      setExtensionStatus(prev => ({ ...prev, isTraining: false, currentPreset: undefined }));
      setTrainingProgress(null);
    } catch (error) {
      console.error('Error stopping training:', error);
    }
  };

  useImperativeHandle(ref, () => ({
    startTraining: startTrainingWithExtension,
    stopTraining: stopTrainingWithExtension,
  }));

  const openExtensionDownload = () => {
    // In production, this would link to Chrome Web Store
    window.open('https://github.com/your-repo/youtube-algorithm-trainer/releases', '_blank');
  };

  const InstallGuideModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && setShowInstallGuide(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-2xl p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Chrome className="h-6 w-6 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Install Browser Extension</h2>
        </div>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
            <h3 className="text-blue-300 font-medium mb-2">Why do I need the extension?</h3>
            <p className="text-blue-200 text-sm">
              The browser extension enables <strong>real YouTube algorithm training</strong> in your browser. 
              Without it, no training is possible.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-white font-medium">Installation Steps:</h3>
            
            <div className="space-y-2">
              <div className="flex items-start space-x-3 p-3 bg-gray-700/30 rounded-lg">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <div>
                  <div className="text-white font-medium">Download Extension</div>
                  <div className="text-gray-400 text-sm">Download the extension files from the project folder</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-gray-700/30 rounded-lg">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <div>
                  <div className="text-white font-medium">Open Chrome Extensions</div>
                  <div className="text-gray-400 text-sm">Go to <code className="bg-gray-600 px-1 rounded">chrome://extensions/</code></div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-gray-700/30 rounded-lg">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <div>
                  <div className="text-white font-medium">Enable Developer Mode</div>
                  <div className="text-gray-400 text-sm">Toggle "Developer mode" in the top right</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-gray-700/30 rounded-lg">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                <div>
                  <div className="text-white font-medium">Load Extension</div>
                  <div className="text-gray-400 text-sm">Click "Load unpacked" and select the extension folder</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-green-700/30 rounded-lg">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">5</div>
                <div>
                  <div className="text-white font-medium">Go to YouTube</div>
                  <div className="text-gray-400 text-sm">Navigate to YouTube.com to activate the extension</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowInstallGuide(false)}
            className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
          >
            Cancel
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={() => window.open('https://youtube.com', '_blank')}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
            >
              <Chrome className="h-4 w-4" />
              <span>Open YouTube</span>
            </button>
            
            <button
              onClick={openExtensionDownload}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download Extension</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <>
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Chrome className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Browser Extension Status</h3>
            <div className={`px-2 py-1 rounded text-xs ${
              extensionStatus.isInstalled 
                ? extensionStatus.isConnected 
                  ? 'bg-green-900/30 text-green-300' 
                  : 'bg-yellow-900/30 text-yellow-300'
                : 'bg-red-900/30 text-red-300'
            }`}>
              {extensionStatus.isInstalled 
                ? extensionStatus.isConnected 
                  ? 'Connected' 
                  : 'Installed'
                : 'Not Installed'
              }
            </div>
            {extensionStatus.version && (
              <div className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                v{extensionStatus.version}
              </div>
            )}
            {extensionStatus.detectionMethod && (
              <div className="px-2 py-1 bg-purple-900/30 text-purple-300 rounded text-xs">
                {extensionStatus.detectionMethod}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={checkExtensionStatus}
              disabled={isChecking}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50"
              title="Refresh status"
            >
              <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
            </button>
            
            {!extensionStatus.isInstalled && (
              <button
                onClick={() => setShowInstallGuide(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Install Extension</span>
              </button>
            )}
          </div>
        </div>

        {/* Extension Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-700/50 rounded-lg p-4 text-center">
            <div className={`text-2xl font-bold ${
              extensionStatus.isInstalled ? 'text-green-400' : 'text-red-400'
            }`}>
              {extensionStatus.isInstalled ? <CheckCircle className="h-8 w-8 mx-auto" /> : <AlertTriangle className="h-8 w-8 mx-auto" />}
            </div>
            <div className="text-xs text-gray-400 mt-2">Installation</div>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-4 text-center">
            <div className={`text-2xl font-bold ${
              extensionStatus.isConnected ? 'text-green-400' : 'text-gray-400'
            }`}>
              {extensionStatus.isConnected ? <Zap className="h-8 w-8 mx-auto" /> : <div className="h-8 w-8 mx-auto border-2 border-gray-600 rounded-full" />}
            </div>
            <div className="text-xs text-gray-400 mt-2">Connection</div>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-4 text-center">
            <div className={`text-2xl font-bold ${
              extensionStatus.isTraining ? 'text-blue-400' : 'text-gray-400'
            }`}>
              {extensionStatus.isTraining ? <Play className="h-8 w-8 mx-auto" /> : <Square className="h-8 w-8 mx-auto" />}
            </div>
            <div className="text-xs text-gray-400 mt-2">Training</div>
          </div>
        </div>

        {/* Training Progress */}
        {extensionStatus.isTraining && trainingProgress && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-300 font-medium">Training Progress</span>
              <span className="text-blue-400 font-bold">{Math.round(trainingProgress.progress)}%</span>
            </div>
            
            <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
              <motion.div
                className="bg-blue-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${trainingProgress.progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            
            <div className="text-blue-200 text-sm mb-3">{trainingProgress.message}</div>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="text-gray-300">
                Videos Watched: <span className="text-white font-bold">{trainingProgress.videosWatched}</span>
              </div>
              <div className="text-gray-300">
                Searches: <span className="text-white font-bold">{trainingProgress.searchesPerformed}</span>
              </div>
            </div>

            <button
              onClick={stopTrainingWithExtension}
              className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
            >
              <Square className="h-4 w-4" />
              <span>Stop Training</span>
            </button>
          </motion.div>
        )}

        {/* Current Status Info */}
        {extensionStatus.isInstalled ? (
          extensionStatus.isConnected ? (
            <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
              <div className="flex items-center space-x-2 text-green-300">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Extension Ready!</span>
              </div>
              <p className="text-green-200 text-sm mt-1">
                Extension is connected and ready for real YouTube algorithm training.
                Detection: {extensionStatus.detectionMethod}
              </p>
            </div>
          ) : (
            <div className="p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
              <div className="flex items-center space-x-2 text-yellow-300">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Extension Installed but Not Connected</span>
              </div>
              <p className="text-yellow-200 text-sm mt-1">
                Extension is installed but not responding. Try navigating to YouTube.com first.
              </p>
            </div>
          )
        ) : (
          <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
            <div className="flex items-center space-x-2 text-red-300">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Extension Required</span>
            </div>
            <p className="text-red-200 text-sm mt-1">
              Install the browser extension to enable real YouTube algorithm training. 
              Without it, no training is possible.
            </p>
          </div>
        )}
      </div>

      {/* Install Guide Modal */}
      <AnimatePresence>
        {showInstallGuide && <InstallGuideModal />}
      </AnimatePresence>
    </>
  );
});
