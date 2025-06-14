import React, { useState } from 'react';
import { Save, Play, Trash2, Download, Upload, Clock, Target, Globe, Users, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TrainingPreset, AlgorithmState, BrowserProfile } from '@/types';

interface ProfileManagerProps {
  onLoadProfile: (profile: BrowserProfile) => void;
  onCreateProfile: () => void;
  currentPreset?: TrainingPreset;
  currentAlgorithmState?: AlgorithmState;
  isVisible: boolean;
  onClose: () => void;
  savedProfiles: BrowserProfile[];
  setSavedProfiles: (profiles: BrowserProfile[]) => void;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({
  onLoadProfile,
  onCreateProfile,
  currentPreset,
  currentAlgorithmState,
  isVisible,
  onClose,
  savedProfiles,
  setSavedProfiles
}) => {
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'lastUsed' | 'profileStrength' | 'name' | 'createdAt'>('lastUsed');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileDescription, setNewProfileDescription] = useState('');
  const [newProfileTags, setNewProfileTags] = useState<string[]>([]);

  const saveProfiles = async (profiles: BrowserProfile[]) => {
    try {
      setSavedProfiles(profiles);
      await chrome.runtime.sendMessage({
        type: 'SAVE_PROFILES',
        profiles: profiles,
      });
      console.log('📦 Profiles saved to storage:', profiles);
    } catch (error) {
      console.error('Failed to save profiles:', error);
    }
  };

  const saveCurrentProfile = () => {
    if (!currentPreset || !newProfileName.trim()) return;



    console.log('--- Saving Profile ---');

    const newProfile: BrowserProfile = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: newProfileName.trim(),
      description: newProfileDescription.trim(),
      algorithmState: currentAlgorithmState || {
        id: Date.now().toString(),
        profileId: '',
        timestamp: new Date(),
        recommendations: [],
        categoryDistribution: [],
        contentAnalysis: {
          relevance: 0,
          sentiment: 'neutral',
          category: currentPreset?.category || 'general',
          keywords: []
        },
        trainingProgress: 0,
        lastTrainingDate: new Date(),
        totalVideosWatched: 0,
        totalSearches: 0,
        averageWatchTime: 0,
        preferredCategories: [],
        preferredChannels: [],
        preferredKeywords: [],
        avoidedChannels: [],
        avoidedKeywords: []
      },
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      createdAt: new Date(),
      lastUsed: new Date(),
      profileStrength: 0,
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
      isActive: false,
      tags: newProfileTags,
      language: currentPreset?.language || 'en',
      region: currentPreset?.region || 'US',
      category: currentPreset?.category || 'general',
      color: currentPreset?.color || '#3B82F6'
    };

