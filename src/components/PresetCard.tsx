import React from 'react';
import { Play, Edit, Trash2, Copy, Clock, Target, Globe, Shield, Users } from 'lucide-react';
import { TrainingPreset } from '../types';
import { motion } from 'framer-motion';

interface PresetCardProps {
  preset: TrainingPreset;
  onTrain: (preset: TrainingPreset) => void;
  onEdit: (preset: TrainingPreset) => void;
  onDelete: (id: string) => void;
  onDuplicate: (preset: TrainingPreset) => void;
  isTraining?: boolean;
}

export const PresetCard: React.FC<PresetCardProps> = ({
  preset,
  onTrain,
  onEdit,
  onDelete,
  onDuplicate,
  isTraining = false
}) => {
  const categoryIcons = {
    tech: '💻',
    science: '🔬',
    politics: '🏛️',
    music: '🎵',
    lifestyle: '🌱',
    custom: '⚙️'
  };

  const languageFlags = {
    'en': '🇺🇸',
    'de': '🇩🇪',
    'es': '🇪🇸',
    'fr': '🇫🇷',
    'ja': '🇯🇵',
    'zh': '🇨🇳',
    'ru': '🇷🇺',
    'pt': '🇧🇷',
    'it': '🇮🇹',
    'ko': '🇰🇷'
  };

  const getLanguageFlag = (lang: string) => {
    return languageFlags[lang as keyof typeof languageFlags] || '🌐';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: preset.color }}
          />
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <span>{categoryIcons[preset.category]}</span>
              <span>{getLanguageFlag(preset.language || 'en')}</span>
              <span>{preset.name}</span>
            </h3>
            <p className="text-sm text-gray-400">{preset.description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="flex items-center space-x-2 text-gray-300">
          <Target className="h-4 w-4" />
          <span>{(preset.searches || []).length} searches</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-300">
          <Clock className="h-4 w-4" />
          <span>{preset.trainingDuration}min training</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-300">
          <Globe className="h-4 w-4" />
          <span>{(preset.language || 'en').toUpperCase()}/{preset.region || 'US'}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-300">
          <Users className="h-4 w-4" />
          <span>{(preset.channelPreferences || []).length} channels</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex flex-wrap gap-1 mb-2">
          {(preset.targetKeywords || []).slice(0, 3).map((keyword, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-green-900/30 text-green-300 rounded border border-green-700"
            >
              +{keyword}
            </span>
          ))}
          {(preset.targetKeywords || []).length > 3 && (
            <span className="px-2 py-1 text-xs bg-green-900/30 text-green-300 rounded border border-green-700">
              +{(preset.targetKeywords || []).length - 3} more
            </span>
          )}
        </div>
        
        {(preset.avoidKeywords || []).length > 0 && (
          <div className="flex flex-wrap gap-1">
            {(preset.avoidKeywords || []).slice(0, 2).map((keyword, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-red-900/30 text-red-300 rounded border border-red-700"
              >
                -{keyword}
              </span>
            ))}
            {(preset.avoidKeywords || []).length > 2 && (
              <span className="px-2 py-1 text-xs bg-red-900/30 text-red-300 rounded border border-red-700">
                -{(preset.avoidKeywords || []).length - 2} more
              </span>
            )}
          </div>
        )}
      </div>

      {preset.advancedOptions && (
        <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
          <div className="flex items-center space-x-4 text-xs text-gray-400">
            <div className="flex items-center space-x-1">
              <Target className="h-3 w-3" />
              <span>{Math.round(preset.advancedOptions.engagementRate * 100)}% engagement</span>
            </div>
            {preset.advancedOptions.skipAds && (
              <div className="flex items-center space-x-1">
                <Shield className="h-3 w-3" />
                <span>Skip Ads</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={() => onTrain(preset)}
          disabled={isTraining}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
            isTraining
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <Play className="h-4 w-4" />
          <span>{isTraining ? 'Training...' : 'Train Algorithm'}</span>
        </button>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => onDuplicate(preset)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
            title="Duplicate preset"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(preset)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
            title="Edit preset"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(preset.id)}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-md transition-colors"
            title="Delete preset"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {preset.lastUsed && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            Last used: {preset.lastUsed.toLocaleDateString()}
          </p>
        </div>
      )}
    </motion.div>
  );
};