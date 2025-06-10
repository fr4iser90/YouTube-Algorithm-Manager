import React, { useState, useEffect } from 'react';
import { Save, X, Globe, Target, Clock, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { BrowserProfile, TrainingPreset } from '../types';

interface ProfileCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: BrowserProfile) => void;
  currentPreset?: TrainingPreset;
  currentAlgorithmState?: any;
}

export const ProfileCreationModal: React.FC<ProfileCreationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentPreset,
  currentAlgorithmState
}) => {
  const [formData, setFormData] = useState({
    name: currentPreset ? `Training Profile: ${currentPreset.name}` : '',
    description: currentPreset ? `Created for training preset: ${currentPreset.name}\n${currentPreset.description || ''}` : '',
    tags: currentPreset ? [currentPreset.category, 'training'] : [] as string[],
    tagInput: ''
  });

  useEffect(() => {
    if (currentPreset) {
      setFormData({
        name: `Training Profile: ${currentPreset.name}`,
        description: `Created for training preset: ${currentPreset.name}\n${currentPreset.description || ''}`,
        tags: [currentPreset.category, 'training'],
        tagInput: ''
      });
    }
  }, [currentPreset]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!formData.name.trim()) return;

    const newProfile: BrowserProfile = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: formData.name.trim(),
      description: formData.description.trim(),
      algorithmState: currentAlgorithmState || {
        timestamp: new Date(),
        recommendations: [],
        profileScore: 0,
        language: currentPreset?.language || 'en',
        region: currentPreset?.region || 'US',
        blockedChannels: [],
        prioritizedChannels: []
      },
      createdAt: new Date(),
      lastUsed: new Date(),
      profileStrength: currentAlgorithmState?.profileScore || 0,
      totalVideosWatched: 0,
      totalSearches: 0,
      trainingHours: 0,
      isActive: true,
      tags: formData.tags,
      language: currentPreset?.language || 'en',
      region: currentPreset?.region || 'US',
      category: currentPreset?.category || 'general',
      color: currentPreset?.color || '#3B82F6',
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      averageWatchTime: 0,
      preferredCategories: currentPreset?.category ? [currentPreset.category] : [],
      preferredChannels: currentPreset?.channelPreferences?.map(c => c.channelId) || [],
      preferredKeywords: currentPreset?.targetKeywords || [],
      watchHistory: [],
      avoidedChannels: [],
      avoidedKeywords: currentPreset?.avoidKeywords || []
    };

    onSave(newProfile);
    onClose();
  };

  const addTag = () => {
    const tag = formData.tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
        tagInput: ''
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

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
        className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Save className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Neues Profil erstellen</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Profil Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mein YouTube Profil..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Beschreibung
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Beschreibe dieses Profil..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={formData.tagInput}
                onChange={(e) => setFormData(prev => ({ ...prev, tagInput: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tag hinzufügen..."
              />
              <button
                onClick={addTag}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="flex items-center space-x-1 px-2 py-1 bg-gray-700 text-gray-300 text-sm rounded"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => removeTag(tag)}
                    className="text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>{currentPreset?.language?.toUpperCase() || 'EN'}/{currentPreset?.region || 'US'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Kategorie: {currentPreset?.category || 'general'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{currentPreset?.trainingDuration || 45}min Training</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>{currentPreset?.channelPreferences?.length || 0} Kanäle</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={!formData.name.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition-colors"
          >
            Profil erstellen
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}; 