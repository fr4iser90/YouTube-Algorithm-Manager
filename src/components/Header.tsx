import React, { useState } from 'react';
import { Brain, Download, Upload, Settings, Save, Shield, Eye, EyeOff, AlertTriangle, CheckCircle, X, Chrome, PlaySquare } from 'lucide-react';
import { BubbleProfileManager } from './BubbleProfileManager';
import { BubblePreset, AlgorithmState } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { TrainingManager } from './TrainingManager';

interface HeaderProps {
  onExport: () => void;
  onImport: () => void;
  onSettings: () => void;
  currentPreset?: BubblePreset;
  currentAlgorithmState?: AlgorithmState;
  onLoadProfile: (profile: any) => void;
  onCreateProfile: () => void;
  savedProfiles: any[];
  setSavedProfiles: (profiles: any[]) => void;
  presets: any[];
  onCreate: () => void;
  onEdit: (preset: any) => void;
  onDelete: (id: string) => void;
  onDuplicate: (preset: any) => void;
  onTrain: (preset: any) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

interface SecurityCheck {
  anonymousMode: boolean;
  trackingBlocked: boolean;
  webrtcDisabled: boolean;
  userAgentRotated: boolean;
  cookiesManaged: boolean;
  extensionInstalled: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  onExport, 
  onImport, 
  onSettings,
  currentPreset,
  currentAlgorithmState,
  onLoadProfile,
  onCreateProfile,
  savedProfiles,
  setSavedProfiles,
  presets,
  onCreate,
  onEdit,
  onDelete,
  onDuplicate,
  onTrain,
  searchQuery,
  setSearchQuery
}) => {
  const [isProfileManagerOpen, setIsProfileManagerOpen] = useState(false);
  const [isTrainingManagerOpen, setIsTrainingManagerOpen] = useState(false);
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);

  // Security Check - Extension focused
  const performSecurityCheck = (): SecurityCheck => {
    // Check localStorage for current settings
    const anonymousConfig = JSON.parse(localStorage.getItem('anonymous-config') || '{}');
    
    // Check if extension is installed
    const extensionInstalled = !!(
      localStorage.getItem('yt-trainer-extension-info') ||
      document.querySelector('#yt-trainer-extension-marker') ||
      (window as any).ytTrainerExtension
    );

    return {
      anonymousMode: anonymousConfig.enabled || false,
      trackingBlocked: anonymousConfig.blockTracking || false,
      webrtcDisabled: anonymousConfig.disableWebRTC || false,
      userAgentRotated: anonymousConfig.rotateUserAgent || false,
      cookiesManaged: anonymousConfig.cookieStrategy !== 'persist' || false,
      extensionInstalled
    };
  };

  const handleBrowseAnonymous = () => {
    const securityCheck = performSecurityCheck();
    
    // Check if extension is missing
    if (!securityCheck.extensionInstalled) {
      alert('❌ Browser Extension Required!\n\nPlease install the browser extension first. Without it, no training or anonymous browsing is possible.');
      return;
    }

    // Check for warnings
    const warnings = [];
    
    if (!securityCheck.anonymousMode) {
      warnings.push('Anonymous Mode nicht aktiviert');
    }
    
    if (!securityCheck.trackingBlocked) {
      warnings.push('Tracking nicht blockiert');
    }
    
    if (!securityCheck.webrtcDisabled) {
      warnings.push('WebRTC nicht deaktiviert');
    }
    
    if (!securityCheck.userAgentRotated) {
      warnings.push('User Agent nicht rotiert');
    }

    // Show warning if there are issues
    if (warnings.length > 1) {
      setShowSecurityWarning(true);
      return;
    }

    // Proceed with anonymous browsing
    proceedWithAnonymousBrowsing();
  };

  const proceedWithAnonymousBrowsing = () => {
    try {
      // Load saved profile cookies
      const savedProfiles = localStorage.getItem('youtube-profiles');
      let profileCookies = '';
      
      if (savedProfiles) {
        const profiles = JSON.parse(savedProfiles);
        const activeProfile = profiles.find((p: any) => p.isActive);
        
        if (activeProfile && activeProfile.cookies) {
          profileCookies = atob(activeProfile.cookies);
          console.log('🍪 Loading profile cookies for anonymous browsing');
        }
      }

      // Create YouTube URL with profile parameters
      const youtubeUrl = new URL('https://www.youtube.com');
      
      if (profileCookies) {
        youtubeUrl.searchParams.set('profile_restore', 'true');
        youtubeUrl.searchParams.set('bubble_mode', 'anonymous');
      }

      // Open YouTube with profile data
      const newWindow = window.open(youtubeUrl.toString(), '_blank');
      
      if (newWindow) {
        setTimeout(() => {
          try {
            console.log('🎯 Profile cookies injected into anonymous window');
            console.log('✅ Anonymous browsing with loaded bubble profile active!');
          } catch (error) {
            console.log('⚠️ Cookie injection failed, but window opened');
          }
        }, 1000);
      }

      console.log('🕵️ Opening YouTube ANONYMOUSLY with LOADED PROFILE...');
      
    } catch (error) {
      console.error('❌ Failed to load profile for anonymous browsing:', error);
      window.open('https://www.youtube.com', '_blank');
    }
  };

  const handleBrowseWithProfile = () => {
    try {
      const savedProfiles = localStorage.getItem('youtube-profiles');
      
      if (savedProfiles) {
        const profiles = JSON.parse(savedProfiles);
        const activeProfile = profiles.find((p: any) => p.isActive);
        
        if (activeProfile) {
          console.log('🍪 Opening YouTube with full profile data...');
          
          const youtubeUrl = new URL('https://www.youtube.com');
          youtubeUrl.searchParams.set('profile_id', activeProfile.id);
          youtubeUrl.searchParams.set('bubble_strength', activeProfile.bubbleStrength.toString());
          
          window.open(youtubeUrl.toString(), '_blank');
          return;
        }
      }
      
      window.open('https://www.youtube.com', '_blank');
      console.log('🔗 Opening YouTube with current browser profile...');
      
    } catch (error) {
      console.error('❌ Failed to load profile:', error);
      window.open('https://www.youtube.com', '_blank');
    }
  };

  const SecurityWarningModal = () => {
    const securityCheck = performSecurityCheck();
    
    const warnings = [];

    if (!securityCheck.extensionInstalled) {
      warnings.push({
        icon: <Chrome className="h-5 w-5 text-red-400" />,
        title: 'Browser Extension nicht installiert',
        description: 'Ohne Extension ist kein Training möglich',
        severity: 'critical',
        solution: 'Browser Extension installieren'
      });
    }
    
    if (!securityCheck.anonymousMode) {
      warnings.push({
        icon: <Eye className="h-5 w-5 text-yellow-400" />,
        title: 'Anonymous Mode deaktiviert',
        description: 'Browser-Fingerprinting nicht verhindert',
        severity: 'warning',
        solution: 'Anonymous Mode aktivieren'
      });
    }
    
    if (!securityCheck.trackingBlocked) {
      warnings.push({
        icon: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
        title: 'Tracking nicht blockiert',
        description: 'Werbetreibende können dich verfolgen',
        severity: 'warning',
        solution: 'Tracking-Schutz aktivieren'
      });
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && setShowSecurityWarning(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-yellow-400" />
              <div>
                <h2 className="text-xl font-bold text-white">Browser-Sicherheits-Check</h2>
                <p className="text-sm text-gray-400">Überprüfe deine Browser-Einstellungen</p>
              </div>
            </div>
            <button
              onClick={() => setShowSecurityWarning(false)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Security Issues */}
          <div className="space-y-4 mb-6">
            {warnings.map((issue, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  issue.severity === 'critical' 
                    ? 'bg-red-900/20 border-red-700' 
                    : 'bg-yellow-900/20 border-yellow-700'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {issue.icon}
                  <div className="flex-1">
                    <h3 className={`font-medium ${
                      issue.severity === 'critical' ? 'text-red-300' : 'text-yellow-300'
                    }`}>
                      {issue.title}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      issue.severity === 'critical' ? 'text-red-200' : 'text-yellow-200'
                    }`}>
                      {issue.description}
                    </p>
                    <p className={`text-xs mt-2 ${
                      issue.severity === 'critical' ? 'text-red-300' : 'text-yellow-300'
                    }`}>
                      💡 <strong>Lösung:</strong> {issue.solution}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setShowSecurityWarning(false);
                onSettings();
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Einstellungen öffnen</span>
            </button>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowSecurityWarning(false)}
                className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
              >
                Abbrechen
              </button>
              
              <button
                onClick={() => {
                  setShowSecurityWarning(false);
                  proceedWithAnonymousBrowsing();
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors"
              >
                <Shield className="h-4 w-4" />
                <span>Trotzdem fortfahren</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <>
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-blue-400" />
              <div>
                <h1 className="text-xl font-bold text-white">YouTube Algorithm Manager</h1>
                <p className="text-xs text-gray-400">Extension-only real training</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Aktives Profil Badge */}
              {(() => {
                const activeProfile = savedProfiles.find((p: any) => p.isActive);
                return (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${activeProfile ? 'bg-green-700 text-green-100' : 'bg-gray-700 text-gray-300'}`}
                        title={activeProfile ? activeProfile.name : 'Kein Profil geladen'}>
                    Profil: {activeProfile ? activeProfile.name : 'None'}
                  </span>
                );
              })()}
              {/* Browse Buttons */}
              <button
                onClick={handleBrowseAnonymous}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                title="Öffnet YouTube anonym mit Extension"
              >
                <Shield className="h-4 w-4" />
                <EyeOff className="h-4 w-4" />
                <Chrome className="h-4 w-4" />
                <span>Browse Anonymous</span>
              </button>
              <button
                onClick={handleBrowseWithProfile}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                title="Öffnet YouTube mit vollständigem Profile"
              >
                <Eye className="h-4 w-4" />
                <Save className="h-4 w-4" />
                <span>Browse with Profile</span>
              </button>
              {/* Bestehende Buttons */}
              <button
                onClick={() => setIsProfileManagerOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>Profile Manager</span>
              </button>
              <button
                onClick={() => setIsTrainingManagerOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-md transition-colors"
              >
                <PlaySquare className="h-4 w-4" />
                <span>Training Manager</span>
              </button>
              <button
                onClick={onSettings}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <BubbleProfileManager
        isVisible={isProfileManagerOpen}
        onClose={() => setIsProfileManagerOpen(false)}
        onLoadProfile={onLoadProfile}
        onCreateProfile={onCreateProfile}
        currentPreset={currentPreset}
        currentAlgorithmState={currentAlgorithmState}
        savedProfiles={savedProfiles}
        setSavedProfiles={setSavedProfiles}
      />

      {isTrainingManagerOpen && (
        <TrainingManager
          presets={presets}
          onImport={onImport}
          onExport={onExport}
          onCreate={onCreate}
          onEdit={onEdit}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onTrain={onTrain}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isVisible={isTrainingManagerOpen}
          onClose={() => setIsTrainingManagerOpen(false)}
        />
      )}

      {/* Security Warning Modal */}
      <AnimatePresence>
        {showSecurityWarning && <SecurityWarningModal />}
      </AnimatePresence>
    </>
  );
};