    const updatedProfiles = [...savedProfiles, newProfile];
    saveProfiles(updatedProfiles);
    setShowSaveDialog(false);
    setNewProfileName('');
    setNewProfileDescription('');
    setNewProfileTags([]);
    window.dispatchEvent(new CustomEvent('profiles-updated'));
  };

  const loadProfile = (profile: BrowserProfile) => {
    try {
      const updatedProfiles = savedProfiles.map(s => ({
        ...s,
        isActive: s.id === profile.id,
        lastUsed: s.id === profile.id ? new Date() : s.lastUsed
      }));
      saveProfiles(updatedProfiles);
      onLoadProfile(profile);
      onClose();
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const browseWithProfile = (profile: BrowserProfile) => {
    chrome.runtime.sendMessage({
      type: 'BROWSE_WITH_PROFILE',
      profile: profile,
    });
    onClose();
  };

  const deleteProfile = (profileId: string) => {
    const updatedProfiles = savedProfiles.filter(s => s.id !== profileId);
    saveProfiles(updatedProfiles);
  };

  const duplicateProfile = (profile: BrowserProfile) => {
    const duplicated: BrowserProfile = {
      ...profile,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: `${profile.name} (Copy)`,
      createdAt: new Date(),
      lastUsed: new Date(),
      isActive: false
    };
    
    const updatedProfiles = [...savedProfiles, duplicated];
    saveProfiles(updatedProfiles);
  };

  const exportProfiles = () => {
    const dataStr = JSON.stringify(savedProfiles, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'youtube-profiles.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importProfiles = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedProfiles = JSON.parse(e.target?.result as string, (key, value) => {
              if (key.endsWith('At') || key === 'createdAt' || key === 'lastUsed') {
                return new Date(value);
              }
              return value;
            });
            
            const mergedProfiles = [...savedProfiles, ...importedProfiles];
            saveProfiles(mergedProfiles);
          } catch (error) {
            alert('Invalid profile file format');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const filteredAndSortedProfiles = savedProfiles
    .filter(profile => {
      const matchesSearch = profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           profile.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = filterTag === 'all' || profile.tags.includes(filterTag);
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'lastUsed':
          return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
        case 'profileStrength':
          return b.profileStrength - a.profileStrength;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

  const allTags = Array.from(new Set(savedProfiles.flatMap(s => s.tags)));

  const formatTimeAgo = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return 'just now';
  };

  if (!isVisible) return null;

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
        className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-6xl max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Save className="h-6 w-6 text-blue-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Profile Manager</h2>
              <p className="text-sm text-gray-400">Load saved profiles</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={importProfiles}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span>Import</span>
            </button>
            
            <button
              onClick={exportProfiles}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            
            <button
              onClick={() => setShowSaveDialog(true)}
              className="flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Save Current</span>
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search profiles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="lastUsed">Last Used</option>
              <option value="profileStrength">Profile Strength</option>
              <option value="name">Name</option>
              <option value="createdAt">Created Date</option>
            </select>
            
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-400">
            {filteredAndSortedProfiles.length} profile{filteredAndSortedProfiles.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Profiles List */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {filteredAndSortedProfiles.length === 0 ? (
            <div className="text-center py-12">
              <Save className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Profiles Found</h3>
              <p className="text-gray-400 mb-4">
                {savedProfiles.length === 0 
                  ? 'Create your first profile to get started'
                  : 'Try adjusting your search or filters'
                }
              </p>
              <button
                onClick={() => setShowSaveDialog(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Create First Profile
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedProfiles.map(profile => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    profile.isActive
                      ? 'bg-green-900/30 border-green-500 ring-2 ring-green-500/50'
                      : selectedProfile === profile.id
                      ? 'bg-blue-900/30 border-blue-500'
                      : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                  }`}
                  onClick={() => setSelectedProfile(profile.id)}
                  onDoubleClick={() => loadProfile(profile)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: profile.color }}
                      />
                      <h3 className="font-semibold text-white">{profile.name}</h3>
                      {profile.isActive && (
                        <div className="px-2 py-1 bg-green-600 text-white text-xs rounded">
                          Active
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateProfile(profile);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                        title="Duplicate"
                      >
                        <Save className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteProfile(profile.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                    {profile.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                    <div className="flex items-center space-x-1 text-gray-300">
                      <Target className="h-3 w-3" />
                      <span>Profile Strength: {profile.profileStrength}%</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-300">
                      <Play className="h-3 w-3" />
                      <span>{profile.totalVideosWatched} Videos</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-300">
                      <Globe className="h-3 w-3" />
                      <span>{(profile.language || 'en').toUpperCase()}/{profile.region || 'US'}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-300">
                      <Clock className="h-3 w-3" />
                      <span>{profile.trainingHours}h Training</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Last used: {formatTimeAgo(profile.lastUsed)}</span>
                    <span>{profile.category}</span>
                  </div>

                  {profile.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {profile.tags.slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {profile.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded">
                          +{profile.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {selectedProfile === profile.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-3 border-t border-gray-600"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          browseWithProfile(profile);
                        }}
                        className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                      >
                        <Play className="h-4 w-4" />
                        <span>Browse with Profile</span>
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Save Dialog */}
      <AnimatePresence>
        {showSaveDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowSaveDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4">Save Current Profile</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Profile Name *
                  </label>
                  <input
                    type="text"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter profile name..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newProfileDescription}
                    onChange={(e) => setNewProfileDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe this profile..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newProfileTags.join(', ')}
                    onChange={(e) => setNewProfileTags(e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="tech, ai, research..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveCurrentProfile}
                  disabled={!newProfileName.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                >
                  Save Profile
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
